import { JwtToken, JwtSession, ApiTokenSession } from '../jwt.js';

// Helper function to create a valid JWT token for testing
function createJwtToken(payload) {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = btoa(JSON.stringify(header));
	const encodedPayload = btoa(JSON.stringify(payload))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	const signature = 'fake_signature';
	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

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

describe('JwtSession', () => {
	let localStorageMock;
	let consoleLogSpy;

	beforeEach(() => {
		// Mock localStorage
		localStorageMock = (() => {
			let store = {};
			return {
				getItem: jest.fn((key) => store[key] || null),
				setItem: jest.fn((key, value) => {
					store[key] = value.toString();
				}),
				removeItem: jest.fn((key) => {
					delete store[key];
				}),
				clear: jest.fn(() => {
					store = {};
				})
			};
		})();

		global.localStorage = localStorageMock;
		global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
		global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
		global.window = { location: { href: '' } };

		// Mock console.log
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

		// Reset callbacks
		JwtSession.onLoginCallback = undefined;
		JwtSession.onLogoutCallback = undefined;
		JwtSession.onNewTokenCallback = undefined;
		JwtSession.onSessionExpireCallback = undefined;
	});

	afterEach(() => {
		jest.clearAllMocks();
		consoleLogSpy.mockRestore();
	});

	describe('Callback setters', () => {
		test('should set onLoginCallback', () => {
			const callback = jest.fn();
			JwtSession.setOnLoginCallback(callback);

			expect(JwtSession.onLoginCallback).toBe(callback);
		});

		test('should set onLogoutCallback', () => {
			const callback = jest.fn();
			JwtSession.setOnLogoutCallback(callback);

			expect(JwtSession.onLogoutCallback).toBe(callback);
		});

		test('should set onNewTokenCallback', () => {
			const callback = jest.fn();
			JwtSession.setOnNewTokenCallback(callback);

			expect(JwtSession.onNewTokenCallback).toBe(callback);
		});

		test('should set onSessionExpireCallback', () => {
			const callback = jest.fn();
			JwtSession.setOnSessionExpireCallback(callback);

			expect(JwtSession.onSessionExpireCallback).toBe(callback);
		});
	});

	describe('Token management', () => {
		test('should get and set access token', () => {
			JwtSession.setToken('test_token');

			expect(JwtSession.getToken()).toBe('test_token');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'test_token');
		});

		test('should get and set refresh token', () => {
			JwtSession.setRefreshToken('refresh_token');

			expect(JwtSession.getRefreshToken()).toBe('refresh_token');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token');
		});

		test('should return null when no token exists', () => {
			expect(JwtSession.getToken()).toBeNull();
		});
	});

	describe('login', () => {
		test('should store tokens and call callbacks', () => {
			const loginCallback = jest.fn();
			const onComplete = jest.fn();
			JwtSession.setOnLoginCallback(loginCallback);

			JwtSession.login({ access_token: 'token123', refresh_token: 'refresh123' }, null, onComplete);

			expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'token123');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'refresh123');
			expect(loginCallback).toHaveBeenCalled();
			expect(onComplete).toHaveBeenCalled();
			expect(consoleLogSpy).toHaveBeenCalledWith('JwtSession.login()');
		});

		test('should handle token key instead of access_token', () => {
			JwtSession.login({ token: 'token123', refresh_token: 'refresh123' });

			expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'token123');
		});

		test('should redirect when redirectUrl is provided', () => {
			JwtSession.login({ access_token: 'token123' }, 'https://example.com/dashboard');

			expect(window.location.href).toBe('https://example.com/dashboard');
		});

		test('should not redirect when redirectUrl is null', () => {
			window.location.href = 'https://example.com';
			JwtSession.login({ access_token: 'token123' }, null);

			expect(window.location.href).toBe('https://example.com');
		});

		test('should remove real_users from storage', () => {
			JwtSession.login({ access_token: 'token123' });

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('real_users');
		});

		test('should work without callbacks', () => {
			expect(() => {
				JwtSession.login({ access_token: 'token123' });
			}).not.toThrow();
		});
	});

	describe('updateToken', () => {
		test('should update access token', () => {
			const onComplete = jest.fn();

			JwtSession.updateToken('new_token', 'new_refresh', onComplete);

			expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new_token');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new_refresh');
			expect(onComplete).toHaveBeenCalledWith('new_token', 'new_refresh');
		});

		test('should call onNewTokenCallback', () => {
			const callback = jest.fn();
			JwtSession.setOnNewTokenCallback(callback);

			JwtSession.updateToken('new_token');

			expect(callback).toHaveBeenCalled();
		});

		test('should not update refresh token if undefined', () => {
			JwtSession.updateToken('new_token', undefined);

			expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new_token');
			expect(localStorageMock.setItem).not.toHaveBeenCalledWith('refresh_token', undefined);
		});

		test('should work without callbacks', () => {
			expect(() => {
				JwtSession.updateToken('new_token');
			}).not.toThrow();
		});
	});

	describe('logout', () => {
		test('should remove tokens and call callbacks', () => {
			const logoutCallback = jest.fn();
			const onComplete = jest.fn();
			JwtSession.setOnLogoutCallback(logoutCallback);

			JwtSession.logout(null, onComplete);

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('real_users');
			expect(logoutCallback).toHaveBeenCalled();
			expect(onComplete).toHaveBeenCalled();
			expect(consoleLogSpy).toHaveBeenCalledWith('JwtSession.logout()');
		});

		test('should redirect when redirectUrl is provided', () => {
			JwtSession.logout('https://example.com/login');

			expect(window.location.href).toBe('https://example.com/login');
		});

		test('should work without callbacks', () => {
			expect(() => {
				JwtSession.logout();
			}).not.toThrow();
		});
	});

	describe('expireSession', () => {
		test('should remove tokens and call expire callback', () => {
			const expireCallback = jest.fn();
			const onComplete = jest.fn();
			JwtSession.setOnSessionExpireCallback(expireCallback);

			JwtSession.expireSession(null, onComplete);

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('real_users');
			expect(expireCallback).toHaveBeenCalled();
			expect(onComplete).toHaveBeenCalled();
			expect(consoleLogSpy).toHaveBeenCalledWith('JwtSession.expireSession()');
		});

		test('should redirect when redirectUrl is provided', () => {
			JwtSession.expireSession('https://example.com/expired');

			expect(window.location.href).toBe('https://example.com/expired');
		});
	});

	describe('getData', () => {
		test('should get data from current token', () => {
			const payload = { userId: 123, username: 'john' };
			const token = createJwtToken(payload);
			JwtSession.setToken(token);

			const result = JwtSession.getData('userId');

			expect(result).toBe(123);
		});

		test('should return null when no token', () => {
			const result = JwtSession.getData('userId');

			expect(result).toBeNull();
		});
	});

	describe('isAnonymous', () => {
		test('should return true when no token', () => {
			expect(JwtSession.isAnonymous()).toBe(true);
		});

		test('should return false when token exists', () => {
			JwtSession.setToken('token123');

			expect(JwtSession.isAnonymous()).toBe(false);
		});
	});

	describe('isGranted', () => {
		test('should return true when user has role', () => {
			const payload = { roles: ['ROLE_USER', 'ROLE_ADMIN'] };
			const token = createJwtToken(payload);
			JwtSession.setToken(token);

			expect(JwtSession.isGranted('ROLE_ADMIN')).toBe(true);
		});

		test('should return false when user does not have role', () => {
			const payload = { roles: ['ROLE_USER'] };
			const token = createJwtToken(payload);
			JwtSession.setToken(token);

			expect(JwtSession.isGranted('ROLE_ADMIN')).toBe(false);
		});
	});

	describe('denyAccessUnlessGranted', () => {
		test('should return true when user has at least one role', () => {
			const payload = { roles: ['ROLE_USER'] };
			const token = createJwtToken(payload);
			JwtSession.setToken(token);

			const result = JwtSession.denyAccessUnlessGranted(['ROLE_ADMIN', 'ROLE_USER']);

			expect(result).toBe(true);
		});

		test('should return false when user has none of the roles', () => {
			const payload = { roles: ['ROLE_USER'] };
			const token = createJwtToken(payload);
			JwtSession.setToken(token);

			const result = JwtSession.denyAccessUnlessGranted(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

			expect(result).toBe(false);
		});

		test('should return false when no token', () => {
			const result = JwtSession.denyAccessUnlessGranted(['ROLE_USER']);

			expect(result).toBe(false);
		});
	});

	describe('Simulate login', () => {
		test('should save real user and switch to simulated user', () => {
			const realToken = createJwtToken({ userId: 1 });
			const simulatedToken = createJwtToken({ userId: 2 });

			JwtSession.setToken(realToken);
			JwtSession.setRefreshToken('refresh1');

			JwtSession.simulateLogin({ access_token: simulatedToken, refresh_token: 'refresh2' });

			expect(JwtSession.getToken()).toBe(simulatedToken);
			const realUsers = JwtSession.getRealLoggedUsers();
			expect(realUsers).toHaveLength(1);
			expect(realUsers[0].access_token).toBe(realToken);
		});

		test('should handle multiple simulated logins', () => {
			JwtSession.setToken('token1');
			JwtSession.simulateLogin({ access_token: 'token2' });
			JwtSession.simulateLogin({ access_token: 'token3' });

			const realUsers = JwtSession.getRealLoggedUsers();
			expect(realUsers).toHaveLength(2);
		});

		test('should handle token key instead of access_token', () => {
			JwtSession.simulateLogin({ token: 'simulated_token' });

			expect(JwtSession.getToken()).toBe('simulated_token');
		});

		test('should call onComplete callback', () => {
			const onComplete = jest.fn();
			JwtSession.simulateLogin({ access_token: 'token' }, null, onComplete);

			expect(onComplete).toHaveBeenCalled();
		});

		test('should redirect when redirectUrl is provided', () => {
			JwtSession.simulateLogin({ access_token: 'token' }, 'https://example.com/simulated');

			expect(window.location.href).toBe('https://example.com/simulated');
		});
	});

	describe('cancelSimulatedLogin', () => {
		test('should restore real user token', () => {
			const realToken = 'real_token';
			JwtSession.setToken(realToken);
			JwtSession.simulateLogin({ access_token: 'simulated_token' });

			JwtSession.cancelSimulatedLogin();

			expect(JwtSession.getToken()).toBe(realToken);
			expect(JwtSession.getRealLoggedUsers()).toHaveLength(0);
		});

		test('should handle multiple cancel operations', () => {
			JwtSession.setToken('token1');
			JwtSession.simulateLogin({ access_token: 'token2' });
			JwtSession.simulateLogin({ access_token: 'token3' });

			JwtSession.cancelSimulatedLogin();
			expect(JwtSession.getToken()).toBe('token2');

			JwtSession.cancelSimulatedLogin();
			expect(JwtSession.getToken()).toBe('token1');
		});

		test('should do nothing when no simulated login exists', () => {
			JwtSession.setToken('token1');

			expect(() => {
				JwtSession.cancelSimulatedLogin();
			}).not.toThrow();

			expect(JwtSession.getToken()).toBe('token1');
		});

		test('should handle token key instead of access_token', () => {
			JwtSession.setToken('real_token');
			JwtSession.simulateLogin({ token: 'simulated' });
			JwtSession.cancelSimulatedLogin();

			expect(JwtSession.getToken()).toBe('real_token');
		});

		test('should call onComplete callback', () => {
			const onComplete = jest.fn();
			JwtSession.setToken('real');
			JwtSession.simulateLogin({ access_token: 'simulated' });
			JwtSession.cancelSimulatedLogin(null, onComplete);

			expect(onComplete).toHaveBeenCalled();
		});

		test('should redirect when redirectUrl is provided', () => {
			JwtSession.setToken('real');
			JwtSession.simulateLogin({ access_token: 'simulated' });
			JwtSession.cancelSimulatedLogin('https://example.com/back');

			expect(window.location.href).toBe('https://example.com/back');
		});
	});

	describe('getRealLoggedUsers', () => {
		test('should return empty array when no real users', () => {
			expect(JwtSession.getRealLoggedUsers()).toEqual([]);
		});

		test('should return array of real users', () => {
			const users = [{ access_token: 'token1' }, { access_token: 'token2' }];
			localStorageMock.setItem('real_users', JSON.stringify(users));

			expect(JwtSession.getRealLoggedUsers()).toEqual(users);
		});
	});
});

describe('ApiTokenSession', () => {
	let localStorageMock;

	beforeEach(() => {
		localStorageMock = (() => {
			let store = {};
			return {
				getItem: jest.fn((key) => store[key] || null),
				setItem: jest.fn((key, value) => {
					store[key] = value.toString();
				}),
				removeItem: jest.fn((key) => {
					delete store[key];
				})
			};
		})();

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