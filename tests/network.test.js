import { Cookie, UrlAndQueryString } from '../network.js';

describe('Cookie', () => {
	// Mock document.cookie
	let cookieStore = {};

	beforeEach(() => {
		cookieStore = {};

		Object.defineProperty(global, 'document', {
			value: {
				get cookie() {
					return Object.entries(cookieStore).map(([key, value]) => `${key}=${value}`).join('; ');
				},
				set cookie(value) {
					const match = value.match(/([^=]+)=([^;]*)/);
					if (match) {
						const [, key, val] = match;
						// Check if expires date is in the past
						const expiresMatch = value.match(/expires=([^;]+)/);
						if (expiresMatch) {
							const expiresDate = new Date(expiresMatch[1]);
							if (expiresDate < new Date()) {
								delete cookieStore[key];
								return;
							}
						}
						cookieStore[key] = val;
					}
				}
			},
			writable: true,
			configurable: true
		});
	});

	describe('set', () => {
		test('should set a cookie with default validity', () => {
			Cookie.set('testCookie', 'testValue');
			expect(cookieStore['testCookie']).toBe('testValue');
		});

		test('should set a cookie with custom validity days', () => {
			Cookie.set('testCookie', 'testValue', 7);
			expect(cookieStore['testCookie']).toBe('testValue');
		});

		test('should set cookie with empty value', () => {
			Cookie.set('emptyCookie', '');
			expect(cookieStore['emptyCookie']).toBe('');
		});

		test('should set cookie with numeric value', () => {
			Cookie.set('numericCookie', '123');
			expect(cookieStore['numericCookie']).toBe('123');
		});
	});

	describe('get', () => {
		test('should get an existing cookie', () => {
			cookieStore['testCookie'] = 'testValue';
			expect(Cookie.get('testCookie')).toBe('testValue');
		});

		test('should return null for non-existent cookie', () => {
			expect(Cookie.get('nonExistent')).toBeNull();
		});

		test('should handle cookies with spaces in name', () => {
			cookieStore['test Cookie'] = 'value';
			expect(Cookie.get('test Cookie')).toBe('value');
		});

		test('should handle empty cookie value', () => {
			cookieStore['emptyCookie'] = '';
			expect(Cookie.get('emptyCookie')).toBe('');
		});
	});

	describe('erase', () => {
		test('should erase an existing cookie', () => {
			cookieStore['testCookie'] = 'testValue';
			Cookie.erase('testCookie');
			expect(cookieStore['testCookie']).toBeUndefined();
		});

		test('should handle erasing non-existent cookie', () => {
			expect(() => Cookie.erase('nonExistent')).not.toThrow();
		});
	});
});

describe('UrlAndQueryString', () => {
	beforeEach(() => {
		global.window = {
			location: {
				origin: 'https://example.com',
				host: 'example.com',
				pathname: '/',
				search: '',
			},
		};
	});

	describe('displayUrl', () => {
		test('should display URL with link by default', () => {
			const result = UrlAndQueryString.displayUrl('https://example.com/path');
			expect(result).toContain('<a href="https://example.com/path">');
			expect(result).toContain('example.com');
			expect(result).toContain('</a>');
		});

		test('should display URL without link', () => {
			const result = UrlAndQueryString.displayUrl('https://example.com/path', false);
			expect(result).not.toContain('<a');
			expect(result).toBe('example.com');
		});

		test('should handle URL with port', () => {
			const result = UrlAndQueryString.displayUrl('https://example.com:8080/path', false);
			expect(result).toBe('example.com:8080');
		});

		test('should handle URL with subdomain', () => {
			const result = UrlAndQueryString.displayUrl('https://sub.example.com/path', false);
			expect(result).toBe('sub.example.com');
		});
	});

	describe('displayUrlAndPath', () => {
		test('should display URL and path with link', () => {
			const result = UrlAndQueryString.displayUrlAndPath('https://example.com/path/to/page');
			expect(result).toContain('<a href="https://example.com/path/to/page">');
			expect(result).toContain('example.com/path/to/page');
			expect(result).toContain('</a>');
		});

		test('should display URL and path without link', () => {
			const result = UrlAndQueryString.displayUrlAndPath('https://example.com/path/to/page', false);
			expect(result).toBe('example.com/path/to/page');
		});

		test('should remove trailing slash when path is root and displayPathIfEmpty is false', () => {
			const result = UrlAndQueryString.displayUrlAndPath('https://example.com/', false, false);
			expect(result).toBe('example.com');
		});

		test('should keep trailing slash when displayPathIfEmpty is true', () => {
			const result = UrlAndQueryString.displayUrlAndPath('https://example.com/', false, true);
			expect(result).toBe('example.com/');
		});

		test('should handle URL with query string', () => {
			const result = UrlAndQueryString.displayUrlAndPath('https://example.com/path?query=1', false);
			expect(result).toBe('example.com/path');
		});
	});

	describe('urlify', () => {
		test('should convert URLs to links in text', () => {
			const text = 'Visit https://example.com for more info';
			const result = UrlAndQueryString.urlify(text);
			expect(result).toContain('<a href="https://example.com">https://example.com</a>');
		});

		test('should handle multiple URLs in text', () => {
			const text = 'Visit https://example.com and https://test.com';
			const result = UrlAndQueryString.urlify(text);
			expect(result).toContain('<a href="https://example.com">');
			expect(result).toContain('<a href="https://test.com">');
		});

		test('should handle HTTP and HTTPS URLs', () => {
			const text = 'http://example.com and https://example.com';
			const result = UrlAndQueryString.urlify(text);
			expect(result).toContain('<a href="http://example.com">');
			expect(result).toContain('<a href="https://example.com">');
		});

		test('should not modify text without URLs', () => {
			const text = 'No URLs here';
			const result = UrlAndQueryString.urlify(text);
			expect(result).toBe('No URLs here');
		});
	});

	describe('getHost', () => {
		test('should get host with protocol', () => {
			const result = UrlAndQueryString.getHost('https://example.com/path');
			expect(result).toBe('https://example.com');
		});

		test('should get host without protocol', () => {
			const result = UrlAndQueryString.getHost('https://example.com/path', false);
			expect(result).toBe('example.com');
		});

		test('should handle URL with port', () => {
			const result = UrlAndQueryString.getHost('https://example.com:8080/path', false);
			expect(result).toBe('example.com:8080');
		});

		test('should handle URL with subdomain', () => {
			const result = UrlAndQueryString.getHost('https://sub.example.com/path', false);
			expect(result).toBe('sub.example.com');
		});

		test('should handle HTTP protocol', () => {
			const result = UrlAndQueryString.getHost('http://example.com/path');
			expect(result).toBe('http://example.com');
		});
	});

	describe('getPath', () => {
		test('should get path from URL', () => {
			const result = UrlAndQueryString.getPath('https://example.com/path/to/page');
			expect(result).toBe('/path/to/page');
		});

		test('should return root path for URL without path', () => {
			const result = UrlAndQueryString.getPath('https://example.com');
			expect(result).toBe('/');
		});

		test('should handle URL with query string', () => {
			const result = UrlAndQueryString.getPath('https://example.com/path?query=1');
			expect(result).toBe('/path');
		});

		test('should handle URL with fragment', () => {
			const result = UrlAndQueryString.getPath('https://example.com/path#section');
			expect(result).toBe('/path');
		});
	});

	describe('getQueryString', () => {
		test('should get query string from URL', () => {
			const result = UrlAndQueryString.getQueryString('https://example.com/path?query=1&param=2');
			expect(result).toBe('?query=1&param=2');
		});

		test('should return empty string for URL without query', () => {
			const result = UrlAndQueryString.getQueryString('https://example.com/path');
			expect(result).toBe('');
		});

		test('should handle URL with fragment', () => {
			const result = UrlAndQueryString.getQueryString('https://example.com/path?query=1#section');
			expect(result).toBe('?query=1');
		});

		test('should handle empty query string', () => {
			const result = UrlAndQueryString.getQueryString('https://example.com/path?');
			expect(result).toBe('');
		});
	});

	describe('getHostAndPath', () => {
		test('should get host and path with protocol', () => {
			const result = UrlAndQueryString.getHostAndPath('https://example.com/path/to/page');
			expect(result).toBe('https://example.com/path/to/page');
		});

		test('should get host and path without protocol', () => {
			const result = UrlAndQueryString.getHostAndPath('https://example.com/path/to/page', false);
			expect(result).toBe('example.com/path/to/page');
		});

		test('should exclude query string', () => {
			const result = UrlAndQueryString.getHostAndPath('https://example.com/path?query=1', false);
			expect(result).toBe('example.com/path');
		});

		test('should handle root path', () => {
			const result = UrlAndQueryString.getHostAndPath('https://example.com/', false);
			expect(result).toBe('example.com/');
		});
	});

	describe('getParam', () => {
		test('should get parameter from URL', () => {
			const result = UrlAndQueryString.getParam('query', 'https://example.com/path?query=value&other=test');
			expect(result).toBe('value');
		});

		test('should return null for non-existent parameter', () => {
			const result = UrlAndQueryString.getParam('missing', 'https://example.com/path?query=value');
			expect(result).toBeNull();
		});

		test('should handle parameters with special characters', () => {
			const result = UrlAndQueryString.getParam('query', 'https://example.com/path?query=hello%20world');
			expect(result).toBe('hello world');
		});

		test('should handle empty parameter value', () => {
			const result = UrlAndQueryString.getParam('query', 'https://example.com/path?query=');
			expect(result).toBe('');
		});

		test('should handle parameter without value', () => {
			const result = UrlAndQueryString.getParam('query', 'https://example.com/path?query');
			expect(result).toBe('');
		});
	});

	describe('setParam', () => {
		test('should add a new parameter to empty query string', () => {
			const result = UrlAndQueryString.setParam('', 'foo', 'bar');
			expect(result).toBe('foo=bar');
		});

		test('should add a new parameter to existing query string', () => {
			const result = UrlAndQueryString.setParam('?a=1&b=2', 'c', '3');
			expect(result).toContain('a=1');
			expect(result).toContain('b=2');
			expect(result).toContain('c=3');
		});

		test('should override existing parameter', () => {
			const result = UrlAndQueryString.setParam('?a=1&b=2', 'a', '99');
			expect(result).toContain('a=99');
			expect(result).not.toContain('a=1');
			expect(result).toContain('b=2');
		});

		test('should encode spaces as %20, not +', () => {
			const result = UrlAndQueryString.setParam('', 'q', 'hello world');
			expect(result).toContain('q=hello%20world');
			expect(result).not.toContain('+');
		});

		test('should encode accented characters', () => {
			const result = UrlAndQueryString.setParam('', 'q', 'café');
			expect(result).not.toContain('é');
			expect(result).toContain('q=caf');
		});
	});

	describe('setParamOfUrl', () => {
		test('should add a parameter to a URL', () => {
			const result = UrlAndQueryString.setParamOfUrl('foo', 'bar', 'https://example.com/path?a=1');
			expect(result).toContain('https://example.com/path?');
			expect(result).toContain('a=1');
			expect(result).toContain('foo=bar');
		});

		test('should override existing parameter in URL', () => {
			const result = UrlAndQueryString.setParamOfUrl('a', '99', 'https://example.com/path?a=1&b=2');
			expect(result).toContain('a=99');
			expect(result).not.toContain('a=1');
			expect(result).toContain('b=2');
		});

		test('should encode spaces as %20 in URL', () => {
			const result = UrlAndQueryString.setParamOfUrl('q', 'hello world', 'https://example.com/path');
			expect(result).toContain('q=hello%20world');
			expect(result).not.toContain('+');
		});
	});

	describe('deleteParam', () => {
		test('should delete parameter from query string', () => {
			const result = UrlAndQueryString.deleteParam('?query=1&param=2&other=3', 'param');
			expect(result).not.toContain('param=2');
			expect(result).toContain('query=1');
			expect(result).toContain('other=3');
		});

		test('should handle deleting non-existent parameter', () => {
			const result = UrlAndQueryString.deleteParam('?query=1&param=2', 'missing');
			expect(result).toContain('query=1');
			expect(result).toContain('param=2');
		});

		test('should handle deleting only parameter', () => {
			const result = UrlAndQueryString.deleteParam('?query=1', 'query');
			expect(result).toBe('');
		});
	});

	describe('deleteParamOfUrl', () => {
		test('should delete parameter from URL', () => {
			const result = UrlAndQueryString.deleteParamOfUrl('param', 'https://example.com/path?query=1&param=2&other=3');
			expect(result).not.toContain('param=2');
			expect(result).toContain('https://example.com/path?');
			expect(result).toContain('query=1');
		});

		test('should preserve host and path', () => {
			const result = UrlAndQueryString.deleteParamOfUrl('param', 'https://example.com/path?param=1');
			expect(result).toContain('https://example.com/path');
		});
	});

	describe('deleteParamsOfUrl', () => {
		test('should delete multiple parameters from URL', () => {
			const result = UrlAndQueryString.deleteParamsOfUrl(
				['param1', 'param2'],
				'https://example.com/path?query=1&param1=2&param2=3&other=4'
			);
			expect(result).not.toContain('param1');
			expect(result).not.toContain('param2');
			expect(result).toContain('query=1');
			expect(result).toContain('other=4');
		});

		test('should handle empty array', () => {
			const result = UrlAndQueryString.deleteParamsOfUrl([], 'https://example.com/path?query=1');
			expect(result).toContain('query=1');
		});
	});

	describe('parseQuery', () => {
		test('should parse simple query string', () => {
			const result = UrlAndQueryString.parseQuery('?name=John&age=30');
			expect(result).toEqual({ name: 'John', age: '30' });
		});

		test('should parse query string without question mark', () => {
			const result = UrlAndQueryString.parseQuery('name=John&age=30');
			expect(result).toEqual({ name: 'John', age: '30' });
		});

		test('should handle empty query string', () => {
			const result = UrlAndQueryString.parseQuery('');
			expect(result).toEqual({});
		});

		test('should handle parameter without value', () => {
			const result = UrlAndQueryString.parseQuery('name=John&flag');
			expect(result).toEqual({ name: 'John', flag: '' });
		});

		test('should handle encoded characters', () => {
			const result = UrlAndQueryString.parseQuery('name=John%20Doe&message=hello%20world');
			expect(result.name).toBe('John Doe');
			expect(result.message).toBe('hello world');
		});

		test('should handle array parameters', () => {
			const result = UrlAndQueryString.parseQuery('items[0]=apple&items[1]=banana');
			expect(result.items).toEqual(['apple', 'banana']);
		});

		test('should handle nested array parameters', () => {
			const result = UrlAndQueryString.parseQuery('data[user][name]=John&data[user][age]=30');
			expect(result.data).toBeDefined();
			expect(result.data.user).toBeDefined();
			expect(result.data.user.name).toBe('John');
			expect(result.data.user.age).toBe('30');
		});
	});

	describe('buildQuery', () => {
		test('should build query string from simple object', () => {
			const result = UrlAndQueryString.buildQuery({ name: 'John', age: 30 });
			expect(result).toContain('name=John');
			expect(result).toContain('age=30');
		});

		test('should handle empty object', () => {
			const result = UrlAndQueryString.buildQuery({});
			expect(result).toBe('');
		});

		test('should handle boolean values', () => {
			const result = UrlAndQueryString.buildQuery({ active: true, deleted: false });
			expect(result).toContain('active=1');
			expect(result).toContain('deleted=0');
		});

		test('should skip undefined values', () => {
			const result = UrlAndQueryString.buildQuery({ name: 'John', age: undefined });
			expect(result).toContain('name=John');
			expect(result).not.toContain('undefined');
		});

		test('should skip null values', () => {
			const result = UrlAndQueryString.buildQuery({ name: 'John', age: null });
			expect(result).toContain('name=John');
			expect(result).not.toContain('null');
		});

		test('should handle array values', () => {
			const result = UrlAndQueryString.buildQuery({ items: ['apple', 'banana', 'orange'] });
			expect(result).toContain('items[]=apple');
			expect(result).toContain('items[]=banana');
			expect(result).toContain('items[]=orange');
		});

		test('should handle nested objects', () => {
			const result = UrlAndQueryString.buildQuery({ user: { name: 'John', age: 30 } });
			expect(result).toContain('user[]=John');
			expect(result).toContain('user[]=30');
		});
	});

	describe('parseQueryString (deprecated)', () => {
		test('should parse simple query string', () => {
			const result = UrlAndQueryString.parseQueryString('?name=John&age=30');
			expect(result).toEqual({ name: 'John', age: '30' });
		});

		test('should handle empty string', () => {
			const result = UrlAndQueryString.parseQueryString('');
			expect(result).toEqual({});
		});

		test('should handle null', () => {
			const result = UrlAndQueryString.parseQueryString(null);
			expect(result).toEqual({});
		});

		test('should parse boolean values', () => {
			const result = UrlAndQueryString.parseQueryString('active=true&deleted=false');
			expect(result.active).toBe(true);
			expect(result.deleted).toBe(false);
		});

		test('should handle array parameters', () => {
			const result = UrlAndQueryString.parseQueryString('items[]=apple&items[]=banana');
			expect(result.items).toEqual(['apple', 'banana']);
		});

		test('should prevent prototype pollution with __proto__', () => {
			const result = UrlAndQueryString.parseQueryString('__proto__[polluted]=true');
			// Vérifie que la propriété polluted n'a pas été ajoutée au prototype
			expect(result.polluted).toBeUndefined();
			expect(Object.keys(result).length).toBe(0);
		});
	});

	describe('matchQueryParamsToFormFields', () => {
		test('should keep scalar param matching a scalar field', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ name: 'John' },
				['name', 'age']
			);
			expect(result).toEqual({ name: 'John' });
		});

		test('should keep array param matching an array field', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ tags: ['a', 'b'] },
				['tags[]']
			);
			expect(result).toEqual({ tags: ['a', 'b'] });
		});

		test('should wrap scalar into array when field expects array', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ tags: 'a' },
				['tags[]']
			);
			expect(result).toEqual({ tags: ['a'] });
		});

		test('should exclude params not in the list', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ name: 'John', unknown: 'x' },
				['name']
			);
			expect(result).toEqual({ name: 'John' });
			expect(result).not.toHaveProperty('unknown');
		});

		test('should handle mix of scalar and array fields', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ name: 'John', tags: ['a', 'b'], page: '1' },
				['name', 'tags[]', 'page']
			);
			expect(result).toEqual({ name: 'John', tags: ['a', 'b'], page: '1' });
		});

		test('should return empty object when no params match', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ foo: 'bar' },
				['name', 'tags[]']
			);
			expect(result).toEqual({});
		});

		test('should return empty object when inputs are empty', () => {
			expect(UrlAndQueryString.matchQueryParamsToFormFields({}, [])).toEqual({});
		});

		test('should not include array param when field only accepts scalar', () => {
			const result = UrlAndQueryString.matchQueryParamsToFormFields(
				{ name: ['a', 'b'] },
				['name']
			);
			expect(result).toEqual({});
		});
	});

	describe('getQuery (deprecated)', () => {
		test('should get query string from URL', () => {
			const result = UrlAndQueryString.getQuery('https://example.com/path?query=1&param=2');
			expect(result).toBe('query=1&param=2');
		});

		test('should return empty string for URL without query', () => {
			const result = UrlAndQueryString.getQuery('https://example.com/path');
			expect(result).toBe('');
		});

		test('should handle URL with anchor', () => {
			const result = UrlAndQueryString.getQuery('https://example.com/path?query=1#section');
			expect(result).toBe('query=1');
		});

		test('should handle URL with only anchor', () => {
			const result = UrlAndQueryString.getQuery('https://example.com/path#section');
			expect(result).toBe('');
		});
	});
});