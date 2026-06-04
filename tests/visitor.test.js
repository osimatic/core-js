import { Browser, UserAgent } from '../visitor.js';

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

describe('UserAgent', () => {
	describe('getInfosDisplay', () => {
		test('should join all components with default separator', () => {
			const data = {
				os: 'Windows 10',
				browser: 'Chrome 91',
				device: 'Desktop'
			};

			expect(UserAgent.getInfosDisplay(data)).toBe('Windows 10 — Chrome 91 — Desktop');
		});

		test('should join all components with custom separator', () => {
			const data = {
				os: 'Windows 10',
				browser: 'Chrome 91',
				device: 'Desktop'
			};

			expect(UserAgent.getInfosDisplay(data, ' | ')).toBe('Windows 10 | Chrome 91 | Desktop');
		});

		test('should skip null os', () => {
			const data = {
				os: null,
				browser: 'Chrome 91',
				device: 'Desktop'
			};

			expect(UserAgent.getInfosDisplay(data)).toBe('Chrome 91 — Desktop');
		});

		test('should skip null browser', () => {
			const data = {
				os: 'Windows 10',
				browser: null,
				device: 'Desktop'
			};

			expect(UserAgent.getInfosDisplay(data)).toBe('Windows 10 — Desktop');
		});

		test('should skip null device', () => {
			const data = {
				os: 'Windows 10',
				browser: 'Chrome 91',
				device: null
			};

			expect(UserAgent.getInfosDisplay(data)).toBe('Windows 10 — Chrome 91');
		});

		test('should return empty string when all null', () => {
			const data = {
				os: null,
				browser: null,
				device: null
			};

			expect(UserAgent.getInfosDisplay(data)).toBe('');
		});

		test('should handle only one component', () => {
			const data = {
				os: 'Windows 10',
				browser: null,
				device: null
			};

			expect(UserAgent.getInfosDisplay(data)).toBe('Windows 10');
		});
	});

	describe('getData', () => {
		test('should parse Windows Chrome user agent', () => {
			const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
			const result = UserAgent.getData(ua);
			expect(result.os).toBe('Windows 10');
			expect(result.browser).toBe('Chrome 91');
			expect(result.device).toBeNull();
		});

		test('should handle os without version', () => {
			const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0';
			const result = UserAgent.getData(ua);
			expect(result.os).toBe('Linux');
		});

		test('should handle mobile device', () => {
			const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
			const result = UserAgent.getData(ua);
			expect(result.device).toContain('mobile');
			expect(result.device).toContain('Apple');
			expect(result.device).toContain('iPhone');
		});

		test('should return all null for empty user agent', () => {
			const result = UserAgent.getData('');
			expect(result).toEqual({ os: null, browser: null, device: null });
		});
	});

	describe('getOsIcon', () => {
		test('should return Windows icon', () => {
			expect(UserAgent.getOsIcon('Windows')).toBe('<i class="fab fa-windows"></i>');
			expect(UserAgent.getOsIcon('WINDOWS')).toBe('<i class="fab fa-windows"></i>');
			expect(UserAgent.getOsIcon('windows')).toBe('<i class="fab fa-windows"></i>');
		});

		test('should return Linux icon', () => {
			expect(UserAgent.getOsIcon('Linux')).toBe('<i class="fab fa-linux"></i>');
			expect(UserAgent.getOsIcon('LINUX')).toBe('<i class="fab fa-linux"></i>');
		});

		test('should return Apple icon for macOS', () => {
			expect(UserAgent.getOsIcon('macOS')).toBe('<i class="fab fa-apple"></i>');
			expect(UserAgent.getOsIcon('MACOS')).toBe('<i class="fab fa-apple"></i>');
		});

		test('should return Apple icon for iOS', () => {
			expect(UserAgent.getOsIcon('iOS')).toBe('<i class="fab fa-apple"></i>');
			expect(UserAgent.getOsIcon('IOS')).toBe('<i class="fab fa-apple"></i>');
		});

		test('should return Android icon', () => {
			expect(UserAgent.getOsIcon('Android')).toBe('<i class="fab fa-android"></i>');
			expect(UserAgent.getOsIcon('ANDROID')).toBe('<i class="fab fa-android"></i>');
		});

		test('should return empty string for unknown OS', () => {
			expect(UserAgent.getOsIcon('Unknown')).toBe('');
			expect(UserAgent.getOsIcon('FreeBSD')).toBe('');
		});
	});

	describe('getOsDisplay', () => {
		test('should return icon and name for Windows', () => {
			const result = UserAgent.getOsDisplay('Windows');
			expect(result).toContain('<i class="fab fa-windows"></i>');
			expect(result).toContain('Windows');
		});

		test('should return only name when no icon', () => {
			const result = UserAgent.getOsDisplay('Unknown');
			expect(result).toBe('Unknown');
		});
	});

	describe('getBrowserIcon', () => {
		test('should return Chrome icon', () => {
			expect(UserAgent.getBrowserIcon('Chrome')).toBe('<i class="fab fa-chrome"></i>');
			expect(UserAgent.getBrowserIcon('CHROME')).toBe('<i class="fab fa-chrome"></i>');
		});

		test('should return Firefox icon', () => {
			expect(UserAgent.getBrowserIcon('Firefox')).toBe('<i class="fab fa-firefox"></i>');
			expect(UserAgent.getBrowserIcon('FIREFOX')).toBe('<i class="fab fa-firefox"></i>');
		});

		test('should return Edge icon', () => {
			expect(UserAgent.getBrowserIcon('Edge')).toBe('<i class="fab fa-edge"></i>');
			expect(UserAgent.getBrowserIcon('EDGE')).toBe('<i class="fab fa-edge"></i>');
		});

		test('should return Safari icon', () => {
			expect(UserAgent.getBrowserIcon('Safari')).toBe('<i class="fab fa-safari"></i>');
			expect(UserAgent.getBrowserIcon('SAFARI')).toBe('<i class="fab fa-safari"></i>');
		});

		test('should return Opera icon', () => {
			expect(UserAgent.getBrowserIcon('Opera')).toBe('<i class="fab fa-opera"></i>');
			expect(UserAgent.getBrowserIcon('OPERA')).toBe('<i class="fab fa-opera"></i>');
		});

		test('should return empty string for unknown browser', () => {
			expect(UserAgent.getBrowserIcon('Unknown')).toBe('');
			expect(UserAgent.getBrowserIcon('Brave')).toBe('');
		});
	});

	describe('getBrowserDisplay', () => {
		test('should return icon and name for Chrome', () => {
			const result = UserAgent.getBrowserDisplay('Chrome');
			expect(result).toContain('<i class="fab fa-chrome"></i>');
			expect(result).toContain('Chrome');
		});

		test('should return only name when no icon', () => {
			const result = UserAgent.getBrowserDisplay('Unknown');
			expect(result).toBe('Unknown');
		});
	});

	describe('getDeviceDisplay', () => {
		test('should return desktop icon for desktop type', () => {
			const device = { type: 'desktop' };
			const result = UserAgent.getDeviceDisplay(device);

			expect(result).toBe('<i class="fas fa-desktop"></i> Ordinateur');
		});

		test('should return mobile icon with manufacturer and model', () => {
			const device = {
				type: 'mobile',
				is_mobile: true,
				manufacturer: 'Apple',
				model: 'iPhone 12'
			};
			const result = UserAgent.getDeviceDisplay(device);

			expect(result).toContain('<i class="fas fa-mobile-alt"></i>');
			expect(result).toContain('Apple');
			expect(result).toContain('iPhone 12');
		});

		test('should show "Mobile" when no manufacturer and model', () => {
			const device = {
				type: 'mobile',
				is_mobile: true,
				manufacturer: null,
				model: null
			};
			const result = UserAgent.getDeviceDisplay(device);

			expect(result).toContain('Mobile');
		});

		test('should handle tablet without is_mobile flag', () => {
			const device = {
				type: 'tablet',
				is_mobile: false,
				manufacturer: 'Samsung',
				model: 'Galaxy Tab'
			};
			const result = UserAgent.getDeviceDisplay(device);

			expect(result).toContain('Samsung');
			expect(result).toContain('Galaxy Tab');
		});

		test('should handle device with only manufacturer', () => {
			const device = {
				type: 'mobile',
				is_mobile: true,
				manufacturer: 'Google',
				model: undefined
			};
			const result = UserAgent.getDeviceDisplay(device);

			expect(result).toContain('Google');
		});
	});
});