import { JwtToken } from './JwtToken.js';

class JwtSession {
	/*static setStorage(storage) {
		JwtSession.storage = storage;
	}*/
	static setOnLoginCallback(callback) {
		JwtSession.onLoginCallback = callback;
	}
	static setOnLogoutCallback(callback) {
		JwtSession.onLogoutCallback = callback;
	}
	static setOnNewTokenCallback(callback) {
		JwtSession.onNewTokenCallback = callback;
	}
	static setOnSessionExpireCallback(callback) {
		JwtSession.onSessionExpireCallback = callback;
	}

	static getItemInStorage(key) {
		return localStorage.getItem(key);
	}
	static setItemInStorage(key, value) {
		localStorage.setItem(key, value);
	}
	static removeItemInStorage(key) {
		localStorage.removeItem(key);
	}

	static getToken() {
		return JwtSession.getItemInStorage('access_token');
	}
	static setToken(token) {
		JwtSession.setItemInStorage('access_token', token);
	}

	static getRefreshToken() {
		return JwtSession.getItemInStorage('refresh_token');
	}
	static setRefreshToken(token) {
		JwtSession.setItemInStorage('refresh_token', token);
	}

	static login(data, redirectUrl, onComplete) {
		console.log('JwtSession.login()');
		JwtSession.setToken(data['access_token'] || data['token']);
		if (data['refresh_token'] != null) {
			JwtSession.setRefreshToken(data['refresh_token']);
		}

		JwtSession.removeItemInStorage('real_users');

		if (typeof JwtSession.onLoginCallback == 'function') {
			JwtSession.onLoginCallback();
		}
		if (typeof onComplete == 'function') {
			onComplete();
		}

		if (typeof redirectUrl != 'undefined' && null != redirectUrl) {
			window.location.href = redirectUrl;
		}
	}

	static updateToken(accessToken, refreshToken, onComplete) {
		console.log('JwtSession.updateToken()');
		JwtSession.setToken(accessToken);

		if (typeof refreshToken != 'undefined' && null != refreshToken) {
			JwtSession.setRefreshToken(refreshToken);
		}

		if (typeof JwtSession.onNewTokenCallback == 'function') {
			JwtSession.onNewTokenCallback();
		}
		if (typeof onComplete == 'function') {
			onComplete(accessToken, refreshToken);
		}
	}

	static logout(redirectUrl, onComplete) {
		console.log('JwtSession.logout()');
		JwtSession.removeItemInStorage('access_token');
		JwtSession.removeItemInStorage('refresh_token');

		JwtSession.removeItemInStorage('real_users');

		if (typeof JwtSession.onLogoutCallback == 'function') {
			JwtSession.onLogoutCallback();
		}
		if (typeof onComplete == 'function') {
			onComplete();
		}

		if (typeof redirectUrl != 'undefined' && null != redirectUrl) {
			window.location.href = redirectUrl;
		}
	}

	static expireSession(redirectUrl, onComplete) {
		console.log('JwtSession.expireSession()');
		JwtSession.removeItemInStorage('access_token');
		JwtSession.removeItemInStorage('refresh_token');

		JwtSession.removeItemInStorage('real_users');

		if (typeof JwtSession.onSessionExpireCallback == 'function') {
			JwtSession.onSessionExpireCallback();
		}
		if (typeof onComplete == 'function') {
			onComplete();
		}

		if (typeof redirectUrl != 'undefined' && null != redirectUrl) {
			window.location.href = redirectUrl;
		}
	}

	static getData(key) {
		return JwtToken.getData(JwtSession.getToken(), key);
	}

	static isAnonymous() {
		return JwtSession.getItemInStorage('access_token') == null;
	}

	static isGranted(role) {
		return JwtToken.hasRole(JwtSession.getToken(), role);
	}

	static denyAccessUnlessGranted(roles) {
		let hasRole = false;

		roles.forEach(role => {
			if (JwtSession.isGranted(role)) {
				hasRole = true;
			}
		});

		return hasRole;
	}


	static getRealLoggedUsers() {
		let realUsers = [];
		if (JwtSession.getItemInStorage('real_users') != null) {
			realUsers = JSON.parse(JwtSession.getItemInStorage('real_users'));
		}
		return realUsers;
	}

	static simulateLogin(loginData, redirectUrl, onComplete) {
		console.log('JwtSession.simulateLogin');

		// on sauvegarde les tokens de l'utilisateur réellement connecté
		let realUsers = JwtSession.getRealLoggedUsers();
		realUsers.push({
			access_token: JwtSession.getToken(),
			refresh_token: JwtSession.getRefreshToken(),
		});
		JwtSession.setItemInStorage('real_users', JSON.stringify(realUsers));

		// on enregistre la session de l'utilisateur simulé
		JwtSession.setToken(loginData['access_token'] || loginData['token']);
		if (loginData['refresh_token'] != null) {
			JwtSession.setRefreshToken(loginData['refresh_token']);
		}

		if (typeof onComplete == 'function') {
			onComplete();
		}

		if (typeof redirectUrl != 'undefined' && null != redirectUrl) {
			window.location.href = redirectUrl;
		}
	}

	static cancelSimulatedLogin(redirectUrl, onComplete) {
		console.log('JwtSession.cancelSimulatedLogin');

		// on récupère les tokens de l'utilisateur réellement connecté
		let realUsers = JwtSession.getRealLoggedUsers();
		let loginData = realUsers.pop();

		if (typeof loginData == 'undefined' || null == loginData) {
			return;
		}

		JwtSession.setItemInStorage('real_users', JSON.stringify(realUsers));

		JwtSession.setToken(loginData['access_token'] || loginData['token']);
		if (loginData['refresh_token'] != null) {
			JwtSession.setRefreshToken(loginData['refresh_token']);
		}

		if (typeof onComplete == 'function') {
			onComplete();
		}

		if (typeof redirectUrl != 'undefined' && null != redirectUrl) {
			window.location.href = redirectUrl;
		}
	}

}

export { JwtSession };
