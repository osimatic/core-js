const { SqlTime, TimestampUnix } = require('../../date_time');

describe('SqlTime', () => {
	describe('parse', () => {
		test('should parse SQL time with seconds to Date object', () => {
			const sqlTime = '10:30:45';
			const result = SqlTime.parse(sqlTime);
			expect(result instanceof Date).toBe(true);
			expect(result.getUTCHours()).toBe(10);
			expect(result.getUTCMinutes()).toBe(30);
			expect(result.getUTCSeconds()).toBe(45);
		});

		test('should parse SQL time without seconds', () => {
			const sqlTime = '10:30';
			const result = SqlTime.parse(sqlTime);
			expect(result instanceof Date).toBe(true);
			expect(result.getUTCHours()).toBe(10);
			expect(result.getUTCMinutes()).toBe(30);
			expect(result.getUTCSeconds()).toBe(0);
		});

		test('should return null for null input', () => {
			expect(SqlTime.parse(null)).toBeNull();
		});

		test('should parse midnight', () => {
			const sqlTime = '00:00:00';
			const result = SqlTime.parse(sqlTime);
			expect(result.getUTCHours()).toBe(0);
			expect(result.getUTCMinutes()).toBe(0);
			expect(result.getUTCSeconds()).toBe(0);
		});

		test('should parse noon', () => {
			const sqlTime = '12:00:00';
			const result = SqlTime.parse(sqlTime);
			expect(result.getUTCHours()).toBe(12);
		});

		test('should parse end of day', () => {
			const sqlTime = '23:59:59';
			const result = SqlTime.parse(sqlTime);
			expect(result.getUTCHours()).toBe(23);
			expect(result.getUTCMinutes()).toBe(59);
			expect(result.getUTCSeconds()).toBe(59);
		});
	});

	describe('getCurrentSqlTime', () => {
		test('should return current time in SQL format', () => {
			const result = SqlTime.getCurrentSqlTime();
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});

		test('should return time within valid range', () => {
			const result = SqlTime.getCurrentSqlTime();
			const parts = result.split(':');
			const hours = parseInt(parts[0]);
			const minutes = parseInt(parts[1]);
			const seconds = parseInt(parts[2]);

			expect(hours).toBeGreaterThanOrEqual(0);
			expect(hours).toBeLessThanOrEqual(23);
			expect(minutes).toBeGreaterThanOrEqual(0);
			expect(minutes).toBeLessThanOrEqual(59);
			expect(seconds).toBeGreaterThanOrEqual(0);
			expect(seconds).toBeLessThanOrEqual(59);
		});
	});

	describe('getTimeDisplay', () => {
		test('should format SQL time for display', () => {
			const sqlTime = '10:30:45';
			const result = SqlTime.getTimeDisplay(sqlTime, 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should format midnight', () => {
			const sqlTime = '00:00:00';
			const result = SqlTime.getTimeDisplay(sqlTime, 'fr-FR', 'UTC');
			expect(result).toContain('00');
		});
	});

	describe('getTimeDigitalDisplay', () => {
		test('should format SQL time in digital format', () => {
			const sqlTime = '10:30:45';
			const result = SqlTime.getTimeDigitalDisplay(sqlTime, 'fr-FR', 'UTC');
			expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
		});

		test('should format time without seconds', () => {
			const sqlTime = '10:30';
			const result = SqlTime.getTimeDigitalDisplay(sqlTime, 'fr-FR', 'UTC');
			expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
		});
	});

	describe('getTimeDisplayWithNbDays', () => {
		test('should display time without days difference', () => {
			const sqlTime = '10:30:00';
			const result = SqlTime.getTimeDisplayWithNbDays(sqlTime, '10:30:00', 'fr-FR', 'UTC');
			expect(result).toContain('10');
			expect(result).toContain('30');
		});

		test('should not show days for same time', () => {
			const sqlTime = '10:30:00';
			const result = SqlTime.getTimeDisplayWithNbDays(sqlTime, '10:30:00', 'fr-FR', 'UTC');
			expect(result).not.toContain('J+');
		});
	});

	describe('getTimeForInputTime', () => {
		test('should return time for input field without seconds', () => {
			const sqlTime = '10:30:45';
			const result = SqlTime.getTimeForInputTime(sqlTime, 'UTC', false);
			expect(result).toMatch(/^\d{2}:\d{2}$/);
		});

		test('should return time for input field with seconds', () => {
			const sqlTime = '10:30:45';
			const result = SqlTime.getTimeForInputTime(sqlTime, 'UTC', true);
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});

		test('should handle time without seconds', () => {
			const sqlTime = '10:30';
			const result = SqlTime.getTimeForInputTime(sqlTime, 'UTC', true);
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});
	});

	describe('getTimestamp', () => {
		test('should convert SQL time to timestamp', () => {
			const sqlTime = '10:30:45';
			const result = SqlTime.getTimestamp(sqlTime);
			expect(typeof result).toBe('number');
		});

		test('should return consistent timestamp', () => {
			const sqlTime = '10:30:45';
			const result1 = SqlTime.getTimestamp(sqlTime);
			const result2 = SqlTime.getTimestamp(sqlTime);
			expect(result1).toBe(result2);
		});

		test('should handle midnight', () => {
			const sqlTime = '00:00:00';
			const result = SqlTime.getTimestamp(sqlTime);
			expect(typeof result).toBe('number');
		});

		test('should handle time without seconds', () => {
			const sqlTime = '10:30';
			const result = SqlTime.getTimestamp(sqlTime);
			expect(typeof result).toBe('number');
		});

		describe('régression DST — doit utiliser le DST du jour, pas celui du 1970-01-01', () => {
			// Régression : l'ancienne implémentation utilisait '1970-01-01' comme date pivot.
			// Le 1er janvier 1970, Paris était en CET (UTC+1).
			// En été, Paris est en CEST (UTC+2) → l'affichage était décalé d'1h.

			afterEach(() => {
				jest.useRealTimers();
			});

			test("en été (CEST, UTC+2) : '12:00:00' UTC doit s'afficher 14h à Paris", () => {
				// Simulation : on est le 15 juillet 2024 (heure d'été, CEST = UTC+2)
				jest.useFakeTimers();
				jest.setSystemTime(new Date('2024-07-15T10:00:00Z'));

				const timestamp = SqlTime.getTimestamp('12:00:00');
				const heureAParis = TimestampUnix.getHour(timestamp, 'Europe/Paris');

				// 12h UTC + 2h (CEST) = 14h — avec l'ancienne implémentation : 13h (CET de 1970)
				expect(heureAParis).toBe(14);
			});

			test("en hiver (CET, UTC+1) : '12:00:00' UTC doit s'afficher 13h à Paris", () => {
				// Simulation : on est le 15 janvier 2024 (heure d'hiver, CET = UTC+1)
				jest.useFakeTimers();
				jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));

				const timestamp = SqlTime.getTimestamp('12:00:00');
				const heureAParis = TimestampUnix.getHour(timestamp, 'Europe/Paris');

				// 12h UTC + 1h (CET) = 13h — les deux implémentations concordaient en hiver
				expect(heureAParis).toBe(13);
			});

			test('deux heures successives restent comparables', () => {
				jest.useFakeTimers();
				jest.setSystemTime(new Date('2024-07-15T10:00:00Z'));

				const ts14h = SqlTime.getTimestamp('14:00:00');
				const ts16h = SqlTime.getTimestamp('16:00:00');

				expect(ts14h).toBeLessThan(ts16h);
			});
		});
	});
});
