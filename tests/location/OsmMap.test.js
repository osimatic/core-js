/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import L from 'leaflet';
import { OsmMap } from '../../location/OsmMap.js';
import { createMockMap, createMockMarker } from './helpers.js';

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