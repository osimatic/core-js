import { jest } from '@jest/globals';
import { TelephoneNumber } from '../../contact/TelephoneNumber.js';

describe('TelephoneNumber', () => {

	describe('setLocalCountryCode', () => {
		test('should set local country code', () => {
			TelephoneNumber.setLocalCountryCode('FR');
			expect(TelephoneNumber.localCountryCode).toBe('FR');
		});
	});


	describe('getCountryIsoCode', () => {
		test('should return country code for valid phone number', () => {
			const result = TelephoneNumber.getCountryIsoCode('+33612345678', 'FR');
			expect(result).toBe('FR');
		});

		test('should return null for invalid phone number', () => {
			const result = TelephoneNumber.getCountryIsoCode('invalid', 'FR');
			expect(result).toBeNull();
		});
	});

	describe('formatNational', () => {
		test('should format phone number in national format', () => {
			const result = TelephoneNumber.formatNational('+33612345678', 'FR');
			expect(result).toBe('06 12 34 56 78');
		});

		test('should return empty string for invalid phone number', () => {
			const result = TelephoneNumber.formatNational('invalid', 'FR');
			expect(result).toBe('');
		});
	});

	describe('formatInternational', () => {
		test('should format phone number in international format', () => {
			const result = TelephoneNumber.formatInternational('+33612345678', 'FR');
			expect(result).toBe('+33 6 12 34 56 78');
		});

		test('should return empty string for invalid phone number', () => {
			const result = TelephoneNumber.formatInternational('invalid', 'FR');
			expect(result).toBe('');
		});
	});

	describe('formatInternationalWithTelLink', () => {
		test('should format phone number with tel link', () => {
			const result = TelephoneNumber.formatInternationalWithTelLink('+33612345678', 'FR');
			expect(result).toBe('<a href="tel:+33612345678">+33 6 12 34 56 78</a>');
		});
	});

	describe('parse', () => {
		test('should parse valid phone number', () => {
			const result = TelephoneNumber.parse('+33612345678', 'FR');
			expect(result).toBe('+33 6 12 34 56 78');
		});

		test('should return null for invalid phone number', () => {
			const result = TelephoneNumber.parse('invalid', 'FR');
			expect(result).toBeNull();
		});
	});

	describe('check', () => {
		test('should validate correct phone number', () => {
			const result = TelephoneNumber.check('+33612345678', 'FR');
			expect(result).toBe(true);
		});

		test('should reject invalid phone number', () => {
			const result = TelephoneNumber.check('invalid', 'FR');
			expect(result).toBe(false);
		});
	});

	describe('checkSyntaxe', () => {
		test('should validate French phone numbers', () => {
			expect(TelephoneNumber.checkSyntaxe('0612345678')).toBe(true);
			expect(TelephoneNumber.checkSyntaxe('06 12 34 56 78')).toBe(true);
			expect(TelephoneNumber.checkSyntaxe('06.12.34.56.78')).toBe(true);
			expect(TelephoneNumber.checkSyntaxe('06-12-34-56-78')).toBe(true);
		});

		test('should validate international phone numbers', () => {
			expect(TelephoneNumber.checkSyntaxe('+33612345678')).toBe(true);
			expect(TelephoneNumber.checkSyntaxe('+33 6 12 34 56 78')).toBe(true);
			expect(TelephoneNumber.checkSyntaxe('0033612345678')).toBe(true);
		});

		test('should reject invalid phone numbers', () => {
			expect(TelephoneNumber.checkSyntaxe('123')).toBe(false);
			expect(TelephoneNumber.checkSyntaxe('abcdefghij')).toBe(false);
		});
	});

	describe('getType', () => {
		test('should return phone type', () => {
			const result = TelephoneNumber.getType('+33612345678', 'FR');
			expect(result).toBe('MOBILE');
		});

		test('should return MASKED for null or empty phone number', () => {
			expect(TelephoneNumber.getType(null, 'FR')).toBe('MASKED');
			expect(TelephoneNumber.getType('', 'FR')).toBe('MASKED');
		});

		test('should return null for invalid phone number', () => {
			const result = TelephoneNumber.getType('invalid', 'FR');
			expect(result).toBeNull();
		});
	});

	describe('getTypeLabelList', () => {
		test('should return type labels object', () => {
			const labels = TelephoneNumber.getTypeLabelList();
			expect(labels).toHaveProperty('MOBILE', 'Mobile');
			expect(labels).toHaveProperty('FIXED_LINE', 'Fixe');
			expect(labels).toHaveProperty('MASKED', 'Masqué');
		});
	});

	describe('getTypeLabel', () => {
		test('should return label for known type', () => {
			expect(TelephoneNumber.getTypeLabel('MOBILE')).toBe('Mobile');
			expect(TelephoneNumber.getTypeLabel('FIXED_LINE')).toBe('Fixe');
		});

		test('should return Inconnu for unknown type', () => {
			expect(TelephoneNumber.getTypeLabel('UNKNOWN_TYPE')).toBe('Inconnu');
		});
	});

	describe('getCountryName', () => {
		test('should return country name for phone number', () => {
			const result = TelephoneNumber.getCountryName('+33612345678', 'FR');
			expect(result).toBe('France');
		});
	});

	describe('getFlagImg', () => {
		test('should return flag image for phone number', () => {
			const result = TelephoneNumber.getFlagImg('+33612345678', 'FR');
			expect(result).toContain('fi-fr');
			expect(result).toContain('<span');
		});
	});

	describe('formatNationalWithFlagImg', () => {
		test('should format phone number with flag image', () => {
			const result = TelephoneNumber.formatNationalWithFlagImg('+33612345678', 'FR');
			expect(result).toContain('fi-fr');
			expect(result).toContain('06 12 34 56 78');
		});
	});

	describe('formatNationalWithFlagImgAndTelLink', () => {
		test('should format phone number with flag and tel link', () => {
			const result = TelephoneNumber.formatNationalWithFlagImgAndTelLink('+33612345678', 'FR');
			expect(result).toContain('fi-fr');
			expect(result).toContain('<a href="tel:+33612345678">');
			expect(result).toContain('06 12 34 56 78');
		});
	});


});