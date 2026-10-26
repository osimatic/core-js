import intlTelInputLib from 'intl-tel-input/intlTelInputWithUtils';
import { TelephoneNumber } from './TelephoneNumber.js';

// Méthodes qui dépendent de intl-tel-input : séparées de TelephoneNumber pour ne pas embarquer la lib
// quand seul le formatage des numéros est utilisé
class IntlTelInput {
	static setIntlTelInput(input, placeholderNumberType) {
		TelephoneNumber.localCountryCode = typeof TelephoneNumber.localCountryCode != 'undefined' ? TelephoneNumber.localCountryCode : null;

		return intlTelInputLib(input[0], {
			initialCountry: null != TelephoneNumber.localCountryCode ? TelephoneNumber.localCountryCode.toLowerCase() : null, // depuis version 19.x, le code pays doit être en minuscule
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

export { IntlTelInput };