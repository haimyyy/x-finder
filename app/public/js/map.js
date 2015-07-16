function Marker (id,location,title,type){
	return {
		id:id,
		location: location,
		title:title,
		type:type
	}
}
var icons_images = {
	me : "",
	CURIOSITY:'img/Curiosity_Icon 1.png',
	TRACKING:'img/Tracking_Icon 1.png',
	AVOIDANCE:'img/Avoidance_Icon 1.png',
	map_location : "img/Maps_MyPlace.png",
	avoidance_green: 'img/Avoidance_Icon 2.png',
	tracking_green: 'img/Tracking_Icon 2.png',
	curiosity_green: 'img/Curiosity_Icon 2.png',
	avoidance_red: 'img/Avoidance_Icon 3.png',
	tracking_red: 'img/Tracking_Icon 3.png',
	curiosity_red: 'img/Curiosity_Icon 3.png'
}
var MapSingelton = (function (){
    var _map;
    var _oms;
    var _geocoder;
    var _my_marker;
    var _my_location;
    var _info_window;
    var _marker_list = [];
   	var _max_zoom=17;
   	var _min_zoom=14;
  	var counter=0;
    function initializeMap() {
        var mapOptions = {
			center : new google.maps.LatLng(_my_location),
			zoom : 14,
			styles: [{"featureType":"all","elementType":"all","stylers":[{"invert_lightness":true},{"saturation":10},
{"lightness":30},{"gamma":0.5},{"hue":"#435158"}]},
{"featureType":"administrative.province","elementType":"labels.text","stylers":[{"visibility":"off"}]},
{"featureType":"administrative.locality","elementType":"labels.text","stylers":[{"visibility":"off"}]},
{"featureType":"administrative.neighborhood","elementType":"labels.text","stylers":
[{"visibility":"off"}]},
{"featureType":"administrative.land_parcel","elementType":"labels.text","stylers":
[{"visibility":"simpliﬁed"}]},
{"featureType":"landscape.man_made","elementType":"labels.text","stylers":[{"visibility":"off"}]},
{"featureType":"landscape.natural","elementType":"labels.text","stylers":
[{"visibility":"simpliﬁed"}]},
{"featureType":"landscape.natural.landcover","elementType":"labels.text","stylers":
[{"visibility":"off"}]},
{"featureType":"landscape.natural.terrain","elementType":"labels.text","stylers":
[{"visibility":"off"}]},
{"featureType":"road.highway.controlled_access","elementType":"labels.text","stylers":
[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":
[{"visibility":"simpliﬁed"},{"lightness":"-40"},{"gamma":"1.13"}]},
{"featureType":"road.local","elementType":"labels.text","stylers":[{"visibility":"on"},
{"lightness":"-78"},{"gamma":"1.62"},{"weight":"1"},{"hue":"#00ebff"},{"saturation":"-11"}]},
{"featureType":"transit.station.bus","elementType":"all","stylers":[{"visibility":"on"}]}],
		
			disableDefaultUI: true
		};
		console.log("map is ready to use");
		return new google.maps.Map(document.getElementById("map"), mapOptions);
    }
	
	function init_map_events(){
		google.maps.event.addListener(_map, 'zoom_changed', function() {
	    	//if (_map.getZoom()<_min_zoom) _map.setZoom(14);
		});
		
		google.maps.event.addListener(_map, 'center_changed', function() {
		    //console.log(_map.getCenter())
	  	});
	  	
	  	google.maps.event.addListener(_map, 'click', function() {
		   if (_info_window)_info_window.close();
	    });
	}
	
	function showInfoDialog(obj){
		// console.log(obj)
		// //debugger;
		var time = new Date(obj.id);
		var div = $('<div>').attr('id','pop')
		var h4 = $('<h4>').attr('id','popTitle').html(obj.title);
		var p = $('<p>').attr('id','popTime').html(time.getHours()+":"+time.getMinutes())
			
		div.append(h4.toString()).append(p.toString());
		var contentString = '<div id="pop">'+
		'<h4 id="popTitle">'+obj.title+'</h4>'+
		'<p id="popTime">'+time.getHours()+":"+time.getMinutes()+'</p>'+
		'</div>'; 
		
	 console.log(obj,"map")
	  infoBubble = new InfoBubble({
	      map: _map,
	      content: contentString,
	      position: new google.maps.LatLng(obj.position.A, obj.position.F),
	      shadowStyle: 1,
	      padding: 8,
	      backgroundColor: '#19282f',
	      borderRadius: 0,
	      arrowSize: 10,
	      borderWidth: 2,
	      borderColor: '#ffffff',
	      disableAutoPan: true,
	      hideCloseButton: true,
	      arrowPosition: 30,
	      backgroundClassName: 'transparent',
	      arrowStyle: 0,
	      maxHeight:50,
	      minWidth:150,
	      maxWidth:250
    });
	if (_info_window)_info_window.close();
    _info_window=infoBubble;
    _info_window.open();
	}
	
	function onMarkerPressed() {
		//showInfoDialog(this);
		switch(_map.getZoom()){
			case _max_zoom:{
				if(this.type == "me")
					_map.setZoom(_min_zoom);
				break;
			}
			case _min_zoom:{
				if(this.type == "me")
					_map.setZoom(_max_zoom);
				//_map.setCenter(new google.maps.LatLng(this.position.k, this.position.D));
				break;
			}
			default:{
				//_map.setZoom(_min_zoom);
				//_map.setCenter(new google.maps.LatLng(this.position.k, this.position.D));
				break;
			}
		}
		if (this.type == "me") return;
		showInfoDialog(this);
	}
	
    function HomeControl(map,image) {
		var controlDiv = document.createElement('div');
		controlDiv.style.paddingRight = '10px';
		controlDiv.style.paddingLeft = '10px';
		controlDiv.setAttribute("id", image.split(".")[0]);
		controlDiv.innerHTML = '<img id='+image.split(".")[0]+' src='+image+' width="45" height="45" >';
		if (controlDiv.getAttribute("id").indexOf(icons_images.map_location)) {
				controlDiv.style.paddingBottom = '14px';
				controlDiv.style.paddingRight = '20px';
		}
		// if (controlDiv.getAttribute("id")=="img/someNameToBePopup") {
				// controlDiv.setAttribute("data-rel","popup");
		// }
		// Setup the click event listeners: simply set the map to
		google.maps.event.addDomListener(controlDiv, 'click', function() {
			if (this.getAttribute("id").indexOf(icons_images.map_location)){
				console.log("my location button pressed")
				console.log("set center to ",_my_location)
				_map.setCenter(_my_location)
				_map.setZoom(_max_zoom);
				
			}
		});
		return controlDiv;
	}
    return {
		getMap: function () {
            if (!_map) {
            	//if (window.localStorage.getItem("_my_location") != null)
            		//_my_location = JSON.parse(window.localStorage.getItem("_my_location"));
            	if (!_my_location) 
            		_my_location = new google.maps.LatLng(31.7963186,35.175359);
                _map = initializeMap();
                _map.setCenter(_my_location);
                _oms = new OverlappingMarkerSpiderfier(_map, {markersWontMove: true, markersWontHide: true , keepSpiderfied:true});
                _geocoder = new google.maps.Geocoder()
                _map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(new HomeControl(_map,icons_images.map_location));
               
                init_map_events()
               
            }
			return {
				map: _map,
				setMarker : function (marker){
					// if the marker is't exist in marker list.
					// else new google.maps.Marker({position: new google.maps.LatLng(m[0].position.k, m[0].position.D),map: MapSingelton.getMap().map,title: m[0].title,});
					var image;
					if (marker.type.indexOf("avoidance_green") != -1 || marker.type.indexOf("avoidance_red") != -1) 
						image = new google.maps.MarkerImage(
					    	icons_images[marker.type],
						    new google.maps.Size(71, 71),
						    new google.maps.Point(0, 0),
						    new google.maps.Point(25, 27),
						    new google.maps.Size(50, 50));
					else if (marker.type.indexOf("curiosity_green") != -1 || marker.type.indexOf("curiosity_red") != -1) 
						image = new google.maps.MarkerImage(
					    	icons_images[marker.type],
						    new google.maps.Size(71, 71),
						    new google.maps.Point(0, 0),
						    new google.maps.Point(29, 25),
						    new google.maps.Size(60,45));
					else if (marker.type.indexOf("tracking_green") != -1 || marker.type.indexOf("tracking_red") != -1) 
						image = new google.maps.MarkerImage(
					    	icons_images[marker.type],
						    new google.maps.Size(71, 71),
						    new google.maps.Point(0, 0),
						    new google.maps.Point(25, 25),
						    new google.maps.Size(50, 50));
					else { 	
						if (marker.type == 'AVOIDANCE')
							image = new google.maps.MarkerImage(
						    	icons_images[marker.type],
							    new google.maps.Size(71, 71),
							    new google.maps.Point(0, 0),
							    new google.maps.Point(17, 36),
							    new google.maps.Size(47, 60));
						if (marker.type == 'TRACKING')
							image = new google.maps.MarkerImage(
						    	icons_images[marker.type],
							    new google.maps.Size(71, 71),
							    new google.maps.Point(0, 0),
							    new google.maps.Point(17, 36),
							    new google.maps.Size(47, 60));
						if (marker.type == 'CURIOSITY')					
							image = new google.maps.MarkerImage(
						    	icons_images[marker.type],
							    new google.maps.Size(71, 71),
							    new google.maps.Point(0, 0),
							    new google.maps.Point(17, 36),
							    new google.maps.Size(47, 60));
					}
				 	var map_marker = new google.maps.Marker({
				        position: marker.location,
				        map: _map,
				        icon: image,
				        type: marker.type,
				        id:marker.id,
				        title: marker.title,
				        optimized: false,
			    	});
			    	google.maps.event.addListener(map_marker, 'click', onMarkerPressed);
			    	if (marker.type == "me"){
			    		_my_marker = map_marker;
			    		_my_marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			    		return;
			    	}
			    	// if (marker.type.indexOf("user") != -1){
			    	// 	return;
			    	// }
			    	_marker_list.push(map_marker);
			    	_oms.addMarker(map_marker);
				},
				setMyLocation : function (location){
					_my_location = location;
					_my_marker.setPosition(_my_location);
				},
				changeMyImage : function (icon){
					if (icon == 'CURIOSITY')
						_my_marker.setIcon({url:icons_images[icon] ,size: {width:71,height:71},scaledSize: {width:22,height:32},anchor: {x:17,y:34},origin: {x:0,y:0}})
					else 
						_my_marker.setIcon({url:icons_images[icon] ,size: {width:71,height:71},scaledSize: {width:25,height:27},anchor: {x:17,y:34},origin: {x:0,y:0}})
				},
				getMarkers : function (){
					return _marker_list;
				},
				getOms : function (){
					return _oms;
				},
				removeMarkers : function (){
					for (var i = 0; i < _marker_list.length; i++) {
					    _marker_list[i].setMap(null);
					}
					_marker_list=[];
					_oms = new OverlappingMarkerSpiderfier(_map, {markersWontMove: true, markersWontHide: true , keepSpiderfied:true});
				},
				getGeocoder : function (){ // receive callback
					 var address =_geocoder.geocode({'location': _my_location}, function(results, status) {
				        if (status === google.maps.GeocoderStatus.OK)
				        {
				        	console.log (results[0].formatted_address);
						   	//callback(results[0].formatted_address);
				        }
				        else
				        {
				            alert('Please try again to checkin!');
				        }
				    });
				},
				refreshMap : function (){ // receive callback
					  google.maps.event.trigger(map, 'resize');
				},
				clearPopup : function (){ // receive callback
					if (_info_window)
						_info_window.close();
					//google.maps.event.trigger(map,'click')
				}
			}
		}
    };
    
})();


