import '../utils/string.js';
import { Locale } from '../location/Locale.js';
import { TimeZone } from './TimeZone.js';
import { DateTimeFormatter } from './DateTimeFormatter.js';
import { DatePeriod } from './DatePeriod.js';

class DateTime {
	static getSqlDate(jsDate, timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getDateSqlFormatter(timeZone).format(jsDate).replace(/\//g,'-').replace(',','');
	}

	static getSqlTime(jsDate, timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getTimeSqlFormatter(timeZone).format(jsDate);
	}

	static getSqlDateTime(jsDate, timeZone=TimeZone.getDefault()) {
		return this.getSqlDate(jsDate, timeZone)+' '+this.getSqlTime(jsDate, timeZone);
	}

	static getDateForInputDate(jsDate, timeZone=TimeZone.getDefault()) {
		return this.getSqlDate(jsDate, timeZone);
	}
	static getTimeForInputTime(jsDate, withSeconds=false, timeZone=TimeZone.getDefault()) {
		return jsDate.toLocaleTimeString('en-GB', {hour: 'numeric', timeZone: timeZone, hour12: false}).padStart(2, '0')+':'+jsDate.toLocaleTimeString('en-GB', {minute: 'numeric', timeZone: timeZone, hour12: false}).padStart(2, '0')+(withSeconds?':'+jsDate.toLocaleTimeString('en-GB', {second: 'numeric', timeZone: timeZone, hour12: false}).padStart(2, '0'):'');
	}

	static getTimestamp(jsDate) {
		return Math.trunc(jsDate.getTime()/1000);
	}

	static getDateDigitalDisplay(jsDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getDateDigitalFormatter(locale, timeZone).format(jsDate);
		//return jsDate.toLocaleDateString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', timeZone: timeZone}); 
	}

	static getDateTextDisplay(jsDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getDateTextFormatter(locale, timeZone).format(jsDate);
		//return jsDate.toLocaleDateString(locale, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timeZone});  
	}

	static getTimeDisplay(jsDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getTimeFormatter(locale, timeZone).format(jsDate);
		//return jsDate.toLocaleTimeString(locale, {hour: 'numeric', minute: 'numeric', timeZone: timeZone}); 
	}

	static getTimeDigitalDisplay(jsDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getTimeDigitalFormatter(locale, timeZone).format(jsDate);
		//return jsDate.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timeZone}); 
	}

	static getTimeDisplayWithNbDays(jsDate, jsPreviousDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		let str = this.getTimeDisplay(jsDate, locale, timeZone);
		if (jsPreviousDate !== 0 && jsPreviousDate != null) {
			let nbDaysDiff = DatePeriod.getNbDayBetweenTwo(jsPreviousDate, jsDate, false);
			if (nbDaysDiff > 0) {
				str += ' (J+'+nbDaysDiff+')';
			}
		}
		return str;
	}

	static getDateTimeDigitalDisplay(jsDate, locale=Locale.getDefault(), timeZone=TimeZone.getDefault()) {
		return DateTimeFormatter.getDateTimeFormatter(locale, timeZone).format(jsDate);
		//return jsDate.toLocaleDateString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: timeZone}); 
	}

	static getYear(jsDate) {
		return jsDate.getUTCFullYear();
	}
	static getMonth(jsDate) {
		return jsDate.getUTCMonth()+1;
	}
	static getMonthName(jsDate, locale=Locale.getDefault(), isShort=false) {
		return jsDate.toLocaleDateString(locale, {month: (isShort?'short':'long')});
	}
	static getDay(jsDate) {
		return jsDate.getUTCDate();
	}

	static getDayOfMonth(jsDate) {
		return jsDate.getUTCDate();
	}

	static getDayOfWeek(jsDate) {
		return jsDate.getUTCDay();
	}

	static getDayName(jsDate, locale=Locale.getDefault(), isShort=false) {
		return jsDate.toLocaleDateString(locale, {weekday: (isShort?'short':'long')});
	}

	static getNbDaysInMonth(year, month) {
		return new Date(Date.UTC(year, month, 0)).getDate();
	}

	static getMonthNameByMonth(month, locale=Locale.getDefault(), isShort=false) {
		let d = new Date();
		d.setDate(1);
		d.setMonth(month-1);
		return this.getMonthName(d, locale, isShort);
	}
	static getDayNameByDayOfWeek(dayOfWeek, locale=Locale.getDefault(), isShort=false) {
		let d = new Date();
		// d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
		d.setDate(d.getDate() + (dayOfWeek - d.getDay()) % 7);
		return this.getDayName(d, locale, isShort);
	}


	static getFirstDayOfWeek(date) {
		let firstDayOfWeek = new Date(date);
		const day = date.getUTCDay();
		firstDayOfWeek.setUTCDate(date.getUTCDate() - day + (0 === day ? -6:1)); // First day is the day of the month - the day of the week
		return firstDayOfWeek;
	}

	static getLastDayOfWeek(date) {
		let lastDayOfWeek = this.getFirstDayOfWeek(date);
		lastDayOfWeek.setUTCDate(lastDayOfWeek.getUTCDate() + 6); // last day is the first day + 6
		return lastDayOfWeek;
	}

	static getFirstDayOfMonth(date) {
		return this.getFirstDayOfMonthAndYear(date.getUTCFullYear(), date.getUTCMonth()+1);
	}

	static getLastDayOfMonth(date) {
		return this.getLastDayOfMonthAndYear(date.getUTCFullYear(), date.getUTCMonth()+1);
	}

	static getFirstDayOfYear(date) {
		date.setUTCDate(1);
		date.setUTCMonth(0);
		return new Date(date);
	}

	static getLastDayOfYear(date) {
		return new Date(Date.UTC(date.getUTCFullYear(), 11, 31));
	}

	static getFirstDayOfWeekAndYear(year, week) {
		let simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
		let dow = simple.getDay();
		let ISOweekStart = simple;
		if (dow <= 4) {
			ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
		}
		else {
			ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
		}
		return ISOweekStart;
	}
	static getLastDayOfWeekAndYear(year, week) {
		let firstDayOfWeek = this.getFirstDayOfWeekAndYear(year, week);
		firstDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate()+6);
		return firstDayOfWeek;
	}

	static getFirstDayOfMonthAndYear(year, month) {
		return new Date(Date.UTC(year, month-1, 1));
	}

	static getLastDayOfMonthAndYear(year, month) {
		return new Date(Date.UTC(year, month, 0));
	}

	static isDateEqual(jsDate1, jsDate2) {
		return (jsDate1.getFullYear() === jsDate2.getFullYear() && jsDate1.getMonth() === jsDate2.getMonth() && jsDate1.getDate() === jsDate2.getDate());
	}

	static isDateInThePast(jsDate) {
		jsDate.setHours(0);
		jsDate.setMinutes(0);
		jsDate.setSeconds(0);
		jsDate.setMilliseconds(0);
		let today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);
		return jsDate.getTime() < today.getTime();
	}

	static isDateInTheFuture(jsDate) {
		jsDate.setHours(0);
		jsDate.setMinutes(0);
		jsDate.setSeconds(0);
		jsDate.setMilliseconds(0);
		let today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);
		return jsDate.getTime() > today.getTime();
	}

	static isDateTimeInThePast(jsDateTime) {
		let today = new Date();
		return jsDateTime < today;
	}

	static isDateTimeInTheFuture(jsDateTime) {
		let today = new Date();
		return jsDateTime > today;
	}

	static addDays(date, days) {
		date.setUTCDate(date.getUTCDate() + days);
		return date;
	}

	static addMonths(date, months) {
		let d = date.getDate();
		date.setMonth(date.getMonth() + +months);
		if (date.getDate() !== d) {
			date.setDate(0);
		}
		return date;
	}

	/** @deprecated use DatePeriod.getNbDayBetweenTwo instead */
	static getNbDayBetweenTwo(jsDate1, jsDate2, asPeriod=false, timeZone=TimeZone.getDefault()) {
		return DatePeriod.getNbDayBetweenTwo(jsDate1, jsDate2, asPeriod, timeZone);
	}
}

export { DateTime };
