import { jest } from '@jest/globals';
import { ApiTokenSession } from '../../auth/ApiTokenSession.js';
import { createLocalStorageMock } from './helpers.js';

describe('ApiTokenSession', () => {
	let localStorageMock;

	beforeEach(() => {
		localStorageMock = createLocalStorageMock();

		global.localStorage = localStorageMock;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Token management', () => {
		test('should get and set token', () => {
			ApiTokenSession.setToken('api_token_123');

			expect(ApiTokenSession.getToken()).toBe('api_token_123');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('api_token', 'api_token_123');
		});

		test('should return null when no token', () => {
			expect(ApiTokenSession.getToken()).toBeNull();
		});
	});

	describe('Token data management', () => {
		test('should get and set token data', () => {
			const data = { userId: 123, username: 'john' };
			ApiTokenSession.setTokenData(data);

			expect(ApiTokenSession.getTokenData()).toEqual(data);
		});

		test('should return null when no token data', () => {
			expect(ApiTokenSession.getTokenData()).toBeNull();
		});

		test('should parse JSON correctly', () => {
			const data = { roles: ['ROLE_USER'], permissions: ['read', 'write'] };
			ApiTokenSession.setTokenData(data);

			const result = ApiTokenSession.getTokenData();
			expect(result.roles).toEqual(['ROLE_USER']);
		});
	});

	describe('logout', () => {
		test('should remove token and token data', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ userId: 123 });

			ApiTokenSession.logout();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('api_token');
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('token_data');
		});
	});

	describe('getData', () => {
		test('should get data by key', () => {
			ApiTokenSession.setTokenData({ userId: 123, username: 'john' });

			expect(ApiTokenSession.getData('userId')).toBe(123);
			expect(ApiTokenSession.getData('username')).toBe('john');
		});

		test('should return null for missing key', () => {
			ApiTokenSession.setTokenData({ userId: 123 });

			expect(ApiTokenSession.getData('nonexistent')).toBeNull();
		});

		test('should return null when no token data', () => {
			expect(ApiTokenSession.getData('userId')).toBeNull();
		});

		test('should handle nested objects', () => {
			ApiTokenSession.setTokenData({ user: { id: 123, name: 'John' } });

			expect(ApiTokenSession.getData('user')).toEqual({ id: 123, name: 'John' });
		});
	});

	describe('isAnonymous', () => {
		test('should return true when no token', () => {
			expect(ApiTokenSession.isAnonymous()).toBe(true);
		});

		test('should return false when token exists', () => {
			ApiTokenSession.setToken('token123');

			expect(ApiTokenSession.isAnonymous()).toBe(false);
		});
	});

	describe('isGranted', () => {
		test('should return true when user has role in roles array', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: ['ROLE_USER', 'ROLE_ADMIN'] });

			expect(ApiTokenSession.isGranted('ROLE_ADMIN')).toBe(true);
		});

		test('should return true when user has role in role string', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ role: 'ROLE_USER' });

			expect(ApiTokenSession.isGranted('ROLE_USER')).toBe(true);
		});

		test('should handle single role as string', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: 'ROLE_USER' });

			expect(ApiTokenSession.isGranted('ROLE_USER')).toBe(true);
		});

		test('should return false when user does not have role', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: ['ROLE_USER'] });

			expect(ApiTokenSession.isGranted('ROLE_ADMIN')).toBe(false);
		});

		test('should return false when no token', () => {
			expect(ApiTokenSession.isGranted('ROLE_USER')).toBe(false);
		});

		test('should prefer roles over role when both exist', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ role: 'ROLE_USER', roles: ['ROLE_ADMIN'] });

			expect(ApiTokenSession.isGranted('ROLE_ADMIN')).toBe(true);
			expect(ApiTokenSession.isGranted('ROLE_USER')).toBe(false);
		});

		test('should handle empty roles array', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: [] });

			expect(ApiTokenSession.isGranted('ROLE_USER')).toBe(false);
		});

		test('should handle null role and roles', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ userId: 123 });

			expect(ApiTokenSession.isGranted('ROLE_USER')).toBe(false);
		});
	});

	describe('denyAccessUnlessGranted', () => {
		test('should return true when user has at least one role', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: ['ROLE_USER'] });

			const result = ApiTokenSession.denyAccessUnlessGranted(['ROLE_ADMIN', 'ROLE_USER']);

			expect(result).toBe(true);
		});

		test('should return false when user has none of the roles', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: ['ROLE_USER'] });

			const result = ApiTokenSession.denyAccessUnlessGranted(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

			expect(result).toBe(false);
		});

		test('should return false when no token', () => {
			const result = ApiTokenSession.denyAccessUnlessGranted(['ROLE_USER']);

			expect(result).toBe(false);
		});

		test('should return true when user has multiple required roles', () => {
			ApiTokenSession.setToken('token123');
			ApiTokenSession.setTokenData({ roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] });

			const result = ApiTokenSession.denyAccessUnlessGranted(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

			expect(result).toBe(true);
		});
	});
});