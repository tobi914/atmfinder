var map;
var infowindow;
var service;

function initialize(){
  document.getElementById("hidden").style.display = "none";
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
    var marker = new google.maps.Marker({
      map:map,
      icon:"http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      label:"Your Position",
      position:loc
    });
    updateMarker(1000, ["atm"], loc);
  })
  locationPromise.catch((pos_err) => {
    alert(pos_err);
  });
}

function callback(results, status, loc){
  if(status == google.maps.places.PlacesServiceStatus.OK){
    var tbodyId = document.getElementById("atmList");
    var link;
    results = distanceSort(results, loc);
    for(var i = 0; i < 10; ++i){
      mark(results[i]);
      link = "https://maps.googleapis.com/maps/api/staticmap?center=" + loc.lat() + "," + loc.lng() + "&size=400x300&markers=color:blue|size:tiny|" + loc.lat() + "," + loc.lng() + "&markers=color:red|size:mid|" + results[i].geometry.location.lat() + "," + results[i].geometry.location.lng() + "&key=AIzaSyBP-BLiqXxf5pnZdnZYz9diITQfKkvoqWY";
      console.log(link);
      var row = tbodyId.insertRow(-1);
      var namecell = row.insertCell(0);
      var distcell = row.insertCell(1);
      var hcell = row.insertCell(2);
      hcell.style.display = "none";
      (function(row, hcell){
        row.addEventListener("click", () => {
          toggle(hcell);
        });
      }(row, hcell));
      namecell.innerHTML = results[i].name;
      distcell.innerHTML = results[i].distance.toFixed(0) + "m";
      hcell.innerHTML = document.createElement("IMG");
      hcell.innerHTML = "<img src=" + link + ">";
    }
  }
}

function mark(place){
  var marker = new google.maps.Marker({
    map:map,
    animation: google.maps.Animation.DROP,
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
    //radius:rad,
    types:type,
    rankBy:google.maps.places.RankBy.DISTANCE
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

function sortTable(index)
{
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("atmList");
  switching = true;
  while(switching){
    switching = false;
    rows = table.getElementsByTagName("TR");
    for(i = 1; i < rows.length - 1; ++i){
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[index];
      y = rows[i + 1].getElementsByTagName("TD")[index];
      if(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()){
        shouldSwitch = true;
        break;
      }
    }
    if(shouldSwitch){
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

function toggle(cell){
  if(cell.style.display === "none"){
    cell.style.display = "block";
    document.getElementById("hidden").style.display = "block";
  }
  else{
    cell.style.display = "none";
    document.getElementById("hidden").style.display = "none";
  }
}

google.maps.event.addDomListener(window, "load", initialize);
