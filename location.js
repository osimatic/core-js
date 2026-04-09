const Address = require('ilib/lib/Address');
const AddressFmt = require('ilib/lib/AddressFmt');
const { toEl } = require('./util');
const isoCountries = require('i18n-iso-countries');
const { Locale } = require('./locale');
const { SelectBox } = require('./select_box');
isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));

class Country {
	static setFlagsPath(flagsPath) {
		Country.flagsPath = flagsPath;
	}

	static getFlagPath(countryCode) {
		return typeof Country.flagsPath !== 'undefined' ? Country.flagsPath + countryCode.toLowerCase() + '.png' : null;
	}
	static getFlagImg(countryCode, locale=Locale.getDefault()) {
		if (typeof Country.flagsPath !== 'undefined') {
			return '<span><img src="'+Country.getFlagPath(countryCode)+'" alt="" title="'+Country.getCountryName(countryCode, locale)+'" class="flag" /></span>';
		}
		return '<span class="fi fi-' + countryCode.toLowerCase() + '"></span>';
	}
	static getFlagEmoji(countryCode) {
		return [...countryCode.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('');
	}

	static fillSelect(select, defaultValue=null, locale=Locale.getDefault(), showFlags=false, countriesList=null, addNoneValue=false, noneLabel='- Aucun -') {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		if (addNoneValue) {
			select.insertAdjacentHTML('beforeend', '<option value="">'+noneLabel+'</option>');
		}
		const allCountries = Country.getCountries(locale);
		const entries = countriesList != null
			? countriesList.map(code => [code, allCountries[code] || code])
			: Object.entries(allCountries);
			entries.forEach(([countryCode, countryName]) => {
			let attrs = '';
			if (showFlags) {
				/*if (typeof Country.flagsPath !== 'undefined') {
					attrs = ' data-thumbnail="' + Country.getFlagPath(countryCode) + '"';
				} else {*/
				attrs = ' data-content="<span class=&quot;fi fi-' + countryCode.toLowerCase() + '&quot;></span> ' + countryName + '"';
			}
			select.insertAdjacentHTML('beforeend', '<option value="' + countryCode + '"' + attrs + '>' + countryName + '</option>');
		});

		SelectBox.refresh(select);
		if (null != defaultValue) {
			SelectBox.setValue(select, defaultValue);
		}
	}

	static fillSelectWithFlags(select, defaultValue=null, locale=Locale.getDefault(), countriesList=null, addNoneValue=false, noneLabel='- Aucun -') {
		return Country.fillSelect(select, defaultValue, locale, true, countriesList, addNoneValue, noneLabel);
	}

	static getCountryName(countryCode, locale=Locale.getDefault()) {
		const baseLang = Locale.getBaseLang(locale);
		Country.getCountries(locale); // ensure locale is registered
		const name = isoCountries.getName(countryCode, baseLang);
		return name || countryCode;
	}
	static getCountries(locale = 'en') {
		const baseLang = Locale.getBaseLang(locale);
		let names = isoCountries.getNames(baseLang);
		if (!names || Object.keys(names).length === 0) {
			try {
				isoCountries.registerLocale(require('i18n-iso-countries/langs/' + baseLang + '.json'));
				names = isoCountries.getNames(baseLang);
			} catch (e) {
				// locale not available
			}
		}
		return names || {};
	}

	static getContinents() {
		return {
			1: "Europe",
			2: "Moyen-Orient",
			3: "Afrique",
			4: "Amérique du Nord",
			5: "Amérique du Sud",
			6: "Asie",
			7: "Océanie",
		};
	}

	/** @deprecated Use getCountries instead **/
	static getCountryList() {
		return Country.getCountries();
	}
	/** @deprecated Use fillSelect instead **/
	static fillCountrySelect(select, defaultValue=null, countriesList=null, addNoneValue=false, noneLabel='- Aucun -') {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		if (addNoneValue) {
			select.insertAdjacentHTML('beforeend', '<option value="">'+noneLabel+'</option>');
		}
		Object.entries(null != countriesList ? countriesList : Country.getCountries()).forEach(([countryCode, countryName]) => {
			select.insertAdjacentHTML('beforeend', '<option value="' + countryCode + '">' + countryName + '</option>');
		});
		SelectBox.refresh(select);
		if (null != defaultValue) {
			SelectBox.setValue(select, defaultValue);
		}
	}
}

class PostalAddress {
	static setAutocomplete(input, onPlaceChanged) {
		input = toEl(input);
		if (!input) {
			return;
		}
		const autocomplete = new google.maps.places.Autocomplete(
			input,
			{types: ['geocode']}
		);

		// When the user selects an address from the dropdown, populate the address fields in the form.

		if (typeof onPlaceChanged != 'function') {
			return;
		}

		autocomplete.addListener('place_changed', function() {
			let place = autocomplete.getPlace();
			input.value = '';
			onPlaceChanged(place);
		});

		return autocomplete;
	}

	static format(addressData, separator='<br/>', locale=null) {
		function empty(value) {
			return typeof value == 'undefined' || value == null || value === '';
		}

		/*
		var address = new Address({
			country: "USA",
			countryCode: "US",
			postalCode: "95054",
			region: "CA",
			locality: "Santa Clara",
			streetAddress: "LG Silicon Valley Lab, 5150 Great America Pkwy"
		});
		var af = new AddressFmt();
		var formatted = af.format(address);
		console.log(formatted);
		 */

		addressData['countryCode'] = !empty(addressData['countryCode'])?addressData['countryCode']:null;

		let addressDataForPluging = {
			streetAddress: (!empty(addressData['streetAddress'])?addressData['streetAddress']:'')+(!empty(addressData['additionalAddress'])?"\n"+addressData['additionalAddress']:''),
			postalCode: !empty(addressData['postalCode'])?addressData['postalCode']:null,
			locality: !empty(addressData['locality'])?addressData['locality']:null,
			region: !empty(addressData['state'])?addressData['state']:null,
			countryCode: addressData['countryCode'],
			country: Country.getCountryName(addressData['countryCode']),
		};
		if (addressDataForPluging['locality'] == null && !empty(addressData['suburb'])) {
			addressDataForPluging['locality'] = addressData['suburb'];
		}
		if (addressDataForPluging['locality'] == null && !empty(addressData['stateDistrict'])) {
			addressDataForPluging['locality'] = addressData['stateDistrict'];
		}

		const afLocale = locale || (addressDataForPluging['countryCode'] ? `und-${addressDataForPluging['countryCode']}` : null);
		let af = new AddressFmt(afLocale ? {locale: afLocale} : {});
		let formattedAddress = af.format(new Address(addressDataForPluging));
		return formattedAddress.replace(/\n+/g, separator);
	}

	static getComponentsFromGoogleApi(googleApiResult) {
		/*
		var addressData = {
			streetAddress: address.street,
			additionalAddress: null,
			postalCode: address.zipCode,
			locality: address.city,
			stateDistrict: null,
			state: null,
			countryCode: address.country,
		};
		*/

		var streetNumber = null;
		var route = null;
		var shortRoute = null;

		var addressData = {};
		googleApiResult.address_components.forEach(function(resultAddressComponent) {
			if (resultAddressComponent.types.indexOf('street_number') !== -1) {
				streetNumber = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('route') !== -1) {
				route = resultAddressComponent.long_name;
				shortRoute = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('sublocality_level_1') !== -1) {
				addressData.suburb = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('locality') !== -1) {
				addressData.locality = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('postal_town') !== -1) {
				addressData.locality = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('postal_code') !== -1) {
				addressData.postalCode = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('administrative_area_level_3') !== -1) {
				addressData.locality = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('administrative_area_level_2') !== -1) {
				addressData.stateDistrict = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('administrative_area_level_1') !== -1) {
				addressData.state = resultAddressComponent.long_name;
			}
			if (resultAddressComponent.types.indexOf('country') !== -1) {
				addressData.countryCode = resultAddressComponent.short_name;
			}
		});
		const tmp = document.createElement('div');
		tmp.innerHTML = googleApiResult.adr_address || '';
		if (tmp.children.length > 0) {
			addressData.streetAddress = tmp.children[0].textContent;
		}
		else {
			addressData.streetAddress = streetNumber+' '+route;
		}

		return addressData;
	}
}

class Polygon {
	static format(geoJsonPolygon) {
		geoJsonPolygon = typeof geoJsonPolygon == 'string' ? JSON.parse(geoJsonPolygon) : geoJsonPolygon;

		const rings = geoJsonPolygon.coordinates || [];
		const ring0 = rings[0] || [];
		const n = ring0.length ? ring0.length - (JSON.stringify(ring0[0])===JSON.stringify(ring0[ring0.length-1]) ? 1 : 0) : 0;
		if (ring0.length === 0) {
			return {label:'Polygon (vide)', title:''};
		}

		const [firstLon, firstLat] = ring0[0];

		const maxShow = Math.min(5, ring0.length);
		const concise = ring0.slice(0, maxShow).map(([long,lat]) => GeographicCoordinates.format(lat, long)).join(' · ');
		const more = ring0.length > maxShow ? ` … (+${ring0.length - maxShow} sommets)` : '';

		return {
			label: `Polygone de ${n} sommets (départ : ${GeographicCoordinates.format(firstLat, firstLon)})`,
			title: `Sommets : ${concise}${more}`
		};
	}

	static getStartCoordinates(geoJsonPolygon, asString=false) {
		geoJsonPolygon = typeof geoJsonPolygon == 'string' ? JSON.parse(geoJsonPolygon) : geoJsonPolygon;

		const rings = geoJsonPolygon.coordinates || [];
		const ring0 = rings[0] || [];
		if (ring0.length === 0) {
			return null;
		}

		const [firstLon, firstLat] = ring0[0];
		return asString ? firstLat+','+firstLon : [firstLat, firstLon];
	}

	static convertToGeoJson(latlngs) {
		let rings = [];
		if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
			for (const ring of latlngs) {
				rings.push(ring.map(ll => [Number(ll.lng), Number(ll.lat)]));
			}
		}
		else {
			rings = [latlngs.map(ll => [Number(ll.lng), Number(ll.lat)])];
		}
		rings = rings.map(r => {
			if (r.length >= 3) {
				const [lon0,lat0] = r[0];
				const [lonL,latL] = r[r.length-1];
				if (lon0 !== lonL || lat0 !== latL) {
					r.push([lon0,lat0]);
				}
			}
			return r;
		});
		return { type: 'Polygon', coordinates: rings };
	}

	static toLatLngRings(geoJsonPolygon) {
		geoJsonPolygon = typeof geoJsonPolygon == 'string' ? JSON.parse(geoJsonPolygon) : geoJsonPolygon;

		const polygonCoords = geoJsonPolygon.coordinates;
		if (!Array.isArray(polygonCoords) || polygonCoords.length === 0) {
			return false;
		}

		// polygonCoords: [ [ [long,lat], ... ] , ... ]
		const rings = [];
		for (const ring of polygonCoords) {
			const latlngRing = [];
			for (const coord of ring) {
				if (!Array.isArray(coord) || coord.length < 2) {
					continue;
				}
				const [long, lat] = coord;
				latlngRing.push([lat, long]);
			}
			if (latlngRing.length > 0) {
				// Fermer l'anneau si nécessaire (Leaflet accepte ouvert/fermé, on nettoie par sécurité)
				const first = latlngRing[0];
				const last = latlngRing[latlngRing.length - 1];
				if (first[0] !== last[0] || first[1] !== last[1]) {
					latlngRing.push([first[0], first[1]]);
				}
				rings.push(latlngRing);
			}
		}
		return rings;
	}


	// Test "sur le segment" en degrés (plan local) — suffisant pour le bord du polygone
	static isPointOnSegmentDeg(lat, long, A, B, EPS = 1e-12) {
		const [x,  y ] = [long, lat];
		const [x1, y1] = A;       // A = [long,lat]
		const [x2, y2] = B;       // B = [long,lat]
		const cross = (x - x1)*(y2 - y1) - (y - y1)*(x2 - x1);
		if (Math.abs(cross) > EPS) {
			return false;
		}

		const dot  = (x - x1)*(x2 - x1) + (y - y1)*(y2 - y1);
		if (dot < -EPS) {
			return false;
		}

		const len2 = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
		return dot - len2 <= EPS;
	}

	// Ray-casting + bords inclus pour un anneau (tableau de [long,lat])
	static isPointInRing(lat, long, ring) {
		const n0 = ring.length;
		if (n0 < 3) {
			return false;
		}

		// fermer si nécessaire
		const closed = ring[n0-1][0] === ring[0][0] && ring[n0-1][1] === ring[0][1];
		const pts = closed ? ring : [...ring, ring[0]];
		const n = pts.length;

		// bord inclus
		for (let i = 0; i < n - 1; i++) {
			if (Polygon.isPointOnSegmentDeg(lat, long, pts[i], pts[i+1])) {
				return true;
			}
		}

		// ray casting (x=long, y=lat)
		let inside = false;
		for (let i = 0, j = n - 1; i < n; j = i++) {
			const [xi, yi] = pts[i];
			const [xj, yj] = pts[j];
			const intersect = ((yi > lat) !== (yj > lat)) &&
				(long < ( (xj - xi) * (lat - yi) / ((yj - yi) || 1e-20) + xi ));
			if (intersect) inside = !inside;
		}
		return inside;
	}

	// Polygone avec trous: inside = dans outer ET pas dans un trou
	static isPointInPolygon(lat, long, geoJsonPolygon) {
		const rings = geoJsonPolygon.coordinates;
		if (!Array.isArray(rings) || rings.length === 0) {
			return false;
		}

		if (!Polygon.isPointInRing(lat, long, rings[0])) {
			return false; // outer
		}

		for (let k = 1; k < rings.length; k++) {
			if (Polygon.isPointInRing(lat, long, rings[k])) {
				return false; // dans un trou
			}
		}

		return true;
	}

}

class GeographicCoordinates {
	static check(str) {
		return /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(str);
	}

	static parse(str, asString=false) {
		if (null === str || '' === str || 'NaN,NaN' === str) {
			return null;
		}

		str = (str||'').replace(';', ',').trim().replace(/\s+/g, '');
		const parts = str.split(',');
		if (parts.length !== 2) {
			return null;
		}

		const lat = parseFloat(parts[0]);
		const long = parseFloat(parts[1]);
		if (!isFinite(lat) || !isFinite(long)) {
			return null;
		}

		return asString ? lat+','+long : [lat, long];
	}

	static toFixed(latOrLong, fractionDigit=6) {
		return Number(latOrLong).toFixed(fractionDigit);
	}

	static format(lat, long, fractionDigit=6) {
		return GeographicCoordinates.toFixed(lat, fractionDigit)+','+GeographicCoordinates.toFixed(long, fractionDigit);
	}

	static formatPoint(geoJsonPoint, fractionDigit=6) {
		const coords = GeographicCoordinates.parseFromGeoJson(geoJsonPoint);
		if (coords == null) {
			return '';
		}
		const [lat, long] = coords;
		if (typeof long == 'undefined' || typeof lat == 'undefined') {
			return '';
		}
		return GeographicCoordinates.format(lat, long, fractionDigit);
	}

	static convertToGeoJson(lat, long) {
		return { type: 'Point', coordinates: [Number(long), Number(lat)] };
	}

	static parseFromGeoJson(geoJsonPoint, asString=false) {
		geoJsonPoint = typeof geoJsonPoint == 'string' ? JSON.parse(geoJsonPoint) : geoJsonPoint;

		const [long, lat] = geoJsonPoint.coordinates || [];
		if (typeof long == 'undefined' || typeof lat == 'undefined') {
			return null;
		}

		return asString ? lat+','+long : [lat, long];
	}

	static getAllLatLongsFromGeoJsonList(geoJsonList) {
		geoJsonList = typeof geoJsonList == 'string' ? JSON.parse(geoJsonList) : geoJsonList;

		const arr = [];
		for (const geoJsonItem of geoJsonList) {
			if (!geoJsonItem) {
				continue;
			}

			if (geoJsonItem.type === 'Point') {
				const [long, lat] = geoJsonItem.coordinates || [];
				arr.push([lat, long]);
				continue;
			}

			if (geoJsonItem.type === 'Polygon') {
				for (const ring of geoJsonItem.coordinates || []) {
					for (const [long,lat] of ring) {
						arr.push([lat, long]);
					}
				}
				continue;
			}
		}

		return arr;
	}

	static isPointCorrespondingToLocationsList(lat, long, locationsList, tolMeters = 1.0) {
		for (const it of locationsList) {
			if (!it) {
				continue;
			}

			if (typeof it === 'string') {
				const p = GeographicCoordinates.parse(it);
				if (p && GeographicCoordinates.haversine(lat,long,p[0],p[1]) <= tolMeters) {
					return true;
				}
			}
			else if (it.type === 'Point') {
				const p = it.coordinates || [];
				if (p && GeographicCoordinates.haversine(lat,long,p[1],p[0]) <= tolMeters) {
					return true;
				}
			}
			else if (it.type === 'Polygon' && Array.isArray(it.coordinates)) {
				if (Polygon.isPointInPolygon(lat, long, it)) {
					return true;
				}
			}
		}
		return false;
	}

	static haversine(lat1, long1, lat2, long2) {
		const R = 6371000;
		const toRad = d => d * Math.PI / 180;
		const dLat = toRad(lat2 - lat1);
		const dLong = toRad(long2 - long1);
		const d1 = toRad(lat1), d2 = toRad(lat2);
		const a = Math.sin(dLat/2)**2 + Math.cos(d1)*Math.cos(d2)*Math.sin(dLong/2)**2;
		return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
	}

}

module.exports = { Country, Locale, PostalAddress, GeographicCoordinates, Polygon };