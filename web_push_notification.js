/**
 * Generic class for managing web push notifications.
 * Handles service worker registration, push subscription lifecycle, and server-side subscription persistence.
 *
 * Usage:
 *   WebPushNotification.init({
 *       vapidPublicKey:    '<base64url VAPID public key>',
 *       subscriberUrl:     '<full URL to save subscription on server>',
 *       serviceWorkerPath: '<path to WebPushServiceWorker.js>',
 *       httpHeaders:       { Authorization: '...' },
 *   });
 *   WebPushNotification.subscribe();
 *
 * The service worker must handle the 'pushsubscriptionchange' event and post a message of type 'RESUBSCRIBE' with the new subscription to the page so that this class can re-send it to the server.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Push_API
 * @see https://web.dev/articles/push-notifications-overview
 */
class WebPushNotification {

	// =========================================================================
	// Configuration
	// =========================================================================

	/**
	 * Initialize the class with project-specific configuration.
	 * Must be called before any other method.
	 * @param {object} config
	 * @param {string} config.vapidPublicKey      - base64url VAPID public key
	 * @param {string} config.subscriberUrl       - full URL to save subscription on server
	 * @param {string} [config.unsubscribeUrl]    - full URL to delete subscription on server (optional)
	 * @param {string} config.serviceWorkerPath   - path to the service worker file
	 * @param {object} [config.httpHeaders={}]    - HTTP headers for authenticated requests
	 */
	static init(config) {
		this._vapidPublicKey = config.vapidPublicKey;
		this._subscriberUrl = config.subscriberUrl;
		this._unsubscribeUrl = config.unsubscribeUrl || null;
		this._serviceWorkerPath = config.serviceWorkerPath;
		this._httpHeaders = config.httpHeaders || {};
		this._messageListenerRegistered = false;
	}

	// =========================================================================
	// Public API
	// =========================================================================

	/**
	 * Check whether all requirements for push notifications are met:
	 * 1. must run in secure context (window.isSecureContext = true)
	 * 2. browser must implement navigator.serviceWorker, window.PushManager, window.Notification
	 * @returns {boolean}
	 */
	static isAvailable() {
		if (!window.isSecureContext) {
			console.log('WebPushNotification: site must run in secure context!');
			return false;
		}
		return (('serviceWorker' in navigator) &&
			('PushManager' in window) &&
			('Notification' in window));
	}

	/**
	 * Full subscription flow:
	 * - requests user permission if not already granted
	 * - registers the service worker
	 * - subscribes via PushManager (reuses existing subscription if any)
	 * - saves the subscription on the server
	 * - sets up the message listener for pushsubscriptionchange
	 * @returns {Promise<object>} server response
	 */
	static async subscribe() {
		if (!this.isAvailable()) return;

		if ('Notification' in window && window.Notification.permission === 'default') {
			await window.Notification.requestPermission();
		}
		if ('Notification' in window && window.Notification.permission !== 'granted') return;

		const swReg = await this._registerServiceWorker();
		if (!swReg) return;

		this._initMessageListener();

		// Reuse existing subscription or create a new one
		var sub = await swReg.pushManager.getSubscription();
		if (!sub) {
			sub = await swReg.pushManager.subscribe({
				applicationServerKey: this._encodeToUint8Array(this._vapidPublicKey),
				userVisibleOnly: true,
			});
		}

		return this.saveSubscription(sub);
	}

	/**
	 * Save a push subscription on the server using the Fetch API.
	 * The subscription is enriched with the userAgent for server-side identification.
	 * Called on initial subscription and on pushsubscriptionchange.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription
	 * @param {PushSubscription} sub
	 * @returns {Promise<object>} server response
	 */
	static async saveSubscription(sub) {
		console.log('WebPushNotification: saveSubscription');

		var headers = {...this._httpHeaders};
		headers['Content-Type'] = 'application/json';

		// Stringify and parse to add custom property — directly stringifying a
		// PushSubscription ignores added properties
		var body = JSON.parse(JSON.stringify(sub));
		body.userAgent = navigator.userAgent;

		var response = await fetch(this._subscriberUrl, {
			method: 'post',
			headers: headers,
			body: JSON.stringify(body),
		});
		return response.json();
	}

	/**
	 * Unsubscribe from push notifications, notify the server if unsubscribeUrl is configured, then unregister the service worker.
	 * @returns {Promise<void>}
	 */
	static async unsubscribe() {
		if (!this.isAvailable()) return;

		var reg = await navigator.serviceWorker.getRegistration();
		if (reg) {
			var sub = await reg.pushManager.getSubscription();
			if (sub) {
				if (this._unsubscribeUrl) {
					await this.deleteSubscription(sub);
				}
				await sub.unsubscribe();
			}
		}

		await this._unregisterServiceWorker();
	}

	/**
	 * Delete a push subscription on the server using the Fetch API.
	 * @param {PushSubscription} sub
	 * @returns {Promise<object>} server response
	 */
	static async deleteSubscription(sub) {
		console.log('WebPushNotification: deleteSubscription');

		var headers = {...this._httpHeaders};
		headers['Content-Type'] = 'application/json';

		var body = JSON.parse(JSON.stringify(sub));
		body.userAgent = navigator.userAgent;

		var response = await fetch(this._unsubscribeUrl, {
			method: 'delete',
			headers: headers,
			body: JSON.stringify(body),
		});
		return response.json();
	}

	/**
	 * Check whether push notifications are already subscribed.
	 * @returns {Promise<boolean>}
	 */
	static async isSubscribed() {
		if (!this.isAvailable()) return false;
		var swReg = await navigator.serviceWorker.getRegistration();
		if (!swReg) return false;
		var sub = await swReg.pushManager.getSubscription();
		return sub !== null;
	}

	// =========================================================================
	// Private
	// =========================================================================

	/**
	 * Register the service worker.
	 * The browser handles duplicate registration — no check needed.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
	 * @returns {Promise<ServiceWorkerRegistration|null>}
	 */
	static async _registerServiceWorker() {
		try {
			var swReg = await navigator.serviceWorker.register(this._serviceWorkerPath, {scope: '/'});
			console.log('WebPushNotification: registration succeeded. Scope is ' + swReg.scope);
			return swReg;
		} catch (e) {
			console.log('WebPushNotification: registration failed with ' + e);
			return null;
		}
	}

	/**
	 * Unregister the service worker.
	 * @returns {Promise<void>}
	 */
	static async _unregisterServiceWorker() {
		var reg = await navigator.serviceWorker.getRegistration();
		if (!reg) return;
		var bOK = await reg.unregister();
		console.log(bOK
			? 'WebPushNotification: unregister service worker succeeded.'
			: 'WebPushNotification: unregister service worker failed.'
		);
	}

	/**
	 * Set up the message listener for RESUBSCRIBE messages from the service worker.
	 * Called once from subscribe() — guard against duplicate registration.
	 */
	static _initMessageListener() {
		if (this._messageListenerRegistered) return;
		this._messageListenerRegistered = true;
		navigator.serviceWorker.addEventListener('message', async (event) => {
			if (event.data && event.data.type === 'RESUBSCRIBE') {
				console.log('WebPushNotification: received RESUBSCRIBE message from service worker');
				await WebPushNotification.saveSubscription(event.data.subscription);
			}
		});
	}

	/**
	 * Encode a base64url string to a Uint8Array.
	 * Used to convert the VAPID public key for pushManager.subscribe().
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
	 * @param {string} strBase64 - base64url encoded string
	 * @returns {Uint8Array}
	 */
	static _encodeToUint8Array(strBase64) {
		var strPadding = '='.repeat((4 - (strBase64.length % 4)) % 4);
		strBase64 = (strBase64 + strPadding).replace(/-/g, '+').replace(/_/g, '/');
		var rawData = atob(strBase64);
		var aOutput = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			aOutput[i] = rawData.charCodeAt(i);
		}
		return aOutput;
	}
}

export { WebPushNotification };