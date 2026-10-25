import { Polygon } from '../../location/Polygon.js';

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