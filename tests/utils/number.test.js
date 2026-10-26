import '../../utils/number.js';

describe('Number formatting methods', () => {
	describe('Number.prototype.format', () => {
		test('should format number with default parameters', () => {
			const result = (1234.567).format();
			expect(result).toContain('1');
			expect(result).toContain('234');
			expect(result).toContain('57');
		});

		test('should format number with custom decimals', () => {
			const result = (1234.567).format(3);
			expect(result).toContain('567');
		});

		test('should format number with en-US locale', () => {
			const result = (1234.567).format(2, 'en-US');
			expect(result).toContain('1,234');
			expect(result).toContain('57');
		});

		test('should format zero', () => {
			const result = (0).format(2);
			expect(result).toBeTruthy();
		});

		test('should format negative numbers', () => {
			const result = (-1234.567).format(2);
			expect(result).toContain('1');
			expect(result).toContain('234');
		});
	});

	describe('Number.format', () => {
		test('should format number as static method', () => {
			const result = Number.format(1234.567, 2, 'fr-FR');
			expect(result).toContain('1');
			expect(result).toContain('234');
		});

		test('should format with default parameters', () => {
			const result = Number.format(1234.567);
			expect(result).toContain('234');
		});

		test('should format integer', () => {
			const result = Number.format(1234, 0);
			expect(result).toContain('1');
		});
	});

	describe('Number.prototype.formatCurrency', () => {
		test('should format currency with EUR', () => {
			const result = (1234.56).formatCurrency('EUR');
			expect(result).toContain('1');
			expect(result).toContain('234');
			expect(result).toContain('56');
			expect(result).toContain('€');
		});

		test('should format currency with USD', () => {
			const result = (1234.56).formatCurrency('USD', 2, 'en-US');
			expect(result).toContain('$');
			expect(result).toContain('1,234');
		});

		test('should format zero currency', () => {
			const result = (0).formatCurrency('EUR');
			expect(result).toContain('0');
		});

		test('should format negative currency', () => {
			const result = (-1234.56).formatCurrency('EUR');
			expect(result).toContain('1');
			expect(result).toContain('234');
		});

		test('should format with custom decimals', () => {
			const result = (1234.567).formatCurrency('EUR', 3);
			expect(result).toContain('567');
		});
	});

	describe('Number.formatCurrency', () => {
		test('should format currency as static method', () => {
			const result = Number.formatCurrency(1234.56, 'EUR', 2, 'fr-FR');
			expect(result).toContain('1');
			expect(result).toContain('234');
			expect(result).toContain('€');
		});

		test('should format with different currencies', () => {
			const resultEur = Number.formatCurrency(100, 'EUR');
			const resultUsd = Number.formatCurrency(100, 'USD');
			expect(resultEur).not.toBe(resultUsd);
		});
	});

	describe('Number.prototype.formatPercent', () => {
		test('should format percent', () => {
			const result = (0.1234).formatPercent();
			expect(result).toContain('12');
			expect(result).toContain('%');
		});

		test('should format percent with custom decimals', () => {
			const result = (0.1234).formatPercent(3);
			expect(result).toContain('%');
		});

		test('should format 100%', () => {
			const result = (1).formatPercent(0);
			expect(result).toContain('100');
			expect(result).toContain('%');
		});

		test('should format zero percent', () => {
			const result = (0).formatPercent();
			expect(result).toContain('0');
			expect(result).toContain('%');
		});

		test('should format with different locales', () => {
			const resultFr = (0.1234).formatPercent(2, 'fr-FR');
			const resultEn = (0.1234).formatPercent(2, 'en-US');
			expect(resultFr).toContain('%');
			expect(resultEn).toContain('%');
		});
	});

	describe('Number.formatPercent', () => {
		test('should format percent as static method', () => {
			const result = Number.formatPercent(0.1234, 2, 'fr-FR');
			expect(result).toContain('%');
		});

		test('should format percentage values', () => {
			const result = Number.formatPercent(0.5, 0);
			expect(result).toContain('50');
		});
	});

	describe('Number.prototype.formatForDisplay', () => {
		test('should format with default parameters (3 digit groups)', () => {
			const result = (1234567.89).formatForDisplay(2, ' ', ',');
			expect(result).toBe('1 234 567,89');
		});

		test('should format with no decimals', () => {
			const result = (1234567).formatForDisplay(0, ' ', ',');
			expect(result).toBe('1 234 567');
		});

		test('should format with custom section length', () => {
			const result = (12345678).formatForDisplay(0, '-', ',', 4);
			expect(result).toBe('1234-5678');
		});

		test('should format small numbers', () => {
			const result = (123.45).formatForDisplay(2, ' ', ',');
			expect(result).toBe('123,45');
		});

		test('should handle negative numbers', () => {
			const result = (-1234.56).formatForDisplay(2, ' ', ',');
			expect(result).toContain('1 234');
			expect(result).toContain('56');
		});

		test('should format with default decimal separator (dot)', () => {
			const result = (1234.56).formatForDisplay(2, ' ');
			expect(result).toBe('1 234.56');
		});

		test('should handle zero', () => {
			const result = (0).formatForDisplay(2, ' ', ',');
			expect(result).toBe('0,00');
		});
	});

	describe('Number.prototype.truncate', () => {
		test('should truncate positive decimal numbers', () => {
			expect((3.7).truncate()).toBe(3);
			expect((3.2).truncate()).toBe(3);
		});

		test('should truncate negative decimal numbers', () => {
			expect((-3.7).truncate()).toBe(-3);
			expect((-3.2).truncate()).toBe(-3);
		});

		test('should handle integer numbers', () => {
			expect((5).truncate()).toBe(5);
			expect((-5).truncate()).toBe(-5);
		});

		test('should handle zero', () => {
			expect((0).truncate()).toBe(0);
		});

		test('should truncate large decimals', () => {
			expect((123.999).truncate()).toBe(123);
			expect((-123.999).truncate()).toBe(-123);
		});
	});

	describe('Number.prototype.padLeft2', () => {
		test('should pad single digit numbers', () => {
			expect((0).padLeft2()).toBe('00');
			expect((1).padLeft2()).toBe('01');
			expect((5).padLeft2()).toBe('05');
			expect((9).padLeft2()).toBe('09');
		});

		test('should not pad double digit numbers', () => {
			expect((10).padLeft2()).toBe('10');
			expect((99).padLeft2()).toBe('99');
			expect((50).padLeft2()).toBe('50');
		});

		test('should not pad numbers greater than 99', () => {
			expect((100).padLeft2()).toBe('100');
			expect((999).padLeft2()).toBe('999');
		});
	});

	describe('Number.padLeft2', () => {
		test('should pad single digit numbers as static method', () => {
			expect(Number.padLeft2(0)).toBe('00');
			expect(Number.padLeft2(5)).toBe('05');
			expect(Number.padLeft2(9)).toBe('09');
		});

		test('should not pad double digit numbers', () => {
			expect(Number.padLeft2(10)).toBe('10');
			expect(Number.padLeft2(99)).toBe('99');
		});

		test('should handle large numbers', () => {
			expect(Number.padLeft2(100)).toBe('100');
		});
	});

	describe('Number.prototype.roundDecimal', () => {
		test('should round to 2 decimals by default', () => {
			expect((1.234).roundDecimal()).toBe(1.23);
			expect((1.235).roundDecimal()).toBe(1.24);
			expect((1.236).roundDecimal()).toBe(1.24);
		});

		test('should round to custom precision', () => {
			expect((1.234).roundDecimal(1)).toBe(1.2);
			expect((1.235).roundDecimal(1)).toBe(1.2);
			expect((1.236).roundDecimal(1)).toBe(1.2);
		});

		test('should round to 3 decimals', () => {
			expect((1.2345).roundDecimal(3)).toBe(1.235);
			expect((1.2344).roundDecimal(3)).toBe(1.234);
		});

		test('should round negative numbers', () => {
			expect((-1.235).roundDecimal(2)).toBe(-1.24);
			expect((-1.234).roundDecimal(2)).toBe(-1.23);
		});

		test('should round to 0 decimals', () => {
			expect((1.5).roundDecimal(0)).toBe(2);
			expect((1.4).roundDecimal(0)).toBe(1);
		});

		test('should handle integers', () => {
			expect((5).roundDecimal(2)).toBe(5);
		});

		test('should handle zero', () => {
			expect((0).roundDecimal(2)).toBe(0);
		});
	});

	describe('Number.roundDecimal', () => {
		test('should round as static method', () => {
			expect(Number.roundDecimal(1.234, 2)).toBe(1.23);
			expect(Number.roundDecimal(1.235, 2)).toBe(1.24);
		});

		test('should use default precision of 2', () => {
			expect(Number.roundDecimal(1.2345)).toBe(1.23);
		});

		test('should round with different precisions', () => {
			expect(Number.roundDecimal(1.2345, 1)).toBe(1.2);
			expect(Number.roundDecimal(1.2345, 3)).toBe(1.235);
		});
	});
});

describe('Math.getDecimals', () => {
	test('should extract decimal part', () => {
		expect(Math.getDecimals(1.5)).toBe(5);
		expect(Math.getDecimals(1.234)).toBe(234);
		expect(Math.getDecimals(3.14159)).toBe(14159);
	});

	test('should return 0 for integers', () => {
		expect(Math.getDecimals(5)).toBe(0);
		expect(Math.getDecimals(100)).toBe(0);
	});

	test('should handle zero', () => {
		expect(Math.getDecimals(0)).toBe(0);
	});

	test('should handle negative numbers', () => {
		expect(Math.getDecimals(-1.5)).toBe(5);
		expect(Math.getDecimals(-3.14)).toBe(14);
	});

	test('should handle numbers with single decimal', () => {
		expect(Math.getDecimals(1.0)).toBe(0);
		expect(Math.getDecimals(1.1)).toBe(1);
	});

	test('should handle very small decimals', () => {
		expect(Math.getDecimals(0.001)).toBe(1);
		expect(Math.getDecimals(0.01)).toBe(1);
		expect(Math.getDecimals(0.1)).toBe(1);
	});
});

describe('Number.random', () => {
	test('should generate number within range', () => {
		for (let i = 0; i < 100; i++) {
			const result = Number.random(1, 10);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(10);
		}
	});

	test('should generate number in range [0, 0]', () => {
		expect(Number.random(0, 0)).toBe(0);
	});

	test('should generate number in range [5, 5]', () => {
		expect(Number.random(5, 5)).toBe(5);
	});

	test('should generate numbers in range [1, 2]', () => {
		const results = new Set();
		for (let i = 0; i < 50; i++) {
			results.add(Number.random(1, 2));
		}
		expect(results.has(1) || results.has(2)).toBe(true);
		expect(results.size).toBeGreaterThanOrEqual(1);
		expect(results.size).toBeLessThanOrEqual(2);
	});

	test('should generate integers only', () => {
		for (let i = 0; i < 50; i++) {
			const result = Number.random(1, 10);
			expect(result).toBe(Math.floor(result));
		}
	});

	test('should handle negative ranges', () => {
		for (let i = 0; i < 50; i++) {
			const result = Number.random(-10, -1);
			expect(result).toBeGreaterThanOrEqual(-10);
			expect(result).toBeLessThanOrEqual(-1);
		}
	});

	test('should handle range crossing zero', () => {
		for (let i = 0; i < 50; i++) {
			const result = Number.random(-5, 5);
			expect(result).toBeGreaterThanOrEqual(-5);
			expect(result).toBeLessThanOrEqual(5);
		}
	});
});