import { PersonName, Email, TelephoneNumber } from '../contact_details.js';

describe('PersonName', () => {
	describe('format', () => {
		test('should format full name with firstName and lastName', () => {
			expect(PersonName.format('John', 'Doe')).toBe('John Doe');
		});

		test('should format with only firstName', () => {
			expect(PersonName.format('John', null)).toBe('John');
			expect(PersonName.format('John', '')).toBe('John');
		});

		test('should format with only lastName', () => {
			expect(PersonName.format(null, 'Doe')).toBe('Doe');
			expect(PersonName.format('', 'Doe')).toBe('Doe');
		});

		test('should return empty string when both are null', () => {
			expect(PersonName.format(null, null)).toBe('');
			expect(PersonName.format('', '')).toBe('');
		});

		test('should trim extra spaces', () => {
			expect(PersonName.format('  John  ', '  Doe  ')).toBe('John Doe');
		});

		test('should handle names with special characters', () => {
			expect(PersonName.format('Jean-Paul', 'O\'Brien')).toBe('Jean-Paul O\'Brien');
		});
	});

	describe('checkFirstName', () => {
		test('should accept valid first names', () => {
			expect(PersonName.checkFirstName('John')).toBe(true);
			expect(PersonName.checkFirstName('Jean-Paul')).toBe(true);
			expect(PersonName.checkFirstName('O\'Brien')).toBe(true);
			expect(PersonName.checkFirstName('José')).toBe(true);
			expect(PersonName.checkFirstName('François')).toBe(true);
		});

		test('should reject first names shorter than 2 characters', () => {
			expect(PersonName.checkFirstName('J')).toBe(false);
			expect(PersonName.checkFirstName('')).toBe(false);
		});

		test('should reject first names longer than 64 characters', () => {
			const longName = 'A'.repeat(65);
			expect(PersonName.checkFirstName(longName)).toBe(false);
		});

		test('should reject first names with numbers', () => {
			expect(PersonName.checkFirstName('John123')).toBe(false);
		});

		test('should reject first names with special characters', () => {
			expect(PersonName.checkFirstName('John@')).toBe(false);
			expect(PersonName.checkFirstName('John!')).toBe(false);
		});

		test('should accept first names with spaces', () => {
			expect(PersonName.checkFirstName('Jean Paul')).toBe(true);
		});

		test('should accept first names with accented characters', () => {
			expect(PersonName.checkFirstName('Zoé')).toBe(true);
			expect(PersonName.checkFirstName('Chloë')).toBe(true);
		});
	});

	describe('checkLastName', () => {
		test('should accept valid last names', () => {
			expect(PersonName.checkLastName('Doe')).toBe(true);
			expect(PersonName.checkLastName('Smith-Jones')).toBe(true);
			expect(PersonName.checkLastName('O\'Brien')).toBe(true);
			expect(PersonName.checkLastName('Müller')).toBe(true);
		});

		test('should reject last names shorter than 2 characters', () => {
			expect(PersonName.checkLastName('D')).toBe(false);
			expect(PersonName.checkLastName('')).toBe(false);
		});

		test('should reject last names longer than 64 characters', () => {
			const longName = 'A'.repeat(65);
			expect(PersonName.checkLastName(longName)).toBe(false);
		});

		test('should reject last names with numbers', () => {
			expect(PersonName.checkLastName('Doe123')).toBe(false);
		});

		test('should reject last names with special characters', () => {
			expect(PersonName.checkLastName('Doe@')).toBe(false);
			expect(PersonName.checkLastName('Doe!')).toBe(false);
		});

		test('should accept last names with spaces', () => {
			expect(PersonName.checkLastName('Van Der Berg')).toBe(true);
		});
	});
});

describe('Email', () => {
	describe('validateEmail', () => {
		test('should validate correct email addresses', () => {
			expect(Email.validateEmail('test@example.com')).toBe(true);
			expect(Email.validateEmail('user.name@example.com')).toBe(true);
			expect(Email.validateEmail('user+tag@example.co.uk')).toBe(true);
			expect(Email.validateEmail('user_name@example.com')).toBe(true);
		});

		test('should reject invalid email addresses', () => {
			expect(Email.validateEmail('invalid')).toBe(false);
			expect(Email.validateEmail('invalid@')).toBe(false);
			expect(Email.validateEmail('@example.com')).toBe(false);
			expect(Email.validateEmail('invalid@.com')).toBe(false);
			expect(Email.validateEmail('invalid @example.com')).toBe(false);
		});

		test('should reject emails with multiple @ symbols', () => {
			expect(Email.validateEmail('user@@example.com')).toBe(false);
		});

		test('should accept emails with dots in local part', () => {
			expect(Email.validateEmail('first.last@example.com')).toBe(true);
		});

		test('should accept emails with subdomains', () => {
			expect(Email.validateEmail('user@mail.example.com')).toBe(true);
		});
	});

	describe('checkEmail', () => {
		test('should validate correct email addresses', () => {
			expect(Email.checkEmail('test@example.com')).toBe(true);
			expect(Email.checkEmail('user.name@example.co')).toBe(true);
			expect(Email.checkEmail('user_name@example.org')).toBe(true);
		});

		test('should reject invalid email addresses', () => {
			expect(Email.checkEmail('invalid')).toBe(false);
			expect(Email.checkEmail('invalid@')).toBe(false);
			expect(Email.checkEmail('@example.com')).toBe(false);
		});

		test('should reject emails with TLD longer than 5 characters', () => {
			expect(Email.checkEmail('test@example.museum')).toBe(false);
		});

		test('should accept emails with TLD up to 5 characters', () => {
			expect(Email.checkEmail('test@example.co')).toBe(true);
			expect(Email.checkEmail('test@example.com')).toBe(true);
			expect(Email.checkEmail('test@example.info')).toBe(true);
		});
	});

	describe('getMailToLink', () => {
		test('should generate mailto link', () => {
			const email = 'test@example.com';
			const expected = '<a href="mailto:test@example.com">test@example.com</a>';
			expect(Email.getMailToLink(email)).toBe(expected);
		});

		test('should handle email with special characters', () => {
			const email = 'user+tag@example.com';
			const expected = '<a href="mailto:user+tag@example.com">user+tag@example.com</a>';
			expect(Email.getMailToLink(email)).toBe(expected);
		});
	});
});

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

	describe('getEnteredNumberInInternationalFormat', () => {
		test('should return number in E164 format', () => {
			const iti = { getNumber: jest.fn(() => '+33612345678') };
			const result = TelephoneNumber.getEnteredNumberInInternationalFormat(iti);
			expect(result).toBe('+33612345678');
		});
	});

	describe('formatNumberFromIntlTelInput', () => {
		test('should return number as-is when it starts with +', () => {
			const iti = { getNumber: jest.fn(() => '+33612345678') };
			const result = TelephoneNumber.formatNumberFromIntlTelInput(iti);
			expect(result).toBe('+33612345678');
		});

		test('should prepend + and dial code when number has no +', () => {
			const iti = {
				getNumber: jest.fn(() => '0612345678'),
				getSelectedCountryData: jest.fn(() => ({ dialCode: '33' })),
			};
			const result = TelephoneNumber.formatNumberFromIntlTelInput(iti);
			expect(result).toBe('+330612345678');
		});

		test('should return empty string when number is empty', () => {
			const iti = { getNumber: jest.fn(() => '') };
			const result = TelephoneNumber.formatNumberFromIntlTelInput(iti);
			expect(result).toBe('');
		});
	});
});