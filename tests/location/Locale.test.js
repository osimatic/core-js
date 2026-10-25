import { Locale } from '../../location/Locale.js';

describe('Locale', () => {
	describe('normalize', () => {
		test('should canonicalize to lang-REGION format', () => {
			expect(Locale.normalize('fr-FR')).toBe('fr-FR');
			expect(Locale.normalize('fr-fr')).toBe('fr-FR');
			expect(Locale.normalize('FR-fr')).toBe('fr-FR');
			expect(Locale.normalize('fr_FR')).toBe('fr-FR');
		});

		test('should handle lang-only locales', () => {
			expect(Locale.normalize('fr')).toBe('fr');
			expect(Locale.normalize('EN')).toBe('en');
		});
	});

	describe('getBaseLang', () => {
		test('should extract base language', () => {
			expect(Locale.getBaseLang('fr-FR')).toBe('fr');
			expect(Locale.getBaseLang('en-US')).toBe('en');
			expect(Locale.getBaseLang('fr_FR')).toBe('fr');
		});

		test('should return lang as-is when no region', () => {
			expect(Locale.getBaseLang('fr')).toBe('fr');
		});
	});

	describe('getRegion', () => {
		test('should extract region code', () => {
			expect(Locale.getRegion('fr-FR')).toBe('FR');
			expect(Locale.getRegion('en-US')).toBe('US');
			expect(Locale.getRegion('fr_FR')).toBe('FR');
		});

		test('should return null when no region', () => {
			expect(Locale.getRegion('fr')).toBeNull();
		});
	});

	describe('isValid', () => {
		test('should accept valid locales', () => {
			expect(Locale.isValid('fr')).toBe(true);
			expect(Locale.isValid('fr-FR')).toBe(true);
			expect(Locale.isValid('en-US')).toBe(true);
			expect(Locale.isValid('zh-CN')).toBe(true);
		});

		test('should reject invalid locales', () => {
			expect(Locale.isValid('foobar')).toBe(false);
			expect(Locale.isValid('fr_FR')).toBe(false);
			expect(Locale.isValid('')).toBe(false);
			expect(Locale.isValid('1234')).toBe(false);
		});
	});

	describe('toPOSIX', () => {
		test('should convert to POSIX format', () => {
			expect(Locale.toPOSIX('fr-FR')).toBe('fr_FR');
			expect(Locale.toPOSIX('en-US')).toBe('en_US');
			expect(Locale.toPOSIX('fr_FR')).toBe('fr_FR');
		});

		test('should handle lang-only locales', () => {
			expect(Locale.toPOSIX('fr')).toBe('fr');
		});
	});
});