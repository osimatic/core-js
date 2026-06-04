import { IBAN, BankCard } from '../bank.js';

describe('IBAN', () => {
	describe('format', () => {
		test('should format IBAN with spaces every 4 characters', () => {
			const iban = 'FR7630006000011234567890189';
			expect(IBAN.format(iban)).toBe('FR76 3000 6000 0112 3456 7890 189');
		});

		test('should remove non-alphanumeric characters', () => {
			const iban = 'FR76-3000-6000-0112-3456-7890-189';
			expect(IBAN.format(iban)).toBe('FR76 3000 6000 0112 3456 7890 189');
		});

		test('should handle IBAN with spaces', () => {
			const iban = 'FR76 3000 6000 0112 3456 7890 189';
			expect(IBAN.format(iban)).toBe('FR76 3000 6000 0112 3456 7890 189');
		});

		test('should handle lowercase letters', () => {
			const iban = 'fr7630006000011234567890189';
			expect(IBAN.format(iban)).toBe('FR76 3000 6000 0112 3456 7890 189');
		});

		test('should remove special characters and spaces', () => {
			const iban = 'FR76 3000.6000/0112-3456_7890*189';
			expect(IBAN.format(iban)).toBe('FR76 3000 6000 0112 3456 7890 189');
		});

		test('should handle German IBAN', () => {
			const iban = 'DE89370400440532013000';
			expect(IBAN.format(iban)).toBe('DE89 3704 0044 0532 0130 00');
		});

		test('should handle Belgian IBAN', () => {
			const iban = 'BE68539007547034';
			expect(IBAN.format(iban)).toBe('BE68 5390 0754 7034');
		});

		test('should handle empty string', () => {
			expect(IBAN.format('')).toBe('');
		});

		test('should handle IBAN with mixed case and special chars', () => {
			const iban = 'fR76@3000#6000$0112%3456^7890&189';
			expect(IBAN.format(iban)).toBe('FR76 3000 6000 0112 3456 7890 189');
		});
	});
});

describe('BankCard', () => {
	describe('formatCardNumber', () => {
		test('should format 16-digit card number with dashes', () => {
			const cardNumber = '1234567890123456';
			expect(BankCard.formatCardNumber(cardNumber)).toBe('1234-5678-9012-3456');
		});

		test('should replace asterisks with X', () => {
			const cardNumber = '1234********3456';
			expect(BankCard.formatCardNumber(cardNumber)).toBe('1234-****-****-3456');
		});

		test('should replace asterisks with custom hiddenChar', () => {
			const cardNumber = '1234********3456';
			expect(BankCard.formatCardNumber(cardNumber, 'X')).toBe('1234-XXXX-XXXX-3456');
		});

		test('should replace X with custom hiddenChar', () => {
			const cardNumber = '1234XXXXXXXX3456';
			expect(BankCard.formatCardNumber(cardNumber, '#')).toBe('1234-####-####-3456');
		});

		test('should replace both * and X with hiddenChar', () => {
			const cardNumber = '1234**XX**XX3456';
			// After formatting: 1234-**XX-**XX-3456
			// After replacing * and X with -: 1234-----------3456 (11 dashes: 3 from formatting + 8 from replacement)
			expect(BankCard.formatCardNumber(cardNumber, '-')).toBe('1234-----------3456');
		});

		test('should handle lowercase x', () => {
			const cardNumber = '1234xxxxxxxx3456';
			expect(BankCard.formatCardNumber(cardNumber, '•')).toBe('1234-••••-••••-3456');
		});

		test('should not format if not 16 digits', () => {
			const cardNumber = '12345678901234';
			expect(BankCard.formatCardNumber(cardNumber)).toBe('12345678901234');
		});

		test('should not format if more than 16 digits', () => {
			const cardNumber = '12345678901234567';
			expect(BankCard.formatCardNumber(cardNumber)).toBe('12345678901234567');
		});

		test('should handle card number with all zeros', () => {
			const cardNumber = '0000000000000000';
			expect(BankCard.formatCardNumber(cardNumber)).toBe('0000-0000-0000-0000');
		});

		test('should handle card number with letters (treated as 16 chars)', () => {
			const cardNumber = '123456789012ABCD';
			expect(BankCard.formatCardNumber(cardNumber)).toBe('1234-5678-9012-ABCD');
		});

		test('should handle empty string', () => {
			expect(BankCard.formatCardNumber('')).toBe('');
		});
	});

	describe('formatExpirationDate', () => {
		test('should format expiration date in French', () => {
			const result = BankCard.formatExpirationDate('2025-12-31', 'fr-FR');
			expect(result).toContain('2025');
			expect(result).toContain('décembre');
		});

		test('should use default locale fr-FR', () => {
			const result = BankCard.formatExpirationDate('2025-06-15');
			expect(result).toContain('2025');
			expect(result).toContain('juin');
		});

		test('should format expiration date in English', () => {
			const result = BankCard.formatExpirationDate('2025-03-20', 'en-US');
			expect(result).toContain('2025');
			expect(result).toContain('March');
		});

		test('should handle different date formats', () => {
			const result = BankCard.formatExpirationDate('2026-01-01');
			expect(result).toContain('2026');
		});
	});
});