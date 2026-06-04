import { HTTPClient } from '../http_client.js';
import { JwtSession } from '../jwt.js';

// Mock JwtSession
jest.mock('../jwt', () => ({
	JwtSession: {
		getToken: jest.fn(() => 'mock_jwt_token')
	}
}));

// Mock UrlAndQueryString
jest.mock('../network', () => ({
	UrlAndQueryString: {
		buildQuery: jest.fn((data) => {
			return Object.entries(data)
				.map(([key, value]) => `${key}=${value}`)
				.join('&');
		})
	}
}));

describe('HTTPClient', () => {
	beforeEach(() => {
		// Reset HTTPClient state
		HTTPClient.authorizationToken = undefined;
		HTTPClient.headers = undefined;
		HTTPClient.refreshTokenUrl = undefined;
		HTTPClient.refreshTokenCallback = undefined;
		HTTPClient.getRefreshTokenCallback = undefined;
		HTTPClient.onSuccessRefreshTokenCallback = undefined;
		HTTPClient.onInvalidRefreshTokenCallback = undefined;
		HTTPClient.onInvalidRefreshTokenRedirectUrl = undefined;
		HTTPClient.onInvalidTokenRedirectUrl = undefined;
		HTTPClient.onInvalidTokenCallback = undefined;

		// Mock global Headers
		global.Headers = jest.fn().mockImplementation(function() {
			this.headers = {};
			this.append = jest.fn((key, value) => {
				this.headers[key] = value;
			});
			this.get = jest.fn((key) => this.headers[key]);
		});

		// Mock global FormData
		global.FormData = jest.fn().mockImplementation(function() {
			this.data = {};
			this.append = jest.fn((key, value) => {
				this.data[key] = value;
			});
			this.forEach = jest.fn(function(callback) {
				Object.entries(this.data).forEach(([key, value]) => {
					callback(value, key);
				});
			}.bind(this));
		});

		// Mock global File
		global.File = class File {
			constructor(parts, filename, options) {
				this.parts = parts;
				this.filename = filename;
				this.options = options;
			}
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Configuration setters', () => {
		test('setAuthorizationToken should set authorization token', () => {
			HTTPClient.setAuthorizationToken('custom_token');

			expect(HTTPClient.authorizationToken).toBe('custom_token');
		});

		test('setRefreshTokenUrl should set refresh token URL', () => {
			HTTPClient.setRefreshTokenUrl('https://api.example.com/refresh');

			expect(HTTPClient.refreshTokenUrl).toBe('https://api.example.com/refresh');
		});

		test('setRefreshTokenCallback should set refresh token callback', () => {
			const callback = jest.fn();
			HTTPClient.setRefreshTokenCallback(callback);

			expect(HTTPClient.refreshTokenCallback).toBe(callback);
		});

		test('setGetRefreshTokenCallback should set get refresh token callback', () => {
			const callback = jest.fn();
			HTTPClient.setGetRefreshTokenCallback(callback);

			expect(HTTPClient.getRefreshTokenCallback).toBe(callback);
		});

		test('setOnSuccessRefreshTokenCallback should set success callback', () => {
			const callback = jest.fn();
			HTTPClient.setOnSuccessRefreshTokenCallback(callback);

			expect(HTTPClient.onSuccessRefreshTokenCallback).toBe(callback);
		});

		test('setOnInvalidRefreshTokenCallback should set invalid refresh callback', () => {
			const callback = jest.fn();
			HTTPClient.setOnInvalidRefreshTokenCallback(callback);

			expect(HTTPClient.onInvalidRefreshTokenCallback).toBe(callback);
		});

		test('setOnInvalidRefreshTokenRedirectUrl should set redirect URL', () => {
			HTTPClient.setOnInvalidRefreshTokenRedirectUrl('https://example.com/login');

			expect(HTTPClient.onInvalidRefreshTokenRedirectUrl).toBe('https://example.com/login');
		});

		test('setOnInvalidTokenRedirectUrl should set redirect URL', () => {
			HTTPClient.setOnInvalidTokenRedirectUrl('https://example.com/expired');

			expect(HTTPClient.onInvalidTokenRedirectUrl).toBe('https://example.com/expired');
		});

		test('setOnInvalidTokenCallback should set invalid token callback', () => {
			const callback = jest.fn();
			HTTPClient.setOnInvalidTokenCallback(callback);

			expect(HTTPClient.onInvalidTokenCallback).toBe(callback);
		});
	});

	describe('getHeaders', () => {
		test('should return Headers object by default', () => {
			const headers = HTTPClient.getHeaders();

			expect(headers).toBeInstanceOf(Headers);
		});

		test('should return plain object when asObject=true', () => {
			const headers = HTTPClient.getHeaders(true);

			expect(typeof headers).toBe('object');
			expect(headers).not.toBeInstanceOf(Headers);
		});

		test('should include Authorization header with JWT token', () => {
			const headers = HTTPClient.getHeaders(true);

			expect(headers.Authorization).toBe('Bearer mock_jwt_token');
		});

		test('should use custom authorization token if set', () => {
			HTTPClient.setAuthorizationToken('custom_token');

			const headers = HTTPClient.getHeaders(true);

			expect(headers.Authorization).toBe('Bearer custom_token');
		});

		test('should not include Authorization header when addAuthorizationHeader=false', () => {
			const headers = HTTPClient.getHeaders(true, {}, false);

			expect(headers.Authorization).toBeUndefined();
		});

		test('should include additional headers', () => {
			const headers = HTTPClient.getHeaders(true, { 'Content-Type': 'application/json' });

			expect(headers['Content-Type']).toBe('application/json');
		});

		test('should merge existing HTTPClient.headers', () => {
			HTTPClient.setHeader('X-Custom-Header', 'custom-value');

			const headers = HTTPClient.getHeaders(true);

			expect(headers['X-Custom-Header']).toBe('custom-value');
		});

		test('should handle null authorization token', () => {
			HTTPClient.authorizationToken = null;
			JwtSession.getToken.mockReturnValue(null);

			const headers = HTTPClient.getHeaders(true);

			expect(headers.Authorization).toBeUndefined();
		});

		test('should handle empty authorization token', () => {
			HTTPClient.authorizationToken = '';
			JwtSession.getToken.mockReturnValue('');

			const headers = HTTPClient.getHeaders(true);

			expect(headers.Authorization).toBeUndefined();
		});
	});

	describe('getHeader / setHeader', () => {
		test('setHeader should set a header value', () => {
			HTTPClient.setHeader('X-Custom', 'value');

			expect(HTTPClient.headers['X-Custom']).toBe('value');
		});

		test('getHeader should retrieve a header value', () => {
			HTTPClient.setHeader('X-Custom', 'value');

			const value = HTTPClient.getHeader('X-Custom');

			expect(value).toBe('value');
		});

		test('getHeader should return undefined for non-existent header', () => {
			const value = HTTPClient.getHeader('Non-Existent');

			expect(value).toBeUndefined();
		});

		test('should initialize headers object if undefined', () => {
			HTTPClient.headers = undefined;

			HTTPClient.setHeader('X-Test', 'test');

			expect(HTTPClient.headers).toBeDefined();
			expect(HTTPClient.headers['X-Test']).toBe('test');
		});
	});

	describe('convertObjectToFormData', () => {
		test('should convert simple object to FormData', () => {
			const obj = { name: 'John', age: 30 };

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData).toBeInstanceOf(FormData);
			expect(formData.data.name).toBe('John');
			expect(formData.data.age).toBe(30);
		});

		test('should handle arrays in object', () => {
			const obj = { tags: ['tag1', 'tag2', 'tag3'] };

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData.data['tags[0]']).toBe('tag1');
			expect(formData.data['tags[1]']).toBe('tag2');
			expect(formData.data['tags[2]']).toBe('tag3');
		});

		test('should handle nested objects', () => {
			const obj = { user: { name: 'John', email: 'john@example.com' } };

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData.data['user.name']).toBe('John');
			expect(formData.data['user.email']).toBe('john@example.com');
		});

		test('should handle File objects', () => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			const obj = { document: file };

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData.data.document).toBe(file);
		});

		test('should skip null values', () => {
			const obj = { name: 'John', middleName: null, age: 30 };

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData.data.name).toBe('John');
			expect(formData.data.age).toBe(30);
			expect(formData.data.middleName).toBeUndefined();
		});

		test('should skip undefined values', () => {
			const obj = { name: 'John', middleName: undefined, age: 30 };

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData.data.name).toBe('John');
			expect(formData.data.age).toBe(30);
			expect(formData.data.middleName).toBeUndefined();
		});

		test('should handle mixed types', () => {
			const obj = {
				string: 'text',
				number: 42,
				boolean: true,
				array: [1, 2],
				object: { key: 'value' }
			};

			const formData = HTTPClient.convertObjectToFormData(obj);

			expect(formData.data.string).toBe('text');
			expect(formData.data.number).toBe(42);
			expect(formData.data.boolean).toBe(true);
			expect(formData.data['array[0]']).toBe(1);
			expect(formData.data['array[1]']).toBe(2);
			expect(formData.data['object.key']).toBe('value');
		});
	});

	describe('formatQueryString', () => {
		test('should return empty string for null data', () => {
			const result = HTTPClient.formatQueryString(null);

			expect(result).toBe('');
		});

		test('should convert object to query string', () => {
			const data = { name: 'John', age: 30 };

			const result = HTTPClient.formatQueryString(data);

			expect(result).toBe('&name=John&age=30');
		});

		test('should prepend & to string without &', () => {
			const result = HTTPClient.formatQueryString('name=John&age=30');

			expect(result).toBe('&name=John&age=30');
		});

		test('should not prepend & to string starting with &', () => {
			const result = HTTPClient.formatQueryString('&name=John&age=30');

			expect(result).toBe('&name=John&age=30');
		});

		test('should handle empty string', () => {
			const result = HTTPClient.formatQueryString('');

			expect(result).toBe('');
		});
	});

	describe('formatFormData', () => {
		test('should return FormData instance unchanged', () => {
			const formData = new FormData();
			formData.append('key', 'value');

			const result = HTTPClient.formatFormData(formData);

			expect(result).toBe(formData);
		});

		test('should convert object to FormData', () => {
			const obj = { name: 'John', age: 30 };

			const result = HTTPClient.formatFormData(obj);

			expect(result).toBeInstanceOf(FormData);
			expect(result.data.name).toBe('John');
			expect(result.data.age).toBe(30);
		});
	});

	describe('formatJsonData', () => {
		test('should return string unchanged', () => {
			const jsonString = '{"name":"John"}';

			const result = HTTPClient.formatJsonData(jsonString);

			expect(result).toBe(jsonString);
		});

		test('should convert object to JSON string', () => {
			const obj = { name: 'John', age: 30 };

			const result = HTTPClient.formatJsonData(obj);

			expect(result).toBe('{"name":"John","age":30}');
		});

		test('should handle nested objects', () => {
			const obj = { user: { name: 'John', email: 'john@example.com' } };

			const result = HTTPClient.formatJsonData(obj);

			const parsed = JSON.parse(result);
			expect(parsed['user.name']).toBe('John');
			expect(parsed['user.email']).toBe('john@example.com');
		});
	});

	describe('isExpiredToken', () => {
		test('should return true for expired JWT token status text', () => {
			const response = { status: 401, statusText: 'Expired JWT Token' };
			const json = {};

			expect(HTTPClient.isExpiredToken(response, json)).toBe(true);
		});

		test('should return true for expired token in message', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { message: 'Expired JWT Token' };

			expect(HTTPClient.isExpiredToken(response, json)).toBe(true);
		});

		test('should return true for expired_token error', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { error: 'expired_token' };

			expect(HTTPClient.isExpiredToken(response, json)).toBe(true);
		});

		test('should return true for expired_token string', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = 'expired_token';

			expect(HTTPClient.isExpiredToken(response, json)).toBe(true);
		});

		test('should return false for non-401 status', () => {
			const response = { status: 200, statusText: 'OK' };
			const json = { message: 'Expired JWT Token' };

			expect(HTTPClient.isExpiredToken(response, json)).toBe(false);
		});

		test('should return false for invalid token message', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { message: 'Invalid JWT Token' };

			expect(HTTPClient.isExpiredToken(response, json)).toBe(false);
		});
	});

	describe('isInvalidToken', () => {
		test('should return true for invalid JWT token status text', () => {
			const response = { status: 401, statusText: 'Invalid JWT Token' };
			const json = {};

			expect(HTTPClient.isInvalidToken(response, json)).toBe(true);
		});

		test('should return true for invalid token in message', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { message: 'Invalid JWT Token' };

			expect(HTTPClient.isInvalidToken(response, json)).toBe(true);
		});

		test('should return true for invalid_token error', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { error: 'invalid_token' };

			expect(HTTPClient.isInvalidToken(response, json)).toBe(true);
		});

		test('should return true for authentification_failure error', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { error: 'authentification_failure' };

			expect(HTTPClient.isInvalidToken(response, json)).toBe(true);
		});

		test('should return true for invalid_token string', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = 'invalid_token';

			expect(HTTPClient.isInvalidToken(response, json)).toBe(true);
		});

		test('should return true for authentification_failure string', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = 'authentification_failure';

			expect(HTTPClient.isInvalidToken(response, json)).toBe(true);
		});

		test('should return false for non-401 status', () => {
			const response = { status: 200, statusText: 'OK' };
			const json = { message: 'Invalid JWT Token' };

			expect(HTTPClient.isInvalidToken(response, json)).toBe(false);
		});

		test('should return false for expired token message', () => {
			const response = { status: 401, statusText: 'Unauthorized' };
			const json = { message: 'Expired JWT Token' };

			expect(HTTPClient.isInvalidToken(response, json)).toBe(false);
		});
	});

	describe('logRequestFailure', () => {
		let consoleErrorSpy;

		beforeEach(() => {
			consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		});

		afterEach(() => {
			consoleErrorSpy.mockRestore();
		});

		test('should log network error when response is null', () => {
			HTTPClient.logRequestFailure(null, {});

			expect(consoleErrorSpy).toHaveBeenCalledWith('Request failure : network error.');
		});

		test('should log response status and HTTP code', () => {
			const response = { status: 404, statusText: 'Not Found' };
			const json = { error: 'Resource not found' };

			HTTPClient.logRequestFailure(response, json);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Request failure. Status: Not Found ; HTTP Code : 404',
				json
			);
		});
	});

	describe('logJqueryRequestFailure', () => {
		let consoleErrorSpy;

		beforeEach(() => {
			consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		});

		afterEach(() => {
			consoleErrorSpy.mockRestore();
		});

		test('should log jQuery request failure', () => {
			const jqxhr = { status: 500, responseJSON: { error: 'Server error' } };

			HTTPClient.logJqueryRequestFailure(jqxhr, 'error', 'Internal Server Error');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Request failure. Status: error ; HTTP Code: 500 ; Error message: Internal Server Error',
				{ error: 'Server error' }
			);
		});

		test('should handle empty error thrown', () => {
			const jqxhr = { status: 400, responseJSON: {} };

			HTTPClient.logJqueryRequestFailure(jqxhr, 'error', '');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Request failure. Status: error ; HTTP Code: 400',
				{}
			);
		});

		test('should handle null error thrown', () => {
			const jqxhr = { status: 400, responseJSON: {} };

			HTTPClient.logJqueryRequestFailure(jqxhr, 'error', null);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Request failure. Status: error ; HTTP Code: 400',
				{}
			);
		});
	});

	describe('request', () => {
		let mockFetch;

		beforeEach(() => {
			mockFetch = jest.fn().mockResolvedValue({
				ok: true,
				status: 200,
				statusText: 'OK',
				json: jest.fn().mockResolvedValue({ success: true }),
			});
			global.window = { fetch: mockFetch };
			global.fetch = mockFetch;
			global.URLSearchParams = jest.fn().mockImplementation(function() {
				this.toString = jest.fn().mockReturnValue('');
			});
		});

		afterEach(() => {
			delete global.window;
			delete global.fetch;
			delete global.URLSearchParams;
		});

		test('should handle null data for GET, POST and PATCH', async () => {
			const successCallback = jest.fn();

			await HTTPClient.request('GET', 'https://api.example.com/users', null, successCallback);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.example.com/users?',
				expect.objectContaining({ method: 'GET', body: null })
			);
			expect(successCallback).toHaveBeenCalledWith({ success: true }, expect.anything());

			mockFetch.mockClear();
			successCallback.mockClear();

			await HTTPClient.request('POST', 'https://api.example.com/users', null, successCallback);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.example.com/users',
				expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
			);
			expect(successCallback).toHaveBeenCalledWith({ success: true }, expect.anything());

			mockFetch.mockClear();
			successCallback.mockClear();

			await HTTPClient.request('PATCH', 'https://api.example.com/users/1', null, successCallback);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.example.com/users/1',
				expect.objectContaining({ method: 'PATCH', body: '' })
			);
			expect(successCallback).toHaveBeenCalledWith({ success: true }, expect.anything());
		});
	});
});