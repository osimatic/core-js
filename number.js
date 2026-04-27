import { Locale } from './locale.js';

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

class NumberFormatter {
	static getDecimalFormatter(locale, digits = 2) {
		this.decimalFormatter = this.decimalFormatter || {};
		if (typeof this.decimalFormatter[locale+digits] == 'undefined') {
			this.decimalFormatter[locale+digits] = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
		}
	
		return this.decimalFormatter[locale+digits];
	}

	static getCurrencyFormatter(locale, currency, digits = 2) {
		this.currencyFormatter = this.currencyFormatter || {};
		if (typeof this.currencyFormatter[locale+currency+digits] == 'undefined') {
			this.currencyFormatter[locale+currency+digits] = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits, style: 'currency', currency });
		}
	
		return this.currencyFormatter[locale+currency+digits];
	}

	static getPercentFormatter(locale, digits = 2) {
		this.percentFormatter = this.percentFormatter || {};
		if (typeof this.percentFormatter[locale+digits] == 'undefined') {
			this.percentFormatter[locale+digits] = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits, style: 'percent' });
		}
	
		return this.percentFormatter[locale+digits];
	}
}

Number.prototype.format = Number.prototype.format || function(nbDecimal=2, locale=Locale.getDefault()) {
	return Number.format(this, nbDecimal, locale);
}

if (!Number.format) {
	Number.format = function(number, nbDecimal=2, locale=Locale.getDefault()) {
		return NumberFormatter.getDecimalFormatter(locale, nbDecimal).format(number);
	};
}

Number.prototype.formatCurrency = Number.prototype.formatCurrency || function(currency=Currency.getDefault(), nbDecimal=2, locale=Locale.getDefault()) {
	return Currency.format(this, nbDecimal, currency, locale);
}

Number.formatCurrency = Number.formatCurrency || function(number, currency=Currency.getDefault(), nbDecimal=2, locale=Locale.getDefault()) {
	return Currency.format(number, nbDecimal, currency, locale);
}

Number.prototype.formatPercent = Number.prototype.formatPercent || function(nbDecimal=2, locale=Locale.getDefault()) {
	return Number.formatPercent(this, nbDecimal, locale);
}

Number.formatPercent = Number.formatPercent || function(number, nbDecimal=2, locale=Locale.getDefault()) {
	return NumberFormatter.getPercentFormatter(locale, nbDecimal).format(number);
}

/**
 * Number.prototype.format(n, x, s, c)
 *
 * @param integer n: length of decimal
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 * @param integer x: length of sections
 */
Number.prototype.formatForDisplay = Number.prototype.formatForDisplay || function(n, s, c, x) {
	let re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
		num = this.toFixed(Math.max(0, ~~n));
	return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

Number.prototype.truncate = Number.prototype.truncate || function() {
	return this < 0 ? Math.ceil(this) : Math.floor(this);
}

Number.prototype.padLeft2 = Number.prototype.padLeft2 || function() {
	return Number.padLeft2(this);
}
Number.padLeft2 = Number.padLeft2 || function(n) {
	return n > 9 ? "" + n : "0" + n;
}

Number.prototype.roundDecimal = Number.prototype.roundDecimal || function(precision=2) {
	return Number.roundDecimal(this, precision);
}
Number.roundDecimal = Number.roundDecimal || function(number, precision=2) {
	let tmp = Math.pow(10, precision);
	return Math.round(number*tmp) / tmp;
}

Math.getDecimals = Math.getDecimals || function(number) {
	return parseInt((number+"").split(".")[1] || 0);
}

if (!Number.random) {
	Number.random = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
}

class Rating {
	static display(rating, maxRating = 5, imgOn = '&#9733;', imgOff = '&#9734;', imgHalf = null) {
		if (rating == null) {
			return '';
		}

		const fullStars = Math.floor(rating);
		const decimal = rating - fullStars;

		let totalFull = fullStars;
		let showHalf = false;

		if (imgHalf !== null && decimal >= 0.25 && decimal < 0.75) {
			showHalf = true;
		}
		else if (decimal >= (imgHalf !== null ? 0.75 : 0.5)) {
			totalFull++;
		}

		return imgOn.repeat(totalFull)
			+ (showHalf ? imgHalf : '')
			+ imgOff.repeat(maxRating - totalFull - (showHalf ? 1 : 0));
	}
}

export { Currency, NumberFormatter, Rating };