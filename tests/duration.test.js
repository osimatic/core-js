import { Duration } from '../duration.js';
import '../number.js'; // Pour Math.getDecimals et Number.roundDecimal

describe('Duration', () => {
	describe('formatDays', () => {
		test('should format number of days with 2 decimal places', () => {
			expect(Duration.formatDays(5)).toBe('5,00');
			expect(Duration.formatDays(5.5)).toBe('5,50');
			expect(Duration.formatDays(5.123)).toBe('5,12');
			expect(Duration.formatDays(0)).toBe('0,00');
		});

		test('should handle negative numbers', () => {
			expect(Duration.formatDays(-3.75)).toBe('-3,75');
		});

		test('should work with en-US locale', () => {
			expect(Duration.formatDays(5.5, 'en-US')).toBe('5.50');
		});
	});

	describe('formatDaysIfPositive', () => {
		test('should return formatted number for positive values', () => {
			expect(Duration.formatDaysIfPositive(5.5)).toBe('5,50');
			expect(Duration.formatDaysIfPositive(0)).toBe('0,00');
		});

		test('should return "-" for negative values', () => {
			expect(Duration.formatDaysIfPositive(-3.75)).toBe('-');
		});
	});

	describe('formatDaysWithColor', () => {
		test('should return HTML with success class for positive values', () => {
			expect(Duration.formatDaysWithColor(5.5)).toBe('<span class="text-success">5,50</span>');
			expect(Duration.formatDaysWithColor(0)).toBe('<span class="text-success">0,00</span>');
		});

		test('should return HTML with danger class for negative values', () => {
			expect(Duration.formatDaysWithColor(-3.75)).toBe('<span class="text-danger">-3,75</span>');
		});
	});

	describe('parseTimeInputToSeconds', () => {
		test('should convert HH:MM:SS to seconds', () => {
			expect(Duration.parseTimeInputToSeconds('01:30:45')).toBe(5445); // 1*3600 + 30*60 + 45
			expect(Duration.parseTimeInputToSeconds('02:00:00')).toBe(7200);
			expect(Duration.parseTimeInputToSeconds('00:05:30')).toBe(330);
		});

		test('should convert HH:MM to seconds', () => {
			expect(Duration.parseTimeInputToSeconds('01:30')).toBe(5400); // 1*3600 + 30*60
		});

		test('should handle edge cases', () => {
			expect(Duration.parseTimeInputToSeconds('00:00:00')).toBe(0);
			expect(Duration.parseTimeInputToSeconds('10:00:00')).toBe(36000);
		});

		test('should return 0 for null input', () => {
			expect(Duration.parseTimeInputToSeconds(null)).toBe(0);
		});

		test('should return 0 for invalid format', () => {
			expect(Duration.parseTimeInputToSeconds('invalid')).toBe(0);
			expect(Duration.parseTimeInputToSeconds('123')).toBe(0);
		});

		test('should handle missing parts', () => {
			expect(Duration.parseTimeInputToSeconds('01::')).toBe(3600);
		});
	});

	describe('formatSecondsAsTimeInput', () => {
		test('should convert seconds to HH:MM:SS format', () => {
			expect(Duration.formatSecondsAsTimeInput(5445)).toBe('01:30:45');
			expect(Duration.formatSecondsAsTimeInput(7200)).toBe('02:00:00');
			expect(Duration.formatSecondsAsTimeInput(330)).toBe('00:05:30');
		});

		test('should handle negative values as positive', () => {
			expect(Duration.formatSecondsAsTimeInput(-5445)).toBe('01:30:45');
		});

		test('should handle zero', () => {
			expect(Duration.formatSecondsAsTimeInput(0)).toBe('00:00:00');
		});
	});

	describe('formatSecondsAsChrono', () => {
		test('should convert to chrono format (HH:MM.SS) by default', () => {
			expect(Duration.formatSecondsAsChrono(5445)).toBe('01:30.45'); // 1h 30m 45s
			expect(Duration.formatSecondsAsChrono(7200)).toBe('02:00.00');
			expect(Duration.formatSecondsAsChrono(330)).toBe('00:05.30');
		});

		test('should convert to input_time format (HH:MM:SS)', () => {
			expect(Duration.formatSecondsAsChrono(5445, 'input_time')).toBe('01:30:45');
			expect(Duration.formatSecondsAsChrono(7200, 'input_time')).toBe('02:00:00');
		});

		test('should handle negative values', () => {
			expect(Duration.formatSecondsAsChrono(-5445)).toBe('- 01:30.45');
			expect(Duration.formatSecondsAsChrono(-7200, 'input_time')).toBe('- 02:00:00');
		});

		test('should handle zero', () => {
			expect(Duration.formatSecondsAsChrono(0)).toBe('00:00.00');
		});

		test('should round decimals', () => {
			expect(Duration.formatSecondsAsChrono(5445.7)).toBe('01:30.46');
		});

		test('should handle large durations', () => {
			expect(Duration.formatSecondsAsChrono(86400)).toBe('24:00.00'); // 24 hours
		});
	});

	describe('formatSecondsAsString', () => {
		test('should convert with default options (all components)', () => {
			expect(Duration.formatSecondsAsString(5445)).toBe('1h 30min 45s'); // 1h 30m 45s
		});

		test('should convert without seconds', () => {
			expect(Duration.formatSecondsAsString(5445, false)).toBe('1h 30min');
		});

		test('should convert without minutes', () => {
			expect(Duration.formatSecondsAsString(5445, true, false)).toBe('1h 45s');
		});

		test('should convert without minute label', () => {
			expect(Duration.formatSecondsAsString(5445, true, true, false)).toBe('1h 30 45s');
		});

		test('should convert with full labels', () => {
			expect(Duration.formatSecondsAsString(5445, true, true, true, true)).toBe('1 heure 30 minutes 45 secondes');
		});

		test('should handle plural labels correctly', () => {
			expect(Duration.formatSecondsAsString(7201, true, true, true, true)).toBe('2 heures 0 minute 1 seconde'); // 0 est singulier en français
		});

		test('should hide hour if zero when requested', () => {
			expect(Duration.formatSecondsAsString(330, true, true, true, false, true)).toBe('05min 30s'); // 0h 5m 30s
		});

		test('should show hour if zero when not hiding', () => {
			expect(Duration.formatSecondsAsString(330, true, true, true, false, false)).toBe('0h 05min 30s');
		});

		test('should pad minutes and seconds with zero', () => {
			expect(Duration.formatSecondsAsString(3605)).toBe('1h 00min 05s'); // 1h 0m 5s
		});

		test('should handle zero duration', () => {
			expect(Duration.formatSecondsAsString(0)).toBe('0h 00min 00s');
		});

		test('should prefix sign for negative duration with hours', () => {
			expect(Duration.formatSecondsAsString(-39888)).toBe('- 11h 04min 48s'); // -11h 4m 48s
		});

		test('should prefix sign for pure-minutes negative duration', () => {
			// totalHours(-300) = 0, le signe était perdu avant le fix
			expect(Duration.formatSecondsAsString(-300)).toBe('- 0h 05min 00s');
		});

		test('should prefix sign for negative without seconds', () => {
			expect(Duration.formatSecondsAsString(-39888, false)).toBe('- 11h 04min');
		});
	});

	describe('roundSeconds', () => {
		test('should not round when precision is 0', () => {
			expect(Duration.roundSeconds(5445, 0)).toBe(5445);
			expect(Duration.roundSeconds(5478, 0)).toBe(5478);
		});

		test('should round to nearest 15 minutes', () => {
			expect(Duration.roundSeconds(3600 + 7*60, 15, 'close')).toBe(3600); // 1h 7m -> 1h 0m
			expect(Duration.roundSeconds(3600 + 8*60, 15, 'close')).toBe(3600 + 15*60); // 1h 8m -> 1h 15m
			expect(Duration.roundSeconds(3600 + 22*60, 15, 'close')).toBe(3600 + 15*60); // 1h 22m -> 1h 15m
			expect(Duration.roundSeconds(3600 + 23*60, 15, 'close')).toBe(3600 + 30*60); // 1h 23m -> 1h 30m
		});

		test('should round up when mode is "up"', () => {
			expect(Duration.roundSeconds(3600 + 1, 15, 'up')).toBe(3600 + 15*60); // 1h 0m 1s -> 1h 15m
			expect(Duration.roundSeconds(3600 + 7*60, 15, 'up')).toBe(3600 + 15*60); // 1h 7m -> 1h 15m
		});

		test('should round down when mode is not "up" and below half', () => {
			expect(Duration.roundSeconds(3600 + 7*60, 15, 'down')).toBe(3600); // 1h 7m -> 1h 0m
		});

		test('should handle rounding that crosses hour boundary', () => {
			expect(Duration.roundSeconds(3600 + 55*60, 15, 'up')).toBe(7200); // 1h 55m -> 2h 0m
		});

		test('should remove seconds when rounding', () => {
			expect(Duration.roundSeconds(3600 + 30*60 + 45, 15)).toBe(3600 + 30*60);
		});

		test('should handle exact precision values', () => {
			expect(Duration.roundSeconds(3600 + 15*60, 15, 'close')).toBe(3600 + 15*60);
			expect(Duration.roundSeconds(3600 + 30*60, 15, 'close')).toBe(3600 + 30*60);
		});
	});

	describe('totalDays', () => {
		test('should return number of complete days', () => {
			expect(Duration.totalDays(86400)).toBe(1);
			expect(Duration.totalDays(172800)).toBe(2);
			expect(Duration.totalDays(259200)).toBe(3);
		});

		test('should return 0 for less than a day', () => {
			expect(Duration.totalDays(3600)).toBe(0);
			expect(Duration.totalDays(86399)).toBe(0);
		});

		test('should truncate the result', () => {
			expect(Duration.totalDays(86400 + 3600)).toBe(1); // 1j 1h
		});

		test('should truncate toward zero for negative values', () => {
			// Math.floor(-1.04) = -2, Math.trunc(-1.04) = -1
			expect(Duration.totalDays(-90000)).toBe(-1); // -1j 1h
			expect(Duration.totalDays(-3600)).toBe(0);
		});
	});

	describe('totalHours', () => {
		test('should return total number of hours', () => {
			expect(Duration.totalHours(3600)).toBe(1);
			expect(Duration.totalHours(7200)).toBe(2);
			expect(Duration.totalHours(86400)).toBe(24);
		});

		test('should return 0 for less than an hour', () => {
			expect(Duration.totalHours(3599)).toBe(0);
		});

		test('should truncate the result', () => {
			expect(Duration.totalHours(3600 + 1800)).toBe(1); // 1h 30m
		});

		test('should truncate toward zero for negative values', () => {
			// -39888s = -11h 4m 48s — Math.floor(-11.08) = -12, Math.trunc(-11.08) = -11
			expect(Duration.totalHours(-39888)).toBe(-11);
			expect(Duration.totalHours(-3599)).toBe(0);
		});
	});

	describe('totalMinutes', () => {
		test('should return total number of minutes', () => {
			expect(Duration.totalMinutes(60)).toBe(1);
			expect(Duration.totalMinutes(120)).toBe(2);
			expect(Duration.totalMinutes(3600)).toBe(60);
		});

		test('should return 0 for less than a minute', () => {
			expect(Duration.totalMinutes(59)).toBe(0);
		});

		test('should truncate the result', () => {
			expect(Duration.totalMinutes(90)).toBe(1); // 1m 30s
		});

		test('should truncate toward zero for negative values', () => {
			// -310s = -5m 10s — Math.floor(-5.17) = -6, Math.trunc(-5.17) = -5
			expect(Duration.totalMinutes(-310)).toBe(-5);
			expect(Duration.totalMinutes(-59)).toBe(0);
		});
	});

	describe('remainingHours', () => {
		test('should return hours remaining after removing complete days', () => {
			expect(Duration.remainingHours(86400 + 3600)).toBe(1); // 1j 1h
			expect(Duration.remainingHours(86400 + 7200)).toBe(2); // 1j 2h
		});

		test('should return total hours if less than a day', () => {
			expect(Duration.remainingHours(3600)).toBe(1);
			expect(Duration.remainingHours(7200)).toBe(2);
		});

		test('should return 0 for exact days', () => {
			expect(Duration.remainingHours(86400)).toBe(0);
		});

		test('should return positive value for negative input', () => {
			expect(Duration.remainingHours(-39888)).toBe(11); // -11h 4m 48s
		});
	});

	describe('remainingMinutes', () => {
		test('should return minutes remaining after removing complete hours', () => {
			expect(Duration.remainingMinutes(3600 + 60)).toBe(1); // 1h 1m
			expect(Duration.remainingMinutes(3600 + 120)).toBe(2); // 1h 2m
			expect(Duration.remainingMinutes(3600 + 1800)).toBe(30); // 1h 30m
		});

		test('should return total minutes if less than an hour', () => {
			expect(Duration.remainingMinutes(60)).toBe(1);
			expect(Duration.remainingMinutes(1800)).toBe(30);
		});

		test('should return 0 for exact hours', () => {
			expect(Duration.remainingMinutes(3600)).toBe(0);
		});

		test('should return positive value for negative input with hours', () => {
			expect(Duration.remainingMinutes(-39888)).toBe(4); // -11h 4m 48s
		});

		test('should return positive value for pure-minutes negative duration', () => {
			expect(Duration.remainingMinutes(-300)).toBe(5); // -5min
		});
	});

	describe('remainingSeconds', () => {
		test('should return seconds remaining after removing complete minutes', () => {
			expect(Duration.remainingSeconds(61)).toBe(1);
			expect(Duration.remainingSeconds(90)).toBe(30);
			expect(Duration.remainingSeconds(3661)).toBe(1); // 1h 1m 1s
		});

		test('should return total seconds if less than a minute', () => {
			expect(Duration.remainingSeconds(30)).toBe(30);
			expect(Duration.remainingSeconds(59)).toBe(59);
		});

		test('should return 0 for exact minutes', () => {
			expect(Duration.remainingSeconds(60)).toBe(0);
			expect(Duration.remainingSeconds(3600)).toBe(0);
		});

		test('should return positive value for negative input', () => {
			expect(Duration.remainingSeconds(-310)).toBe(10); // -5m 10s
		});
	});

	describe('toDecimalHours', () => {
		test('should convert seconds to hundredth of an hour', () => {
			expect(Duration.toDecimalHours(3600)).toBe(1);
			expect(Duration.toDecimalHours(7200)).toBe(2);
		});

		test('should convert minutes to hundredths', () => {
			expect(Duration.toDecimalHours(3600 + 1800)).toBeCloseTo(1.5, 2); // 1h 30m = 1.5h
			expect(Duration.toDecimalHours(3600 + 900)).toBeCloseTo(1.25, 2); // 1h 15m = 1.25h
		});

		test('should handle zero', () => {
			expect(Duration.toDecimalHours(0)).toBe(0);
		});

		test('should round minutes to nearest hundredth', () => {
			expect(Duration.toDecimalHours(3600 + 360)).toBeCloseTo(1.1, 1); // 1h 6m
		});
	});

	describe('getHoursFromDecimal', () => {
		test('should return integer hours from hundredth format', () => {
			expect(Duration.getHoursFromDecimal(1.5)).toBe(1);
			expect(Duration.getHoursFromDecimal(2.75)).toBe(2);
			expect(Duration.getHoursFromDecimal(10.99)).toBe(10);
		});

		test('should return 0 for less than an hour', () => {
			expect(Duration.getHoursFromDecimal(0.5)).toBe(0);
			expect(Duration.getHoursFromDecimal(0.99)).toBe(0);
		});

		test('should handle exact hours', () => {
			expect(Duration.getHoursFromDecimal(1)).toBe(1);
			expect(Duration.getHoursFromDecimal(5)).toBe(5);
		});
	});

	describe('getMinutesFromDecimal', () => {
		test('should return minutes from hundredth format', () => {
			expect(Duration.getMinutesFromDecimal(1.5)).toBe(30); // 0.5 * 60 = 30
			expect(Duration.getMinutesFromDecimal(1.25)).toBe(15); // 0.25 * 60 = 15
			expect(Duration.getMinutesFromDecimal(1.75)).toBe(45); // 0.75 * 60 = 45
		});

		test('should return 0 for exact hours', () => {
			expect(Duration.getMinutesFromDecimal(1)).toBe(0);
			expect(Duration.getMinutesFromDecimal(2)).toBe(0);
		});

		test('should handle less than an hour', () => {
			expect(Duration.getMinutesFromDecimal(0.5)).toBe(30);
			expect(Duration.getMinutesFromDecimal(0.25)).toBe(15);
			expect(Duration.getMinutesFromDecimal(0.75)).toBe(45);
		});
	});
});
