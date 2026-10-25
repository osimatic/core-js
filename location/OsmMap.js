import { toEl } from '../utils/util.js';

class OsmMap {

	constructor(mapContainer, options={}) {
		mapContainer = toEl(mapContainer);
		
		this.markers = [];
		this.locations = [];
		this.tempSelection = null;
		this.tempLayer = null;
		this.map = OpenStreetMap.createMap(mapContainer, options);
	}

	setZoom(zoom) {
		OpenStreetMap.setZoom(this.map, zoom);
	}

	deleteMarkers() {
		this.locations = [];
		this.markers.length = 0;
		this.markers = [];
	}

	clearSelections() {
		OpenStreetMap.clearSelections(this.map);
	}

	addTempMarker(lat, lon) {
		this.tempLayer = OpenStreetMap.addTempMarker(this.map, lat, lon, (selection) => {
			const ll = selection.getLatLng();
			this.tempSelection = { type: 'point', lat: ll.lat, long: ll.lng };
		});
	}

	resetTempSelection() {
		OpenStreetMap.resetTempSelection(this.map, this.tempLayer);
		this.tempLayer = null;
		this.tempSelection = null;
	}

	addMarkers(listLocations, icon) {
		OpenStreetMap.addMarkers(this.map, listLocations, icon).forEach(marker => {
			const { lat, lng } = marker.getLatLng();
			this.markers.push(marker);
			this.locations.push([lat, lng]);
		});
	}

	addMarker(coordinates, options) {
		const marker = OpenStreetMap.addMarker(this.map, coordinates, options);
		if (!marker) {
			return;
		}
		const { lat, lng } = marker.getLatLng();
		this.markers.push(marker);
		this.locations.push([lat, lng]);
	}

	addGeoJson(geoJson, options) {
		OpenStreetMap.displayGeoJSONOnMap(this.map, geoJson, options);
	}

	destroyMap() {
		OpenStreetMap.destroyMap(this.map);
	}

	setView(location, zoom) {
		OpenStreetMap.setView(this.map, location, zoom);
	}

	centerOnFrance() {
		OpenStreetMap.centerOnFrance(this.map);
	}

	centerOnCountry(countryIsoCode, opts) {
		OpenStreetMap.centerMapOnCountry(this.map, countryIsoCode, opts);
	}

	centerOnMarkers(padding) {
		OpenStreetMap.centerMapToLocations(this.map, this.locations, padding);
	}

	centerOnGooglePlace(place) {
		OpenStreetMap.centerMapToGooglePlace(this.map, place);
	}

	centerOnCoordinates(lat, long) {
		OpenStreetMap.centerMapToCoordinates(this.map, lat, long);
	}

	initDrawControl(options) {
		return OpenStreetMap.initDrawControl(this.map, options);
	}

	connectMarkers() {
		OpenStreetMap.connectMarkers(this.map, this.locations);
	}
}

export { OsmMap };
