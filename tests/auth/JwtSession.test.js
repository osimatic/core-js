import { jest } from '@jest/globals';
import { JwtSession } from '../../auth/JwtSession.js';
import { createJwtToken, createLocalStorageMock } from './helpers.js';

describe('JwtSession', () => {
	let localStorageMock;
	let consoleLogSpy;

	beforeEach(() => {
		localStorageMock = createLocalStorageMock();

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