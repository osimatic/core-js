/**
 * @jest-environment jsdom
 */
import { OpenStreetMap, OsmMap } from '../open_street_map.js';
import L from 'leaflet';

function createMockMap(zoom = 6) {
	return {
		setView: jest.fn(),
		getZoom: jest.fn(() => zoom),
		setZoom: jest.fn(),
		fitBounds: jest.fn(),
		invalidateSize: jest.fn(),
		off: jest.fn(),
		remove: jest.fn(),
		addLayer: jest.fn(),
		removeLayer: jest.fn(),
		eachLayer: jest.fn(),
		addControl: jest.fn(),
		on: jest.fn(),
	};
}

function createMockMarker(lat = 48.8566, lng = 2.3522) {
	return {
		on: jest.fn(),
		addTo: jest.fn().mockReturnThis(),
		bindPopup: jest.fn(),
		getLatLng: jest.fn(() => ({ lat, lng })),
	};
}

describe('OpenStreetMap', () => {
	describe('createMap', () => {
		let mockMap;
		let mockTileLayer;
		let domUtilGetSpy;
		let mapSpy;
		let tileLayerSpy;

		beforeEach(() => {
			mockMap = createMockMap();
			mockTileLayer = { addTo: jest.fn() };
			domUtilGetSpy = jest.spyOn(L.DomUtil, 'get').mockReturnValue(null);
			mapSpy = jest.spyOn(L, 'map').mockReturnValue(mockMap);
			tileLayerSpy = jest.spyOn(L, 'tileLayer').mockReturnValue(mockTileLayer);
			jest.spyOn(L, 'latLngBounds').mockReturnValue({ _bounds: [] });
		});

		afterEach(() => jest.restoreAllMocks());

		test('should return null when mapContainer is null', () => {
			const result = OpenStreetMap.createMap(null);
			expect(result).toBeNull();
			expect(mapSpy).not.toHaveBeenCalled();
		});

		test('should return null when mapContainer is undefined', () => {
			const result = OpenStreetMap.createMap(undefined);
			expect(result).toBeNull();
			expect(mapSpy).not.toHaveBeenCalled();
		});

		test('should create and return a Leaflet map for a valid DOM element', () => {
			const div = document.createElement('div');
			document.body.appendChild(div);

			const result = OpenStreetMap.createMap(div);

			expect(mapSpy).toHaveBeenCalledWith(div, {});
			expect(tileLayerSpy).toHaveBeenCalled();
			expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap);
			expect(result).toBe(mockMap);

			document.body.removeChild(div);
		});

		test('should reset _leaflet_id when container already has one', () => {
			const div = document.createElement('div');
			document.body.appendChild(div);
			const existingContainer = { _leaflet_id: 42 };
			domUtilGetSpy.mockReturnValue(existingContainer);

			OpenStreetMap.createMap(div);

			expect(existingContainer._leaflet_id).toBeNull();
			document.body.removeChild(div);
		});

		test('should pass options to L.map', () => {
			const div = document.createElement('div');
			document.body.appendChild(div);

			OpenStreetMap.createMap(div, { zoomControl: false });

			expect(mapSpy).toHaveBeenCalledWith(div, { zoomControl: false });
			document.body.removeChild(div);
		});

		test('should center on France by default', () => {
			const div = document.createElement('div');
			document.body.appendChild(div);

			OpenStreetMap.createMap(div);

			expect(mockMap.fitBounds).toHaveBeenCalled();
			document.body.removeChild(div);
		});
	});

	describe('getUrl', () => {
		test('should generate OpenStreetMap URL with latitude and longitude', () => {
			const url = OpenStreetMap.getUrl(48.8566, 2.3522);
			expect(url).toBe('https://www.openstreetmap.org/?mlat=48.8566&mlon=2.3522#map=17/48.8566/2.3522&layers=N');
		});

		test('should handle negative coordinates', () => {
			const url = OpenStreetMap.getUrl(-33.8688, 151.2093);
			expect(url).toContain('mlat=-33.8688');
			expect(url).toContain('mlon=151.2093');
		});

		test('should handle zero coordinates', () => {
			const url = OpenStreetMap.getUrl(0, 0);
			expect(url).toContain('mlat=0');
			expect(url).toContain('mlon=0');
		});

		test('should include zoom level 17', () => {
			expect(OpenStreetMap.getUrl(48.8566, 2.3522)).toContain('#map=17/');
		});

		test('should include layers=N parameter', () => {
			expect(OpenStreetMap.getUrl(48.8566, 2.3522)).toContain('&layers=N');
		});
	});

	describe('getUrlFromCoordinates', () => {
		test('should parse coordinate string and generate URL', () => {
			const url = OpenStreetMap.getUrlFromCoordinates('48.8566,2.3522');
			expect(url).toBe('https://www.openstreetmap.org/?mlat=48.8566&mlon=2.3522#map=17/48.8566/2.3522&layers=N');
		});

		test('should handle negative coordinates in string', () => {
			const url = OpenStreetMap.getUrlFromCoordinates('-33.8688,151.2093');
			expect(url).toContain('mlat=-33.8688');
			expect(url).toContain('mlon=151.2093');
		});

		test('should parse coordinates with spaces', () => {
			const url = OpenStreetMap.getUrlFromCoordinates('48.8566, 2.3522');
			expect(url).toContain('mlat=48.8566');
			expect(url).toContain('mlon=2.3522');
		});

		test('should handle decimal coordinates', () => {
			const url = OpenStreetMap.getUrlFromCoordinates('48.856614,2.352222');
			expect(url).toContain('mlat=48.856614');
			expect(url).toContain('mlon=2.352222');
		});
	});

	describe('centerOnFrance', () => {
		test('should call setView with France coordinates', () => {
			const mockMap = createMockMap();
			OpenStreetMap.centerOnFrance(mockMap);
			expect(mockMap.setView).toHaveBeenCalledWith([46.52863469527167, 2.43896484375], 6);
		});

		test('should use zoom level 6', () => {
			const mockMap = createMockMap();
			OpenStreetMap.centerOnFrance(mockMap);
			expect(mockMap.setView).toHaveBeenCalledWith(expect.any(Array), 6);
		});

		test('should not throw when map is null', () => {
			expect(() => OpenStreetMap.centerOnFrance(null)).not.toThrow();
		});
	});

	describe('getCountryBoundingBoxes', () => {
		test('should return object with country codes', () => {
			const boxes = OpenStreetMap.getCountryBoundingBoxes();
			expect(typeof boxes).toBe('object');
			expect(boxes).toHaveProperty('fr');
			expect(boxes).toHaveProperty('de');
			expect(boxes).toHaveProperty('us');
		});

		test('should have France bounding box', () => {
			expect(OpenStreetMap.getCountryBoundingBoxes().fr).toEqual([[41.333, -5.142], [51.091, 9.559]]);
		});

		test('should have Germany bounding box', () => {
			expect(OpenStreetMap.getCountryBoundingBoxes().de).toEqual([[47.270, 5.866], [55.058, 15.041]]);
		});

		test('should have USA bounding box', () => {
			expect(OpenStreetMap.getCountryBoundingBoxes().us).toEqual([[24.396, -124.848], [49.384, -66.885]]);
		});

		test('should include European countries', () => {
			const boxes = OpenStreetMap.getCountryBoundingBoxes();
			['fr', 'de', 'es', 'it', 'gb'].forEach(c => expect(boxes).toHaveProperty(c));
		});

		test('should include Asian countries', () => {
			const boxes = OpenStreetMap.getCountryBoundingBoxes();
			['cn', 'in', 'jp'].forEach(c => expect(boxes).toHaveProperty(c));
		});

		test('should include American countries', () => {
			const boxes = OpenStreetMap.getCountryBoundingBoxes();
			['us', 'ca', 'br', 'mx'].forEach(c => expect(boxes).toHaveProperty(c));
		});

		test('should include African countries', () => {
			const boxes = OpenStreetMap.getCountryBoundingBoxes();
			['ma', 'eg', 'za'].forEach(c => expect(boxes).toHaveProperty(c));
		});

		test('should have bounding box format [[S,W], [N,E]]', () => {
			const frBox = OpenStreetMap.getCountryBoundingBoxes().fr;
			expect(Array.isArray(frBox)).toBe(true);
			expect(frBox).toHaveLength(2);
			expect(frBox[0]).toHaveLength(2);
			expect(frBox[1]).toHaveLength(2);
		});
	});

	describe('getCountryBoundingBox', () => {
		test('should return bounding box for France', () => {
			expect(OpenStreetMap.getCountryBoundingBox('FR')).toEqual([[41.333, -5.142], [51.091, 9.559]]);
		});

		test('should be case insensitive', () => {
			const box = OpenStreetMap.getCountryBoundingBox('FR');
			expect(OpenStreetMap.getCountryBoundingBox('fr')).toEqual(box);
			expect(OpenStreetMap.getCountryBoundingBox('Fr')).toEqual(box);
		});

		test('should handle whitespace in country code', () => {
			expect(OpenStreetMap.getCountryBoundingBox(' FR ')).toEqual([[41.333, -5.142], [51.091, 9.559]]);
		});

		test('should return null for unknown country code', () => {
			expect(OpenStreetMap.getCountryBoundingBox('XX')).toBeNull();
		});

		test('should return null for empty string', () => {
			expect(OpenStreetMap.getCountryBoundingBox('')).toBeNull();
		});

		test('should return null for null', () => {
			expect(OpenStreetMap.getCountryBoundingBox(null)).toBeNull();
		});

		test('should return null for undefined', () => {
			expect(OpenStreetMap.getCountryBoundingBox(undefined)).toBeNull();
		});

		test('should return bounding box for Germany', () => {
			expect(OpenStreetMap.getCountryBoundingBox('DE')).toEqual([[47.270, 5.866], [55.058, 15.041]]);
		});

		test('should return bounding box for USA', () => {
			expect(OpenStreetMap.getCountryBoundingBox('US')).toEqual([[24.396, -124.848], [49.384, -66.885]]);
		});

		test('should return bounding box for Japan', () => {
			expect(OpenStreetMap.getCountryBoundingBox('JP')).toEqual([[24.249, 122.938], [45.557, 153.987]]);
		});

		test('should return bounding box for Brazil', () => {
			expect(OpenStreetMap.getCountryBoundingBox('BR')).toEqual([[-33.751, -73.987], [5.271, -34.729]]);
		});
	});

	describe('centerMapOnCountry', () => {
		let mockMap;

		beforeEach(() => {
			mockMap = createMockMap();
			jest.spyOn(L, 'latLngBounds').mockReturnValue({ _bounds: [] });
		});

		afterEach(() => jest.restoreAllMocks());

		test('should not throw when map is null', () => {
			expect(() => OpenStreetMap.centerMapOnCountry(null, 'FR')).not.toThrow();
		});

		test('should not call fitBounds for unknown country', () => {
			OpenStreetMap.centerMapOnCountry(mockMap, 'XX');
			expect(mockMap.fitBounds).not.toHaveBeenCalled();
		});

		test('should call fitBounds for known country', () => {
			OpenStreetMap.centerMapOnCountry(mockMap, 'FR');
			expect(mockMap.fitBounds).toHaveBeenCalled();
		});

		test('should be case insensitive', () => {
			OpenStreetMap.centerMapOnCountry(mockMap, 'fr');
			expect(mockMap.fitBounds).toHaveBeenCalled();
		});

		test('should enforce minZoom when current zoom is too low', () => {
			mockMap.getZoom.mockReturnValue(1);
			OpenStreetMap.centerMapOnCountry(mockMap, 'FR');
			expect(mockMap.setZoom).toHaveBeenCalledWith(3);
		});

		test('should not enforce minZoom when zoom is sufficient', () => {
			mockMap.getZoom.mockReturnValue(6);
			OpenStreetMap.centerMapOnCountry(mockMap, 'FR');
			expect(mockMap.setZoom).not.toHaveBeenCalled();
		});
	});

	describe('centerMapToLocations', () => {
		let mockMap;

		beforeEach(() => {
			mockMap = createMockMap(12);
			jest.spyOn(L, 'latLngBounds').mockReturnValue({ _bounds: [] });
		});

		afterEach(() => jest.restoreAllMocks());

		test('should call fitBounds with location bounds', () => {
			const locations = [[48.8566, 2.3522], [48.8606, 2.3376]];
			OpenStreetMap.centerMapToLocations(mockMap, locations);
			expect(mockMap.invalidateSize).toHaveBeenCalledWith(false);
			expect(mockMap.fitBounds).toHaveBeenCalled();
		});

		test('should not do anything when map is null', () => {
			OpenStreetMap.centerMapToLocations(null, [[48.8566, 2.3522]]);
			expect(mockMap.invalidateSize).not.toHaveBeenCalled();
		});

		test('should not do anything when locations list is empty', () => {
			OpenStreetMap.centerMapToLocations(mockMap, []);
			expect(mockMap.invalidateSize).not.toHaveBeenCalled();
		});

		test('should set zoom to maxZoom if current zoom exceeds it', () => {
			mockMap.getZoom.mockReturnValue(20);
			OpenStreetMap.centerMapToLocations(mockMap, [[48.8566, 2.3522]], [20, 20], 18);
			expect(mockMap.setZoom).toHaveBeenCalledWith(18);
		});

		test('should use custom padding', () => {
			OpenStreetMap.centerMapToLocations(mockMap, [[48.8566, 2.3522]], [50, 50]);
			expect(mockMap.fitBounds).toHaveBeenCalledWith(expect.anything(), { padding: [50, 50] });
		});
	});

	describe('centerMapToGooglePlace', () => {
		test('should call setView with place location', () => {
			const mockMap = createMockMap(10);
			const place = { geometry: { location: { lat: () => 48.8566, lng: () => 2.3522 } } };
			OpenStreetMap.centerMapToGooglePlace(mockMap, place);
			expect(mockMap.setView).toHaveBeenCalledWith([48.8566, 2.3522], 15);
		});

		test('should not throw when place is null', () => {
			expect(() => OpenStreetMap.centerMapToGooglePlace(createMockMap(), null)).not.toThrow();
		});

		test('should not throw when place has no geometry', () => {
			expect(() => OpenStreetMap.centerMapToGooglePlace(createMockMap(), {})).not.toThrow();
		});
	});

	describe('centerMapToCoordinates', () => {
		test('should call setView with provided coordinates', () => {
			const mockMap = createMockMap(10);
			OpenStreetMap.centerMapToCoordinates(mockMap, 48.8566, 2.3522);
			expect(mockMap.setView).toHaveBeenCalledWith([48.8566, 2.3522], 15);
		});

		test('should use minimum zoom of 15 if current zoom is lower', () => {
			const mockMap = createMockMap(10);
			OpenStreetMap.centerMapToCoordinates(mockMap, 48.8566, 2.3522);
			expect(mockMap.setView).toHaveBeenCalledWith(expect.any(Array), 15);
		});

		test('should keep current zoom if higher than 15', () => {
			const mockMap = createMockMap(18);
			OpenStreetMap.centerMapToCoordinates(mockMap, 48.8566, 2.3522);
			expect(mockMap.setView).toHaveBeenCalledWith(expect.any(Array), 18);
		});

		test('should not call setView when map is null', () => {
			const mockMap = createMockMap(10);
			OpenStreetMap.centerMapToCoordinates(null, 48.8566, 2.3522);
			expect(mockMap.setView).not.toHaveBeenCalled();
		});

		test('should handle negative coordinates', () => {
			const mockMap = createMockMap(10);
			OpenStreetMap.centerMapToCoordinates(mockMap, -33.8688, 151.2093);
			expect(mockMap.setView).toHaveBeenCalledWith([-33.8688, 151.2093], 15);
		});
	});

	describe('clearSelections', () => {
		test('should call eachLayer on map', () => {
			const mockMap = createMockMap();
			mockMap.eachLayer = jest.fn();
			OpenStreetMap.clearSelections(mockMap);
			expect(mockMap.eachLayer).toHaveBeenCalled();
		});

		test('should remove L.Marker layers', () => {
			const removeSpy = jest.spyOn(L.Marker.prototype, 'remove').mockImplementation(() => {});
			const mockMap = createMockMap();
			mockMap.eachLayer = jest.fn((cb) => { cb(new L.Marker([0, 0])); });

			OpenStreetMap.clearSelections(mockMap);

			expect(removeSpy).toHaveBeenCalled();
			removeSpy.mockRestore();
		});

		test('should not throw when map is null', () => {
			expect(() => OpenStreetMap.clearSelections(null)).not.toThrow();
		});
	});

	describe('addTempMarker', () => {
		let mockMarker;

		beforeEach(() => {
			mockMarker = { on: jest.fn() };
			jest.spyOn(L, 'marker').mockReturnValue(mockMarker);
		});

		afterEach(() => jest.restoreAllMocks());

		test('should create a draggable marker and add it to the map', () => {
			const mockMap = createMockMap();
			const result = OpenStreetMap.addTempMarker(mockMap, 48.8566, 2.3522);
			expect(L.marker).toHaveBeenCalledWith([48.8566, 2.3522], { draggable: true });
			expect(mockMap.addLayer).toHaveBeenCalledWith(mockMarker);
			expect(result).toBe(mockMarker);
		});

		test('should register dragend when onDragEnd is provided', () => {
			OpenStreetMap.addTempMarker(createMockMap(), 48.8566, 2.3522, jest.fn());
			expect(mockMarker.on).toHaveBeenCalledWith('dragend', expect.any(Function));
		});

		test('should not register dragend when onDragEnd is not provided', () => {
			OpenStreetMap.addTempMarker(createMockMap(), 48.8566, 2.3522);
			expect(mockMarker.on).not.toHaveBeenCalled();
		});

		test('should call onDragEnd with the marker on dragend', () => {
			const onDragEnd = jest.fn();
			let dragEndHandler;
			mockMarker.on = jest.fn((event, handler) => { dragEndHandler = handler; });

			OpenStreetMap.addTempMarker(createMockMap(), 48.8566, 2.3522, onDragEnd);
			dragEndHandler({ target: mockMarker });

			expect(onDragEnd).toHaveBeenCalledWith(mockMarker);
		});
	});

	describe('resetTempSelection', () => {
		test('should remove tempLayer from map', () => {
			const mockMap = createMockMap();
			OpenStreetMap.resetTempSelection(mockMap, {});
			expect(mockMap.removeLayer).toHaveBeenCalled();
		});

		test('should not call removeLayer when tempLayer is null', () => {
			const mockMap = createMockMap();
			OpenStreetMap.resetTempSelection(mockMap, null);
			expect(mockMap.removeLayer).not.toHaveBeenCalled();
		});

		test('should not throw when both are null', () => {
			expect(() => OpenStreetMap.resetTempSelection(null, null)).not.toThrow();
		});
	});

	describe('destroyMap', () => {
		test('should call off and remove on map', () => {
			const mockMap = createMockMap();
			OpenStreetMap.destroyMap(mockMap);
			expect(mockMap.off).toHaveBeenCalled();
			expect(mockMap.remove).toHaveBeenCalled();
		});

		test('should not throw when map is null', () => {
			expect(() => OpenStreetMap.destroyMap(null)).not.toThrow();
		});
	});

	describe('setZoom', () => {
		test('should call setZoom on map', () => {
			const mockMap = createMockMap();
			OpenStreetMap.setZoom(mockMap, 12);
			expect(mockMap.setZoom).toHaveBeenCalledWith(12);
		});

		test('should not throw when map is null', () => {
			expect(() => OpenStreetMap.setZoom(null, 12)).not.toThrow();
		});
	});

	describe('setView', () => {
		test('should call setView on map', () => {
			const mockMap = createMockMap();
			OpenStreetMap.setView(mockMap, [48.8566, 2.3522], 12);
			expect(mockMap.setView).toHaveBeenCalledWith([48.8566, 2.3522], 12);
		});

		test('should not throw when map is null', () => {
			expect(() => OpenStreetMap.setView(null, [0, 0], 10)).not.toThrow();
		});
	});

	describe('addMarker', () => {
		let mockMarker;

		beforeEach(() => {
			mockMarker = createMockMarker();
			jest.spyOn(L, 'marker').mockReturnValue(mockMarker);
			jest.spyOn(L, 'icon').mockReturnValue({});
		});

		afterEach(() => jest.restoreAllMocks());

		test('should return null when map is null', () => {
			expect(OpenStreetMap.addMarker(null, '48.8566,2.3522', {})).toBeNull();
		});

		test('should create marker at parsed coordinates', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', {});
			expect(L.marker).toHaveBeenCalledWith([48.8566, 2.3522], expect.any(Object));
		});

		test('should set icon when provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', { icon: '/img/marker.png' });
			expect(L.icon).toHaveBeenCalledWith({ iconUrl: '/img/marker.png', iconSize: [22, 32] });
		});

		test('should not set icon when not provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', {});
			expect(L.icon).not.toHaveBeenCalled();
		});

		test('should set title when provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', { title: 'Test' });
			expect(L.marker).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ title: 'Test' }));
		});

		test('should bind popup when provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', { popup: '<p>info</p>' });
			expect(mockMarker.bindPopup).toHaveBeenCalledWith('<p>info</p>');
		});

		test('should not bind popup when not provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', {});
			expect(mockMarker.bindPopup).not.toHaveBeenCalled();
		});

		test('should add marker to map', () => {
			const mockMap = createMockMap();
			OpenStreetMap.addMarker(mockMap, '48.8566,2.3522', {});
			expect(mockMarker.addTo).toHaveBeenCalledWith(mockMap);
		});

		test('should return the marker', () => {
			expect(OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', {})).toBe(mockMarker);
		});

		test('should register popupopen when on_click is provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', { on_click: jest.fn() });
			expect(mockMarker.on).toHaveBeenCalledWith('popupopen', expect.any(Function));
		});

		test('should not register popupopen when no callbacks provided', () => {
			OpenStreetMap.addMarker(createMockMap(), '48.8566,2.3522', {});
			expect(mockMarker.on).not.toHaveBeenCalled();
		});
	});

	describe('addMarkers', () => {
		beforeEach(() => {
			jest.spyOn(L, 'marker').mockReturnValue(createMockMarker());
			jest.spyOn(L, 'icon').mockReturnValue({});
		});

		afterEach(() => jest.restoreAllMocks());

		test('should return empty array when map is null', () => {
			expect(OpenStreetMap.addMarkers(null, ['48.8566,2.3522'], {})).toEqual([]);
		});

		test('should return empty array when list is empty', () => {
			expect(OpenStreetMap.addMarkers(createMockMap(), [], {})).toEqual([]);
		});

		test('should return one marker per location', () => {
			const result = OpenStreetMap.addMarkers(createMockMap(), ['48.8566,2.3522', '48.86,2.35'], {});
			expect(result).toHaveLength(2);
		});
	});

	describe('connectMarkers', () => {
		let mockPolyline;

		beforeEach(() => {
			mockPolyline = { addTo: jest.fn() };
			jest.spyOn(L, 'polyline').mockReturnValue(mockPolyline);
		});

		afterEach(() => jest.restoreAllMocks());

		test('should not draw when locations is empty', () => {
			OpenStreetMap.connectMarkers(createMockMap(), []);
			expect(L.polyline).not.toHaveBeenCalled();
		});

		test('should not draw when map is null', () => {
			OpenStreetMap.connectMarkers(null, [[0, 0], [1, 1]]);
			expect(L.polyline).not.toHaveBeenCalled();
		});

		test('should not draw with only one location', () => {
			OpenStreetMap.connectMarkers(createMockMap(), [[0, 0]]);
			expect(L.polyline).not.toHaveBeenCalled();
		});

		test('should draw n-1 polylines for n locations', () => {
			OpenStreetMap.connectMarkers(createMockMap(), [[0, 0], [1, 1], [2, 2]]);
			expect(L.polyline).toHaveBeenCalledTimes(2);
		});
	});
});

describe('OsmMap', () => {
	let mockMap;

	beforeEach(() => {
		mockMap = createMockMap();
		jest.spyOn(L.DomUtil, 'get').mockReturnValue(null);
		jest.spyOn(L, 'map').mockReturnValue(mockMap);
		jest.spyOn(L, 'tileLayer').mockReturnValue({ addTo: jest.fn() });
		jest.spyOn(L, 'latLngBounds').mockReturnValue({ _bounds: [] });
	});

	afterEach(() => jest.restoreAllMocks());

	function makeOsmMap() {
		const div = document.createElement('div');
		document.body.appendChild(div);
		const osmMap = new OsmMap(div);
		document.body.removeChild(div);
		return osmMap;
	}

	test('constructor initializes markers, locations, tempSelection, tempLayer', () => {
		const osmMap = makeOsmMap();
		expect(osmMap.markers).toEqual([]);
		expect(osmMap.locations).toEqual([]);
		expect(osmMap.tempSelection).toBeNull();
		expect(osmMap.tempLayer).toBeNull();
		expect(osmMap.map).toBe(mockMap);
	});

	test('setZoom delegates to map', () => {
		makeOsmMap().setZoom(12);
		expect(mockMap.setZoom).toHaveBeenCalledWith(12);
	});

	test('deleteMarkers clears markers and locations', () => {
		const osmMap = makeOsmMap();
		osmMap.markers.push({});
		osmMap.locations.push([0, 0]);
		osmMap.deleteMarkers();
		expect(osmMap.markers).toHaveLength(0);
		expect(osmMap.locations).toHaveLength(0);
	});

	test('clearSelections calls eachLayer on map', () => {
		mockMap.eachLayer = jest.fn();
		makeOsmMap().clearSelections();
		expect(mockMap.eachLayer).toHaveBeenCalled();
	});

	test('addTempMarker sets tempLayer', () => {
		const mockTempMarker = { on: jest.fn() };
		jest.spyOn(L, 'marker').mockReturnValue(mockTempMarker);

		const osmMap = makeOsmMap();
		osmMap.addTempMarker(48.8566, 2.3522);

		expect(osmMap.tempLayer).toBe(mockTempMarker);
	});

	test('addTempMarker updates tempSelection on dragend', () => {
		let dragEndHandler;
		const mockTempMarker = {
			on: jest.fn((e, h) => { dragEndHandler = h; }),
			getLatLng: jest.fn(() => ({ lat: 48.86, lng: 2.35 })),
		};
		jest.spyOn(L, 'marker').mockReturnValue(mockTempMarker);

		const osmMap = makeOsmMap();
		osmMap.addTempMarker(48.8566, 2.3522);
		dragEndHandler({ target: mockTempMarker });

		expect(osmMap.tempSelection).toEqual({ type: 'point', lat: 48.86, long: 2.35 });
	});

	test('resetTempSelection removes tempLayer and resets state', () => {
		const osmMap = makeOsmMap();
		const mockLayer = {};
		osmMap.tempLayer = mockLayer;
		osmMap.tempSelection = { type: 'point', lat: 1, long: 2 };

		osmMap.resetTempSelection();

		expect(mockMap.removeLayer).toHaveBeenCalledWith(mockLayer);
		expect(osmMap.tempLayer).toBeNull();
		expect(osmMap.tempSelection).toBeNull();
	});

	test('addMarker pushes to markers and locations', () => {
		const mockMarker = createMockMarker(48.8566, 2.3522);
		jest.spyOn(L, 'marker').mockReturnValue(mockMarker);
		jest.spyOn(L, 'icon').mockReturnValue({});

		const osmMap = makeOsmMap();
		osmMap.addMarker('48.8566,2.3522', {});

		expect(osmMap.markers).toHaveLength(1);
		expect(osmMap.locations).toEqual([[48.8566, 2.3522]]);
	});

	test('addMarker does nothing when map is null', () => {
		const osmMap = makeOsmMap();
		osmMap.map = null;
		osmMap.addMarker('48.8566,2.3522', {});
		expect(osmMap.markers).toHaveLength(0);
	});

	test('addMarkers pushes all markers to markers and locations', () => {
		jest.spyOn(L, 'marker').mockReturnValue(createMockMarker());
		jest.spyOn(L, 'icon').mockReturnValue({});

		const osmMap = makeOsmMap();
		osmMap.addMarkers(['48.8566,2.3522', '48.86,2.35'], {});

		expect(osmMap.markers).toHaveLength(2);
		expect(osmMap.locations).toHaveLength(2);
	});

	test('setView delegates to map', () => {
		makeOsmMap().setView([48.8566, 2.3522], 10);
		expect(mockMap.setView).toHaveBeenCalledWith([48.8566, 2.3522], 10);
	});

	test('centerOnFrance calls setView with France coords', () => {
		makeOsmMap().centerOnFrance();
		expect(mockMap.setView).toHaveBeenCalledWith([46.52863469527167, 2.43896484375], 6);
	});

	test('centerOnCountry calls fitBounds for known country', () => {
		makeOsmMap().centerOnCountry('FR');
		expect(mockMap.fitBounds).toHaveBeenCalled();
	});

	test('centerOnMarkers calls fitBounds with locations', () => {
		const osmMap = makeOsmMap();
		osmMap.locations = [[48.8566, 2.3522]];
		osmMap.centerOnMarkers([20, 20]);
		expect(mockMap.invalidateSize).toHaveBeenCalled();
		expect(mockMap.fitBounds).toHaveBeenCalled();
	});

	test('centerOnGooglePlace calls setView with place coords', () => {
		const place = { geometry: { location: { lat: () => 48.8566, lng: () => 2.3522 } } };
		makeOsmMap().centerOnGooglePlace(place);
		expect(mockMap.setView).toHaveBeenCalledWith([48.8566, 2.3522], 15);
	});

	test('centerOnCoordinates calls setView', () => {
		makeOsmMap().centerOnCoordinates(48.8566, 2.3522);
		expect(mockMap.setView).toHaveBeenCalledWith([48.8566, 2.3522], 15);
	});

	test('connectMarkers draws polylines between locations', () => {
		jest.spyOn(L, 'polyline').mockReturnValue({ addTo: jest.fn() });

		const osmMap = makeOsmMap();
		osmMap.locations = [[0, 0], [1, 1], [2, 2]];
		osmMap.connectMarkers();

		expect(L.polyline).toHaveBeenCalledTimes(2);
	});

	test('destroyMap calls off and remove', () => {
		makeOsmMap().destroyMap();
		expect(mockMap.off).toHaveBeenCalled();
		expect(mockMap.remove).toHaveBeenCalled();
	});
});