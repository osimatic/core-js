import '../utils/string.js';
import { Locale } from '../location/Locale.js';
import { TimeZone } from './TimeZone.js';
import { DateTime } from './DateTime.js';
import { DatePeriod } from './DatePeriod.js';
import { SqlDateTime } from './SqlDateTime.js';

/**
 * Les dates SQL fournies en paramètre doivent être en UTC.
 */
class SqlDate {
	static parse(sqlDate) {
		if (sqlDate == null) {
			return null;
		}
		return new Date(Date.UTC(sqlDate.substring(0, 4), sqlDate.substring(5, 7)-1, sqlDate.substring(8, 10), 0, 0, 0));
	}

	static getCurrentSqlDate() {
		return DateTime.getSqlDate(new Date());
	}

	static getDateDigitalDisplay(sqlDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return SqlDateTime.getDateDigitalDisplay(sqlDate+" 00:00:00", locale, timeZone);
	}
	static getDateTextDisplay(sqlDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return SqlDateTime.getDateTextDisplay(sqlDate+" 00:00:00", locale, timeZone);
	}

	static getDateForInputDate(sqlDate, timeZone=TimeZone.getDefault()) {
		return SqlDateTime.getDateForInputDate(sqlDate+" 00:00:00", timeZone);
	}

	static getTimestamp(sqlDate) {
		return SqlDateTime.getTimestamp(sqlDate+" 00:00:00");
	}

	static getYear(sqlDate) {
		return SqlDateTime.getYear(sqlDate+" 00:00:00");
	}
	static getMonth(sqlDate) {
		return SqlDateTime.getMonth(sqlDate+" 00:00:00");
	}
	static getMonthName(sqlDate, locale=Locale.getDefault(), isShort=false) {
		return SqlDateTime.getMonthName(sqlDate+" 00:00:00", locale, isShort);
	}
	static getDay(sqlDate) {
		return SqlDateTime.getDay(sqlDate+" 00:00:00");
	}

	static isDateInTheFuture(sqlDate) {
		return DateTime.isDateInTheFuture(SqlDateTime.parse(sqlDate + " 00:00:00"));
	}
	static getNbDayBetweenTwo(sqlDate1, sqlDate2, asPeriod=false) {
		return DatePeriod.getNbDayBetweenTwo(SqlDateTime.parse(sqlDate1 + " 00:00:00"), SqlDateTime.parse(sqlDate2 + " 00:00:00"), asPeriod);
	}
}

export { SqlDate };
