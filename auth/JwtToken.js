class JwtToken {
	static parseJwt (token) {
		let base64Url = token.split('.')[1];
		let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		let jsonPayload;
		try {
			jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
		} catch (e) {
			// Fallback for characters that can't be decoded
			jsonPayload = atob(base64);
		}

		return JSON.parse(jsonPayload);
	}

	static getData(token, key) {
		if (token == null) {
			return null;
		}

		let payload = JwtToken.parseJwt(token);
		if (typeof payload[key] != 'undefined') {
			return payload[key];
		}
		return null;
	}

	static hasRole(token, role) {
		if (token == null) {
			return false;
		}

		let payload = JwtToken.parseJwt(token);
		return typeof payload['roles'] != 'undefined' && payload['roles'].indexOf(role) !== -1;
	}
}

export { JwtToken };
