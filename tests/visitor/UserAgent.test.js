import { UserAgent } from '../../visitor/UserAgent.js';

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