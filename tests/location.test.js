import { Country, Locale, PostalAddress, GeographicCoordinates, Polygon } from '../location.js';

describe('Country', () => {
	describe('getCountries', () => {
		test('should return an object with country codes', () => {
			const countries = Country.getCountries();
			expect(typeof countries).toBe('object');
			expect(countries).toHaveProperty('FR');
			expect(countries).toHaveProperty('US');
			expect(countries).toHaveProperty('GB');
		});

		test('should have correct country names', () => {
			const countries = Country.getCountries();
			expect(countries.FR).toBe('France');
			expect(countries.US).toBe('United States of America');
			expect(countries.GB).toBe('United Kingdom');
		});
	});

	describe('getCountryName', () => {
		test('should return country name for valid code (default fr-FR locale)', () => {
			expect(Country.getCountryName('FR')).toBe('France');
			expect(Country.getCountryName('US')).toBe("États-Unis d'Amérique");
			expect(Country.getCountryName('CA')).toBe('Canada');
		});

		test('should return country name in specified locale', () => {
			expect(Country.getCountryName('US', 'en')).toBe('United States of America');
			expect(Country.getCountryName('DE', 'de')).toBeTruthy();
		});

		test('should handle full locale with region (fr-FR, en-US)', () => {
			expect(Country.getCountryName('FR', 'fr-FR')).toBe('France');
			expect(Country.getCountryName('US', 'fr-FR')).toBe("États-Unis d'Amérique");
			expect(Country.getCountryName('US', 'en-US')).toBe('United States of America');
		});

		test('should return the code itself if country not found', () => {
			expect(Country.getCountryName('XX')).toBe('XX');
			expect(Country.getCountryName('ZZZ')).toBe('ZZZ');
		});
	});

	describe('getContinents', () => {
		test('should return an object with continent IDs', () => {
			const continents = Country.getContinents();
			expect(typeof continents).toBe('object');
			expect(continents[1]).toBe('Europe');
			expect(continents[3]).toBe('Afrique');
			expect(continents[6]).toBe('Asie');
		});
	});

	describe('getFlagPath', () => {
		test('should return null when no flagsPath set', () => {
			Country.flagsPath = undefined;
			expect(Country.getFlagPath('FR')).toBeNull();
		});

		test('should return image path when flagsPath set', () => {
			Country.setFlagsPath('/custom/flags/');
			expect(Country.getFlagPath('FR')).toBe('/custom/flags/fr.png');
			expect(Country.getFlagPath('US')).toBe('/custom/flags/us.png');
			Country.flagsPath = undefined;
		});
	});

	describe('getFlagImg', () => {
		test('should return flag-icons span when no flagsPath set', () => {
			Country.flagsPath = undefined;
			const html = Country.getFlagImg('FR');
			expect(html).toContain('<span');
			expect(html).toContain('fi fi-fr');
		});

		test('should return img tag when flagsPath set', () => {
			Country.setFlagsPath('/flags/');
			const html = Country.getFlagImg('FR');
			expect(html).toContain('<img');
			expect(html).toContain('fr.png');
			expect(html).toContain('class="flag"');
			expect(html).toContain("title=\"France\"");
			Country.flagsPath = undefined;
		});
	});

	describe('getCountryList', () => {
		test('should return the same as getCountries (deprecated)', () => {
			const list = Country.getCountryList();
			const countries = Country.getCountries();
			expect(list).toEqual(countries);
		});
	});

	describe('getFlagEmoji', () => {
		test('should return emoji flag for country code', () => {
			expect(Country.getFlagEmoji('FR')).toBe('🇫🇷');
			expect(Country.getFlagEmoji('US')).toBe('🇺🇸');
			expect(Country.getFlagEmoji('GB')).toBe('🇬🇧');
		});
		test('should handle lowercase country codes', () => {
			expect(Country.getFlagEmoji('fr')).toBe('🇫🇷');
		});
	});

	describe('getCountries with locale', () => {
		test('should auto-register and return names for an unregistered locale', () => {
			const countriesFr = Country.getCountries('fr');
			expect(typeof countriesFr).toBe('object');
			expect(countriesFr.FR).toBe('France');
			expect(typeof countriesFr.US).toBe('string');
		});

		test('should return names for de locale', () => {
			const countriesDe = Country.getCountries('de');
			expect(typeof countriesDe).toBe('object');
			expect(countriesDe.DE).toBeTruthy();
		});

		test('should return empty object for unknown locale', () => {
			const result = Country.getCountries('xx');
			expect(typeof result).toBe('object');
		});
	});

	describe('fillSelect', () => {
		function makeSelect() {
			const options = [];
			return {
				children: options,
				value: null,
				insertAdjacentHTML(position, html) { options.push(html); },
			};
		}

		test('should populate with all countries in given locale', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR');
			expect(select.children.length).toBeGreaterThan(0);
			expect(select.children.some(h => h.includes('value="FR"'))).toBe(true);
			expect(select.children.some(h => h.includes('France'))).toBe(true);
		});

		test('should restrict to provided countriesList', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR', false, ['FR', 'DE', 'US']);
			expect(select.children).toHaveLength(3);
			expect(select.children.some(h => h.includes('value="FR"'))).toBe(true);
			expect(select.children.some(h => h.includes('value="DE"'))).toBe(true);
		});

		test('should add none option when addNoneValue is true', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR', false, ['FR'], true, '-- Aucun --');
			expect(select.children[0]).toContain('value=""');
			expect(select.children[0]).toContain('-- Aucun --');
			expect(select.children).toHaveLength(2);
		});

		test('should add data-content with flag-icons when showFlags is true', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR', true, ['FR']);
			expect(select.children[0]).toContain('data-content=');
			expect(select.children[0]).toContain('fi fi-fr');
		});

		test('should not add options if select already has children', () => {
			const select = makeSelect();
			select.children.push('<option value="FR">France</option>');
			Country.fillSelect(select, null, 'fr-FR');
			expect(select.children).toHaveLength(1);
		});
	});

	describe('fillSelectWithFlags', () => {
		function makeSelect() {
			const options = [];
			return {
				children: options,
				value: null,
				insertAdjacentHTML(position, html) { options.push(html); },
			};
		}

		test('should add data-content with flag-icons', () => {
			const select = makeSelect();
			Country.fillSelectWithFlags(select, null, 'fr-FR', ['FR', 'US']);
			expect(select.children).toHaveLength(2);
			expect(select.children[0]).toContain('fi fi-fr');
			expect(select.children[1]).toContain('fi fi-us');
		});
	});
});

describe('Locale', () => {
	describe('normalize', () => {
		test('should canonicalize to lang-REGION format', () => {
			expect(Locale.normalize('fr-FR')).toBe('fr-FR');
			expect(Locale.normalize('fr-fr')).toBe('fr-FR');
			expect(Locale.normalize('FR-fr')).toBe('fr-FR');
			expect(Locale.normalize('fr_FR')).toBe('fr-FR');
		});

		test('should handle lang-only locales', () => {
			expect(Locale.normalize('fr')).toBe('fr');
			expect(Locale.normalize('EN')).toBe('en');
		});
	});

	describe('getBaseLang', () => {
		test('should extract base language', () => {
			expect(Locale.getBaseLang('fr-FR')).toBe('fr');
			expect(Locale.getBaseLang('en-US')).toBe('en');
			expect(Locale.getBaseLang('fr_FR')).toBe('fr');
		});

		test('should return lang as-is when no region', () => {
			expect(Locale.getBaseLang('fr')).toBe('fr');
		});
	});

	describe('getRegion', () => {
		test('should extract region code', () => {
			expect(Locale.getRegion('fr-FR')).toBe('FR');
			expect(Locale.getRegion('en-US')).toBe('US');
			expect(Locale.getRegion('fr_FR')).toBe('FR');
		});

		test('should return null when no region', () => {
			expect(Locale.getRegion('fr')).toBeNull();
		});
	});

	describe('isValid', () => {
		test('should accept valid locales', () => {
			expect(Locale.isValid('fr')).toBe(true);
			expect(Locale.isValid('fr-FR')).toBe(true);
			expect(Locale.isValid('en-US')).toBe(true);
			expect(Locale.isValid('zh-CN')).toBe(true);
		});

		test('should reject invalid locales', () => {
			expect(Locale.isValid('foobar')).toBe(false);
			expect(Locale.isValid('fr_FR')).toBe(false);
			expect(Locale.isValid('')).toBe(false);
			expect(Locale.isValid('1234')).toBe(false);
		});
	});

	describe('toPOSIX', () => {
		test('should convert to POSIX format', () => {
			expect(Locale.toPOSIX('fr-FR')).toBe('fr_FR');
			expect(Locale.toPOSIX('en-US')).toBe('en_US');
			expect(Locale.toPOSIX('fr_FR')).toBe('fr_FR');
		});

		test('should handle lang-only locales', () => {
			expect(Locale.toPOSIX('fr')).toBe('fr');
		});
	});
});

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

describe('Polygon', () => {
	describe('convertToGeoJson', () => {
		test('should convert latlngs to GeoJSON Polygon', () => {
			const latlngs = [
				{ lat: 48.8, lng: 2.3 },
				{ lat: 48.9, lng: 2.4 },
				{ lat: 48.85, lng: 2.5 }
			];
			const geoJson = Polygon.convertToGeoJson(latlngs);
			expect(geoJson.type).toBe('Polygon');
			expect(geoJson.coordinates[0]).toHaveLength(4); // Should be closed
			expect(geoJson.coordinates[0][0]).toEqual([2.3, 48.8]);
			expect(geoJson.coordinates[0][3]).toEqual([2.3, 48.8]); // Closed
		});

		test('should handle multi-ring polygons', () => {
			const latlngs = [
				[
					{ lat: 48.8, lng: 2.3 },
					{ lat: 48.9, lng: 2.4 },
					{ lat: 48.85, lng: 2.5 }
				]
			];
			const geoJson = Polygon.convertToGeoJson(latlngs);
			expect(geoJson.type).toBe('Polygon');
			expect(geoJson.coordinates).toHaveLength(1);
		});

		test('should not duplicate closing point if already closed', () => {
			const latlngs = [
				{ lat: 48.8, lng: 2.3 },
				{ lat: 48.9, lng: 2.4 },
				{ lat: 48.85, lng: 2.5 },
				{ lat: 48.8, lng: 2.3 }
			];
			const geoJson = Polygon.convertToGeoJson(latlngs);
			expect(geoJson.coordinates[0]).toHaveLength(4);
		});
	});

	describe('format', () => {
		test('should format a valid polygon', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[2.3, 48.8],
					[2.4, 48.9],
					[2.5, 48.85],
					[2.3, 48.8]
				]]
			};
			const formatted = Polygon.format(polygon);
			expect(formatted).toHaveProperty('label');
			expect(formatted).toHaveProperty('title');
			expect(formatted.label).toContain('Polygone de');
			expect(formatted.label).toContain('sommets');
		});

		test('should handle empty polygon', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[]]
			};
			const formatted = Polygon.format(polygon);
			expect(formatted.label).toBe('Polygon (vide)');
		});

		test('should parse JSON string', () => {
			const polygonStr = '{"type":"Polygon","coordinates":[[[2.3,48.8],[2.4,48.9],[2.3,48.8]]]}';
			const formatted = Polygon.format(polygonStr);
			expect(formatted).toHaveProperty('label');
		});
	});

	describe('getStartCoordinates', () => {
		test('should return start coordinates as array', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[2.3, 48.8],
					[2.4, 48.9],
					[2.3, 48.8]
				]]
			};
			const coords = Polygon.getStartCoordinates(polygon);
			expect(coords).toEqual([48.8, 2.3]);
		});

		test('should return start coordinates as string when asString=true', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[2.3, 48.8],
					[2.4, 48.9],
					[2.3, 48.8]
				]]
			};
			const coords = Polygon.getStartCoordinates(polygon, true);
			expect(coords).toBe('48.8,2.3');
		});

		test('should return null for empty polygon', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[]]
			};
			const coords = Polygon.getStartCoordinates(polygon);
			expect(coords).toBeNull();
		});
	});

	describe('isPointOnSegmentDeg', () => {
		test('should return true for point on segment', () => {
			const A = [0, 0];
			const B = [2, 2];
			expect(Polygon.isPointOnSegmentDeg(1, 1, A, B)).toBe(true);
		});

		test('should return false for point not on segment', () => {
			const A = [0, 0];
			const B = [2, 2];
			expect(Polygon.isPointOnSegmentDeg(1, 0, A, B)).toBe(false);
		});

		test('should return true for point at segment endpoints', () => {
			const A = [0, 0];
			const B = [2, 2];
			expect(Polygon.isPointOnSegmentDeg(0, 0, A, B)).toBe(true);
			expect(Polygon.isPointOnSegmentDeg(2, 2, A, B)).toBe(true);
		});
	});

	describe('isPointInRing', () => {
		test('should return true for point inside ring', () => {
			const ring = [
				[0, 0],
				[4, 0],
				[4, 4],
				[0, 4],
				[0, 0]
			];
			expect(Polygon.isPointInRing(2, 2, ring)).toBe(true);
		});

		test('should return false for point outside ring', () => {
			const ring = [
				[0, 0],
				[4, 0],
				[4, 4],
				[0, 4],
				[0, 0]
			];
			expect(Polygon.isPointInRing(5, 5, ring)).toBe(false);
		});

		test('should return true for point on ring edge', () => {
			const ring = [
				[0, 0],
				[4, 0],
				[4, 4],
				[0, 4],
				[0, 0]
			];
			expect(Polygon.isPointInRing(2, 0, ring)).toBe(true);
		});
	});

	describe('isPointInPolygon', () => {
		test('should return true for point inside polygon', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[0, 0],
					[4, 0],
					[4, 4],
					[0, 4],
					[0, 0]
				]]
			};
			expect(Polygon.isPointInPolygon(2, 2, polygon)).toBe(true);
		});

		test('should return false for point outside polygon', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[0, 0],
					[4, 0],
					[4, 4],
					[0, 4],
					[0, 0]
				]]
			};
			expect(Polygon.isPointInPolygon(5, 5, polygon)).toBe(false);
		});

		test('should return false for point in hole', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [
					// Outer ring
					[
						[0, 0],
						[4, 0],
						[4, 4],
						[0, 4],
						[0, 0]
					],
					// Hole
					[
						[1, 1],
						[3, 1],
						[3, 3],
						[1, 3],
						[1, 1]
					]
				]
			};
			expect(Polygon.isPointInPolygon(2, 2, polygon)).toBe(false);
		});
	});

	describe('toLatLngRings', () => {
		test('should convert GeoJSON to LatLng rings', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[2.3, 48.8],
					[2.4, 48.9],
					[2.5, 48.85],
					[2.3, 48.8]
				]]
			};
			const rings = Polygon.toLatLngRings(polygon);
			expect(rings).toHaveLength(1);
			expect(rings[0][0]).toEqual([48.8, 2.3]);
		});

		test('should return false for invalid polygon', () => {
			const polygon = { type: 'Polygon', coordinates: [] };
			expect(Polygon.toLatLngRings(polygon)).toBe(false);
		});

		test('should close unclosed rings', () => {
			const polygon = {
				type: 'Polygon',
				coordinates: [[
					[2.3, 48.8],
					[2.4, 48.9],
					[2.5, 48.85]
				]]
			};
			const rings = Polygon.toLatLngRings(polygon);
			const lastPoint = rings[0][rings[0].length - 1];
			const firstPoint = rings[0][0];
			expect(lastPoint).toEqual(firstPoint);
		});
	});
});

describe('PostalAddress', () => {
	describe('format', () => {
		test('should return a string', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(typeof result).toBe('string');
		});

		test('should contain streetAddress, postalCode and locality', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(result).toContain('10 Rue de la Paix');
			expect(result).toContain('75001');
			expect(result).toContain('Paris');
		});

		test('should use <br/> as default separator', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(result).toContain('<br/>');
			expect(result).not.toContain('\n');
		});

		test('should use custom separator when provided', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			}, ', ');
			expect(result).toContain(', ');
			expect(result).not.toContain('\n');
		});

		test('should include additionalAddress on a separate line', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				additionalAddress: 'Bât. B',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(result).toContain('10 Rue de la Paix');
			expect(result).toContain('Bât. B');
		});

		test('should use suburb as locality fallback when locality is null', () => {
			const result = PostalAddress.format({
				streetAddress: '5 High Street',
				postalCode: 'SW1A 1AA',
				suburb: 'Westminster',
				countryCode: 'GB',
			});
			expect(result).toContain('Westminster');
		});

		test('should use stateDistrict as locality fallback when locality and suburb are null', () => {
			const result = PostalAddress.format({
				streetAddress: '5 High Street',
				postalCode: 'SW1A 1AA',
				stateDistrict: 'Greater London',
				countryCode: 'GB',
			});
			expect(result).toContain('Greater London');
		});

		test('should handle null/undefined optional fields without throwing', () => {
			expect(() => PostalAddress.format({
				streetAddress: null,
				additionalAddress: null,
				postalCode: null,
				locality: null,
				state: null,
				countryCode: null,
			})).not.toThrow();
		});

		test('should handle empty strings for optional fields', () => {
			expect(() => PostalAddress.format({
				streetAddress: '',
				additionalAddress: '',
				postalCode: '',
				locality: '',
				state: '',
				countryCode: '',
			})).not.toThrow();
		});

		test('should include state/region in the formatted address', () => {
			const result = PostalAddress.format({
				streetAddress: '1600 Amphitheatre Pkwy',
				locality: 'Mountain View',
				state: 'CA',
				postalCode: '94043',
				countryCode: 'US',
			});
			expect(result).toContain('CA');
			expect(result).toContain('Mountain View');
			expect(result).toContain('94043');
		});

		test('should place postalCode before locality for FR (countryCode)', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			}, '\n');
			expect(result.indexOf('75001')).toBeLessThan(result.indexOf('Paris'));
		});

		test('should place postalCode before locality for FR (locale parameter, no countryCode)', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
			}, '\n', 'fr-FR');
			expect(result.indexOf('75001')).toBeLessThan(result.indexOf('Paris'));
		});

		test('should place postalCode before locality for FR (locale parameter and countryCode)', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			}, '\n', 'fr-FR');
			expect(result.indexOf('75001')).toBeLessThan(result.indexOf('Paris'));
		});

		test('should place postalCode after locality for US', () => {
			const result = PostalAddress.format({
				streetAddress: '1600 Amphitheatre Pkwy',
				postalCode: '94043',
				locality: 'Mountain View',
				state: 'CA',
				countryCode: 'US',
			}, '\n');
			expect(result.indexOf('94043')).toBeGreaterThan(result.indexOf('Mountain View'));
		});
	});
});