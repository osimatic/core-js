import { TimestampUnix } from '../../date_time.js';

describe('TimestampUnix', () => {
	describe('parse', () => {
		test('should parse Unix timestamp to Date', () => {
			const timestamp = 1705314600; // 2024-01-15 10:30:00 UTC
			const result = TimestampUnix.parse(timestamp);
			expect(result instanceof Date).toBe(true);
			expect(result.getTime()).toBe(1705314600000);
		});

		test('should return null for null input', () => {
			expect(TimestampUnix.parse(null)).toBeNull();
		});

		test('should handle timestamp 0', () => {
			const result = TimestampUnix.parse(0);
			expect(result.getTime()).toBe(0);
		});
	});

	describe('getCurrent', () => {
		test('should return current Unix timestamp', () => {
			const result = TimestampUnix.getCurrent();
			const now = Math.trunc(Date.now() / 1000);
			expect(result).toBeCloseTo(now, 0);
		});

		test('should return an integer', () => {
			const result = TimestampUnix.getCurrent();
			expect(Number.isInteger(result)).toBe(true);
		});
	});

	describe('getDateDigitalDisplay', () => {
		test('should format timestamp date in digital format', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getDateDigitalDisplay(timestamp, 'fr-FR', 'UTC');
			expect(result).toContain('15');
			expect(result).toContain('01');
			expect(result).toContain('2024');
		});
	});

	describe('getDateTextDisplay', () => {
		test('should format timestamp date in text format', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getDateTextDisplay(timestamp, 'fr-FR', 'UTC');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(10);
		});
	});

	describe('getTimeDisplay', () => {
		test('should format timestamp time', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getTimeDisplay(timestamp, 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});
	});

	describe('getTimeDisplayWithNbDays', () => {
		test('should display time without days difference', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getTimeDisplayWithNbDays(timestamp, 0, 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should display time with days difference', () => {
			const timestamp1 = 1705315800; // 2024-01-15 10:30:00
			const timestamp2 = 1705574400; // 2024-01-18 10:00:00
			const result = TimestampUnix.getTimeDisplayWithNbDays(timestamp2, timestamp1, 'fr-FR', 'UTC');
			expect(result).toContain('J+');
		});
	});

	describe('getTimeDigitalDisplay', () => {
		test('should format timestamp time in digital format', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getTimeDigitalDisplay(timestamp, 'fr-FR', 'UTC');
			expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
		});
	});

	describe('getYear', () => {
		test('should return year from timestamp', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getYear(timestamp, 'UTC');
			expect(result).toBe(2024);
		});
	});

	describe('getMonth', () => {
		test('should return month from timestamp', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getMonth(timestamp, 'UTC');
			expect(result).toBe(1);
		});
	});

	describe('getDayOfMonth', () => {
		test('should return day of month from timestamp', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getDayOfMonth(timestamp, 'UTC');
			expect(result).toBe(15);
		});
	});

	describe('getHour', () => {
		test('should return hour from timestamp', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getHour(timestamp, 'UTC');
			expect(result).toBe(10);
		});
	});

	describe('getMinute', () => {
		test('should return minute from timestamp', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getMinute(timestamp, 'UTC');
			expect(result).toBe(30);
		});
	});

	describe('getSecond', () => {
		test('should return second from timestamp', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getSecond(timestamp, 'UTC');
			expect(result).toBe(0);
		});

		test('should return 45 seconds', () => {
			const timestamp = 1705315845;
			const result = TimestampUnix.getSecond(timestamp, 'UTC');
			expect(result).toBe(45);
		});
	});

	describe('getSqlDateTime', () => {
		test('should convert timestamp to SQL datetime', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getSqlDateTime(timestamp, 'UTC');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});
	});

	describe('getSqlDate', () => {
		test('should convert timestamp to SQL date', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getSqlDate(timestamp, 'UTC');
			expect(result).toBe('2024-01-15');
		});
	});

	describe('getSqlTime', () => {
		test('should convert timestamp to SQL time', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getSqlTime(timestamp, 'UTC');
			expect(result).toBe('10:30:00');
		});
	});

	describe('getDateForInputDate', () => {
		test('should return date for input field', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getDateForInputDate(timestamp, 'UTC');
			expect(result).toBe('2024-01-15');
		});
	});

	describe('getTimeForInputTime', () => {
		test('should return time for input field without seconds', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getTimeForInputTime(timestamp, 'UTC', false);
			expect(result).toMatch(/^\d{2}:\d{2}$/);
		});

		test('should return time for input field with seconds', () => {
			const timestamp = 1705314600;
			const result = TimestampUnix.getTimeForInputTime(timestamp, 'UTC', true);
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});
	});

	describe('isDateEqual', () => {
		test('should return true for timestamps on same date', () => {
			const timestamp1 = 1705315800; // 2024-01-15 10:30:00
			const timestamp2 = 1705329600; // 2024-01-15 14:20:00
			expect(TimestampUnix.isDateEqual(timestamp1, timestamp2)).toBe(true);
		});

		test('should return false for timestamps on different dates', () => {
			const timestamp1 = 1705315800; // 2024-01-15
			const timestamp2 = 1705402200; // 2024-01-16
			expect(TimestampUnix.isDateEqual(timestamp1, timestamp2)).toBe(false);
		});
	});

	describe('getNbDayBetweenTwo', () => {
		test('should calculate days between two timestamps', () => {
			const timestamp1 = 1705315800; // 2024-01-15 10:30:00
			const timestamp2 = 1705747800; // 2024-01-20 10:30:00
			expect(TimestampUnix.getNbDayBetweenTwo(timestamp1, timestamp2, true, 'UTC')).toBe(5);
		});

		test('should return 0 for same day', () => {
			const timestamp1 = 1705315800; // 2024-01-15 10:30:00
			const timestamp2 = 1705329600; // 2024-01-15 14:20:00
			expect(TimestampUnix.getNbDayBetweenTwo(timestamp1, timestamp2, false, 'UTC')).toBe(0);
		});
	});

	describe('isDateInThePast', () => {
		test('should return true for past timestamp', () => {
			const timestamp = 1577836800; // 2020-01-01
			expect(TimestampUnix.isDateInThePast(timestamp)).toBe(true);
		});

		test('should return false for future timestamp', () => {
			const timestamp = 1893456000; // 2030-01-01
			expect(TimestampUnix.isDateInThePast(timestamp)).toBe(false);
		});
	});

	describe('isDateTimeInThePast', () => {
		test('should return true for past timestamp', () => {
			const timestamp = 1577836800; // 2020-01-01
			expect(TimestampUnix.isDateTimeInThePast(timestamp)).toBe(true);
		});

		test('should return false for future timestamp', () => {
			const timestamp = 1893456000; // 2030-01-01
			expect(TimestampUnix.isDateTimeInThePast(timestamp)).toBe(false);
		});
	});

	describe('isDateInTheFuture', () => {
		test('should return true for future timestamp', () => {
			const timestamp = 1893456000; // 2030-01-01
			expect(TimestampUnix.isDateInTheFuture(timestamp)).toBe(true);
		});

		test('should return false for past timestamp', () => {
			const timestamp = 1577836800; // 2020-01-01
			expect(TimestampUnix.isDateInTheFuture(timestamp)).toBe(false);
		});
	});

	describe('isDateTimeInTheFuture', () => {
		test('should return true for future timestamp', () => {
			const timestamp = 1893456000; // 2030-01-01
			expect(TimestampUnix.isDateTimeInTheFuture(timestamp)).toBe(true);
		});

		test('should return false for past timestamp', () => {
			const timestamp = 1577836800; // 2020-01-01
			expect(TimestampUnix.isDateTimeInTheFuture(timestamp)).toBe(false);
		});
	});
});
