import '../utils/string.js';
import { Locale } from '../location/Locale.js';
import { TimeZone } from './TimeZone.js';
import { DateTime } from './DateTime.js';
import { DatePeriod } from './DatePeriod.js';

/**
 * Les dates/heures SQL fournies en paramètre doivent être en UTC.
 */
class SqlDateTime {
	static getCurrentSqlDateTime() {
		return DateTime.getSqlDateTime(new Date());
	}

	static getSqlDate(sqlDateTime, timeZone="UTC") {
		if (sqlDateTime == null) {
			return null;
		}
		return DateTime.getSqlDate(this.parse(sqlDateTime), timeZone);
	}

	static getSqlTime(sqlDateTime, timeZone="UTC") {
		if (sqlDateTime == null) {
			return null;
		}
		return DateTime.getSqlTime(this.parse(sqlDateTime), timeZone);
	}

	static parse(sqlDateTime) {
		if (sqlDateTime == null) {
			return null;
		}
		//return new Date(sqlDateTime.substring(0, 4), sqlDateTime.substring(5, 7)-1, sqlDateTime.substring(8, 10), sqlDateTime.substring(11, 13), sqlDateTime.substring(14, 16), sqlDateTime.substring(17, 19));
		return new Date(Date.UTC(sqlDateTime.substring(0, 4), sqlDateTime.substring(5, 7)-1, sqlDateTime.substring(8, 10), sqlDateTime.substring(11, 13), sqlDateTime.substring(14, 16), sqlDateTime.substring(17, 19)));
	}

	static getDateDigitalDisplay(sqlDateTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getDateDigitalDisplay(this.parse(sqlDateTime), locale, timeZone);
	}
	static getDateTextDisplay(sqlDateTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getDateTextDisplay(this.parse(sqlDateTime), locale, timeZone);
	}

	static getTimeDisplay(sqlDateTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeDisplay(this.parse(sqlDateTime), locale, timeZone);
	}
	static getTimeDisplayWithNbDays(sqlDateTime, previousSqlDateTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeDisplayWithNbDays(this.parse(sqlDateTime), this.parse(previousSqlDateTime), locale, timeZone);
	}
	static getTimeDigitalDisplay(sqlDateTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeDigitalDisplay(this.parse(sqlDateTime), locale, timeZone);
	}

	static getDateTimeDigitalDisplay(sqlDateTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getDateTimeDigitalDisplay(this.parse(sqlDateTime), locale, timeZone);
	}

	static getDateForInputDate(sqlDateTime, timeZone=TimeZone.getDefault()) {
		return DateTime.getDateForInputDate(this.parse(sqlDateTime), timeZone);
	}
	static getTimeForInputTime(sqlDateTime, withSeconds=false, timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeForInputTime(this.parse(sqlDateTime), withSeconds, timeZone);
	}

	static getYear(sqlDateTime) {
		return DateTime.getYear(this.parse(sqlDateTime));
	}
	static getMonth(sqlDateTime) {
		return DateTime.getMonth(this.parse(sqlDateTime));
	}
	static getMonthName(sqlDateTime, locale=Locale.getDefault(), isShort=false) {
		return DateTime.getMonthName(this.parse(sqlDateTime), locale);
	}
	static getDay(sqlDateTime) {
		return DateTime.getDay(this.parse(sqlDateTime));
	}

	static getTimestamp(sqlDateTime) {
		return DateTime.getTimestamp(this.parse(sqlDateTime));
	}

	static isDateInTheFuture(sqlDateTime) {
		return DateTime.isDateInTheFuture(this.parse(sqlDateTime));
	}

	static isDateTimeInTheFuture(sqlDateTime) {
		return DateTime.isDateTimeInTheFuture(this.parse(sqlDateTime));
	}

	static getNbDayBetweenTwo(sqlDateTime1, sqlDateTime2, asPeriod=false) {
		return DatePeriod.getNbDayBetweenTwo(this.parse(sqlDateTime1), this.parse(sqlDateTime2), asPeriod);
	}

}

export { SqlDateTime };
