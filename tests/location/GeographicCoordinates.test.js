import { GeographicCoordinates } from '../../location/GeographicCoordinates.js';

describe('GeographicCoordinates', () => {
	describe('check', () => {
		test('should validate correct coordinates', () => {
			expect(GeographicCoordinates.check('48.8566,2.3522')).toBe(true);
			expect(GeographicCoordinates.check('0,0')).toBe(true);
			expect(GeographicCoordinates.check('-45.5,-73.6')).toBe(true);
			expect(GeographicCoordinates.check('90,180')).toBe(true);
			expect(GeographicCoordinates.check('-90,-180')).toBe(true);
		});

		test('should reject invalid coordinates', () => {
			expect(GeographicCoordinates.check('91,180')).toBe(false);
			expect(GeographicCoordinates.check('45,181')).toBe(false);
			expect(GeographicCoordinates.check('abc,def')).toBe(false);
			expect(GeographicCoordinates.check('45')).toBe(false);
		});
	});

	describe('parse', () => {
		test('should parse valid coordinate string', () => {
			const coords = GeographicCoordinates.parse('48.8566,2.3522');
			expect(coords).toEqual([48.8566, 2.3522]);
		});

		test('should handle spaces and semicolons', () => {
			expect(GeographicCoordinates.parse('48.8566, 2.3522')).toEqual([48.8566, 2.3522]);
			expect(GeographicCoordinates.parse('48.8566;2.3522')).toEqual([48.8566, 2.3522]);
			expect(GeographicCoordinates.parse('  48.8566  ,  2.3522  ')).toEqual([48.8566, 2.3522]);
		});

		test('should return null for invalid input', () => {
			expect(GeographicCoordinates.parse(null)).toBeNull();
			expect(GeographicCoordinates.parse('')).toBeNull();
			expect(GeographicCoordinates.parse('NaN,NaN')).toBeNull();
			expect(GeographicCoordinates.parse('invalid')).toBeNull();
		});

		test('should return string when asString=true', () => {
			const coords = GeographicCoordinates.parse('48.8566,2.3522', true);
			expect(typeof coords).toBe('string');
		});
	});

	describe('toFixed', () => {
		test('should format number with default 6 decimals', () => {
			expect(GeographicCoordinates.toFixed(48.85661234)).toBe('48.856612');
		});

		test('should format number with custom decimals', () => {
			expect(GeographicCoordinates.toFixed(48.85661234, 2)).toBe('48.86');
			expect(GeographicCoordinates.toFixed(48.85661234, 4)).toBe('48.8566');
		});
	});

	describe('format', () => {
		test('should format coordinates with default 6 decimals', () => {
			expect(GeographicCoordinates.format(48.8566, 2.3522)).toBe('48.856600,2.352200');
		});

		test('should format coordinates with custom decimals', () => {
			expect(GeographicCoordinates.format(48.8566, 2.3522, 2)).toBe('48.86,2.35');
		});
	});

	describe('convertToGeoJson', () => {
		test('should convert to GeoJSON Point format', () => {
			const geoJson = GeographicCoordinates.convertToGeoJson(48.8566, 2.3522);
			expect(geoJson).toEqual({
				type: 'Point',
				coordinates: [2.3522, 48.8566]
			});
		});

		test('should convert strings to numbers', () => {
			const geoJson = GeographicCoordinates.convertToGeoJson('48.8566', '2.3522');
			expect(geoJson.coordinates[0]).toBe(2.3522);
			expect(geoJson.coordinates[1]).toBe(48.8566);
		});
	});

	describe('parseFromGeoJson', () => {
		test('should parse GeoJSON Point to [lat, long]', () => {
			const geoJson = { type: 'Point', coordinates: [2.3522, 48.8566] };
			const coords = GeographicCoordinates.parseFromGeoJson(geoJson);
			expect(coords).toEqual([48.8566, 2.3522]);
		});

		test('should parse GeoJSON string', () => {
			const geoJsonStr = '{"type":"Point","coordinates":[2.3522,48.8566]}';
			const coords = GeographicCoordinates.parseFromGeoJson(geoJsonStr);
			expect(coords).toEqual([48.8566, 2.3522]);
		});

		test('should return null for invalid GeoJSON', () => {
			expect(GeographicCoordinates.parseFromGeoJson({ type: 'Point', coordinates: [] })).toBeNull();
			expect(GeographicCoordinates.parseFromGeoJson({ type: 'Point' })).toBeNull();
		});

		test('should return string when asString=true', () => {
			const geoJson = { type: 'Point', coordinates: [2.3522, 48.8566] };
			const coords = GeographicCoordinates.parseFromGeoJson(geoJson, true);
			expect(coords).toBe('48.8566,2.3522');
		});
	});

	describe('formatPoint', () => {
		test('should format GeoJSON Point with default 6 decimals', () => {
			const geoJsonPoint = { type: 'Point', coordinates: [2.3522123, 48.8566789] };
			const formatted = GeographicCoordinates.formatPoint(geoJsonPoint);
			expect(formatted).toBe('48.856679,2.352212');
		});

		test('should format GeoJSON Point with custom decimals', () => {
			const geoJsonPoint = { type: 'Point', coordinates: [2.3522, 48.8566] };
			const formatted = GeographicCoordinates.formatPoint(geoJsonPoint, 2);
			expect(formatted).toBe('48.86,2.35');
		});

		test('should return empty string for invalid GeoJSON Point', () => {
			const invalidPoint1 = { type: 'Point', coordinates: [] };
			const invalidPoint2 = { type: 'Point' };
			expect(GeographicCoordinates.formatPoint(invalidPoint1)).toBe('');
			expect(GeographicCoordinates.formatPoint(invalidPoint2)).toBe('');
		});

		test('should handle GeoJSON Point as JSON string', () => {
			const geoJsonStr = '{"type":"Point","coordinates":[2.3522,48.8566]}';
			const formatted = GeographicCoordinates.formatPoint(geoJsonStr, 4);
			expect(formatted).toBe('48.8566,2.3522');
		});
	});

	describe('haversine', () => {
		test('should calculate distance between two points', () => {
			// Paris to London: ~344 km
			const distance = GeographicCoordinates.haversine(48.8566, 2.3522, 51.5074, -0.1278);
			expect(distance).toBeGreaterThan(340000);
			expect(distance).toBeLessThan(345000);
		});

		test('should return 0 for same coordinates', () => {
			const distance = GeographicCoordinates.haversine(48.8566, 2.3522, 48.8566, 2.3522);
			expect(distance).toBe(0);
		});
	});

	describe('isPointCorrespondingToLocationsList', () => {
		test('should return true when point matches string coordinate in list', () => {
			const locationsList = ['48.8566,2.3522', '51.5074,-0.1278'];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.8566, 2.3522, locationsList, 1)).toBe(true);
		});

		test('should return true when point matches GeoJSON Point in list', () => {
			const locationsList = [
				{ type: 'Point', coordinates: [2.3522, 48.8566] }
			];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.8566, 2.3522, locationsList, 1)).toBe(true);
		});

		test('should return false when point does not match any location', () => {
			const locationsList = ['51.5074,-0.1278'];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.8566, 2.3522, locationsList, 1)).toBe(false);
		});

		test('should return true when point is inside polygon', () => {
			const locationsList = [
				{
					type: 'Polygon',
					coordinates: [[
						[2.3, 48.8],
						[2.4, 48.8],
						[2.4, 48.9],
						[2.3, 48.9],
						[2.3, 48.8]
					]]
				}
			];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.85, 2.35, locationsList)).toBe(true);
		});

		test('should skip null/undefined items in list', () => {
			const locationsList = [null, undefined, { type: 'Point', coordinates: [2.3522, 48.8566] }];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.8566, 2.3522, locationsList, 1)).toBe(true);
		});

		test('should handle invalid string coordinates in list', () => {
			const locationsList = ['invalid', '48.8566,2.3522'];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.8566, 2.3522, locationsList, 1)).toBe(true);
		});

		test('should handle invalid Point without coordinates', () => {
			const locationsList = [{ type: 'Point' }, { type: 'Point', coordinates: [2.3522, 48.8566] }];
			expect(GeographicCoordinates.isPointCorrespondingToLocationsList(48.8566, 2.3522, locationsList, 1)).toBe(true);
		});
	});

	describe('getAllLatLongsFromGeoJsonList', () => {
		test('should extract coordinates from Point', () => {
			const geoJsonList = [
				{ type: 'Point', coordinates: [2.3522, 48.8566] }
			];
			const coords = GeographicCoordinates.getAllLatLongsFromGeoJsonList(geoJsonList);
			expect(coords).toEqual([[48.8566, 2.3522]]);
		});

		test('should extract coordinates from Polygon', () => {
			const geoJsonList = [
				{
					type: 'Polygon',
					coordinates: [[
						[2.3, 48.8],
						[2.4, 48.9]
					]]
				}
			];
			const coords = GeographicCoordinates.getAllLatLongsFromGeoJsonList(geoJsonList);
			expect(coords).toEqual([[48.8, 2.3], [48.9, 2.4]]);
		});

		test('should handle mixed GeoJSON types', () => {
			const geoJsonList = [
				{ type: 'Point', coordinates: [2.3522, 48.8566] },
				{
					type: 'Polygon',
					coordinates: [[
						[2.3, 48.8],
						[2.4, 48.9]
					]]
				}
			];
			const coords = GeographicCoordinates.getAllLatLongsFromGeoJsonList(geoJsonList);
			expect(coords.length).toBe(3);
		});
	});
});