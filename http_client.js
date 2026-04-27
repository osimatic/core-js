import { JwtSession } from './jwt.js';
import { UrlAndQueryString } from './network.js';
import { Locale } from './locale.js';

class HTTPClient {
	static setAuthorizationToken(authorizationToken) {
		HTTPClient.authorizationToken = authorizationToken;
	}

	// URL appelée pour rafraichir le token. Le token est mis à jour dans JwtSession. En cas de succès, on appelle HTTPClient.onSuccessRefreshTokenCallback et on réexécute toutes les requêtes HTTP en attente de nouveau token. En cas d'échec, on redirige vers HTTPClient.onInvalidRefreshTokenRedirectUrl et/ou on appelle HTTPClient.onInvalidRefreshTokenCallback.
	static setRefreshTokenUrl(url) {
		HTTPClient.refreshTokenUrl = url;
	}
	// Callback appelé pour remplacer l'appel à HTTPClient.refreshTokenUrl (et donc pas de gestion de la session avec JwtSession)
	static setRefreshTokenCallback(callback) {
		HTTPClient.refreshTokenCallback = callback;
	}

	static setGetRefreshTokenCallback(callback) {
		HTTPClient.getRefreshTokenCallback = callback;
	}

	static setOnSuccessRefreshTokenCallback(callback) {
		HTTPClient.onSuccessRefreshTokenCallback = callback;
	}
	static setOnInvalidRefreshTokenCallback(callback) {
		HTTPClient.onInvalidRefreshTokenCallback = callback;
	}
	static setOnInvalidRefreshTokenRedirectUrl(url) {
		HTTPClient.onInvalidRefreshTokenRedirectUrl = url;
	}

	// URL de la page vers laquelle on redirige si le token est invalide apres destruction de la JwtSession.
	static setOnInvalidTokenRedirectUrl(url) {
		HTTPClient.onInvalidTokenRedirectUrl = url;
	}
	// Callback appelé lorsqu'un token est invalide (destruction de la JwtSession dans tous les cas).
	static setOnInvalidTokenCallback(callback) {
		HTTPClient.onInvalidTokenCallback = callback;
	}

	static getHeaders(asObject=false, additionalHeaders={}, addAuthorizationHeader=true) {
		let httpHeadersData = {};

		if (typeof HTTPClient.headers != 'undefined' && null != HTTPClient.headers) {
			HTTPClient.headers['Authorization'] = null;
			httpHeadersData = HTTPClient.headers;
		}

		httpHeadersData['Accept-Language'] = Locale.getDefault();

		if (addAuthorizationHeader) {
			const authorizationToken = typeof HTTPClient.authorizationToken != 'undefined' && null != HTTPClient.authorizationToken ? HTTPClient.authorizationToken : JwtSession.getToken();
			if (null != authorizationToken && '' !== authorizationToken) {
				httpHeadersData['Authorization'] = 'Bearer ' + authorizationToken;
			}
		}

		if (null != additionalHeaders && typeof additionalHeaders == 'object') {
			for (const [key, value] of Object.entries(additionalHeaders)) {
				httpHeadersData[key] = value;
			}
		}

		if (asObject) {
			return httpHeadersData;
		}

		let httpHeaders = new Headers();
		Object.entries(httpHeadersData).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				httpHeaders.append(key, value);
			}
		});
		return httpHeaders;
	}

	static getHeader(key) {
		if (typeof HTTPClient.headers == 'undefined') {
			HTTPClient.headers = {};
		}

		return HTTPClient.headers[key];
	}

	static setHeader(key, value) {
		if (typeof HTTPClient.headers == 'undefined') {
			HTTPClient.headers = {};
		}

		HTTPClient.headers[key] = value;
	}

	static convertObjectToFormData(obj) {
		// 30/05/2022 : ancienne version, qui ne fonctionne pas avec des tableaux
		// let formData = new FormData();
		// Object.entries(data).forEach(([key, value]) => formData.append(key, value));
		// return formData;

		let formData = new FormData();

		function appendFormData(data, root) {
			//console.log('appendFormData', data, root);
			root = root || '';
			if (data instanceof File) {
				formData.append(root, data);
			}
			else if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					appendFormData(data[i], root + '[' + i + ']');
				}
			}
			else if (typeof data === 'object' && data) {
				for (let key in data) {
					if (data.hasOwnProperty(key)) {
						if (root === '') {
							appendFormData(data[key], key);
						} else {
							appendFormData(data[key], root + '.' + key);
						}
					}
				}
			}
			else {
				if (data !== null && typeof data !== 'undefined') {
					formData.append(root, data);
				}
			}
		}

		appendFormData(obj);

		return formData;
	}

	static formatQueryString(data) {
		if (data == null) {
			return '';
		}
		if (typeof data == 'object') {
			data = UrlAndQueryString.buildQuery(data);
		}
		if (data !== '' && data.substring(0, 1) !== '&') {
			data = '&' + data;
		}
		return data;
	}

	static formatFormData(data) {
		if (!(data instanceof FormData)) {
			return HTTPClient.convertObjectToFormData(data);
		}
		return data;
	}

	static formatJsonData(data) {
		if (typeof data == 'string') {
			return data;
		}

		let formData = HTTPClient.formatFormData(data);

		let object = {};
		formData.forEach((value, key) => object[key] = value);
		return JSON.stringify(object);
	}

	static logRequestFailure(response, json) {
		if (null == response) {
			console.error('Request failure : network error.');
			return;
		}
		console.error('Request failure. Status: '+response.statusText+' ; HTTP Code : '+response.status, json);
	}
	static logJqueryRequestFailure(jqxhr, status, errorThrown) {
		console.error('Request failure. Status: ' + status + ' ; HTTP Code: ' + jqxhr.status + (null != errorThrown && '' !== errorThrown ? ' ; Error message: ' + errorThrown : ''), jqxhr.responseJSON);
	}

	static isExpiredToken(response, json) {
		if (response.status !== 401) {
			return false;
		}

		return (
			response.statusText === 'Expired JWT Token'
			|| (typeof json['message'] != 'undefined' && json['message'] === 'Expired JWT Token')
			|| (typeof json['error'] != 'undefined' && json['error'] === 'expired_token')
			|| (json === 'expired_token')
		);
	}

	static isInvalidToken(response, json) {
		if (response.status !== 401) {
			return false;
		}

		return (
			response.statusText === 'Invalid JWT Token'
			|| (typeof json['message'] != 'undefined' && json['message'] === 'Invalid JWT Token')
			|| (typeof json['error'] != 'undefined' && json['error'] === 'invalid_token')
			|| (typeof json['error'] != 'undefined' && json['error'] === 'authentification_failure')
			|| (json === 'invalid_token')
			|| (json === 'authentification_failure')
		);
	}

	static onInvalidToken() {
		if (typeof HTTPClient.onInvalidTokenCallback == 'function') {
			HTTPClient.onInvalidTokenCallback();
			return;
		}
		JwtSession.logout(HTTPClient.onInvalidTokenRedirectUrl);
	}

	static async request(method, url, data={}, successCallback=null, errorCallback=null, formErrorCallback=null, additionalHeaders={}, sendAuthorizationHeader=true) {
		if (!window.fetch) {
			return;
		}

		let body = null;
		method = method.toUpperCase();

		let headers = HTTPClient.getHeaders(false, additionalHeaders, sendAuthorizationHeader);

		if ('PATCH' === method || 'DELETE' === method) {
			headers.append('Content-Type', 'application/x-www-form-urlencoded');
			// 30/01/2023 : ajout encodeURIComponent() sinon les valeurs contenant des "+" pose pb (signe "+" retiré)
			body = encodeURIComponent(new URLSearchParams(HTTPClient.formatFormData(data)).toString());
		}
		else if ('POST' === method) {
			if (headers.get('Content-Type') === 'application/json') {
				body = HTTPClient.formatJsonData(data);
			}
			else {
				body = HTTPClient.formatFormData(data);
			}
		}
		else {
			const qs = HTTPClient.formatQueryString(data);
			url += url.includes('?') ? qs : '?' + qs.substring(1);
			data = null;
		}

		let response = null;
		let jsonData = {};
		try {
			const requestOptions = {
				method: method,
				headers: headers,
				body: body,
				mode: 'cors',
				cache: 'no-cache'
			}

			// On met le fetch dans un try catch pour détecter les erreurs de connexion réseau (si pas de connexion, une exception est déclenchée par fetch)
			response = await fetch(url, requestOptions);

			if (response.status !== 204 && response.statusText !== 'No Content') {
				jsonData = await response.json();
			}

			if (HTTPClient.isExpiredToken(response, jsonData)) {
				HTTPClient.refreshToken(() => HTTPClient.request(method, url, data, successCallback, errorCallback, formErrorCallback, additionalHeaders, sendAuthorizationHeader), errorCallback);
				return;
			}

			if (HTTPClient.isInvalidToken(response, jsonData)) {
				HTTPClient.onInvalidToken();
				return;
			}

			if (response.ok) {
				if (typeof successCallback == 'function') {
					successCallback(jsonData, response);
				}
				return;
			}

			if (response.status === 400 && typeof formErrorCallback == 'function') {
				formErrorCallback(jsonData, response);
				return;
			}
		}
		catch (e) {
			console.error(e);
			if (typeof errorCallback == 'function') {
				errorCallback(response);
			}
			return;
		}

		HTTPClient.logRequestFailure(response, jsonData);
		if (typeof errorCallback == 'function') {
			errorCallback(response, jsonData);
		}
	}

	static requestAsPromise(method, url, data={}, additionalHeaders={}, sendAuthorizationHeader=true) {
		return new Promise((resolve, reject) => {
			HTTPClient.request(method, url, data,
				(jsonData, response) => resolve({ jsonData, response }),
				(response, jsonData) => reject({ response, jsonData }),
				(jsonData, response) => reject({ response, jsonData }),
				additionalHeaders,
				sendAuthorizationHeader
			);
		});
	}

	static download(method, url, data={}, errorCallback=null, completeCallback=null, additionalHeaders={}) {
		HTTPClient.requestBlob(method, url, data,
			(blobData, response) => {
				const contentType = response.headers.get('content-type');
				// Si la réponse est du JSON, on ne télécharge pas de fichier
				if (contentType && contentType.includes('application/json')) {
					return;
				}
				File.download(blobData, contentType, response.headers.get('content-disposition'));
			},
			errorCallback,
			completeCallback,
			additionalHeaders
		);
	}

	static async requestBlob(method, url, data={}, successCallback=null, errorCallback=null, completeCallback=null, additionalHeaders={}) {
		if (!window.fetch) {
			return;
		}

		let body = null;
		method = method.toUpperCase();

		let headers = HTTPClient.getHeaders(false, additionalHeaders);
		if ('PATCH' === method || 'DELETE' === method) {
			headers.append('Content-Type', 'application/x-www-form-urlencoded');
			body = encodeURIComponent(new URLSearchParams(HTTPClient.formatFormData(data)).toString());
		}
		else if ('POST' === method) {
			if (headers.get('Content-Type') === 'application/json') {
				body = HTTPClient.formatJsonData(data);
			}
			else {
				body = HTTPClient.formatFormData(data);
			}
		}
		else {
			const qs = HTTPClient.formatQueryString(data);
			url += url.includes('?') ? qs : '?' + qs.substring(1);
			data = null;
		}

		let response = null;
		try {
			const requestOptions = {
				method: method,
				headers: headers,
				body: body,
				mode: 'cors',
				cache: 'no-cache'
			}

			// On met le fetch dans un try catch pour détecter les erreurs de connexion réseau (si pas de connexion, une exception est déclenchée par fetch)
			response = await fetch(url, requestOptions);

			let jsonDataBlob = {};
			if (response.status === 401) {
				try { jsonDataBlob = await response.json(); } catch (e) { /* ignore */ }
			}

			if (HTTPClient.isExpiredToken(response, jsonDataBlob)) {
				HTTPClient.refreshToken(() => HTTPClient.requestBlob(method, url, data, successCallback, errorCallback, completeCallback, additionalHeaders), errorCallback);
				return;
			}

			if (HTTPClient.isInvalidToken(response, jsonDataBlob)) {
				HTTPClient.onInvalidToken();
				return;
			}

			if (response.ok) {
				if (response.headers.get('Content-Type') === 'application/json') {
					const json = await response.json();
					if (typeof successCallback == 'function') {
						successCallback(json, response);
					}
				}
				else {
					const blobData = await response.blob();
					if (typeof successCallback == 'function') {
						successCallback(blobData, response);
					}
				}
			}
			else {
				let json = null;
				if (response.headers.get('Content-Type') === 'application/json') {
					json = await response.json();
				}
				HTTPClient.logRequestFailure(response, json);
				if (typeof errorCallback == 'function') {
					errorCallback(response, json);
				}
			}
		}
		catch (e) {
			console.error(e);
			if (typeof errorCallback == 'function') {
				errorCallback(response);
			}
		}
		if (typeof completeCallback == 'function') {
			completeCallback(response);
		}
	}

	static refreshToken(completeCallback, errorCallback=null) {
		if (typeof HTTPClient.listCompleteCallbackAfterRefreshTokenFinished == 'undefined') {
			HTTPClient.listCompleteCallbackAfterRefreshTokenFinished = [];
		}
		HTTPClient.listCompleteCallbackAfterRefreshTokenFinished.push(completeCallback);
		//HTTPClient.addCompleteCallbackAfterRefreshTokenFinished(completeCallback);

		// S'il y a déjà un appel à refresh token effectué, on le refait pas (le completeCallback est dans une liste de callback à exécuter apres la fin du refresh token)
		if (typeof HTTPClient.refreshTokenStarted != 'undefined' && HTTPClient.refreshTokenStarted) {
			return;
		}

		function onRefreshTokenComplete() {
			HTTPClient.refreshTokenStarted = false;

			// On exécute les completeCallback qui était en attente de la requete refresh token
			if (typeof HTTPClient.listCompleteCallbackAfterRefreshTokenFinished != 'undefined') {
				const callbacks = HTTPClient.listCompleteCallbackAfterRefreshTokenFinished;
				HTTPClient.listCompleteCallbackAfterRefreshTokenFinished = [];
				callbacks.forEach(callback => typeof callback == 'function' ? callback() : null);
			}
		}

		HTTPClient.refreshTokenStarted = true;

		if (typeof HTTPClient.refreshTokenCallback == 'function') {
			console.log('HTTPClient.refreshToken : Appel callback HTTPClient.refreshTokenCallback');
			HTTPClient.refreshTokenCallback(onRefreshTokenComplete);
			return;
		}

		if (typeof HTTPClient.refreshTokenUrl == 'undefined') {
			console.error('URL refresh token non définie. Appeler HTTPClient.setRefreshTokenUrl(url)');
			return;
		}

		const refreshToken = typeof HTTPClient.getRefreshTokenCallback == 'function' ? HTTPClient.getRefreshTokenCallback() : JwtSession.getRefreshToken();

		console.log('HTTPClient.refreshToken : Appel HTTP vers HTTPClient.refreshTokenUrl');
		let payload = new FormData();
		payload.append('refresh_token', refreshToken);

		HTTPClient.request('POST', HTTPClient.refreshTokenUrl, payload,
			(data) => {
				if (typeof HTTPClient.onSuccessRefreshTokenCallback == 'function') {
					HTTPClient.onSuccessRefreshTokenCallback(data['token'], data['refresh_token']);
				}
				else {
					JwtSession.updateToken(data['token'], data['refresh_token']);
					HTTPClient.setAuthorizationToken(JwtSession.getToken());
				}
				onRefreshTokenComplete();
			},
			() => {
				HTTPClient.refreshTokenStarted = false;
				HTTPClient.listCompleteCallbackAfterRefreshTokenFinished = [];
				if (typeof HTTPClient.onInvalidRefreshTokenCallback == 'function') {
					HTTPClient.onInvalidRefreshTokenCallback();
				}
				else {
					JwtSession.expireSession(HTTPClient.onInvalidRefreshTokenRedirectUrl);
				}
				if (typeof errorCallback == 'function') {
					errorCallback();
				}
			},
			null,
			null,
			false
		);
	}

	static sendRequest(url, strParam, methode, formatRetour, callback) {
		let xhr = null;

		if (window.XMLHttpRequest || window.ActiveXObject) {
			if (window.ActiveXObject) {
				try {
					xhr = new ActiveXObject('Msxml2.XMLHTTP');
				} catch (e) {
					xhr = new ActiveXObject('Microsoft.XMLHTTP');
				}
			} else {
				xhr = new XMLHttpRequest();
			}
		} else {
			// Votre navigateur ne supporte pas l'objet XMLHTTPRequest!
			return null;
		}

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
				let data;
				if (formatRetour === 'xml') {
					data = xhr.responseXML;
				}
				else {
					data = eval('(' + xhr.responseText + ')');
				}
				callback(data);
			}
		};

		if (methode === 'POST') {
			xhr.open('POST', url, true);
			xhr.send();
		}
		else {
			xhr.open('GET', url + '?' + strParam, true);
			xhr.send(null);
		}
		return false;
	}

}

export { HTTPClient };