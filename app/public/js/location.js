function GPSLocation (){
	var _center_lo=0;
	var _center_lat=0;
	var _map;
	var _check= false;
}

GPSLocation.prototype.initialize = function (){
	var options = {maximumAge:600000, timeout:5000, enableHighAccuracy: true};
	navigator.geolocation.watchPosition(this.showPosition, this.errorCallback , options);
};

GPSLocation.prototype.errorCallback = function (error) {
    var msg = "Can't get your location (low accuracy attempt). Error = ";
    if (error.code == 1)
        msg += "PERMISSION_DENIED";
    else if (error.code == 2)
        msg += "POSITION_UNAVAILABLE";
    else if (error.code == 3)
        msg += "TIMEOUT";
    if (!this.check){
    	console.log(msg);
		insertInfo("location ",msg,true);
		this.check = true;
	}
	else{
		gps.echoGPS(function(position){
    		//insertInfo("native location "+JSON.stringify(position));
			this._center_lon = position[1];
			this._center_lat = position[0];
			if (this._center_lon != 0 && this._center_lat != 0)
				GPSLocation.prototype.handleLocationData(this._center_lat,this._center_lon);
		},
		function(err){
			insertInfo("native ",err,true);
		});
	}
	GPSLocation.prototype.initialize();
}

GPSLocation.prototype.showPosition = function (position) {
    console.log("show location",position);
    //insertInfo("location "+JSON.stringify(position));
	this._center_lon = position.coords.longitude;
	this._center_lat = position.coords.latitude;
	GPSLocation.prototype.handleLocationData(this._center_lat,this._center_lon);
}

GPSLocation.prototype.handleLocationData = function (lat,lon){
	var my_location = new google.maps.LatLng(lat,lon);
	if (!this._map){
	    console.log("location clone map");
		this._map = MapSingelton.getMap();
		this._map.map.setCenter(my_location);
		this._map.setMarker(Marker(new Date().getTime(),my_location,"title","me"));
	}
	this._map.setMyLocation(my_location);
};

GPSLocation.prototype.getMap = function (){
	return _map;
};

GPSLocation.prototype.getLonLat = function (){
	return [_center_lon,_center_lat];
};