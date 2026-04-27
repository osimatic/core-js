import { SqlDateTime } from './date_time.js';
import { Locale } from './locale.js';

class IBAN {
	static format(iban) {
		return iban.toUpperCase().replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
	}
}

class BankCard {
	static formatCardNumber(cardNumber, hiddenChar='*') {
		if (cardNumber.length === 16) {
			cardNumber = cardNumber.substring(0, 4)+'-'+cardNumber.substring(4, 8)+'-'+cardNumber.substring(8, 12)+'-'+cardNumber.substring(12, 16);
			cardNumber = cardNumber.replace(/[*X]/gi, hiddenChar);
		}
		return cardNumber;
	}

	static formatExpirationDate(expirationDate, locale=Locale.getDefault()) {
		return SqlDateTime.getMonthName(expirationDate, locale)+' '+SqlDateTime.getYear(expirationDate);
	}
}

export { IBAN, BankCard };