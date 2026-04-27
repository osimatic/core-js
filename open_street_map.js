import L from 'leaflet';
import 'leaflet-draw';
import { toEl } from './util.js';

/**
 * https://leafletjs.com/
 * https://switch2osm.org/the-basics/
 * https://www.openstreetmap.org/help
 */
class OpenStreetMap {
	static createMap(mapContainer, options={}) {
		mapContainer = toEl(mapContainer);
		if (!mapContainer) {
			return null;
		}

		const container = L.DomUtil.get(mapContainer);
		if (container != null) {
			container._leaflet_id = null;
		}

		const map = L.map(mapContainer, options);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		const country = options['country'] || 'FR';
		OpenStreetMap.centerMapOnCountry(map, country);

		return map;
	}

	/**
	 * Initialize a draw control on a Leaflet map.
	 * @param {L.Map} map
	 * @param {object} options
	 * @param {boolean} options.polygonAllowed
	 * @param {function} options.onCreated  - callback(type: 'point'|'polygon', data: {lat,long}|{latlngs})
	 * @param {function} options.onDeleted  - callback()
	 * @param {function} options.onEdited   - callback(type, data)
	 * @returns {L.Control.Draw}
	 */
	static initDrawControl(map, options = {}) {
		if (!map) {
			return null;
		}
		
		const { polygonAllowed = false, onCreated, onDeleted, onEdited } = options;

		const drawn = new L.FeatureGroup().addTo(map);
		const drawControl = new L.Control.Draw({
			draw: {
				polygon: polygonAllowed ? { allowIntersection: false, showArea: true } : false,
				polyline: false, rectangle: false, circle: false, circlemarker: false,
				marker: true
			},
			edit: { featureGroup: drawn, remove: true }
		});
		map.addControl(drawControl);

		if (typeof onCreated === 'function') {
			map.on('draw:created', (e) => {
				if (e.layerType === 'marker') {
					const { lat, lng: long } = e.layer.getLatLng();
					onCreated('point', { lat, long }, e.layer);
				} else if (polygonAllowed && e.layerType === 'polygon') {
					onCreated('polygon', { latlngs: e.layer.getLatLngs()[0] }, e.layer);
				}
				drawn.addLayer(e.layer);
			});
		}
		if (typeof onDeleted === 'function') {
			map.on('draw:deleted', () => onDeleted());
		}
		if (typeof onEdited === 'function') {
			map.on('draw:edited', (e) => {
				// pass raw event for flexibility
				onEdited(e);
			});
		}

		return drawControl;
	}

	static getUrl(latitude, longitude) {
		return 'https://www.openstreetmap.org/?mlat='+latitude+'&mlon='+longitude+'#map=17/'+latitude+'/'+longitude+'&layers=N';
		//return 'https://www.openstreetmap.org/#map=17/'+latitude+'/'+longitude+'';
	}

	static getUrlFromCoordinates(locationCoordinates) {
		locationCoordinates = locationCoordinates.split(',');
		return OpenStreetMap.getUrl(parseFloat(locationCoordinates[0]), parseFloat(locationCoordinates[1]));
	}

	static centerOnFrance(map) {
		if (!map) {
			return;
		}
		
		map.setView([46.52863469527167, 2.43896484375], 6);
	}

	static getCountryBoundingBoxes() {
		return {
			// Europe
			"fr": [[41.333, -5.142], [51.091, 9.559]], // France,
			"de": [[47.270, 5.866], [55.058, 15.041]], // Germany
			"es": [[27.642, -18.167], [43.792, 4.327]], // Spain incl. Canaries (approx)
			"it": [[36.619, 6.627], [47.095, 18.520]], // Italy
			"pt": [[36.840, -9.500], [42.280, -6.190]], // Portugal
			"be": [[49.497, 2.545], [51.505, 6.407]], // Belgium
			"nl": [[50.753, 3.358], [53.555, 7.227]], // Netherlands
			"ch": [[45.818, 5.957], [47.808, 10.492]], // Switzerland
			"at": [[46.372, 9.530], [49.021, 17.162]], // Austria
			"gb": [[49.959, -8.649], [59.478, 1.759]], // United Kingdom,
			"ie": [[51.390, -10.480], [55.387, -5.432]], // Ireland
			"pl": [[49.003, 14.123], [54.836, 24.145]], // Poland
			"se": [[55.340, 11.112], [69.061, 24.177]], // Sweden
			"no": [[57.980, 4.500], [71.188, 31.078]], // Norway (Mainland approx)
			"fi": [[59.810, 20.556], [70.092, 31.586]], // Finland
			"dk": [[54.560, 8.089], [57.752, 12.690]], // Denmark

			// Afrique / Moyen-Orient
			"ma": [[27.662, -13.172], [35.922, -0.996]], // Morocco
			"dz": [[18.976, -8.669], [37.093, 11.999]], // Algeria
			"tn": [[30.233, 7.524], [37.544, 11.598]], // Tunisia
			"eg": [[21.725, 24.700], [31.667, 36.895]], // Egypt
			"za": [[-34.833, 16.470], [-22.126, 32.893]], // South Africa
			"sa": [[15.615, 34.495], [32.154, 55.666]], // Saudi Arabia
			"ae": [[22.634, 51.570], [26.084, 56.383]], // United Arab Emirates
			"il": [[29.487, 34.268], [33.277, 35.876]], // Israel

			// Amériques
			"us": [[24.396, -124.848], [49.384, -66.885]], // United States (Contiguous)
			"ca": [[41.675, -141.000], [83.113, -52.648]], // Canada
			"mx": [[14.538, -118.365], [32.720, -86.711]], // Mexico
			"br": [[-33.751, -73.987], [5.271, -34.729]], // Brazil
			"ar": [[-55.051, -73.582], [-21.781, -53.591]], // Argentina

			// Asie / Océanie
			"cn": [[18.159, 73.499], [53.560, 134.772]], // China (mainland approx)
			"in": [[6.554, 68.176], [35.674, 97.402]], // India
			"jp": [[24.249, 122.938], [45.557, 153.987]], // Japan
			"au": [[-43.740, 112.921], [-10.668, 153.639]], // Australia
			"nz": [[-47.290, 166.509], [-34.392, 178.517]], // New Zealand
		};
	}

	static getCountryBoundingBox(countryIsoCode) {
		if (!countryIsoCode) {
			return null;
		}

		const key = countryIsoCode.toLowerCase().trim();
		const countryBox = OpenStreetMap.getCountryBoundingBoxes()[key];
		return countryBox ? countryBox : null;
	}

	static centerMapOnCountry(map, countryIsoCode, opts = {}) {
		if (!map) {
			return;
		}

		const boundingBox = OpenStreetMap.getCountryBoundingBox(countryIsoCode);
		if (null === boundingBox) {
			return;
		}

		const padding = Array.isArray(opts.padding) ? opts.padding : [20, 20];
		const minZoom = Number.isFinite(opts.minZoom) ? opts.minZoom : 3;
		const maxZoomSmall = Number.isFinite(opts.maxZoomSmall) ? opts.maxZoomSmall : 10;
		const maxZoomTiny  = Number.isFinite(opts.maxZoomTiny)  ? opts.maxZoomTiny  : 12;

		// Estimation de "taille" en degrés
		const [[S, W], [N, E]] = boundingBox;
		const latSpan = Math.max(0.0001, Math.abs(N - S));
		const lonSpan = Math.max(0.0001, Math.abs(E - W));
		const areaDeg = latSpan * lonSpan;

		// Heuristique de zoom maximal selon la taille du pays (en degrés²)
		// (fitBounds choisira le zoom, plafonné par maxZoom ci-dessous)
		let maxZoom;
		if (areaDeg > 200) {        // très grand (US, CA, AU, BR, CN)
			maxZoom = 7;
		} else if (areaDeg > 50) {  // grand
			maxZoom = 8;
		} else if (areaDeg > 20) {  // moyen+
			maxZoom = 9;
		} else if (areaDeg > 5) {   // moyen/petit
			maxZoom = maxZoomSmall;   // ~10
		} else {                    // petit/micro-état
			maxZoom = maxZoomTiny;    // ~12
		}

		// fitBounds avec maxZoom pour éviter d'over-zoomer les petits pays
		const bounds = L.latLngBounds([ [S, W], [N, E] ]);
		map.fitBounds(bounds, { padding, maxZoom });
		if (map.getZoom() < minZoom) {
			map.setZoom(minZoom);
		}
	}

	static centerMapToLocations(map, locationsList, padding=[20,20], maxZoom=18) {
		if (!map || locationsList.length === 0) {
			return;
		}

		map.invalidateSize(false);

		const bounds = L.latLngBounds(locationsList);
		map.fitBounds(bounds, { padding: padding });
		if (map.getZoom() > maxZoom) {
			map.setZoom(maxZoom);
		}
	}

	static centerMapToGooglePlace(map, place) {
		if (place && place.geometry && place.geometry.location) {
			const loc = place.geometry.location;
			OpenStreetMap.centerMapToCoordinates(map, loc.lat(), loc.lng());
		}
	}

	static centerMapToCoordinates(map, lat, long) {
		if (!map) {
			return;
		}
		map.setView([lat, long], Math.max(map.getZoom(), 15));
	}

	static clearSelections(map) {
		if (map) {
			map.eachLayer((layer) => {
				if (layer instanceof L.Marker) {
					layer.remove();
				}
			});
		}
	}

	static addTempMarker(map, lat, lon, onDragEnd) {
		const tempLayer = L.marker([lat, lon], { draggable: true });
		map.addLayer(tempLayer);
		if (typeof onDragEnd === 'function') {
			tempLayer.on('dragend', function(e) {
				onDragEnd(e.target);
			});
		}
		return tempLayer;
	}

	static resetTempSelection(map, tempLayer) {
		if (tempLayer && map) {
			map.removeLayer(tempLayer);
		}
	}

	static destroyMap(map) {
		if (!map) {
			return;
		}
		
		map.off();
		map.remove();
	}

	static setZoom(map, zoom) {
		if (!map) {
			return;
		}
		
		map.setZoom(zoom);
	}

	static setView(map, location, zoom) {
		if (!map) {
			return;
		}
		
		map.setView(location, zoom);
	}

	static addMarker(map, coordinates, options) {
		if (!map) {
			return null;
		}
		
		let locationCoordinates = coordinates.split(',');
		let latitude = parseFloat(locationCoordinates[0]);
		let longitude = parseFloat(locationCoordinates[1]);

		const markerOptions = {};
		if (options['icon']) {
			markerOptions.icon = L.icon({
				iconUrl: options['icon'],
				iconSize: [22, 32]
			});
		}
		if (options['title']) {
			markerOptions.title = options['title'];
		}

		let marker = L.marker([latitude, longitude], markerOptions);

		if (options['on_click'] || options['popupopen']) {
			marker.on('popupopen', () => {
				if (typeof options['on_click'] == 'function') {
					options['on_click']();
				}
				if (typeof options['popupopen'] == 'function') {
					options['popupopen']();
				}
				return false;
			});
		}

		marker.addTo(map);

		if (options['popup']) {
			marker.bindPopup(options['popup']);
		}

		return marker;
	}

	static addMarkers(map, listLocations, icon) {
		if (!map || listLocations.length === 0) {
			return [];
		}
		return listLocations.map(location => OpenStreetMap.addMarker(map, location, icon));
	}

	static connectMarkers(map, locations) {
		if (!map || locations.length === 0) {
			return;
		}

		let prevLocation = null;
		let listLineCoordinates = [];
		locations.forEach(location => {
			if (prevLocation != null) {
				listLineCoordinates.push([prevLocation, location]);
			}
			prevLocation = location;
		});

		listLineCoordinates.forEach(line => {
			L.polyline(line, {color: '#728bec'}).addTo(map);
		});
	}

	/**
	 * Affiche un GeoJSON (string) sur une carte Leaflet (OSM).
	 * Gère: Point, Polygon, et Feature/FeatureCollection contenant ces types.
	 *
	 * @param {L.Map} map - instance Leaflet déjà créée
	 * @param {string} geoJson - GeoJSON en texte
	 * @param {object} [opts]
	 *  - layerGroup: L.LayerGroup | L.FeatureGroup (facultatif, cible d'ajout)
	 *  - pointMarker: options Leaflet pour le marker (ex: { draggable:false })
	 *  - polygonStyle: options Leaflet pour le polygon (ex: { color:'#007bff' })
	 *  - fit: boolean (par défaut true) → adapte la vue à la géométrie
	 *  - pointZoom: number (zoom si Point et fit=true, défaut 16)
	 *  - popup: string (facultatif) → bindPopup commun pour l'entité
	 * @returns {L.Layer | null} couche ajoutée (marker ou polygon), sinon null
	 */
	static displayGeoJSONOnMap(map, geoJson, opts = {}) {
		if (!map) {
			console.warn('displayGeoJSONOnMap: paramètres invalides');
			return null;
		}

		if (typeof geoJson == 'string') {
			geoJson = JSON.parse(geoJson);
		}

		const {
			layerGroup = null,
			polygonStyle = { color: '#3388ff', weight: 3, opacity: 0.9, fillOpacity: 0.2 },
			fit = true,
			pointZoom = 16,
			icon = null,
			title = null,
			popup = null
		} = opts;

		function addLayer(layer) {
			layer.on('popupopen', () => {
				//console.log('popupopen');
				if (typeof opts['on_click'] == 'function') {
					opts['on_click']();
				}
				return false;
			});

			if (layerGroup && typeof layerGroup.addLayer === 'function') {
				layerGroup.addLayer(layer);
			}
			else {
				layer.addTo(map);
			}
			if (popup) {
				layer.bindPopup(popup);
			}
			return layer;
		}

		if (geoJson.type === 'Point') {
			const coords = geoJson.coordinates;
			if (!Array.isArray(coords) || coords.length < 2) {
				console.warn('displayGeoJSONOnMap: Point invalide');
				return null;
			}
			const [lon, lat] = coords;
			const marker = L.marker([lat, lon], {
				icon: L.icon({
					iconUrl: icon,
					iconSize: [22, 32],
				}),
				title: title,
			});
			addLayer(marker);

			if (fit) {
				map.setView([lat, lon], pointZoom);
				setTimeout(function() { map.invalidateSize(true); }, 30);
			}
			return marker;
		}

		if (geoJson.type === 'Polygon') {
			const rings = Polygon.toLatLngRings(geoJson);
			if (!rings.length) {
				console.warn('displayGeoJSONOnMap: Polygon invalide');
				return null;
			}
			// Leaflet accepte un tableau d'anneaux pour L.polygon
			const poly = L.polygon(rings, polygonStyle);
			addLayer(poly);

			if (fit) {
				const b = poly.getBounds();
				map.fitBounds(b, { padding: [20, 20] });
				setTimeout(function() { map.invalidateSize(true); }, 30);
			}
			return poly;
		}

		console.warn('displayGeoJSONOnMap: type non géré');
		return null;
	}

}

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

export { OpenStreetMap, OsmMap };