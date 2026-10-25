import { JwtToken } from '../../auth/JwtToken.js';
import { createJwtToken } from './helpers.js';

describe('JwtToken', () => {
	beforeEach(() => {
		// Mock atob for Node.js environment
		global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
		global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
	});

	describe('parseJwt', () => {
		test('should parse valid JWT token', () => {
			const payload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 };
			const token = createJwtToken(payload);

			const result = JwtToken.parseJwt(token);

			expect(result).toEqual(payload);
		});

		test('should parse JWT with roles', () => {
			const payload = { sub: '123', roles: ['ROLE_USER', 'ROLE_ADMIN'] };
			const token = createJwtToken(payload);

			const result = JwtToken.parseJwt(token);

			expect(result.roles).toEqual(['ROLE_USER', 'ROLE_ADMIN']);
		});

		test('should handle JWT with special characters', () => {
			const payload = { name: 'José García', email: 'jose@example.com' };
			const token = createJwtToken(payload);

			const result = JwtToken.parseJwt(token);

			expect(result.name).toBe('José García');
		});

		test('should parse JWT with nested objects', () => {
			const payload = {
				user: {
					id: 1,
					profile: { firstName: 'John', lastName: 'Doe' }
				}
			};
			const token = createJwtToken(payload);

			const result = JwtToken.parseJwt(token);

			expect(result.user.profile.firstName).toBe('John');
		});

		test('should parse JWT with array data', () => {
			const payload = { permissions: ['read', 'write', 'delete'] };
			const token = createJwtToken(payload);

			const result = JwtToken.parseJwt(token);

			expect(result.permissions).toEqual(['read', 'write', 'delete']);
		});

		test('should handle JWT with URL-safe base64', () => {
			const payload = { data: 'test-data_with/special+chars' };
			const token = createJwtToken(payload);

			const result = JwtToken.parseJwt(token);

			expect(result.data).toBe('test-data_with/special+chars');
		});
	});

	describe('getData', () => {
		test('should extract data from token by key', () => {
			const payload = { userId: 123, username: 'john' };
			const token = createJwtToken(payload);

			const result = JwtToken.getData(token, 'userId');

			expect(result).toBe(123);
		});

		test('should return null for missing key', () => {
			const payload = { userId: 123 };
			const token = createJwtToken(payload);

			const result = JwtToken.getData(token, 'nonexistent');

			expect(result).toBeNull();
		});

		test('should return null for null token', () => {
			const result = JwtToken.getData(null, 'userId');

			expect(result).toBeNull();
		});

		test('should extract nested data', () => {
			const payload = { user: { id: 123, name: 'John' } };
			const token = createJwtToken(payload);

			const result = JwtToken.getData(token, 'user');

			expect(result).toEqual({ id: 123, name: 'John' });
		});

		test('should extract array data', () => {
			const payload = { roles: ['ROLE_USER', 'ROLE_ADMIN'] };
			const token = createJwtToken(payload);

			const result = JwtToken.getData(token, 'roles');

			expect(result).toEqual(['ROLE_USER', 'ROLE_ADMIN']);
		});

		test('should handle undefined token', () => {
			const result = JwtToken.getData(undefined, 'key');

			expect(result).toBeNull();
		});
	});

	describe('hasRole', () => {
		test('should return true when user has role', () => {
			const payload = { roles: ['ROLE_USER', 'ROLE_ADMIN'] };
			const token = createJwtToken(payload);

			const result = JwtToken.hasRole(token, 'ROLE_ADMIN');

			expect(result).toBe(true);
		});

		test('should return false when user does not have role', () => {
			const payload = { roles: ['ROLE_USER'] };
			const token = createJwtToken(payload);

			const result = JwtToken.hasRole(token, 'ROLE_ADMIN');

			expect(result).toBe(false);
		});

		test('should return false when token has no roles', () => {
			const payload = { userId: 123 };
			const token = createJwtToken(payload);

			const result = JwtToken.hasRole(token, 'ROLE_USER');

			expect(result).toBe(false);
		});

		test('should return false for null token', () => {
			const result = JwtToken.hasRole(null, 'ROLE_USER');

			expect(result).toBe(false);
		});

		test('should handle empty roles array', () => {
			const payload = { roles: [] };
			const token = createJwtToken(payload);

			const result = JwtToken.hasRole(token, 'ROLE_USER');

			expect(result).toBe(false);
		});

		test('should be case sensitive', () => {
			const payload = { roles: ['ROLE_USER'] };
			const token = createJwtToken(payload);

			const result = JwtToken.hasRole(token, 'role_user');

			expect(result).toBe(false);
		});
	});
});