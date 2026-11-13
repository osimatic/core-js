/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { WebAuthn } from '../../auth/WebAuthn.js';

function bytesOf(buffer) {
	return Array.from(new Uint8Array(buffer));
}

function setupWebAuthnApi() {
	const credentials = { create: jest.fn(), get: jest.fn() };
	Object.defineProperty(window, 'PublicKeyCredential', { value: function PublicKeyCredential() {}, configurable: true, writable: true });
	Object.defineProperty(navigator, 'credentials', { value: credentials, configurable: true, writable: true });
	return credentials;
}

function teardownWebAuthnApi() {
	delete window.PublicKeyCredential;
	delete navigator.credentials;
}

afterEach(() => {
	teardownWebAuthnApi();
});

describe('WebAuthn', () => {
	describe('isSupported', () => {
		test('should return false when the browser has no WebAuthn API', () => {
			expect(WebAuthn.isSupported()).toBe(false);
		});

		test('should return false when only PublicKeyCredential is available', () => {
			Object.defineProperty(window, 'PublicKeyCredential', { value: function PublicKeyCredential() {}, configurable: true, writable: true });
			expect(WebAuthn.isSupported()).toBe(false);
		});

		test('should return true when the WebAuthn API is available', () => {
			setupWebAuthnApi();
			expect(WebAuthn.isSupported()).toBe(true);
		});
	});

	describe('bufferToBase64Url', () => {
		test('should encode without padding and with the URL-safe alphabet', () => {
			// 0xfb 0xff encodes to "+/8=" in standard base64
			expect(WebAuthn.bufferToBase64Url(new Uint8Array([0xfb, 0xff]).buffer)).toBe('-_8');
			expect(WebAuthn.bufferToBase64Url(new Uint8Array([0x61]).buffer)).toBe('YQ');
			expect(WebAuthn.bufferToBase64Url(new Uint8Array([0x61, 0x62, 0x63]).buffer)).toBe('YWJj');
		});

		test('should accept a typed array and an empty buffer', () => {
			expect(WebAuthn.bufferToBase64Url(new Uint8Array([0x61, 0x62]))).toBe('YWI');
			expect(WebAuthn.bufferToBase64Url(new ArrayBuffer(0))).toBe('');
		});
	});

	describe('base64UrlToBuffer', () => {
		test('should decode with or without padding and with the URL-safe alphabet', () => {
			expect(bytesOf(WebAuthn.base64UrlToBuffer('-_8'))).toEqual([0xfb, 0xff]);
			expect(bytesOf(WebAuthn.base64UrlToBuffer('-_8='))).toEqual([0xfb, 0xff]);
			expect(bytesOf(WebAuthn.base64UrlToBuffer('YQ'))).toEqual([0x61]);
			expect(bytesOf(WebAuthn.base64UrlToBuffer('YWJj'))).toEqual([0x61, 0x62, 0x63]);
			expect(bytesOf(WebAuthn.base64UrlToBuffer(''))).toEqual([]);
		});

		test('should be the inverse of bufferToBase64Url for every byte value', () => {
			const all = new Uint8Array(256).map((_, i) => i);
			expect(bytesOf(WebAuthn.base64UrlToBuffer(WebAuthn.bufferToBase64Url(all)))).toEqual(Array.from(all));
		});
	});

	describe('register', () => {
		const serverOptions = () => ({
			publicKey: {
				rp: { id: 'example.com', name: 'Example' },
				user: { id: 'dXNlcg', name: 'admin', displayName: 'Administrator' },
				challenge: 'YWJj',
				excludeCredentials: [{ type: 'public-key', id: 'YQ' }],
				timeout: 60000,
			},
		});

		test('should give the authenticator binary values and return base64url strings', async () => {
			const credentials = setupWebAuthnApi();
			credentials.create.mockResolvedValue({
				id: 'cred-id',
				response: { clientDataJSON: new Uint8Array([1, 2]).buffer, attestationObject: new Uint8Array([0xfb, 0xff]).buffer },
			});
			const options = serverOptions();

			const result = await WebAuthn.register(options);

			const publicKey = credentials.create.mock.calls[0][0].publicKey;
			expect(bytesOf(publicKey.challenge)).toEqual([0x61, 0x62, 0x63]);
			expect(bytesOf(publicKey.user.id)).toEqual(Array.from('user').map(c => c.charCodeAt(0)));
			expect(bytesOf(publicKey.excludeCredentials[0].id)).toEqual([0x61]);
			expect(publicKey.excludeCredentials[0].type).toBe('public-key');
			expect(publicKey.rp).toEqual({ id: 'example.com', name: 'Example' });
			expect(publicKey.timeout).toBe(60000);
			expect(result).toEqual({ id: 'cred-id', clientDataJSON: 'AQI', attestationObject: '-_8' });

			// The options given by the caller are not modified
			expect(options).toEqual(serverOptions());
		});

		test('should work without user and without excluded credentials', async () => {
			const credentials = setupWebAuthnApi();
			credentials.create.mockResolvedValue({ id: 'x', response: { clientDataJSON: new ArrayBuffer(0), attestationObject: new ArrayBuffer(0) } });
			await WebAuthn.register({ publicKey: { challenge: 'YWJj' } });
			expect(credentials.create).toHaveBeenCalledTimes(1);
		});

		test('should return null when the user cancels or when no credential is returned', async () => {
			const credentials = setupWebAuthnApi();
			credentials.create.mockRejectedValueOnce(Object.assign(new Error('cancelled'), { name: 'NotAllowedError' }));
			expect(await WebAuthn.register(serverOptions())).toBeNull();

			credentials.create.mockResolvedValueOnce(null);
			expect(await WebAuthn.register(serverOptions())).toBeNull();
		});

		test('should rethrow other errors', async () => {
			const credentials = setupWebAuthnApi();
			credentials.create.mockRejectedValue(Object.assign(new Error('already registered'), { name: 'InvalidStateError' }));
			await expect(WebAuthn.register(serverOptions())).rejects.toThrow('already registered');
		});
	});

	describe('authenticate', () => {
		const serverOptions = () => ({
			publicKey: {
				rpId: 'example.com',
				challenge: 'YWJj',
				allowCredentials: [{ type: 'public-key', id: 'YQ' }, { type: 'public-key', id: '-_8' }],
				userVerification: 'required',
			},
		});

		test('should give the authenticator binary values and return base64url strings', async () => {
			const credentials = setupWebAuthnApi();
			credentials.get.mockResolvedValue({
				id: 'cred-id',
				response: {
					clientDataJSON: new Uint8Array([1, 2]).buffer,
					authenticatorData: new Uint8Array([3]).buffer,
					signature: new Uint8Array([0xfb, 0xff]).buffer,
				},
			});
			const options = serverOptions();

			const result = await WebAuthn.authenticate(options);

			const publicKey = credentials.get.mock.calls[0][0].publicKey;
			expect(bytesOf(publicKey.challenge)).toEqual([0x61, 0x62, 0x63]);
			expect(bytesOf(publicKey.allowCredentials[0].id)).toEqual([0x61]);
			expect(bytesOf(publicKey.allowCredentials[1].id)).toEqual([0xfb, 0xff]);
			expect(publicKey.rpId).toBe('example.com');
			expect(publicKey.userVerification).toBe('required');
			expect(result).toEqual({ id: 'cred-id', clientDataJSON: 'AQI', authenticatorData: 'Aw', signature: '-_8' });

			// The options given by the caller are not modified
			expect(options).toEqual(serverOptions());
		});

		test('should work without allowed credentials', async () => {
			const credentials = setupWebAuthnApi();
			credentials.get.mockResolvedValue({ id: 'x', response: { clientDataJSON: new ArrayBuffer(0), authenticatorData: new ArrayBuffer(0), signature: new ArrayBuffer(0) } });
			await WebAuthn.authenticate({ publicKey: { challenge: 'YWJj' } });
			expect(credentials.get).toHaveBeenCalledTimes(1);
		});

		test('should return null when the user cancels or when no credential is returned', async () => {
			const credentials = setupWebAuthnApi();
			credentials.get.mockRejectedValueOnce(Object.assign(new Error('cancelled'), { name: 'NotAllowedError' }));
			expect(await WebAuthn.authenticate(serverOptions())).toBeNull();

			credentials.get.mockResolvedValueOnce(null);
			expect(await WebAuthn.authenticate(serverOptions())).toBeNull();
		});

		test('should rethrow other errors', async () => {
			const credentials = setupWebAuthnApi();
			credentials.get.mockRejectedValue(Object.assign(new Error('security'), { name: 'SecurityError' }));
			await expect(WebAuthn.authenticate(serverOptions())).rejects.toThrow('security');
		});
	});
});