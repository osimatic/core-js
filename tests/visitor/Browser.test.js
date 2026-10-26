import { Browser } from '../../visitor/Browser.js';

describe('Browser', () => {
	describe('isOpera', () => {
		test('should return true when window.opr exists', () => {
			global.window = { opr: { addons: true } };
			global.opr = { addons: true };
			global.navigator = { userAgent: '' };

			expect(Browser.isOpera()).toBe(true);

			delete global.window;
			delete global.opr;
			delete global.navigator;
		});

		test('should return true when window.opera exists', () => {
			global.window = { opera: {} };
			global.navigator = { userAgent: '' };

			expect(Browser.isOpera()).toBe(true);

			delete global.window;
			delete global.navigator;
		});

		test('should return true when userAgent contains OPR/', () => {
			global.window = {};
			global.navigator = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277' };

			expect(Browser.isOpera()).toBe(true);

			delete global.window;
			delete global.navigator;
		});

		test('should return false when not Opera', () => {
			global.window = {};
			global.navigator = { userAgent: 'Mozilla/5.0' };

			expect(Browser.isOpera()).toBe(false);

			delete global.window;
			delete global.navigator;
		});
	});

	describe('isFirefox', () => {
		test('should return true when InstallTrigger is defined', () => {
			global.InstallTrigger = {};

			expect(Browser.isFirefox()).toBe(true);

			delete global.InstallTrigger;
		});

		test('should return false when InstallTrigger is undefined', () => {
			expect(Browser.isFirefox()).toBe(false);
		});
	});

	describe('isSafari', () => {
		test('should return true when HTMLElement toString contains Constructor', () => {
			// Mock Object.prototype.toString pour simuler Safari
			const originalToString = Object.prototype.toString;
			Object.prototype.toString = function() {
				if (this === global.window.HTMLElement) {
					return '[object HTMLElementConstructor]';
				}
				return originalToString.call(this);
			};

			global.window = { HTMLElement: function() {} };

			expect(Browser.isSafari()).toBe(true);

			// Restore
			Object.prototype.toString = originalToString;
			delete global.window;
		});

		test('should return false when HTMLElement toString does not contain Constructor', () => {
			const originalToString = Object.prototype.toString;
			Object.prototype.toString = function() {
				if (this === global.window.HTMLElement) {
					return '[object Function]';
				}
				return originalToString.call(this);
			};

			global.window = { HTMLElement: function() {} };

			expect(Browser.isSafari()).toBe(false);

			Object.prototype.toString = originalToString;
			delete global.window;
		});
	});

	describe('isChrome', () => {
		test('should return true when window.chrome.webstore exists', () => {
			global.window = {
				chrome: {
					webstore: {}
				}
			};

			expect(Browser.isChrome()).toBe(true);

			delete global.window;
		});

		test('should return false when window.chrome is undefined', () => {
			global.window = {};

			expect(Browser.isChrome()).toBe(false);

			delete global.window;
		});

		test('should return false when window.chrome.webstore is undefined', () => {
			global.window = {
				chrome: {}
			};

			expect(Browser.isChrome()).toBe(false);

			delete global.window;
		});
	});

	describe('isIE', () => {
		test('should return true when document.documentMode exists', () => {
			global.document = { documentMode: 11 };

			expect(Browser.isIE()).toBe(true);

			delete global.document;
		});

		test('should return false when document.documentMode is undefined', () => {
			global.document = {};

			expect(Browser.isIE()).toBe(false);

			delete global.document;
		});
	});

	describe('isEdge', () => {
		test('should return true when window.StyleMedia exists and not IE', () => {
			global.document = {};
			global.window = { StyleMedia: {} };

			expect(Browser.isEdge()).toBe(true);

			delete global.document;
			delete global.window;
		});

		test('should return false when window.StyleMedia is undefined', () => {
			global.document = {};
			global.window = {};

			expect(Browser.isEdge()).toBe(false);

			delete global.document;
			delete global.window;
		});
	});
});