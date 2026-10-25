import { Email } from '../../contact/Email.js';

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

	describe('normalize', () => {
		test('should lowercase email', () => {
			expect(Email.normalize('Test@Example.COM')).toBe('test@example.com');
		});

		test('should trim leading and trailing whitespace', () => {
			expect(Email.normalize('  test@example.com  ')).toBe('test@example.com');
		});

		test('should lowercase and trim at the same time', () => {
			expect(Email.normalize(' Test@Example.COM ')).toBe('test@example.com');
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