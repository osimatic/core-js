import { Locale } from '../location/Locale.js';
import { NumberFormatter } from './NumberFormatter.js';

class Currency {
	static current = 'EUR';

	static getDefault() {
		return Currency.current;
	}

	static setDefault(currency) {
		Currency.current = currency;
	}

	static format(number, nbDecimal=2, currency=Currency.getDefault(), locale=Locale.getDefault()) {
		return NumberFormatter.getCurrencyFormatter(locale, currency, nbDecimal).format(number);
	}
}

export { Currency };
