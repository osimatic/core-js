import { jest } from '@jest/globals';

export function createMockMap(zoom = 6) {
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

export function createMockMarker(lat = 48.8566, lng = 2.3522) {
	return {
		on: jest.fn(),
		addTo: jest.fn().mockReturnThis(),
		bindPopup: jest.fn(),
		getLatLng: jest.fn(() => ({ lat, lng })),
	};
}