import { IBAN } from '../../bank/IBAN.js';

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