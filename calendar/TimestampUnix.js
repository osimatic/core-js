import '../utils/string.js';
import { Locale } from '../location/Locale.js';
import { TimeZone } from './TimeZone.js';
import { DateTime } from './DateTime.js';
import { DatePeriod } from './DatePeriod.js';

class TimestampUnix {
	static parse(timestamp) {
		if (timestamp == null) {
			return null;
		}
		return new Date(parseInt(timestamp+'000'));
	}

	static getCurrent() {
		let today = new Date();
		return parseInt(today.getTime() / 1000);
	}

	static getDateDigitalDisplay(timestamp, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getDateDigitalDisplay(this.parse(timestamp), locale, timeZone);
	}
	static getDateTextDisplay(timestamp, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getDateTextDisplay(this.parse(timestamp), locale, timeZone);
	}

	static getTimeDisplay(timestamp, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeDisplay(this.parse(timestamp), locale, timeZone);
	}
	static getTimeDisplayWithNbDays(timestamp, previousTimestamp, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeDisplayWithNbDays(this.parse(timestamp), this.parse(previousTimestamp), locale, timeZone);
	}
	static getTimeDigitalDisplay(timestamp, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeDigitalDisplay(this.parse(timestamp), locale, timeZone);
	}

	static getYear(timestamp, timeZone=TimeZone.getDefault()) {
		//const sqlDate = this.getSqlDate(timestamp, timeZone);
		//return parseInt(sqlDate.substring(0, 4));
		return parseInt(this.parse(timestamp).toLocaleDateString(Locale.getDefault(), {year: 'numeric', timeZone: timeZone}));
	}
	static getMonth(timestamp, timeZone=TimeZone.getDefault()) {
		//const sqlDate = this.getSqlDate(timestamp, timeZone);
		//return parseInt(sqlDate.substring(5, 7));
		return parseInt(this.parse(timestamp).toLocaleDateString(Locale.getDefault(), {month: 'numeric', timeZone: timeZone}));
	}
	static getDayOfMonth(timestamp, timeZone=TimeZone.getDefault()) {
		//const sqlDate = this.getSqlDate(timestamp, timeZone);
		//return parseInt(sqlDate.substring(8, 10));
		return parseInt(this.parse(timestamp).toLocaleDateString(Locale.getDefault(), {day: 'numeric', timeZone: timeZone}));
	}

	static getHour(timestamp, timeZone=TimeZone.getDefault()) {
		const sqlTime = this.getSqlTime(timestamp, timeZone);
		return parseInt(sqlTime.substring(0, 2));
	}
	static getMinute(timestamp, timeZone=TimeZone.getDefault()) {
		const sqlTime = this.getSqlTime(timestamp, timeZone);
		return parseInt(sqlTime.substring(3, 5));
	}
	static getSecond(timestamp, timeZone=TimeZone.getDefault()) {
		const sqlTime = this.getSqlTime(timestamp, timeZone);
		return parseInt(sqlTime.substring(6, 8));
	}

	static getSqlDateTime(timestamp, timeZone=TimeZone.getDefault()) {
		return this.getSqlDate(timestamp, timeZone)+' '+this.getSqlTime(timestamp, timeZone);
	}
	static getSqlDate(timestamp, timeZone=TimeZone.getDefault()) {
		return DateTime.getSqlDate(this.parse(timestamp), timeZone);
	}
	static getSqlTime(timestamp, timeZone=TimeZone.getDefault()) {
		return DateTime.getSqlTime(this.parse(timestamp), timeZone);
	}

	static getDateForInputDate(timestamp, timeZone=TimeZone.getDefault()) {
		return DateTime.getDateForInputDate(this.parse(timestamp), timeZone);
	}
	static getTimeForInputTime(timestamp, withSeconds=false, timeZone=TimeZone.getDefault()) {
		return DateTime.getTimeForInputTime(this.parse(timestamp), withSeconds, timeZone);
	}

	static isDateEqual(timestamp1, timestamp2) {
		return DateTime.isDateEqual(this.parse(timestamp1), this.parse(timestamp2));
	}

	static getNbDayBetweenTwo(timestamp1, timestamp2, asPeriod=false, timeZone=TimeZone.getDefault()) {
		return DatePeriod.getNbDayBetweenTwo(this.parse(timestamp1), this.parse(timestamp2), asPeriod, timeZone);
	}

	static isDateInThePast(timestamp) {
		return DateTime.isDateInThePast(this.parse(timestamp));
	}
	static isDateTimeInThePast(timestamp) {
		return DateTime.isDateTimeInThePast(this.parse(timestamp));
	}

	static isDateInTheFuture(timestamp) {
		return DateTime.isDateInTheFuture(this.parse(timestamp));
	}
	static isDateTimeInTheFuture(timestamp) {
		return DateTime.isDateTimeInTheFuture(this.parse(timestamp));
	}

}

export { TimestampUnix };
