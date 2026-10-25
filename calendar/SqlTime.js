import '../utils/string.js';
import { Locale } from '../location/Locale.js';
import { TimeZone } from './TimeZone.js';
import { DateTime } from './DateTime.js';
import { SqlDateTime } from './SqlDateTime.js';

/**
 * Les heures SQL fournies en paramètre doivent être en UTC.
 */
class SqlTime {
	static parse(sqlTime) {
		if (sqlTime == null) {
			return null;
		}

		if ((sqlTime.match(/\:/g) || []).length === 1) {
			sqlTime += ':00';
		}

		let arrayTime = sqlTime.split(':');
		return new Date(Date.UTC(1970, 0, 1, arrayTime[0], arrayTime[1], arrayTime[2]));

		/*let jsDate = new Date();
		jsDate.setUTCFullYear(1970, 0, 1);
		jsDate.setUTCHours(arrayTime[0], arrayTime[1], arrayTime[2], 0);
		return jsDate;*/
	}

	static getCurrentSqlTime() {
		return DateTime.getSqlTime(new Date());
	}

	static #getTodayDatePrefix() {
		const today = new Date();
		return today.getUTCFullYear()+'-'+String(today.getUTCMonth()+1).padStart(2,'0')+'-'+String(today.getUTCDate()).padStart(2,'0');
	}

	static getTimeDisplay(sqlTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return SqlDateTime.getTimeDisplay(SqlTime.#getTodayDatePrefix()+' '+sqlTime, locale, timeZone);
	}
	static getTimeDigitalDisplay(sqlTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return SqlDateTime.getTimeDigitalDisplay(SqlTime.#getTodayDatePrefix()+' '+sqlTime, locale, timeZone);
	}
	static getTimeDisplayWithNbDays(sqlTime, previousSqlTime, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		const todayPrefix = SqlTime.#getTodayDatePrefix();
		return SqlDateTime.getTimeDisplayWithNbDays(todayPrefix+' '+sqlTime, todayPrefix+' '+previousSqlTime, locale, timeZone);
	}

	static getTimeForInputTime(sqlTime, withSeconds=false, timeZone=TimeZone.getDefault()) {
		return SqlDateTime.getTimeForInputTime(SqlTime.#getTodayDatePrefix()+' '+sqlTime, withSeconds, timeZone);
	}

	static getTimestamp(sqlTime) {
		return SqlDateTime.getTimestamp(SqlTime.#getTodayDatePrefix()+' '+sqlTime);
	}
}

export { SqlTime };
