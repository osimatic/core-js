import { DatePeriod, DateTime, SqlDate } from '../../date_time.js';

describe('DatePeriod', () => {
	describe('isSameDay', () => {
		test('should return true for same day', () => {
			const date1 = new Date(2024, 0, 15, 10, 30);
			const date2 = new Date(2024, 0, 15, 14, 45);
			expect(DatePeriod.isSameDay(date1, date2)).toBe(true);
		});

		test('should return false for different days', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2024, 0, 16);
			expect(DatePeriod.isSameDay(date1, date2)).toBe(false);
		});

		test('should return false for different months', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2024, 1, 15);
			expect(DatePeriod.isSameDay(date1, date2)).toBe(false);
		});

		test('should return false for different years', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2023, 0, 15);
			expect(DatePeriod.isSameDay(date1, date2)).toBe(false);
		});
	});

	describe('isHalfDay', () => {
		test('should return true for MORNING', () => {
			expect(DatePeriod.isHalfDay(DatePeriod.PART_OF_DAY_MORNING)).toBe(true);
		});

		test('should return true for AFTERNOON', () => {
			expect(DatePeriod.isHalfDay(DatePeriod.PART_OF_DAY_AFTERNOON)).toBe(true);
		});

		test('should return false for other values', () => {
			expect(DatePeriod.isHalfDay('FULL_DAY')).toBe(false);
			expect(DatePeriod.isHalfDay('')).toBe(false);
			expect(DatePeriod.isHalfDay(null)).toBe(false);
		});
	});

	describe('getNbDayBetweenTwo', () => {
		test('should return 0 for same day', () => {
			const date1 = new Date(2024, 0, 15, 10, 30);
			const date2 = new Date(2024, 0, 15, 14, 45);
			expect(DatePeriod.getNbDayBetweenTwo(date1, date2, false, 'UTC')).toBe(0);
		});

		test('should return positive difference', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 0, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 20, 0, 0, 0));
			expect(DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC')).toBe(5);
		});

		test('should return negative difference when date2 is before date1', () => {
			const date1 = new Date(Date.UTC(2024, 0, 20, 0, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 15, 0, 0, 0));
			expect(DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC')).toBe(-5);
		});

		test('should return 0 when date1 is null', () => {
			const date = new Date(2024, 0, 15);
			expect(DatePeriod.getNbDayBetweenTwo(null, date)).toBe(0);
		});

		test('should return 0 when date2 is null', () => {
			const date = new Date(2024, 0, 15);
			expect(DatePeriod.getNbDayBetweenTwo(date, null)).toBe(0);
		});

		test('should calculate days as period (with time)', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 10, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 20, 14, 0, 0));
			const result = DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC');
			expect(result).toBe(5);
		});
	});

	describe('getPeriodLabels', () => {
		test('should return empty array for empty data', () => {
			expect(DatePeriod.getPeriodLabels([], 'day')).toEqual([]);
			expect(DatePeriod.getPeriodLabels(null, 'day')).toEqual([]);
		});

		test('should return labels for month period', () => {
			const data = ['2024-01', '2024-02'];
			const result = DatePeriod.getPeriodLabels(data, 'month', 'fr-FR');
			expect(Array.isArray(result)).toBe(true);
		});

		test('should return labels for week period', () => {
			const data = ['2024-S01', '2024-S02'];
			const result = DatePeriod.getPeriodLabels(data, 'week', 'fr-FR');
			expect(result).toEqual(['S1 2024', 'S2 2024']);
		});

		test('should return labels for day_of_week period', () => {
			const data = [1, 2, 3];
			const result = DatePeriod.getPeriodLabels(data, 'day_of_week', 'fr-FR');
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(3);
		});

		test('should return labels for day_of_month period', () => {
			const data = ['2024-01-15', '2024-01-16'];
			const result = DatePeriod.getPeriodLabels(data, 'day_of_month', 'fr-FR', 'UTC');
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});

		test('should return labels for hour period', () => {
			const data = [0, 1, 10, 23];
			const result = DatePeriod.getPeriodLabels(data, 'hour', 'fr-FR');
			expect(result).toEqual(['00h', '01h', '10h', '23h']);
		});

		test('should return data as-is for unknown period', () => {
			const data = ['value1', 'value2'];
			const result = DatePeriod.getPeriodLabels(data, 'unknown', 'fr-FR');
			expect(result).toEqual(data);
		});
	});

	describe('PART_OF_DAY constants', () => {
		test('should have MORNING constant', () => {
			expect(DatePeriod.PART_OF_DAY_MORNING).toBe('MORNING');
		});

		test('should have AFTERNOON constant', () => {
			expect(DatePeriod.PART_OF_DAY_AFTERNOON).toBe('AFTERNOON');
		});
	});

	describe('getNbDayBetweenTwo with returnDecimal', () => {
		test('should return decimal when returnDecimal=true', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 10, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 20, 14, 0, 0));
			const result = DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC', true);
			expect(result).toBeCloseTo(5.166, 2);
		});

		test('should return integer when returnDecimal=false', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 10, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 20, 14, 0, 0));
			const result = DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC', false);
			expect(result).toBe(5);
		});

		test('should work with negative differences', () => {
			const date1 = new Date(Date.UTC(2024, 0, 20, 14, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 15, 10, 0, 0));
			const result = DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC', true);
			expect(result).toBeCloseTo(-5.166, 2);
		});

		test('should handle fractional days correctly', () => {
			const date1 = new Date(Date.UTC(2024, 0, 15, 0, 0, 0));
			const date2 = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
			const result = DatePeriod.getNbDayBetweenTwo(date1, date2, true, 'UTC', true);
			expect(result).toBe(0.5);
		});

		test('should return 0 when dates are null', () => {
			expect(DatePeriod.getNbDayBetweenTwo(null, new Date(), true, 'UTC', true)).toBe(0);
			expect(DatePeriod.getNbDayBetweenTwo(new Date(), null, true, 'UTC', true)).toBe(0);
		});
	});
});
