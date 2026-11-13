import intlTelInputLib from 'intl-tel-input/intlTelInputWithUtils';
import { TelephoneNumber } from './TelephoneNumber.js';

// Methods that depend on intl-tel-input: separated from TelephoneNumber so as not to embed the lib
// when only number formatting is used
export class IntlTelInput {
	static setIntlTelInput(input, placeholderNumberType) {
		const localCountryCode = typeof TelephoneNumber.localCountryCode != 'undefined' ? TelephoneNumber.localCountryCode : null;

		return intlTelInputLib(input[0], {
			initialCountry: localCountryCode ? localCountryCode.toLowerCase() : null, // since version 19.x, the country code must be lowercase
			placeholderNumberType: placeholderNumberType || 'FIXED_LINE_OR_MOBILE',
		});
	}

	static getIntlTelInputInstance(input) {
		return intlTelInputLib.getInstance(input[0]);
	}

	static getEnteredNumberInInternationalFormat(intlTelInput) {
		return intlTelInput.getNumber(intlTelInputLib.NUMBER_FORMAT.E164);
	}

	static formatNumberFromIntlTelInput(intlTelInput) {
		let number = intlTelInput.getNumber();
		if (number != '' && number.substr(0, 1) !== '+') {
			number = '+' + intlTelInput.getSelectedCountryData().dialCode + number;
		}
		return number;
	}
}
