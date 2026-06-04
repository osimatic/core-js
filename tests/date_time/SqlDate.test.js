import { SqlDate } from '../../date_time.js';

describe('SqlDate', () => {
	describe('parse', () => {
		test('should parse SQL date to Date object', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.parse(sqlDate);
			expect(result instanceof Date).toBe(true);
			expect(result.getUTCFullYear()).toBe(2024);
			expect(result.getUTCMonth()).toBe(0);
			expect(result.getUTCDate()).toBe(15);
		});

		test('should return null for null input', () => {
			expect(SqlDate.parse(null)).toBeNull();
		});

		test('should parse last day of month', () => {
			const sqlDate = '2024-01-31';
			const result = SqlDate.parse(sqlDate);
			expect(result.getUTCDate()).toBe(31);
		});

		test('should parse February 29 in leap year', () => {
			const sqlDate = '2024-02-29';
			const result = SqlDate.parse(sqlDate);
			expect(result.getUTCMonth()).toBe(1);
			expect(result.getUTCDate()).toBe(29);
		});
	});

	describe('getCurrentSqlDate', () => {
		test('should return current date in SQL format', () => {
			const result = SqlDate.getCurrentSqlDate();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		test('should return today\'s date', () => {
			const result = SqlDate.getCurrentSqlDate();
			const today = new Date();
			const year = today.getFullYear();
			expect(result).toContain(String(year));
		});
	});

	describe('getDateDigitalDisplay', () => {
		test('should format SQL date in digital format', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.getDateDigitalDisplay(sqlDate, 'fr-FR', 'UTC');
			expect(result).toContain('15');
			expect(result).toContain('01');
			expect(result).toContain('2024');
		});

		test('should work with different locales', () => {
			const sqlDate = '2024-01-15';
			const resultFr = SqlDate.getDateDigitalDisplay(sqlDate, 'fr-FR', 'UTC');
			const resultEn = SqlDate.getDateDigitalDisplay(sqlDate, 'en-US', 'UTC');
			expect(resultFr).toBeTruthy();
			expect(resultEn).toBeTruthy();
		});
	});

	describe('getDateTextDisplay', () => {
		test('should format SQL date in text format', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.getDateTextDisplay(sqlDate, 'fr-FR', 'UTC');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(10);
		});

		test('should include month name', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.getDateTextDisplay(sqlDate, 'fr-FR', 'UTC');
			expect(result).toContain('janvier');
		});
	});

	describe('getDateForInputDate', () => {
		test('should return date in input format', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.getDateForInputDate(sqlDate, 'UTC');
			expect(result).toBe('2024-01-15');
		});
	});

	describe('getTimestamp', () => {
		test('should convert SQL date to timestamp', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.getTimestamp(sqlDate);
			expect(typeof result).toBe('number');
			expect(result).toBeGreaterThan(0);
		});

		test('should return consistent timestamp', () => {
			const sqlDate = '2024-01-15';
			const result1 = SqlDate.getTimestamp(sqlDate);
			const result2 = SqlDate.getTimestamp(sqlDate);
			expect(result1).toBe(result2);
		});
	});

	describe('getYear', () => {
		test('should return year from SQL date', () => {
			const sqlDate = '2024-01-15';
			expect(SqlDate.getYear(sqlDate)).toBe(2024);
		});

		test('should work with different years', () => {
			expect(SqlDate.getYear('2020-01-15')).toBe(2020);
			expect(SqlDate.getYear('2030-12-31')).toBe(2030);
		});
	});

	describe('getMonth', () => {
		test('should return month from SQL date', () => {
			const sqlDate = '2024-01-15';
			expect(SqlDate.getMonth(sqlDate)).toBe(1);
		});

		test('should return 12 for December', () => {
			const sqlDate = '2024-12-15';
			expect(SqlDate.getMonth(sqlDate)).toBe(12);
		});
	});

	describe('getMonthName', () => {
		test('should return month name from SQL date', () => {
			const sqlDate = '2024-01-15';
			expect(SqlDate.getMonthName(sqlDate, 'fr-FR')).toBe('janvier');
		});

		test('should return short month name', () => {
			const sqlDate = '2024-01-15';
			const result = SqlDate.getMonthName(sqlDate, 'fr-FR', true);
			expect(result).toContain('janv');
		});

		test('should work with different months', () => {
			expect(SqlDate.getMonthName('2024-06-15', 'fr-FR')).toBe('juin');
			expect(SqlDate.getMonthName('2024-12-15', 'fr-FR')).toBe('décembre');
		});
	});

	describe('getDay', () => {
		test('should return day from SQL date', () => {
			const sqlDate = '2024-01-15';
			expect(SqlDate.getDay(sqlDate)).toBe(15);
		});

		test('should work with first day of month', () => {
			const sqlDate = '2024-01-01';
			expect(SqlDate.getDay(sqlDate)).toBe(1);
		});

		test('should work with last day of month', () => {
			const sqlDate = '2024-01-31';
			expect(SqlDate.getDay(sqlDate)).toBe(31);
		});
	});

	describe('isDateInTheFuture', () => {
		test('should return true for future date', () => {
			const sqlDate = '2030-01-01';
			expect(SqlDate.isDateInTheFuture(sqlDate)).toBe(true);
		});

		test('should return false for past date', () => {
			const sqlDate = '2020-01-01';
			expect(SqlDate.isDateInTheFuture(sqlDate)).toBe(false);
		});
	});

	describe('getNbDayBetweenTwo', () => {
		test('should calculate days between two SQL dates', () => {
			const sqlDate1 = '2024-01-15';
			const sqlDate2 = '2024-01-20';
			expect(SqlDate.getNbDayBetweenTwo(sqlDate1, sqlDate2, true)).toBe(5);
		});

		test('should return 0 for same date', () => {
			const sqlDate1 = '2024-01-15';
			const sqlDate2 = '2024-01-15';
			expect(SqlDate.getNbDayBetweenTwo(sqlDate1, sqlDate2, true)).toBe(0);
		});

		test('should return negative for reversed dates', () => {
			const sqlDate1 = '2024-01-20';
			const sqlDate2 = '2024-01-15';
			expect(SqlDate.getNbDayBetweenTwo(sqlDate1, sqlDate2, true)).toBe(-5);
		});

		test('should work across months', () => {
			const sqlDate1 = '2024-01-30';
			const sqlDate2 = '2024-02-05';
			expect(SqlDate.getNbDayBetweenTwo(sqlDate1, sqlDate2, true)).toBe(6);
		});

		test('should work across years', () => {
			const sqlDate1 = '2023-12-30';
			const sqlDate2 = '2024-01-05';
			expect(SqlDate.getNbDayBetweenTwo(sqlDate1, sqlDate2, true)).toBe(6);
		});
	});
});
