import '../utils/string.js';

class DateTimeFormatter {
	static getDateDigitalFormatter(locale, timeZone) {
		this.dateDigitalFormatter = this.dateDigitalFormatter || {};
		if (typeof this.dateDigitalFormatter[timeZone+locale] == 'undefined') {
			this.dateDigitalFormatter[timeZone+locale] = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: timeZone });
		}

		return this.dateDigitalFormatter[timeZone+locale];
	}

	static getDateTextFormatter(locale, timeZone) {
		this.dateTextFormatter = this.dateTextFormatter || {};
		if (typeof this.dateTextFormatter[timeZone+locale] == 'undefined') {
			this.dateTextFormatter[timeZone+locale] = new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timeZone });
		}

		return this.dateTextFormatter[timeZone+locale];
	}

	static getDateTimeFormatter(locale, timeZone) {
		this.dateTimeFormatter = this.dateTimeFormatter || {};
		if (typeof this.dateTimeFormatter[timeZone+locale] == 'undefined') {
			this.dateTimeFormatter[timeZone+locale] = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: timeZone });
		}

		return this.dateTimeFormatter[timeZone+locale];
	}

	static getDateSqlFormatter(timeZone) {
		this.dateSqlFormatter = this.dateSqlFormatter || {};
		if (typeof this.dateSqlFormatter[timeZone] == 'undefined') {
			this.dateSqlFormatter[timeZone] = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timeZone });
		}

		return this.dateSqlFormatter[timeZone];
	}

	static getTimeSqlFormatter(timeZone) {
		this.timeSqlFormatter = this.timeSqlFormatter || {};
		if (typeof this.timeSqlFormatter[timeZone] == 'undefined') {
			//console.log('init getTimeSqlFormatter avec timezone', timeZone);
			this.timeSqlFormatter[timeZone] = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, timeZone: timeZone }); //hour12: false = 24h format
		}

		return this.timeSqlFormatter[timeZone];
	}

	static getTimeFormatter(locale, timeZone) {
		this.timeFormatter = this.timeFormatter || {};
		if (typeof this.timeFormatter[timeZone+locale] == 'undefined') {
			this.timeFormatter[timeZone+locale] = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', timeZone: timeZone });
		}

		return this.timeFormatter[timeZone+locale];
	}

	static getTimeDigitalFormatter(locale, timeZone) {
		this.timeDigitalFormatter = this.timeDigitalFormatter || {};
		if (typeof this.timeDigitalFormatter[timeZone+locale] == 'undefined') {
			this.timeDigitalFormatter[timeZone+locale] = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timeZone });
		}

		return this.timeDigitalFormatter[timeZone+locale];
	}
}

export { DateTimeFormatter };
