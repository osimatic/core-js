/**
 * @jest-environment jsdom
 */
import { GoogleMap } from '../google_maps.js';

describe('GoogleMap', () => {
	let mockMap;
	let mockMarker;
	let mockInfoWindow;
	let mockLatLng;
	let mockLatLngBounds;
	let mockPolyline;
	let capturedMarkerClickCallback;

	beforeEach(() => {
		// Mock LatLng
		mockLatLng = jest.fn(function(lat, lng) {
			this.lat = () => lat;
			this.lng = () => lng;
			this._lat = lat;
			this._lng = lng;
		});

		// Mock LatLngBounds
		mockLatLngBounds = jest.fn(function() {
			this.points = [];
			this.extend = jest.fn(function(latLng) {
				this.points.push(latLng);
			});
			this.getCenter = jest.fn(function() {
				if (this.points.length === 0) {
					return new mockLatLng(0, 0);
				}
				const avgLat = this.points.reduce((sum, p) => sum + p._lat, 0) / this.points.length;
				const avgLng = this.points.reduce((sum, p) => sum + p._lng, 0) / this.points.length;
				return new mockLatLng(avgLat, avgLng);
			});
		});

		// Mock Marker
		mockMarker = jest.fn(function(options) {
			this.options = options;
			this.position = options.position;
			this.map = options.map;
			this.title = options.title;
			this.icon = options.icon;
			this.listeners = {};
			this.setMap = jest.fn(function(map) {
				this.map = map;
			});
			this.addListener = jest.fn(function(event, callback) {
				this.listeners[event] = callback;
				capturedMarkerClickCallback = callback;
			});
		});

		// Mock InfoWindow
		mockInfoWindow = jest.fn(function(options) {
			this.content = options.content;
			this.open = jest.fn();
		});

		// Mock Polyline
		mockPolyline = jest.fn(function(options) {
			this.path = options.path;
			this.setMap = jest.fn();
		});

		// Mock Map
		mockMap = {
			setCenter: jest.fn(),
			setZoom: jest.fn(),
			fitBounds: jest.fn()
		};

		// Mock google.maps
		global.google = {
			maps: {
				Map: jest.fn(() => mockMap),
				Marker: mockMarker,
				LatLng: mockLatLng,
				LatLngBounds: mockLatLngBounds,
				InfoWindow: mockInfoWindow,
				Polyline: mockPolyline
			}
		};

		// Mock document.getElementById
		document.getElementById = jest.fn((id) => {
			return { id: id };
		});

		// Clear captured callbacks
		capturedMarkerClickCallback = null;
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete global.google;
	});

	describe('constructor', () => {
		test('should return early when element does not exist', () => {
			document.getElementById = jest.fn(() => null);

			const googleMap = new GoogleMap('nonexistent');

			expect(googleMap.mapId).toBe('nonexistent');
			expect(googleMap.map).toBeUndefined();
		});

		test('should initialize map with correct properties', () => {
			const googleMap = new GoogleMap('map-id');

			expect(googleMap.markers).toEqual([]);
			expect(googleMap.locations).toEqual([]);
			expect(googleMap.mapId).toBe('map-id');
		});

		test('should create Google Map instance', () => {
			const googleMap = new GoogleMap('map-id');

			expect(global.google.maps.Map).toHaveBeenCalledWith(
				{ id: 'map-id' },
				{ maxZoom: 18 }
			);
			expect(googleMap.map).toBe(mockMap);
		});

		test('should center on France after initialization', () => {
			const googleMap = new GoogleMap('map-id');

			expect(mockMap.setCenter).toHaveBeenCalledWith({
				lat: 46.52863469527167,
				lng: 2.43896484375
			});
			expect(mockMap.setZoom).toHaveBeenCalledWith(6);
		});

		test('should check if element exists via getElementById', () => {
			const googleMap = new GoogleMap('my-map');

			expect(document.getElementById).toHaveBeenCalledWith('my-map');
		});
	});

	describe('static getUrl', () => {
		test('should return correct Google Maps URL', () => {
			const url = GoogleMap.getUrl(48.8566, 2.3522);

			expect(url).toBe('https://maps.google.com/?q=48.8566,2.3522');
		});

		test('should handle negative coordinates', () => {
			const url = GoogleMap.getUrl(-33.8688, 151.2093);

			expect(url).toBe('https://maps.google.com/?q=-33.8688,151.2093');
		});

		test('should handle zero coordinates', () => {
			const url = GoogleMap.getUrl(0, 0);

			expect(url).toBe('https://maps.google.com/?q=0,0');
		});
	});

	describe('static getUrlFromCoordinates', () => {
		test('should parse coordinates string and return URL', () => {
			const url = GoogleMap.getUrlFromCoordinates('48.8566,2.3522');

			expect(url).toBe('https://maps.google.com/?q=48.8566,2.3522');
		});

		test('should handle coordinates with spaces', () => {
			const url = GoogleMap.getUrlFromCoordinates('48.8566, 2.3522');

			expect(url).toBe('https://maps.google.com/?q=48.8566,2.3522');
		});

		test('should handle negative coordinates in string', () => {
			const url = GoogleMap.getUrlFromCoordinates('-33.8688,151.2093');

			expect(url).toBe('https://maps.google.com/?q=-33.8688,151.2093');
		});
	});

	describe('deleteMarkers', () => {
		test('should clear locations array', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];

			googleMap.deleteMarkers();

			expect(googleMap.locations).toEqual([]);
		});

		test('should remove all markers from map', () => {
			const googleMap = new GoogleMap('map-id');
			const marker1 = new mockMarker({ map: mockMap });
			const marker2 = new mockMarker({ map: mockMap });
			googleMap.markers = [marker1, marker2];

			googleMap.deleteMarkers();

			expect(marker1.setMap).toHaveBeenCalledWith(null);
			expect(marker2.setMap).toHaveBeenCalledWith(null);
		});

		test('should clear markers array', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.markers = [new mockMarker({}), new mockMarker({})];

			googleMap.deleteMarkers();

			expect(googleMap.markers).toEqual([]);
			expect(googleMap.markers.length).toBe(0);
		});

		test('should handle empty markers array', () => {
			const googleMap = new GoogleMap('map-id');

			expect(() => {
				googleMap.deleteMarkers();
			}).not.toThrow();
		});
	});

	describe('addMarkers', () => {
		test('should return early when list is empty', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.addMarkers([], null);

			expect(googleMap.markers.length).toBe(0);
		});

		test('should add multiple markers', () => {
			const googleMap = new GoogleMap('map-id');
			const locations = ['48.8566,2.3522', '45.764,4.8357', '43.2965,5.3698'];

			googleMap.addMarkers(locations, 'icon.png');

			expect(googleMap.markers.length).toBe(3);
			expect(googleMap.locations.length).toBe(3);
		});

		test('should pass icon to each marker', () => {
			const googleMap = new GoogleMap('map-id');
			const locations = ['48.8566,2.3522', '45.764,4.8357'];
			const icon = 'custom-icon.png';

			googleMap.addMarkers(locations, icon);

			expect(mockMarker).toHaveBeenCalledTimes(2);
			googleMap.markers.forEach(marker => {
				expect(marker.icon).toBe(icon);
			});
		});
	});

	describe('addMarker', () => {
		test('should create marker with correct position', () => {
			const googleMap = new GoogleMap('map-id');
			const coordinates = '48.8566,2.3522';

			googleMap.addMarker(coordinates);

			expect(mockLatLng).toHaveBeenCalledWith(48.8566, 2.3522);
			expect(mockMarker).toHaveBeenCalled();
		});

		test('should add marker to markers array', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.addMarker('48.8566,2.3522');

			expect(googleMap.markers.length).toBe(1);
		});

		test('should add location to locations array', () => {
			const googleMap = new GoogleMap('map-id');
			const coordinates = '48.8566,2.3522';

			googleMap.addMarker(coordinates);

			expect(googleMap.locations).toContain(coordinates);
		});

		test('should create marker with icon', () => {
			const googleMap = new GoogleMap('map-id');
			const icon = 'marker-icon.png';

			googleMap.addMarker('48.8566,2.3522', icon);

			const markerOptions = mockMarker.mock.calls[0][0];
			expect(markerOptions.icon).toBe(icon);
		});

		test('should create marker with default title when no infoWindow', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.addMarker('48.8566,2.3522');

			const markerOptions = mockMarker.mock.calls[0][0];
			expect(markerOptions.title).toBe('Marker');
		});

		test('should create marker with custom title from infoWindow', () => {
			const googleMap = new GoogleMap('map-id');
			const infoWindowContent = {
				title: 'Custom Title',
				content: '<div>Content</div>'
			};

			googleMap.addMarker('48.8566,2.3522', null, infoWindowContent);

			const markerOptions = mockMarker.mock.calls[0][0];
			expect(markerOptions.title).toBe('Custom Title');
		});

		test('should create InfoWindow when content provided', () => {
			const googleMap = new GoogleMap('map-id');
			const infoWindowContent = {
				title: 'Title',
				content: '<div>Info content</div>'
			};

			googleMap.addMarker('48.8566,2.3522', null, infoWindowContent);

			expect(mockInfoWindow).toHaveBeenCalledWith({
				content: '<div>Info content</div>'
			});
		});

		test('should add click listener when infoWindow provided', () => {
			const googleMap = new GoogleMap('map-id');
			const infoWindowContent = {
				title: 'Title',
				content: '<div>Content</div>'
			};

			googleMap.addMarker('48.8566,2.3522', null, infoWindowContent);

			const marker = googleMap.markers[0];
			expect(marker.addListener).toHaveBeenCalledWith('click', expect.any(Function));
		});

		test('should open InfoWindow on marker click', () => {
			const googleMap = new GoogleMap('map-id');
			const infoWindowContent = {
				title: 'Title',
				content: '<div>Content</div>'
			};

			googleMap.addMarker('48.8566,2.3522', null, infoWindowContent);

			// Trigger the click callback with the map context
			capturedMarkerClickCallback.call({ map: googleMap.map });

			const infoWindow = mockInfoWindow.mock.instances[0];
			expect(infoWindow.open).toHaveBeenCalled();
		});

		test('should call markerOnClickCallback when provided', () => {
			const googleMap = new GoogleMap('map-id');
			const infoWindowContent = {
				title: 'Title',
				content: '<div>Content</div>'
			};
			const callback = jest.fn();

			googleMap.addMarker('48.8566,2.3522', null, infoWindowContent, callback);

			// Trigger the click callback with the map context
			capturedMarkerClickCallback.call({ map: googleMap.map });

			expect(callback).toHaveBeenCalled();
		});

		test('should not call markerOnClickCallback if not a function', () => {
			const googleMap = new GoogleMap('map-id');
			const infoWindowContent = {
				title: 'Title',
				content: '<div>Content</div>'
			};

			expect(() => {
				googleMap.addMarker('48.8566,2.3522', null, infoWindowContent, 'not-a-function');
				capturedMarkerClickCallback.call({ map: googleMap.map });
			}).not.toThrow();
		});

		test('should return LatLng object', () => {
			const googleMap = new GoogleMap('map-id');

			const result = googleMap.addMarker('48.8566,2.3522');

			expect(result).toBeInstanceOf(mockLatLng);
			expect(result.lat()).toBe(48.8566);
			expect(result.lng()).toBe(2.3522);
		});

		test('should not create InfoWindow when content is undefined', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.addMarker('48.8566,2.3522', null, undefined);

			expect(mockInfoWindow).not.toHaveBeenCalled();
		});

		test('should not create InfoWindow when content is null', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.addMarker('48.8566,2.3522', null, null);

			expect(mockInfoWindow).not.toHaveBeenCalled();
		});
	});

	describe('centerOnFrance', () => {
		test('should set center to France coordinates', () => {
			const googleMap = new GoogleMap('map-id');
			jest.clearAllMocks();

			googleMap.centerOnFrance();

			expect(mockMap.setCenter).toHaveBeenCalledWith({
				lat: 46.52863469527167,
				lng: 2.43896484375
			});
		});

		test('should set zoom to 6', () => {
			const googleMap = new GoogleMap('map-id');
			jest.clearAllMocks();

			googleMap.centerOnFrance();

			expect(mockMap.setZoom).toHaveBeenCalledWith(6);
		});
	});

	describe('centerOnMarkers', () => {
		test('should center on France when no locations', () => {
			const googleMap = new GoogleMap('map-id');
			jest.clearAllMocks();

			googleMap.centerOnMarkers();

			expect(mockMap.setCenter).toHaveBeenCalledWith({
				lat: 46.52863469527167,
				lng: 2.43896484375
			});
			expect(mockMap.setZoom).toHaveBeenCalledWith(6);
		});

		test('should return early when no locations and no map', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.map = null;

			expect(() => {
				googleMap.centerOnMarkers();
			}).not.toThrow();
		});

		test('should create LatLngBounds when locations exist', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];
			jest.clearAllMocks();

			googleMap.centerOnMarkers();

			expect(mockLatLngBounds).toHaveBeenCalled();
		});

		test('should extend bounds for each location', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357', '43.2965,5.3698'];
			jest.clearAllMocks();

			googleMap.centerOnMarkers();

			const bounds = mockLatLngBounds.mock.instances[0];
			expect(bounds.extend).toHaveBeenCalledTimes(3);
		});

		test('should set map center to bounds center', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];
			jest.clearAllMocks();

			googleMap.centerOnMarkers();

			expect(mockMap.setCenter).toHaveBeenCalled();
		});

		test('should fit bounds on map', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];
			jest.clearAllMocks();

			googleMap.centerOnMarkers();

			expect(mockMap.fitBounds).toHaveBeenCalled();
		});

		test('should handle single location', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522'];
			jest.clearAllMocks();

			googleMap.centerOnMarkers();

			const bounds = mockLatLngBounds.mock.instances[0];
			expect(bounds.extend).toHaveBeenCalledTimes(1);
			expect(mockMap.fitBounds).toHaveBeenCalled();
		});
	});

	describe('connectMarkers', () => {
		test('should not create polylines when no locations', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.connectMarkers();

			expect(mockPolyline).not.toHaveBeenCalled();
		});

		test('should not create polylines with single location', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522'];

			googleMap.connectMarkers();

			expect(mockPolyline).not.toHaveBeenCalled();
		});

		test('should create one polyline for two locations', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];

			googleMap.connectMarkers();

			expect(mockPolyline).toHaveBeenCalledTimes(1);
		});

		test('should create polylines between consecutive locations', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357', '43.2965,5.3698'];

			googleMap.connectMarkers();

			expect(mockPolyline).toHaveBeenCalledTimes(2);
		});

		test('should create polyline with correct options', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];

			googleMap.connectMarkers();

			const polylineOptions = mockPolyline.mock.calls[0][0];
			expect(polylineOptions.geodesic).toBe(true);
			expect(polylineOptions.strokeColor).toBe('#FF0000');
			expect(polylineOptions.strokeOpacity).toBe(1.0);
			expect(polylineOptions.strokeWeight).toBe(2);
		});

		test('should set polyline on map', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];

			googleMap.connectMarkers();

			const polyline = mockPolyline.mock.instances[0];
			expect(polyline.setMap).toHaveBeenCalledWith(mockMap);
		});

		test('should create path with correct coordinates', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357'];

			googleMap.connectMarkers();

			const polylineOptions = mockPolyline.mock.calls[0][0];
			expect(polylineOptions.path).toHaveLength(2);
			expect(polylineOptions.path[0]).toBeInstanceOf(mockLatLng);
			expect(polylineOptions.path[1]).toBeInstanceOf(mockLatLng);
		});

		test('should handle multiple polylines correctly', () => {
			const googleMap = new GoogleMap('map-id');
			googleMap.locations = ['48.8566,2.3522', '45.764,4.8357', '43.2965,5.3698', '50.6292,3.0573'];

			googleMap.connectMarkers();

			expect(mockPolyline).toHaveBeenCalledTimes(3);
			mockPolyline.mock.instances.forEach(instance => {
				expect(instance.setMap).toHaveBeenCalledWith(mockMap);
			});
		});
	});

	describe('integration scenarios', () => {
		test('should add markers and center on them', () => {
			const googleMap = new GoogleMap('map-id');
			const locations = ['48.8566,2.3522', '45.764,4.8357'];
			jest.clearAllMocks();

			googleMap.addMarkers(locations);
			googleMap.centerOnMarkers();

			expect(googleMap.markers.length).toBe(2);
			expect(mockMap.fitBounds).toHaveBeenCalled();
		});

		test('should add markers, connect them, and center', () => {
			const googleMap = new GoogleMap('map-id');
			const locations = ['48.8566,2.3522', '45.764,4.8357', '43.2965,5.3698'];

			googleMap.addMarkers(locations);
			googleMap.connectMarkers();
			googleMap.centerOnMarkers();

			expect(googleMap.markers.length).toBe(3);
			expect(mockPolyline).toHaveBeenCalledTimes(2);
			expect(mockMap.fitBounds).toHaveBeenCalled();
		});

		test('should delete markers and re-add new ones', () => {
			const googleMap = new GoogleMap('map-id');

			googleMap.addMarkers(['48.8566,2.3522', '45.764,4.8357']);
			expect(googleMap.markers.length).toBe(2);

			googleMap.deleteMarkers();
			expect(googleMap.markers.length).toBe(0);

			googleMap.addMarkers(['43.2965,5.3698']);
			expect(googleMap.markers.length).toBe(1);
		});
	});
});