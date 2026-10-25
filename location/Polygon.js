import { GeographicCoordinates } from './GeographicCoordinates.js';

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

export { Polygon };
