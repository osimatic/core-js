import { NumberFormatter } from '../../number/NumberFormatter.js';

describe('NumberFormatter', () => {

	describe('getDecimalFormatter', () => {
		test('should create and cache decimal formatter', () => {
			const formatter1 = NumberFormatter.getDecimalFormatter('fr-FR', 2);
			const formatter2 = NumberFormatter.getDecimalFormatter('fr-FR', 2);
			expect(formatter1).toBe(formatter2); // Should return cached instance
			expect(formatter1).toBeInstanceOf(Intl.NumberFormat);
		});

		test('should create different formatters for different locales', () => {
			const formatterFr = NumberFormatter.getDecimalFormatter('fr-FR', 2);
			const formatterEn = NumberFormatter.getDecimalFormatter('en-US', 2);
			expect(formatterFr).not.toBe(formatterEn);
		});

		test('should create different formatters for different digits', () => {
			const formatter2 = NumberFormatter.getDecimalFormatter('fr-FR', 2);
			const formatter3 = NumberFormatter.getDecimalFormatter('fr-FR', 3);
			expect(formatter2).not.toBe(formatter3);
		});
	});

	describe('getCurrencyFormatter', () => {
		test('should create and cache currency formatter', () => {
			const formatter1 = NumberFormatter.getCurrencyFormatter('fr-FR', 'EUR', 2);
			const formatter2 = NumberFormatter.getCurrencyFormatter('fr-FR', 'EUR', 2);
			expect(formatter1).toBe(formatter2); // Should return cached instance
			expect(formatter1).toBeInstanceOf(Intl.NumberFormat);
		});

		test('should create different formatters for different currencies', () => {
			const formatterEur = NumberFormatter.getCurrencyFormatter('fr-FR', 'EUR', 2);
			const formatterUsd = NumberFormatter.getCurrencyFormatter('fr-FR', 'USD', 2);
			expect(formatterEur).not.toBe(formatterUsd);
		});

		test('should create different formatters for different locales', () => {
			const formatterFr = NumberFormatter.getCurrencyFormatter('fr-FR', 'EUR', 2);
			const formatterEn = NumberFormatter.getCurrencyFormatter('en-US', 'EUR', 2);
			expect(formatterFr).not.toBe(formatterEn);
		});
	});

	describe('getPercentFormatter', () => {
		test('should create and cache percent formatter', () => {
			const formatter1 = NumberFormatter.getPercentFormatter('fr-FR', 2);
			const formatter2 = NumberFormatter.getPercentFormatter('fr-FR', 2);
			expect(formatter1).toBe(formatter2); // Should return cached instance
			expect(formatter1).toBeInstanceOf(Intl.NumberFormat);
		});

		test('should create different formatters for different locales', () => {
			const formatterFr = NumberFormatter.getPercentFormatter('fr-FR', 2);
			const formatterEn = NumberFormatter.getPercentFormatter('en-US', 2);
			expect(formatterFr).not.toBe(formatterEn);
		});

		test('should create different formatters for different digits', () => {
			const formatter2 = NumberFormatter.getPercentFormatter('fr-FR', 2);
			const formatter3 = NumberFormatter.getPercentFormatter('fr-FR', 3);
			expect(formatter2).not.toBe(formatter3);
		});
	});
});