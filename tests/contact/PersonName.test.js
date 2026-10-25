import { PersonName } from '../../contact/PersonName.js';

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