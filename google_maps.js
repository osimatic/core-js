
class GoogleMap {
	constructor(mapId) {
		this.markers = [];
		this.locations = [];
		this.mapId = mapId;

		if (!document.getElementById(mapId)) {
			return;
		}

		var mapOptions = {
			// center: { lat: 46.52863469527167, lng: 2.43896484375},
			// zoom: 6,
			maxZoom: 18
		};
		this.map = new google.maps.Map(document.getElementById(mapId), mapOptions);
		this.centerOnFrance();
	}

	static getUrl(latitude, longitude) {
		return 'https://maps.google.com/?q='+latitude+','+longitude+'';
	}

	static getUrlFromCoordinates(locationCoordinates) {
		locationCoordinates = locationCoordinates.split(',');
		return this.getUrl(parseFloat(locationCoordinates[0]), parseFloat(locationCoordinates[1]));
	}

	deleteMarkers() {
		this.locations = [];

		for (var i = 0; i < this.markers.length; i++ ) {
			this.markers[i].setMap(null);
		}
		this.markers.length = 0;
		this.markers = [];

		// this.map.clearOverlays();
	}

	addMarkers(listLocation, icon) {
		//console.log(listLocation);
		if (listLocation.length == 0) {
			return;
		}

		for(var i= 0; i < listLocation.length; i++) {
			this.addMarker(listLocation[i], icon);
		}
	}

	addMarker(coordinates, icon, infoWindowContent, markerOnClickCallback) {
		var displayInfoWindow = (typeof infoWindowContent != 'undefined' && infoWindowContent != null);

		var locationCoordinates = coordinates.split(',');
		var latitude = parseFloat(locationCoordinates[0]);
		var longitude = parseFloat(locationCoordinates[1]);
		// var locationCoordinatesString = .toFixed(8)+','+parseFloat(locationCoordinates[1]).toFixed(8);

		// var myLatLng = new google.maps.LatLng(location.latitude, location.longitude);
		// console.log(coordinates[0], coordinates[1]);
		var myLatLng = new google.maps.LatLng(latitude, longitude);
		
		// console.log(location[2]);
		var marker = new google.maps.Marker({
			position: myLatLng,
			map: this.map,
			title: displayInfoWindow?infoWindowContent.title:'Marker',
			icon: icon
		});

		this.markers.push(marker);
		this.locations.push(coordinates);

		if (displayInfoWindow) {
			var infowindow = new google.maps.InfoWindow({
				content: infoWindowContent.content
			});
			marker.addListener('click', function() {
				infowindow.open(this.map, marker);
				if (typeof markerOnClickCallback == 'function') {
					markerOnClickCallback();
				}
			});
		}

		return myLatLng;
	}

	centerOnFrance() {
		this.map.setCenter({ lat: 46.52863469527167, lng: 2.43896484375});
		this.map.setZoom(6);
			// center: { lat: 46.52863469527167, lng: 2.43896484375},
			// zoom: 6,
	}

	centerOnMarkers() {
		if (this.locations.length == 0) {
			if (this.map != null) {
				this.centerOnFrance();
			}
			return;
		}

		var latlngbounds = new google.maps.LatLngBounds();
		for (var i= 0; i < this.locations.length; i++) {
			var locationCoordinates = this.locations[i].split(',');
			latlngbounds.extend(new google.maps.LatLng(parseFloat(locationCoordinates[0]), parseFloat(locationCoordinates[1])));
		}
		this.map.setCenter(latlngbounds.getCenter());
		this.map.fitBounds(latlngbounds);
	}

	connectMarkers() {
		var prevLocation = null;
		var listLineCoordinates = [];
		for (var i= 0; i < this.locations.length; i++) {
			var locationCoordinates = this.locations[i].split(',');
			var myLatLng = new google.maps.LatLng(parseFloat(locationCoordinates[0]), parseFloat(locationCoordinates[1]));
			if (prevLocation != null) {
				listLineCoordinates.push([prevLocation, myLatLng]);
			}
			prevLocation = myLatLng;
		}

		for (var i= 0; i < listLineCoordinates.length; i++) {
			var flightPlanCoordinates = [
				listLineCoordinates[i][0],
				listLineCoordinates[i][1],
			];
			var flightPath = new google.maps.Polyline({
				path: flightPlanCoordinates,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			flightPath.setMap(this.map);
		}
	}
}

export { GoogleMap };

//deprecated
/*
google.maps.Map.prototype.markers = new Array();

google.maps.Map.prototype.getMarkers = function() {
	return this.markers
};

google.maps.Map.prototype.clearMarkers = function() {
	for(var i=0; i<this.markers.length; i++){
		this.markers[i].setMap(null);
	}
	this.markers = new Array();
};

google.maps.Marker.prototype._setMap = google.maps.Marker.prototype.setMap;

google.maps.Marker.prototype.setMap = function(map) {
	if (map) {
		map.markers[map.markers.length] = this;
	}
	this._setMap(map);
}
*/
