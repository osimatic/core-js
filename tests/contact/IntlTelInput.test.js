import { jest } from '@jest/globals';
import { IntlTelInput } from '../../contact/IntlTelInput.js';

describe('IntlTelInput', () => {
	describe('getEnteredNumberInInternationalFormat', () => {
		test('should return number in E164 format', () => {
			const iti = { getNumber: jest.fn(() => '+33612345678') };
			const result = IntlTelInput.getEnteredNumberInInternationalFormat(iti);
			expect(result).toBe('+33612345678');
		});
	});

	describe('formatNumberFromIntlTelInput', () => {
		test('should return number as-is when it starts with +', () => {
			const iti = { getNumber: jest.fn(() => '+33612345678') };
			const result = IntlTelInput.formatNumberFromIntlTelInput(iti);
			expect(result).toBe('+33612345678');
		});

		test('should prepend + and dial code when number has no +', () => {
			const iti = {
				getNumber: jest.fn(() => '0612345678'),
				getSelectedCountryData: jest.fn(() => ({ dialCode: '33' })),
			};
			const result = IntlTelInput.formatNumberFromIntlTelInput(iti);
			expect(result).toBe('+330612345678');
		});

		test('should return empty string when number is empty', () => {
			const iti = { getNumber: jest.fn(() => '') };
			const result = IntlTelInput.formatNumberFromIntlTelInput(iti);
			expect(result).toBe('');
		});
	});
});