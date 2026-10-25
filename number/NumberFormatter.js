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

export { NumberFormatter };
