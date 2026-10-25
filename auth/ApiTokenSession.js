class ApiTokenSession {
	static getToken() {
		return localStorage.getItem('api_token');
	}
	static setToken(token) {
		localStorage.setItem('api_token', token);
	}

	static getTokenData() {
		let tokenData = localStorage.getItem('token_data');
		if (null == tokenData) {
			return null;
		}
		return JSON.parse(tokenData);
	}
	static setTokenData(data) {
		localStorage.setItem('token_data', JSON.stringify(data));
	}

	static logout() {
		localStorage.removeItem('api_token');
		localStorage.removeItem('token_data');
	}

	static getData(key) {
		let tokenData = ApiTokenSession.getTokenData();
		if (tokenData == null) {
			return null;
		}

		if (typeof tokenData[key] != 'undefined') {
			return tokenData[key];
		}
		return null;
	}

	static isAnonymous() {
		return ApiTokenSession.getToken() == null;
	}

	static isGranted(role) {
		if (ApiTokenSession.getToken() == null) {
			return false;
		}

		let roles = [];
		if (null !== ApiTokenSession.getData('role')) {
			roles = ApiTokenSession.getData('role');
		}
		if (null !== ApiTokenSession.getData('roles')) {
			roles = ApiTokenSession.getData('roles');
		}
		roles = Array.isArray(roles) ? roles : [roles];

		return roles.indexOf(role) !== -1;
	}

	static denyAccessUnlessGranted(roles) {
		let hasRole = false;

		roles.forEach(role => {
			if (ApiTokenSession.isGranted(role)) {
				hasRole = true;
			}
		});

		return hasRole;
	}
}

export { ApiTokenSession };
