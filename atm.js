var map;
var infowindow;
var service;

function initialize(){
  map = new google.maps.Map(document.getElementById("map"), {
    zoom:13
  });
  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
  updateLocation();
}

function updateLocation(){
  var locationPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  locationPromise.then((pos) => {
    var loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    map.setCenter(loc);
    updateMarker(1000, ["atm"], loc);
  })
  locationPromise.catch((pos_err) => {
    alert(pos_err);
  });
}

function callback(results, status, loc){
  if(status == google.maps.places.PlacesServiceStatus.OK){
    var tbodyId = document.getElementById("atmList");
    results = distanceSort(results, loc);
    for(var i = 0; i < 10; ++i){
      mark(results[i]);
      var row = tbodyId.insertRow(-1);
      var namecell = row.insertCell(0);
      var distcell = row.insertCell(1);
      namecell.innerHTML = results[i].name;
      distcell.innerHTML = results[i].distance.toFixed(0) + "m";
    }
  }
}

function mark(place){
  var marker = new google.maps.Marker({
    map:map,
    position:place.geometry.location
  });
  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function updateMarker(rad, type, loc){
  var request = {
    location:loc,
    radius:rad,
    types:type
  };
  service.nearbySearch(request, (result, status) => {
    callback(result, status, loc);
  });
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceSort(places, loc){
  places.sort((a, b) => {
    a.distance = calcDistance(a.geometry.location, loc) * 1000;
    b.distance = calcDistance(b.geometry.location, loc) * 1000;
    return a.distance - b.distance;
  });
  return places;
}

function calcDistance(pos1, pos2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(pos2.lat()-pos1.lat());
  var dLon = degreesToRadians(pos2.lng()-pos1.lng());

  var lat1 = degreesToRadians(pos1.lat());
  var lat2 = degreesToRadians(pos2.lat());

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadiusKm * c;
}
google.maps.event.addDomListener(window, "load", initialize);
