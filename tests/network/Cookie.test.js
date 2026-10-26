import { Cookie } from '../../network/Cookie.js';

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