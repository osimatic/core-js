import { SqlDateTime } from '../../date_time.js';

describe('SqlDateTime', () => {
	describe('parse', () => {
		test('should parse SQL datetime to Date object', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.parse(sqlDateTime);
			expect(result instanceof Date).toBe(true);
			expect(result.getUTCFullYear()).toBe(2024);
			expect(result.getUTCMonth()).toBe(0);
			expect(result.getUTCDate()).toBe(15);
			expect(result.getUTCHours()).toBe(10);
			expect(result.getUTCMinutes()).toBe(30);
			expect(result.getUTCSeconds()).toBe(45);
		});

		test('should return null for null input', () => {
			expect(SqlDateTime.parse(null)).toBeNull();
		});

		test('should parse midnight', () => {
			const sqlDateTime = '2024-01-15 00:00:00';
			const result = SqlDateTime.parse(sqlDateTime);
			expect(result.getUTCHours()).toBe(0);
		});

		test('should parse end of day', () => {
			const sqlDateTime = '2024-01-15 23:59:59';
			const result = SqlDateTime.parse(sqlDateTime);
			expect(result.getUTCHours()).toBe(23);
			expect(result.getUTCMinutes()).toBe(59);
			expect(result.getUTCSeconds()).toBe(59);
		});
	});

	describe('getCurrentSqlDateTime', () => {
		test('should return current datetime in SQL format', () => {
			const result = SqlDateTime.getCurrentSqlDateTime();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});

		test('should return current date and time', () => {
			const result = SqlDateTime.getCurrentSqlDateTime();
			const now = new Date();
			const year = now.getFullYear();
			expect(result).toContain(String(year));
		});
	});

	describe('getSqlDate', () => {
		test('should extract date from SQL datetime', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getSqlDate(sqlDateTime);
			expect(result).toBe('2024-01-15');
		});

		test('should return null for null input', () => {
			expect(SqlDateTime.getSqlDate(null)).toBeNull();
		});
	});

	describe('getSqlTime', () => {
		test('should extract time from SQL datetime', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getSqlTime(sqlDateTime);
			expect(result).toBe('10:30:45');
		});

		test('should return null for null input', () => {
			expect(SqlDateTime.getSqlTime(null)).toBeNull();
		});

		test('should handle midnight', () => {
			const sqlDateTime = '2024-01-15 00:00:00';
			const result = SqlDateTime.getSqlTime(sqlDateTime);
			expect(result).toBe('00:00:00');
		});
	});

	describe('getDateDigitalDisplay', () => {
		test('should format date in digital format', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getDateDigitalDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toContain('15');
			expect(result).toContain('01');
			expect(result).toContain('2024');
		});

		test('should work with different locales', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const resultFr = SqlDateTime.getDateDigitalDisplay(sqlDateTime, 'fr-FR', 'UTC');
			const resultEn = SqlDateTime.getDateDigitalDisplay(sqlDateTime, 'en-US', 'UTC');
			expect(resultFr).toBeTruthy();
			expect(resultEn).toBeTruthy();
		});
	});

	describe('getDateTextDisplay', () => {
		test('should format date in text format', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getDateTextDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(10);
		});

		test('should include month name', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getDateTextDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toContain('janvier');
		});
	});

	describe('getTimeDisplay', () => {
		test('should format time for display', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getTimeDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should format midnight', () => {
			const sqlDateTime = '2024-01-15 00:00:00';
			const result = SqlDateTime.getTimeDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toContain('00');
		});
	});

	describe('getTimeDisplayWithNbDays', () => {
		test('should display time without days difference', () => {
			const sqlDateTime = '2024-01-15 10:30:00';
			const result = SqlDateTime.getTimeDisplayWithNbDays(sqlDateTime, '2024-01-15 10:30:00', 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should display time with days difference', () => {
			const sqlDateTime1 = '2024-01-15 10:30:00';
			const sqlDateTime2 = '2024-01-18 14:30:00';
			const result = SqlDateTime.getTimeDisplayWithNbDays(sqlDateTime2, sqlDateTime1, 'fr-FR', 'UTC');
			expect(result).toContain('J+3');
		});

		test('should not display days when difference is 0', () => {
			const sqlDateTime1 = '2024-01-15 10:30:00';
			const sqlDateTime2 = '2024-01-15 14:30:00';
			const result = SqlDateTime.getTimeDisplayWithNbDays(sqlDateTime2, sqlDateTime1, 'fr-FR', 'UTC');
			expect(result).not.toContain('J+');
		});
	});

	describe('getTimeDigitalDisplay', () => {
		test('should format time in digital format', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getTimeDigitalDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
		});
	});

	describe('getDateTimeDigitalDisplay', () => {
		test('should format datetime in digital format', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getDateTimeDigitalDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toContain('15');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should include both date and time', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getDateTimeDigitalDisplay(sqlDateTime, 'fr-FR', 'UTC');
			expect(result).toContain('2024');
		});
	});

	describe('getDateForInputDate', () => {
		test('should return date in input format', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getDateForInputDate(sqlDateTime, 'UTC');
			expect(result).toBe('2024-01-15');
		});
	});

	describe('getTimeForInputTime', () => {
		test('should return time without seconds', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getTimeForInputTime(sqlDateTime, 'UTC', false);
			expect(result).toMatch(/^\d{2}:\d{2}$/);
		});

		test('should return time with seconds', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			const result = SqlDateTime.getTimeForInputTime(sqlDateTime, 'UTC', true);
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});
	});

	describe('getYear', () => {
		test('should return year from SQL datetime', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			expect(SqlDateTime.getYear(sqlDateTime)).toBe(2024);
		});

		test('should work with different years', () => {
			expect(SqlDateTime.getYear('2020-01-15 10:30:45')).toBe(2020);
			expect(SqlDateTime.getYear('2030-12-31 23:59:59')).toBe(2030);
		});
	});

	describe('getMonth', () => {
		test('should return month from SQL datetime', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			expect(SqlDateTime.getMonth(sqlDateTime)).toBe(1);
		});

		test('should return 12 for December', () => {
			const sqlDateTime = '2024-12-15 10:30:45';
			expect(SqlDateTime.getMonth(sqlDateTime)).toBe(12);
		});
	});

	describe('getMonthName', () => {
		test('should return month name from SQL datetime', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			expect(SqlDateTime.getMonthName(sqlDateTime, 'fr-FR')).toBe('janvier');
		});

		test('should work with different months', () => {
			expect(SqlDateTime.getMonthName('2024-06-15 10:30:45', 'fr-FR')).toBe('juin');
			expect(SqlDateTime.getMonthName('2024-12-15 10:30:45', 'fr-FR')).toBe('décembre');
		});

		test('should work with English locale', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			expect(SqlDateTime.getMonthName(sqlDateTime, 'en-US')).toBe('January');
		});
	});

	describe('getDay', () => {
		test('should return day from SQL datetime', () => {
			const sqlDateTime = '2024-01-15 10:30:45';
			expect(SqlDateTime.getDay(sqlDateTime)).toBe(15);
		});

		test('should work with first day of month', () => {
			const sqlDateTime = '2024-01-01 10:30:45';
			expect(SqlDateTime.getDay(sqlDateTime)).toBe(1);
		});

		test('should work with last day of month', () => {
			const sqlDateTime = '2024-01-31 10:30:45';
			expect(SqlDateTime.getDay(sqlDateTime)).toBe(31);
		});
	});

	describe('getTimestamp', () => {
		test('should convert SQL datetime to Unix timestamp', () => {
			const sqlDateTime = '2024-01-15 10:30:00';
			const result = SqlDateTime.getTimestamp(sqlDateTime);
			expect(typeof result).toBe('number');
			expect(result).toBeGreaterThan(0);
		});

		test('should return consistent timestamp', () => {
			const sqlDateTime = '2024-01-15 10:30:00';
			const result1 = SqlDateTime.getTimestamp(sqlDateTime);
			const result2 = SqlDateTime.getTimestamp(sqlDateTime);
			expect(result1).toBe(result2);
		});
	});

	describe('isDateInTheFuture', () => {
		test('should return true for future date', () => {
			const sqlDateTime = '2030-01-01 10:30:00';
			expect(SqlDateTime.isDateInTheFuture(sqlDateTime)).toBe(true);
		});

		test('should return false for past date', () => {
			const sqlDateTime = '2020-01-01 10:30:00';
			expect(SqlDateTime.isDateInTheFuture(sqlDateTime)).toBe(false);
		});
	});

	describe('isDateTimeInTheFuture', () => {
		test('should return true for future datetime', () => {
			const sqlDateTime = '2030-01-01 10:30:00';
			expect(SqlDateTime.isDateTimeInTheFuture(sqlDateTime)).toBe(true);
		});

		test('should return false for past datetime', () => {
			const sqlDateTime = '2020-01-01 10:30:00';
			expect(SqlDateTime.isDateTimeInTheFuture(sqlDateTime)).toBe(false);
		});
	});

	describe('getNbDayBetweenTwo', () => {
		test('should calculate days between two SQL datetimes', () => {
			const sqlDateTime1 = '2024-01-15 10:30:00';
			const sqlDateTime2 = '2024-01-20 14:45:00';
			expect(SqlDateTime.getNbDayBetweenTwo(sqlDateTime1, sqlDateTime2, true)).toBe(5);
		});

		test('should return 0 for same day', () => {
			const sqlDateTime1 = '2024-01-15 10:30:00';
			const sqlDateTime2 = '2024-01-15 14:45:00';
			expect(SqlDateTime.getNbDayBetweenTwo(sqlDateTime1, sqlDateTime2, false)).toBe(0);
		});

		test('should return negative for reversed dates', () => {
			const sqlDateTime1 = '2024-01-20 10:30:00';
			const sqlDateTime2 = '2024-01-15 14:45:00';
			expect(SqlDateTime.getNbDayBetweenTwo(sqlDateTime1, sqlDateTime2, true)).toBe(-5);
		});

		test('should work across months', () => {
			const sqlDateTime1 = '2024-01-30 10:00:00';
			const sqlDateTime2 = '2024-02-05 14:00:00';
			expect(SqlDateTime.getNbDayBetweenTwo(sqlDateTime1, sqlDateTime2, true)).toBe(6);
		});

		test('should work across years', () => {
			const sqlDateTime1 = '2023-12-30 10:00:00';
			const sqlDateTime2 = '2024-01-05 14:00:00';
			expect(SqlDateTime.getNbDayBetweenTwo(sqlDateTime1, sqlDateTime2, true)).toBe(6);
		});
	});
});
