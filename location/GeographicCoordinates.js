import { Polygon } from './Polygon.js';

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

export { GeographicCoordinates };
