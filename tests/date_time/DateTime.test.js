import { DateTime } from '../../date_time.js';

describe('DateTime', () => {
	describe('getSqlDate', () => {
		test('should format date to SQL format', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getSqlDate(date, 'UTC');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(result).toBe('2024-01-15');
		});

		test('should use default timezone Europe/Paris', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getSqlDate(date);
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe('getSqlTime', () => {
		test('should format time to SQL format', () => {
			const date = new Date('2024-01-15T10:30:45Z');
			const result = DateTime.getSqlTime(date, 'UTC');
			expect(result).toBe('10:30:45');
		});

		test('should handle midnight', () => {
			const date = new Date('2024-01-15T00:00:00Z');
			const result = DateTime.getSqlTime(date, 'UTC');
			expect(result).toBe('00:00:00');
		});
	});

	describe('getSqlDateTime', () => {
		test('should format datetime to SQL format', () => {
			const date = new Date('2024-01-15T10:30:45Z');
			const result = DateTime.getSqlDateTime(date, 'UTC');
			expect(result).toBe('2024-01-15 10:30:45');
		});
	});

	describe('getDateForInputDate', () => {
		test('should return date in input format', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDateForInputDate(date, 'UTC');
			expect(result).toBe('2024-01-15');
		});
	});

	describe('getTimeForInputTime', () => {
		test('should return time without seconds', () => {
			const date = new Date(Date.UTC(2024, 0, 15, 10, 30, 45));
			const result = DateTime.getTimeForInputTime(date, 'UTC', false);
			expect(result).toMatch(/^\d{2}:\d{2}$/);
		});

		test('should return time with seconds', () => {
			const date = new Date(Date.UTC(2024, 0, 15, 10, 30, 45));
			const result = DateTime.getTimeForInputTime(date, 'UTC', true);
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});
	});

	describe('getTimestamp', () => {
		test('should return Unix timestamp', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getTimestamp(date);
			expect(result).toBe(Math.trunc(date.getTime() / 1000));
		});
	});

	describe('getDateDigitalDisplay', () => {
		test('should format date in digital format', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDateDigitalDisplay(date, 'fr-FR', 'UTC');
			expect(result).toContain('15');
			expect(result).toContain('01');
			expect(result).toContain('2024');
		});
	});

	describe('getDateTextDisplay', () => {
		test('should format date in text format', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDateTextDisplay(date, 'fr-FR', 'UTC');
			expect(result).toContain('2024');
			expect(result.length).toBeGreaterThan(10);
		});

		test('should include weekday', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDateTextDisplay(date, 'fr-FR', 'UTC');
			expect(typeof result).toBe('string');
		});
	});

	describe('getTimeDisplay', () => {
		test('should format time for display', () => {
			const date = new Date(Date.UTC(2024, 0, 15, 10, 30, 0));
			const result = DateTime.getTimeDisplay(date, 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});
	});

	describe('getTimeDigitalDisplay', () => {
		test('should format time in digital format', () => {
			const date = new Date(Date.UTC(2024, 0, 15, 10, 30, 45));
			const result = DateTime.getTimeDigitalDisplay(date, 'fr-FR', 'UTC');
			expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
		});
	});

	describe('getTimeDisplayWithNbDays', () => {
		test('should display time without days difference', () => {
			const date = new Date(Date.UTC(2024, 0, 15, 10, 30, 0));
			const result = DateTime.getTimeDisplayWithNbDays(date, 0, 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should display time with days difference', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 10, 30, 0));
			const date2 = new Date(Date.UTC(2024, 0, 18, 14, 30, 0));
			const result = DateTime.getTimeDisplayWithNbDays(date2, date1, 'fr-FR', 'UTC');
			expect(result).toContain('J+3');
		});

		test('should not display days when difference is 0', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 10, 30, 0));
			const date2 = new Date(Date.UTC(2024, 0, 15, 14, 30, 0));
			const result = DateTime.getTimeDisplayWithNbDays(date2, date1, 'fr-FR', 'UTC');
			expect(result).not.toContain('J+');
		});
	});

	describe('getDateTimeDigitalDisplay', () => {
		test('should format datetime in digital format', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDateTimeDigitalDisplay(date, 'fr-FR', 'UTC');
			expect(result).toContain('15');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});
	});

	describe('getYear', () => {
		test('should return year', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(DateTime.getYear(date)).toBe(2024);
		});
	});

	describe('getMonth', () => {
		test('should return month (1-based)', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(DateTime.getMonth(date)).toBe(1);
		});

		test('should return 12 for December', () => {
			const date = new Date('2024-12-15T10:30:00Z');
			expect(DateTime.getMonth(date)).toBe(12);
		});
	});

	describe('getMonthName', () => {
		test('should return month name in French', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(DateTime.getMonthName(date, 'fr-FR')).toBe('janvier');
		});

		test('should return short month name', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getMonthName(date, 'fr-FR', true);
			expect(result).toContain('janv');
		});

		test('should work in English', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(DateTime.getMonthName(date, 'en-US')).toBe('January');
		});
	});

	describe('getDay', () => {
		test('should return day of month', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(DateTime.getDay(date)).toBe(15);
		});
	});

	describe('getDayOfMonth', () => {
		test('should return day of month', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(DateTime.getDayOfMonth(date)).toBe(15);
		});

		test('should return last day of month', () => {
			const date = new Date('2024-01-31T10:30:00Z');
			expect(DateTime.getDayOfMonth(date)).toBe(31);
		});
	});

	describe('getDayOfWeek', () => {
		test('should return day of week (0-6)', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDayOfWeek(date);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(6);
		});

		test('should return 0 for Sunday', () => {
			const date = new Date('2024-01-14T10:30:00Z'); // Sunday
			expect(DateTime.getDayOfWeek(date)).toBe(0);
		});

		test('should return 1 for Monday', () => {
			const date = new Date('2024-01-15T10:30:00Z'); // Monday
			expect(DateTime.getDayOfWeek(date)).toBe(1);
		});
	});

	describe('getDayName', () => {
		test('should return day name in French', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDayName(date, 'fr-FR');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});

		test('should return short day name', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = DateTime.getDayName(date, 'fr-FR', true);
			expect(typeof result).toBe('string');
			expect(result.length).toBeLessThan(10);
		});
	});

	describe('getNbDaysInMonth', () => {
		test('should return 31 for January', () => {
			expect(DateTime.getNbDaysInMonth(2024, 1)).toBe(31);
		});

		test('should return 29 for February in leap year', () => {
			expect(DateTime.getNbDaysInMonth(2024, 2)).toBe(29);
		});

		test('should return 28 for February in non-leap year', () => {
			expect(DateTime.getNbDaysInMonth(2023, 2)).toBe(28);
		});

		test('should return 30 for April', () => {
			expect(DateTime.getNbDaysInMonth(2024, 4)).toBe(30);
		});

		test('should return 31 for December', () => {
			expect(DateTime.getNbDaysInMonth(2024, 12)).toBe(31);
		});
	});

	describe('getMonthNameByMonth', () => {
		test('should return month name by month number', () => {
			expect(DateTime.getMonthNameByMonth(1, 'fr-FR')).toBe('janvier');
			expect(DateTime.getMonthNameByMonth(12, 'fr-FR')).toBe('décembre');
		});

		test('should return short month name', () => {
			const result = DateTime.getMonthNameByMonth(1, 'fr-FR', true);
			expect(result).toContain('janv');
		});
	});

	describe('getDayNameByDayOfWeek', () => {
		test('should return day name by day of week', () => {
			const result = DateTime.getDayNameByDayOfWeek(1, 'fr-FR');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});

		test('should return short day name', () => {
			const result = DateTime.getDayNameByDayOfWeek(1, 'fr-FR', true);
			expect(typeof result).toBe('string');
		});
	});

	describe('getFirstDayOfWeek', () => {
		test('should return Monday of the week', () => {
			const date = new Date(Date.UTC(2024, 0, 17)); // Wednesday
			const result = DateTime.getFirstDayOfWeek(date);
			expect(result.getUTCDay()).toBe(1); // Monday
		});

		test('should handle Sunday', () => {
			const date = new Date(Date.UTC(2024, 0, 14)); // Sunday
			const result = DateTime.getFirstDayOfWeek(date);
			expect(result.getUTCDay()).toBe(1); // Monday
		});
	});

	describe('getLastDayOfWeek', () => {
		test('should return Sunday of the week', () => {
			const date = new Date(Date.UTC(2024, 0, 17)); // Wednesday
			const result = DateTime.getLastDayOfWeek(date);
			expect(result.getUTCDay()).toBe(0); // Sunday
		});
	});

	describe('getFirstDayOfMonth', () => {
		test('should return first day of month', () => {
			const date = new Date(Date.UTC(2024, 0, 15));
			const result = DateTime.getFirstDayOfMonth(date);
			expect(result.getUTCDate()).toBe(1);
			expect(result.getUTCMonth()).toBe(0);
		});
	});

	describe('getLastDayOfMonth', () => {
		test('should return last day of January', () => {
			const date = new Date(Date.UTC(2024, 0, 15));
			const result = DateTime.getLastDayOfMonth(date);
			expect(result.getUTCDate()).toBe(31);
		});

		test('should return last day of February in leap year', () => {
			const date = new Date(Date.UTC(2024, 1, 15));
			const result = DateTime.getLastDayOfMonth(date);
			expect(result.getUTCDate()).toBe(29);
		});
	});

	describe('getFirstDayOfYear', () => {
		test('should return January 1st', () => {
			const date = new Date(Date.UTC(2024, 5, 15));
			const result = DateTime.getFirstDayOfYear(date);
			expect(result.getUTCMonth()).toBe(0);
			expect(result.getUTCDate()).toBe(1);
		});
	});

	describe('getLastDayOfYear', () => {
		test('should return December 31st', () => {
			const date = new Date(Date.UTC(2024, 5, 15));
			const result = DateTime.getLastDayOfYear(date);
			expect(result.getUTCMonth()).toBe(11);
			expect(result.getUTCDate()).toBe(31);
		});
	});

	describe('getFirstDayOfWeekAndYear', () => {
		test('should return first day of week in year', () => {
			const result = DateTime.getFirstDayOfWeekAndYear(2024, 1);
			expect(result instanceof Date).toBe(true);
			expect(result.getUTCDay()).toBe(1); // Monday
		});

		test('should return correct date for week 10', () => {
			const result = DateTime.getFirstDayOfWeekAndYear(2024, 10);
			expect(result instanceof Date).toBe(true);
		});
	});

	describe('getLastDayOfWeekAndYear', () => {
		test('should return last day of week in year', () => {
			const result = DateTime.getLastDayOfWeekAndYear(2024, 1);
			expect(result instanceof Date).toBe(true);
			expect(result.getUTCDay()).toBe(0); // Sunday
		});
	});

	describe('getFirstDayOfMonthAndYear', () => {
		test('should return first day of specific month', () => {
			const result = DateTime.getFirstDayOfMonthAndYear(2024, 3);
			expect(result.getUTCFullYear()).toBe(2024);
			expect(result.getUTCMonth()).toBe(2); // March (0-based)
			expect(result.getUTCDate()).toBe(1);
		});
	});

	describe('getLastDayOfMonthAndYear', () => {
		test('should return last day of January', () => {
			const result = DateTime.getLastDayOfMonthAndYear(2024, 1);
			expect(result.getUTCDate()).toBe(31);
		});

		test('should return last day of February in leap year', () => {
			const result = DateTime.getLastDayOfMonthAndYear(2024, 2);
			expect(result.getUTCDate()).toBe(29);
		});
	});

	describe('isDateEqual', () => {
		test('should return true for same dates', () => {
			const date1 = new Date(2024, 0, 15, 10, 30);
			const date2 = new Date(2024, 0, 15, 14, 45);
			expect(DateTime.isDateEqual(date1, date2)).toBe(true);
		});

		test('should return false for different dates', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2024, 0, 16);
			expect(DateTime.isDateEqual(date1, date2)).toBe(false);
		});
	});

	describe('isDateInThePast', () => {
		test('should return true for past date', () => {
			const date = new Date(2020, 0, 1);
			expect(DateTime.isDateInThePast(date)).toBe(true);
		});

		test('should return false for future date', () => {
			const date = new Date(2030, 0, 1);
			expect(DateTime.isDateInThePast(date)).toBe(false);
		});
	});

	describe('isDateInTheFuture', () => {
		test('should return true for future date', () => {
			const date = new Date(2030, 0, 1);
			expect(DateTime.isDateInTheFuture(date)).toBe(true);
		});

		test('should return false for past date', () => {
			const date = new Date(2020, 0, 1);
			expect(DateTime.isDateInTheFuture(date)).toBe(false);
		});
	});

	describe('isDateTimeInThePast', () => {
		test('should return true for past datetime', () => {
			const date = new Date(2020, 0, 1, 10, 30);
			expect(DateTime.isDateTimeInThePast(date)).toBe(true);
		});

		test('should return false for future datetime', () => {
			const date = new Date(2030, 0, 1, 10, 30);
			expect(DateTime.isDateTimeInThePast(date)).toBe(false);
		});
	});

	describe('isDateTimeInTheFuture', () => {
		test('should return true for future datetime', () => {
			const date = new Date(2030, 0, 1, 10, 30);
			expect(DateTime.isDateTimeInTheFuture(date)).toBe(true);
		});

		test('should return false for past datetime', () => {
			const date = new Date(2020, 0, 1, 10, 30);
			expect(DateTime.isDateTimeInTheFuture(date)).toBe(false);
		});
	});

	describe('addDays', () => {
		test('should add days to date', () => {
			const date = new Date(Date.UTC(2024, 0, 15));
			const result = DateTime.addDays(date, 5);
			expect(result.getUTCDate()).toBe(20);
		});

		test('should subtract days with negative value', () => {
			const date = new Date(Date.UTC(2024, 0, 15));
			const result = DateTime.addDays(date, -5);
			expect(result.getUTCDate()).toBe(10);
		});

		test('should handle month overflow', () => {
			const date = new Date(Date.UTC(2024, 0, 31));
			const result = DateTime.addDays(date, 1);
			expect(result.getUTCMonth()).toBe(1); // February
			expect(result.getUTCDate()).toBe(1);
		});
	});

	describe('addMonths', () => {
		test('should add months to date', () => {
			const date = new Date(2024, 0, 15);
			const result = DateTime.addMonths(date, 3);
			expect(result.getMonth()).toBe(3);
		});

		test('should handle month overflow', () => {
			const date = new Date(2024, 0, 31);
			const result = DateTime.addMonths(date, 1);
			expect(result.getMonth()).toBe(1);
		});

		test('should handle year overflow', () => {
			const date = new Date(2024, 11, 15);
			const result = DateTime.addMonths(date, 2);
			expect(result.getFullYear()).toBe(2025);
			expect(result.getMonth()).toBe(1);
		});
	});
});
