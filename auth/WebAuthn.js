/**
 * Browser side of passwordless authentication with passkeys (WebAuthn).
 * Wraps navigator.credentials: the server sends options as JSON (binary values encoded as base64url), this class converts them into the binary form the browser needs, asks the authenticator, and converts the result back into base64url strings that can be sent to the server as JSON.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
 */
export class WebAuthn {
	/**
	 * Tells whether the current browser can use passkeys.
	 * @returns {boolean}
	 */
	static isSupported() {
		return typeof window !== 'undefined'
			&& typeof window.PublicKeyCredential !== 'undefined'
			&& typeof navigator !== 'undefined'
			&& !!navigator.credentials;
	}

	/**
	 * Registers a new passkey: asks the authenticator to create a key pair for the options sent by the server.
	 * @param {{publicKey: object}} options Registration options as sent by the server (binary values encoded as base64url)
	 * @returns {Promise<{id: string, clientDataJSON: string, attestationObject: string}|null>} The response to send to the server (all values encoded as base64url), or null if the user cancelled or the request timed out
	 * @throws Any error other than a cancellation (e.g. a passkey already registered on this authenticator, or an unsupported browser)
	 */
	static async register(options) {
		const publicKey = WebAuthn.#decodeOptions(options, 'excludeCredentials');
		try {
			const credential = await navigator.credentials.create({ publicKey });
			if (!credential) {
				return null;
			}
			return {
				id: credential.id,
				clientDataJSON: WebAuthn.bufferToBase64Url(credential.response.clientDataJSON),
				attestationObject: WebAuthn.bufferToBase64Url(credential.response.attestationObject),
			};
		}
		catch (e) {
			if (WebAuthn.#isCancellation(e)) {
				return null;
			}
			throw e;
		}
	}

	/**
	 * Authenticates with an existing passkey: asks the authenticator to sign the challenge sent by the server.
	 * @param {{publicKey: object}} options Authentication options as sent by the server (binary values encoded as base64url)
	 * @returns {Promise<{id: string, clientDataJSON: string, authenticatorData: string, signature: string}|null>} The response to send to the server (all values encoded as base64url), or null if the user cancelled or the request timed out
	 * @throws Any error other than a cancellation (e.g. an unsupported browser)
	 */
	static async authenticate(options) {
		const publicKey = WebAuthn.#decodeOptions(options, 'allowCredentials');
		try {
			const credential = await navigator.credentials.get({ publicKey });
			if (!credential) {
				return null;
			}
			return {
				id: credential.id,
				clientDataJSON: WebAuthn.bufferToBase64Url(credential.response.clientDataJSON),
				authenticatorData: WebAuthn.bufferToBase64Url(credential.response.authenticatorData),
				signature: WebAuthn.bufferToBase64Url(credential.response.signature),
			};
		}
		catch (e) {
			if (WebAuthn.#isCancellation(e)) {
				return null;
			}
			throw e;
		}
	}

	/**
	 * Encodes binary data as a base64url string (RFC 4648 section 5, without padding).
	 * @param {ArrayBuffer|Uint8Array} buffer
	 * @returns {string}
	 */
	static bufferToBase64Url(buffer) {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}

	/**
	 * Decodes a base64url string (RFC 4648 section 5, padding optional) into binary data.
	 * @param {string} base64Url
	 * @returns {ArrayBuffer}
	 */
	static base64UrlToBuffer(base64Url) {
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	}

	/**
	 * Converts the options sent by the server into the form expected by navigator.credentials: the challenge, the user ID and the credential IDs must be binary.
	 * The given options are not modified.
	 * @param {{publicKey: object}} options
	 * @param {string} credentialListKey Name of the list of credential descriptors: "excludeCredentials" (registration) or "allowCredentials" (authentication)
	 * @returns {object} The decoded publicKey options
	 */
	static #decodeOptions(options, credentialListKey) {
		const publicKey = { ...options.publicKey };
		publicKey.challenge = WebAuthn.base64UrlToBuffer(publicKey.challenge);
		if (publicKey.user) {
			publicKey.user = { ...publicKey.user, id: WebAuthn.base64UrlToBuffer(publicKey.user.id) };
		}
		if (Array.isArray(publicKey[credentialListKey])) {
			publicKey[credentialListKey] = publicKey[credentialListKey].map(descriptor => ({ ...descriptor, id: WebAuthn.base64UrlToBuffer(descriptor.id) }));
		}
		return publicKey;
	}

	/**
	 * Tells whether an error means that the user cancelled the operation (or that it timed out), as opposed to a real failure.
	 * @param {Error} error
	 * @returns {boolean}
	 */
	static #isCancellation(error) {
		return !!error && error.name === 'NotAllowedError';
	}
}