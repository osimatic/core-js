/**
 * @jest-environment jsdom
 */
import { WebPushNotification } from '../web_push_notification.js';

describe('WebPushNotification', () => {
	let mockSub;
	let mockPushManager;
	let mockSwReg;
	let mockServiceWorker;

	beforeEach(() => {
		mockSub = {
			endpoint: 'https://push.example.com/endpoint',
			unsubscribe: jest.fn().mockResolvedValue(true),
		};

		mockPushManager = {
			getSubscription: jest.fn().mockResolvedValue(null),
			subscribe: jest.fn().mockResolvedValue(mockSub),
		};

		mockSwReg = {
			scope: '/',
			pushManager: mockPushManager,
			unregister: jest.fn().mockResolvedValue(true),
		};

		mockServiceWorker = {
			register: jest.fn().mockResolvedValue(mockSwReg),
			getRegistration: jest.fn().mockResolvedValue(mockSwReg),
			addEventListener: jest.fn(),
		};

		Object.defineProperty(window, 'isSecureContext', { value: true, writable: true, configurable: true });
		Object.defineProperty(window, 'PushManager', { value: {}, writable: true, configurable: true });
		Object.defineProperty(window, 'Notification', {
			value: { permission: 'granted', requestPermission: jest.fn().mockResolvedValue('granted') },
			writable: true,
			configurable: true,
		});
		Object.defineProperty(navigator, 'serviceWorker', {
			value: mockServiceWorker,
			writable: true,
			configurable: true,
		});

		global.fetch = jest.fn().mockResolvedValue({
			json: jest.fn().mockResolvedValue({ success: true }),
		});

		WebPushNotification.init({
			vapidPublicKey: 'dGVzdA',
			subscriberUrl: 'https://example.com/subscribe',
			serviceWorkerPath: '/sw.js',
			httpHeaders: { Authorization: 'Bearer token' },
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// =========================================================================

	describe('init', () => {
		test('should store all config properties', () => {
			WebPushNotification.init({
				vapidPublicKey: 'key123',
				subscriberUrl: 'https://example.com/sub',
				unsubscribeUrl: 'https://example.com/unsub',
				serviceWorkerPath: '/worker.js',
				httpHeaders: { 'X-Token': 'abc' },
			});
			expect(WebPushNotification._vapidPublicKey).toBe('key123');
			expect(WebPushNotification._subscriberUrl).toBe('https://example.com/sub');
			expect(WebPushNotification._unsubscribeUrl).toBe('https://example.com/unsub');
			expect(WebPushNotification._serviceWorkerPath).toBe('/worker.js');
			expect(WebPushNotification._httpHeaders).toEqual({ 'X-Token': 'abc' });
		});

		test('should default httpHeaders to empty object', () => {
			WebPushNotification.init({ vapidPublicKey: 'k', subscriberUrl: 'u', serviceWorkerPath: '/sw.js' });
			expect(WebPushNotification._httpHeaders).toEqual({});
		});

		test('should default unsubscribeUrl to null', () => {
			WebPushNotification.init({ vapidPublicKey: 'k', subscriberUrl: 'u', serviceWorkerPath: '/sw.js' });
			expect(WebPushNotification._unsubscribeUrl).toBeNull();
		});

		test('should reset _messageListenerRegistered to false', () => {
			WebPushNotification._messageListenerRegistered = true;
			WebPushNotification.init({ vapidPublicKey: 'k', subscriberUrl: 'u', serviceWorkerPath: '/sw.js' });
			expect(WebPushNotification._messageListenerRegistered).toBe(false);
		});
	});

	// =========================================================================

	describe('isAvailable', () => {
		test('should return false when not in secure context', () => {
			Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
			expect(WebPushNotification.isAvailable()).toBe(false);
		});

		test('should return false when PushManager is missing', () => {
			// PushManager was added as a configurable own property in beforeEach — we can delete it
			delete window.PushManager;
			expect(WebPushNotification.isAvailable()).toBe(false);
		});

		test('should return false when Notification is missing', () => {
			// Notification was added as a configurable own property in beforeEach — we can delete it
			delete window.Notification;
			expect(WebPushNotification.isAvailable()).toBe(false);
		});

		test('should return true when all requirements are met', () => {
			expect(WebPushNotification.isAvailable()).toBe(true);
		});
	});

	// =========================================================================

	describe('subscribe', () => {
		test('should return early if not available', async () => {
			Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
			const result = await WebPushNotification.subscribe();
			expect(result).toBeUndefined();
			expect(fetch).not.toHaveBeenCalled();
		});

		test('should request permission when permission is default', async () => {
			window.Notification = {
				permission: 'default',
				requestPermission: jest.fn().mockImplementation(async () => {
					window.Notification.permission = 'granted';
				}),
			};
			await WebPushNotification.subscribe();
			expect(window.Notification.requestPermission).toHaveBeenCalled();
		});

		test('should return early if permission is denied', async () => {
			window.Notification = { permission: 'denied', requestPermission: jest.fn() };
			const result = await WebPushNotification.subscribe();
			expect(result).toBeUndefined();
			expect(fetch).not.toHaveBeenCalled();
		});

		test('should return early if SW registration fails', async () => {
			mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));
			const result = await WebPushNotification.subscribe();
			expect(result).toBeUndefined();
			expect(fetch).not.toHaveBeenCalled();
		});

		test('should reuse existing subscription', async () => {
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			await WebPushNotification.subscribe();
			expect(mockPushManager.subscribe).not.toHaveBeenCalled();
		});

		test('should create new subscription when none exists', async () => {
			await WebPushNotification.subscribe();
			expect(mockPushManager.subscribe).toHaveBeenCalledWith({
				applicationServerKey: expect.any(Uint8Array),
				userVisibleOnly: true,
			});
		});

		test('should call saveSubscription and return server response', async () => {
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			const result = await WebPushNotification.subscribe();
			expect(fetch).toHaveBeenCalledWith(
				'https://example.com/subscribe',
				expect.objectContaining({ method: 'post' })
			);
			expect(result).toEqual({ success: true });
		});
	});

	// =========================================================================

	describe('saveSubscription', () => {
		test('should POST to subscriberUrl', async () => {
			await WebPushNotification.saveSubscription(mockSub);
			expect(fetch).toHaveBeenCalledWith(
				'https://example.com/subscribe',
				expect.objectContaining({ method: 'post' })
			);
		});

		test('should include Content-Type header', async () => {
			await WebPushNotification.saveSubscription(mockSub);
			expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
		});

		test('should include custom httpHeaders', async () => {
			await WebPushNotification.saveSubscription(mockSub);
			expect(fetch.mock.calls[0][1].headers['Authorization']).toBe('Bearer token');
		});

		test('should not mutate the original httpHeaders', async () => {
			await WebPushNotification.saveSubscription(mockSub);
			expect(WebPushNotification._httpHeaders['Content-Type']).toBeUndefined();
		});

		test('should include subscription data in body', async () => {
			await WebPushNotification.saveSubscription(mockSub);
			const body = JSON.parse(fetch.mock.calls[0][1].body);
			expect(body.endpoint).toBe('https://push.example.com/endpoint');
		});

		test('should include userAgent in body', async () => {
			await WebPushNotification.saveSubscription(mockSub);
			const body = JSON.parse(fetch.mock.calls[0][1].body);
			expect(body.userAgent).toBe(navigator.userAgent);
		});

		test('should return parsed server response', async () => {
			const result = await WebPushNotification.saveSubscription(mockSub);
			expect(result).toEqual({ success: true });
		});
	});

	// =========================================================================

	describe('deleteSubscription', () => {
		beforeEach(() => {
			WebPushNotification.init({
				vapidPublicKey: 'dGVzdA',
				subscriberUrl: 'https://example.com/subscribe',
				unsubscribeUrl: 'https://example.com/unsubscribe',
				serviceWorkerPath: '/sw.js',
				httpHeaders: { Authorization: 'Bearer token' },
			});
		});

		test('should DELETE to unsubscribeUrl', async () => {
			await WebPushNotification.deleteSubscription(mockSub);
			expect(fetch).toHaveBeenCalledWith(
				'https://example.com/unsubscribe',
				expect.objectContaining({ method: 'delete' })
			);
		});

		test('should include Content-Type header', async () => {
			await WebPushNotification.deleteSubscription(mockSub);
			expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
		});

		test('should include userAgent in body', async () => {
			await WebPushNotification.deleteSubscription(mockSub);
			const body = JSON.parse(fetch.mock.calls[0][1].body);
			expect(body.userAgent).toBe(navigator.userAgent);
		});

		test('should return parsed server response', async () => {
			const result = await WebPushNotification.deleteSubscription(mockSub);
			expect(result).toEqual({ success: true });
		});
	});

	// =========================================================================

	describe('unsubscribe', () => {
		test('should return early if not available', async () => {
			Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
			await WebPushNotification.unsubscribe();
			expect(mockServiceWorker.getRegistration).not.toHaveBeenCalled();
		});

		test('should call _unregisterServiceWorker even when no subscription', async () => {
			mockPushManager.getSubscription.mockResolvedValue(null);
			const unregisterSpy = jest.spyOn(WebPushNotification, '_unregisterServiceWorker').mockResolvedValue();
			await WebPushNotification.unsubscribe();
			expect(unregisterSpy).toHaveBeenCalled();
			unregisterSpy.mockRestore();
		});

		test('should handle missing registration gracefully', async () => {
			mockServiceWorker.getRegistration.mockResolvedValue(undefined);
			const unregisterSpy = jest.spyOn(WebPushNotification, '_unregisterServiceWorker').mockResolvedValue();
			await expect(WebPushNotification.unsubscribe()).resolves.not.toThrow();
			unregisterSpy.mockRestore();
		});

		test('should call sub.unsubscribe() when subscription exists', async () => {
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			await WebPushNotification.unsubscribe();
			expect(mockSub.unsubscribe).toHaveBeenCalled();
		});

		test('should not call deleteSubscription when unsubscribeUrl is not set', async () => {
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			const deleteSpy = jest.spyOn(WebPushNotification, 'deleteSubscription');
			await WebPushNotification.unsubscribe();
			expect(deleteSpy).not.toHaveBeenCalled();
			deleteSpy.mockRestore();
		});

		test('should call deleteSubscription when unsubscribeUrl is set', async () => {
			WebPushNotification.init({
				vapidPublicKey: 'dGVzdA',
				subscriberUrl: 'https://example.com/subscribe',
				unsubscribeUrl: 'https://example.com/unsubscribe',
				serviceWorkerPath: '/sw.js',
			});
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			await WebPushNotification.unsubscribe();
			expect(fetch).toHaveBeenCalledWith(
				'https://example.com/unsubscribe',
				expect.objectContaining({ method: 'delete' })
			);
		});

		test('should call sub.unsubscribe() after deleteSubscription', async () => {
			WebPushNotification.init({
				vapidPublicKey: 'dGVzdA',
				subscriberUrl: 'https://example.com/subscribe',
				unsubscribeUrl: 'https://example.com/unsubscribe',
				serviceWorkerPath: '/sw.js',
			});
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			await WebPushNotification.unsubscribe();
			expect(mockSub.unsubscribe).toHaveBeenCalled();
		});
	});

	// =========================================================================

	describe('isSubscribed', () => {
		test('should return false when not available', async () => {
			Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
			expect(await WebPushNotification.isSubscribed()).toBe(false);
		});

		test('should return false when no service worker registration', async () => {
			mockServiceWorker.getRegistration.mockResolvedValue(undefined);
			expect(await WebPushNotification.isSubscribed()).toBe(false);
		});

		test('should return false when no subscription', async () => {
			mockPushManager.getSubscription.mockResolvedValue(null);
			expect(await WebPushNotification.isSubscribed()).toBe(false);
		});

		test('should return true when subscription exists', async () => {
			mockPushManager.getSubscription.mockResolvedValue(mockSub);
			expect(await WebPushNotification.isSubscribed()).toBe(true);
		});
	});

	// =========================================================================

	describe('_registerServiceWorker', () => {
		test('should register SW with correct path and scope', async () => {
			await WebPushNotification._registerServiceWorker();
			expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
		});

		test('should return the registration on success', async () => {
			const result = await WebPushNotification._registerServiceWorker();
			expect(result).toBe(mockSwReg);
		});

		test('should return null on failure', async () => {
			mockServiceWorker.register.mockRejectedValue(new Error('Failed'));
			const result = await WebPushNotification._registerServiceWorker();
			expect(result).toBeNull();
		});
	});

	// =========================================================================

	describe('_unregisterServiceWorker', () => {
		test('should do nothing when no registration exists', async () => {
			mockServiceWorker.getRegistration.mockResolvedValue(undefined);
			await expect(WebPushNotification._unregisterServiceWorker()).resolves.not.toThrow();
			expect(mockSwReg.unregister).not.toHaveBeenCalled();
		});

		test('should call unregister on the registration', async () => {
			await WebPushNotification._unregisterServiceWorker();
			expect(mockSwReg.unregister).toHaveBeenCalled();
		});
	});

	// =========================================================================

	describe('_initMessageListener', () => {
		test('should register a message event listener', () => {
			WebPushNotification._initMessageListener();
			expect(mockServiceWorker.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
		});

		test('should register the listener only once even if called multiple times', () => {
			WebPushNotification._initMessageListener();
			WebPushNotification._initMessageListener();
			expect(mockServiceWorker.addEventListener).toHaveBeenCalledTimes(1);
		});

		test('should call saveSubscription on RESUBSCRIBE message', async () => {
			const saveSpy = jest.spyOn(WebPushNotification, 'saveSubscription').mockResolvedValue({});
			WebPushNotification._initMessageListener();
			const handler = mockServiceWorker.addEventListener.mock.calls[0][1];
			await handler({ data: { type: 'RESUBSCRIBE', subscription: mockSub } });
			expect(saveSpy).toHaveBeenCalledWith(mockSub);
			saveSpy.mockRestore();
		});

		test('should ignore messages with unknown type', async () => {
			const saveSpy = jest.spyOn(WebPushNotification, 'saveSubscription').mockResolvedValue({});
			WebPushNotification._initMessageListener();
			const handler = mockServiceWorker.addEventListener.mock.calls[0][1];
			await handler({ data: { type: 'OTHER' } });
			expect(saveSpy).not.toHaveBeenCalled();
			saveSpy.mockRestore();
		});

		test('should ignore messages without data', async () => {
			const saveSpy = jest.spyOn(WebPushNotification, 'saveSubscription').mockResolvedValue({});
			WebPushNotification._initMessageListener();
			const handler = mockServiceWorker.addEventListener.mock.calls[0][1];
			await handler({ data: null });
			expect(saveSpy).not.toHaveBeenCalled();
			saveSpy.mockRestore();
		});
	});

	// =========================================================================

	describe('_encodeToUint8Array', () => {
		test('should return a Uint8Array', () => {
			expect(WebPushNotification._encodeToUint8Array('dGVzdA')).toBeInstanceOf(Uint8Array);
		});

		test('should decode base64url to correct bytes', () => {
			// 'dGVzdA' is base64url for 'test' → [116, 101, 115, 116]
			const result = WebPushNotification._encodeToUint8Array('dGVzdA');
			expect(Array.from(result)).toEqual([116, 101, 115, 116]);
		});

		test('should add missing padding automatically', () => {
			// 'dGVzdA' (6 chars, needs 2 padding chars) must give same result as 'dGVzdA=='
			const withoutPadding = WebPushNotification._encodeToUint8Array('dGVzdA');
			const withPadding = WebPushNotification._encodeToUint8Array('dGVzdA==');
			expect(Array.from(withoutPadding)).toEqual(Array.from(withPadding));
		});

		test('should convert base64url dash (-) to standard base64 plus (+)', () => {
			// '-A' in base64url = '+A==' in base64 = byte 0xF8 = 248
			const result = WebPushNotification._encodeToUint8Array('-A');
			expect(Array.from(result)).toEqual([248]);
		});

		test('should convert base64url underscore (_) to standard base64 slash (/)', () => {
			// '_w' in base64url = '/w==' in base64 = byte 0xFF = 255
			const result = WebPushNotification._encodeToUint8Array('_w');
			expect(Array.from(result)).toEqual([255]);
		});
	});
});