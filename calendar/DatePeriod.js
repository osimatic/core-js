import '../utils/string.js';
import { Locale } from '../location/Locale.js';
import { TimeZone } from './TimeZone.js';
import { DateTime } from './DateTime.js';
import { SqlDate } from './SqlDate.js';

class DatePeriod {
	static isSameDay(jsDate1, jsDate2) {
		return jsDate1.getFullYear() === jsDate2.getFullYear() &&
			jsDate1.getMonth() === jsDate2.getMonth() &&
			jsDate1.getDate() === jsDate2.getDate();
	}

	static isHalfDay(partOfDay) {
		return partOfDay === DatePeriod.PART_OF_DAY_MORNING || partOfDay === DatePeriod.PART_OF_DAY_AFTERNOON;
	}

	static getNbDayBetweenTwo(jsDate1, jsDate2, considerTime=false, timeZone=TimeZone.getDefault(), returnDecimal=false) {
		//jsDate1.set
		if (jsDate1 == null || jsDate2 == null) {
			return 0;
		}

		let timestamp1 = jsDate1.getTime() / 1000;
		let timestamp2 = jsDate2.getTime() / 1000;

		if (!considerTime) {
			let jsMidnightDate1 = new Date(jsDate1.toLocaleDateString('en-US', {timeZone: timeZone})+' 00:00:00');
			let jsMidnightDate2 = new Date(jsDate2.toLocaleDateString('en-US', {timeZone: timeZone})+' 00:00:00');
			timestamp1 = jsMidnightDate1.getTime() / 1000;
			timestamp2 = jsMidnightDate2.getTime() / 1000;
			//jsDate1.setHours(0, 0, 0);
			//jsDate2.setHours(0, 0, 0);
			//jsDate1.setUTCHours(0, 0, 0);
			//jsDate2.setUTCHours(0, 0, 0);
		}

		const daysDiff = (timestamp2-timestamp1)/86400;
		return returnDecimal ? daysDiff : parseInt(Math.round(daysDiff));
	}

	static getPeriodLabels(data, period, locale= Locale.getDefault(), timeZone= TimeZone.getDefault()) {
		if (!data || data.length === 0) {
			return [];
		}

		if (period === 'month') {
			data.map(yearAndMonth => {
				const [year, month] = yearAndMonth.split('-').map(Number);
				return DateTime.getMonthNameByMonth(month, locale).capitalize()+' '+year;
			});
		}
		if (period === 'week') {
			return data.map(yearAndWeek => {
				const [year, weekStr] = yearAndWeek.split('-S');
				const week = parseInt(weekStr, 10);
				return 'S'+week+' '+year;
			});
		}
		if (period === 'day_of_week') {
			return data.map(weekDay => DateTime.getDayNameByDayOfWeek(weekDay, locale).capitalize());
		}
		if (period === 'day_of_month') {
			return data.map(sqlDate => SqlDate.getDateDigitalDisplay(sqlDate, locale, timeZone));
		}
		if (period === 'hour') {
			return data.map(hour => String(hour).padStart(2, '0')+'h');
		}
		return data;
	}
}

// Part of day
DatePeriod.PART_OF_DAY_MORNING 		= 'MORNING';
DatePeriod.PART_OF_DAY_AFTERNOON 	= 'AFTERNOON';

export { DatePeriod };
