var staticDirectory = "data/";
var lat = 42.323524;
var lng = -71.107292;
var zoom = 12;
var hideHistoric = false;
var neighborhoodZoom = 14;
var basemapZoom = 14;

// URL parameters
if(getURLVar("ll")){
  var ll = getURLVar("ll").split(",");
  lat = 1.0 * ll[0];
  lng = 1.0 * ll[1];
}
if(getURLVar("z")){
  zoom = Math.round(1 * getURLVar("z"));
}
if(!getURLVar("boxoffset")){
  // for homepage - move boxes down Y axis by 103px
  $(".addressbox").css({ top: "143px" });
  $(".layerbox").css({ top: "231px" });
  $(".filterbox").css({ top: "319px" });
}

var map = L.map('map', {
  center: [ lat, lng ],
  zoom: zoom,
  minZoom: 8,
  maxZoom: 16,
  zoomsliderControl: false,
  scrollWheelZoom: false,
  touchZoom: false,
  zoomControl: false,
  attributionControl: false
});

// load ESRI gray map and BRA basemap
var baseMapLayer = L.tileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}").addTo(map);
var baseMapInternal = L.tileLayer("http://maps.cityofboston.gov/ArcGIS/rest/services/Planning/BRA_Basemap/MapServer/tile/{z}/{y}/{x}").addTo(map);
baseMapInternal.setOpacity(0);

// URL variable for other basemap
var basemap = "maptype_map";
if(getURLVar("mapview") && getURLVar("mapview") != "map"){
  map.removeLayer(baseMapLayer);
  baseMapInternal.setOpacity(0);
  var chooseLayer = getURLVar("mapview").toLowerCase();
  var selectLayer = "maptype_map";
  if(chooseLayer == "satellite"){
    baseMapLayer = L.tileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map);  
    selectLayer = "maptype_sat";
  }
  else if(chooseLayer == "historic"){
    map.options.maxZoom = 15;
    baseMapLayer = L.tileLayer('http://{s}.tiles.electronbolt.com/historical/{z}/{x}/{y}.png').addTo(map);
    selectLayer = "maptype_past";
  }
  $(".activemaptype").removeClass("activemaptype");
  $("#" + selectLayer + " img").addClass("activemaptype");
  basemap = selectLayer;
}
if(hideHistoric){
  $("#maptype_past").css({ display: "none" });
}

// city limit overlay
var citylimit = null;
$.getJSON(staticDirectory + "citylimit.topojson", function(tj){
  var gj = topojson.feature( tj, tj.objects.collection );
  citylimit = L.geoJson(gj, {
    style: function(feature){
      var borderColor = "#000";
      if($("#maptype_sat img").hasClass("activemaptype")){
        borderColor = "#fff";
      }
      return { weight: 3, opacity: 0, color: borderColor, fillOpacity: 0, clickable: false };
    }
  }).addTo(map);
});

// neighborhood overlays
var neighborhoods = [ ];
$.getJSON(staticDirectory + "neighborhoods.topojson", function(tj){
  var gj = topojson.feature( tj, tj.objects.collection );
  L.geoJson(gj, {
    style: function(feature){
      var name = feature.properties.Name;
      var ncolor = getNeighborhoodColor( name );
      return { weight: 3, opacity: 1, color: ncolor, fillColor: ncolor, fillOpacity: 1, clickable: true };
    },
    onEachFeature: function(feature, layer){      
      // add events
      layer.on('click', function(e){
      })
      .on('dblclick', function(e){
        map.zoomIn(1);
      });

      // add text label
      var xOffset = 0;
      var yOffset = 0;
      if(feature.properties.Name == "Bay Village"){
        xOffset = 5;
      }
      else if(feature.properties.Name == "Chinatown"){
        yOffset = 10;
      }
      else if(feature.properties.Name == "Longwood Medical Area" || feature.properties.Name == "East Boston"){
        xOffset = 25;
      }
      else if(feature.properties.Name == "Jamaica Plain" || feature.properties.Name == "South Boston" || feature.properties.Name == "South Boston Waterfront"){
        xOffset = 10;
      }
      else if(feature.properties.Name == "Leather District"){
        yOffset = 12;
      }
      else if(feature.properties.Name == "Downtown"){
        xOffset = -8;
        yOffset = 4;
      }
      else if(feature.properties.Name == "Beacon Hill"){
        yOffset = 16;
      }
      else if(feature.properties.Name == "North End"){
        yOffset = 16;
      }
      else if(feature.properties.Name == "Back Bay"){
        yOffset = 16;
      }
      else if(feature.properties.Name == "West End" || feature.properties.Name == "Fenway" || feature.properties.Name == "South End" || feature.properties.Name == "North End" || feature.properties.Name == "Downtown"){
        yOffset = 8;
      }
      var labelIcon = L.divIcon({ className: 'title-overlay', html: feature.properties.Name, iconAnchor: [ 25 + xOffset, yOffset ], clickable: false });
      var label = L.marker( layer.getBounds().getCenter(), { icon: labelIcon } ).addTo(map);
      label.on('click', function(e){
        layer.fireEvent('click', e);
      });
      neighborhoods.push({ layer: layer, properties: feature.properties });
      map.addLayer(layer);
    }
  });
});
function getNeighborhoodColor(name){
  var ncolor = "#000";
  if(name == "Harbor Islands" || name == "Chinatown" || name == "Mission Hill" || name == "North End" || name == "Roslindale" || name == "South Boston Waterfront"){
    ncolor = "#00647B";
  }
  else if(name == "East Boston" || name == "Brighton" || name == "Dorchester" || name == "Downtown" || name == "Fenway" || name == "Hyde Park" || name == "Jamaica Plain"){
    ncolor = "#008399";
  }
  else if(name == "Charlestown" || name == "Bay Village" || name == "Leather District" || name == "Roxbury" || name == "West End"){
    ncolor = "#00C4DA";
  }
  else if(name == "Allston" || name == "Back Bay" || name == "Longwood Medical Area" || name == "Mattapan" || name == "South Boston" || name == "West Roxbury"){
    ncolor = "#15B8C1";
  }
  else if(name == "Beacon Hill" || name == "South End"){
    ncolor = "#049299";
  }
  return ncolor;
}

// change visibility of neighborhoods, BOLD when zooming
map.on('zoomend', function(){
  if(map.getZoom() < basemapZoom){
    if(map.hasLayer(baseMapInternal)){
      baseMapInternal.setOpacity(0);
      map.addLayer(baseMapLayer);
    }
  }
  else if(!baseMapInternal.options.opacity && basemap == "maptype_map"){
    map.removeLayer(baseMapLayer);
    baseMapInternal.setOpacity(1);
  }
  if(map.getZoom() >= neighborhoodZoom){
    $(".title-overlay").css({ display: "none" });
    var neighborhoodOutline = 0;
    if( $("#maptype_past img").hasClass("activemaptype") ){
      neighborhoodOutline = 1;
    }
    if(citylimit){
      citylimit.setStyle({ opacity: 1 });
    }
    for(var n=0;n<neighborhoods.length;n++){
      var name = neighborhoods[n].properties.Name;
      var ncolor = getNeighborhoodColor( name );
      neighborhoods[n].layer.setStyle({ color: ncolor, fillOpacity: 0, opacity: neighborhoodOutline, clickable: false });
    }
  }
  else{
    $(".title-overlay").css({ display: "block" });
    if(citylimit){
      citylimit.setStyle({ opacity: 0 });
    }
    for(var n=0;n<neighborhoods.length;n++){
      neighborhoods[n].layer.setStyle({ fillOpacity: 1, opacity: 1, clickable: true });
    }
  }
});

// load Article 80 projects
if(getURLVar("hideviewby") == "true"){
  $(".layerbox").css({ display: "none" });
}
function makeIcon(color){
  return L.icon({
    iconUrl: staticDirectory + color + ".png",
    iconSize: [20, 30],
    iconAnchor: [10, 30],
    popupAnchor: [0, -30],
    labelAnchor: [4, -18]
  });
}
var fuschia = makeIcon("fuschia");
var blue = makeIcon("blue");
var gold = makeIcon("gold");
var green = makeIcon("green");
var purple = makeIcon("purple");

// avoid clicking map through control boxes
function blockBoxes(boxes){
  for(var b=0;b<boxes.length;b++){
    L.DomEvent.disableClickPropagation( boxes[b] );
  }
}
blockBoxes($(".map_overlay_left"));
blockBoxes($(".map_overlay_center"));
blockBoxes($(".map_overlay_right"));
blockBoxes($("#mapselect"));

// browser-specific CSS fixes
var userAgent = navigator.userAgent.toLowerCase();
if(userAgent.indexOf("firefox") > -1){
  // Firefox
  $("#map .filter-symbol").css({
    padding: "3px 5px 3px 0"
  });
}
else if(userAgent.indexOf("iphone") > -1 || userAgent.indexOf("ipod") > -1 || userAgent.indexOf("ipad") > -1){
  // iOS
  $("#map .filter-symbol").css({
    padding: "3px 5px 3px 0"
  });
  setTimeout(function(){
    $("#map .leaflet-control-zoomslider-knob").css({
      "margin-left": "-8px",
      "background-position": "3px 2px"
    });
  }, 300);
  $("#map .zoomtool").removeClass("shadowed");
}

// address search
var parcelLayer = null;
map.on('dragstart', function(e){
  if(parcelLayer){
    map.removeLayer(parcelLayer);
    parcelLayer = null;
  }
});
if(getURLVar("hidesearch") == "true"){
  $(".addressbox").css({ display: "none" });
  $(".layerbox").css({ top: "40px" });
  $(".filterbox").css({ top: "185px" });
}
$("#address").on('keydown', function(e){
  if(e.keyCode == 13){
    searchAddress();
  }
});
$("#makesearch").click(searchAddress);
function searchAddress(){
  var address = $("#address").val();
  if(parcelLayer){
    map.removeLayer(parcelLayer);
  }

  // test for parcel ID
  if(!isNaN(address * 1)){
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/base_maps/base_map/MapServer/10/query?where=PID_LONG%3D%27" + address + "%27&returnGeometry=true&outSR=4326&f=pjson&callback=zoomToParcel";
    $(document.body).append(s);
    return;
  }
  
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "http://maps.cityofboston.gov/ArcGIS/rest/services/Schools/BostonComposite/GeocodeServer/findAddressCandidates?SingleLine=" + encodeURIComponent(address) + "&f=pjson&outSR=4326&callback=zoomToAddress";
  $(document.body).append(s);
}
function zoomToAddress(data){
  if(!data.candidates || !data.candidates.length){
    return;
  }
  var pt = [data.candidates[0].location.y, data.candidates[0].location.x];
  parcelLayer = L.marker(pt, { icon: purple }).addTo(map);
  map.setView(pt, Math.max(16, map.getZoom()));
}
function zoomToParcel(data){
  var gj = {
    type: "Feature",
    properties: data.features[0].attributes,
    geometry: {
      type: "Polygon",
      coordinates: data.features[0].geometry.rings
    }
  };
  parcelLayer = L.geoJson(gj);
  map.addLayer(parcelLayer);
  map.fitBounds(parcelLayer.getBounds());
}

// selecting layers
$(".layer").on("mouseover", function(e){
  $(e.target).css({ color: "#fff" });
  var icon = $(e.target).children()[0];
})
.on("mouseout", function(e){
  $(e.target).css({ color: "rgb(101, 101, 101)" });
  var icon = $(e.target).children()[0];
})
.on("click", function(e){
  if( $(e.target).hasClass("development_projects") ){
    if($(".layerlabel.development_projects").hasClass("layerlabelselect")){
      //removeLayer('development_projects');
    }
    else{
      //addLayer('development_projects');
    }
  }
});
function addLayer(layername){
  $(".layerlabel." + layername).addClass("layerlabelselect");
  if($(".layericon." + layername).length){
    var src = $(".layericon." + layername)[0].src;
    if(src.indexOf("select") == -1){
      src = src.replace(".png", "select.png");
      $(".layericon." + layername)[0].src = src;
    }
  }
  if(layername == "development_projects"){
    $(".filterbox").css({ display: "block" });

  }
}
function removeLayer(layername){
  $(".layerlabel." + layername).removeClass("layerlabelselect");
  var src = $(".layericon." + layername)[0].src;
  if(src.indexOf("select") != -1){
    src = src.replace("select.png", ".png");
    $(".layericon." + layername)[0].src = src;
  }
  if(layername == "development_projects"){

    $(".filterbox").css({ display: "none" });
  }
}

// neighborhood dropdown
$(".filterselect").on("change", function(e){
  if( $(".filterbox").css("display") == "none" ){
    return;
  }
  var neighborhood = $(".filterselect").val().toLowerCase();
  if(neighborhood == "all"){

  }
  else{
    for(var n=0;n<neighborhoods.length;n++){
      if(neighborhoods[n].properties.Name.toLowerCase() == neighborhood.toLowerCase()){

        break;
      }
    }
  }
});

// filter box
$(".filter").click(function(e){
  // update UI
  if(!$(e.target).hasClass("filter")){
    e.target = $(e.target).parent()[0];
  }
  if($(e.target).hasClass("filter-select")){
    $(e.target).removeClass("filter-select");
  }
  else{
    $(e.target).addClass("filter-select");
  }
  // update map
  var category = "#" + $(e.target).children()[0].id;
});

// zoom slider
$("#zoomslide").append( (new L.Control.Zoomslider()).onAdd(map));
$(".zoomin").click(function(){
  map.zoomIn(1);
});
$(".zoomout").click(function(){
  map.zoomOut(1);
});

// basemap select
var drawerTimeout = null;
map.on('dragend', function(e){
  // hide layer drawer when map is dragged
  if($("#mapselect").css("display") == "none"){
    return;
  }
  if(drawerTimeout){
    clearTimeout(drawerTimeout);
  }
  $("#mapselect").animate(
    { right: "-500px" },
    1000,
    function(){
      $("#mapselect").css({ display: "none" });
    }
  );
});
$("#mapviewtab").click(function(e){
  if(drawerTimeout){
    clearTimeout(drawerTimeout);
  }
  $("#mapselect").css({ right: "-500px", display: "block" });
  $("#mapselect").animate(
    { right: 0 },
    1000
  );
});
$("#mapselect .tab").click(function(e){
  if(drawerTimeout){
    clearTimeout(drawerTimeout);
  }
  $("#mapselect").animate(
    { right: "-500px" },
    1000,
    function(){
      $("#mapselect").css({ display: "none" });
    }
  );
});
$(".maptype").click(function(e){
  if(drawerTimeout){
    clearTimeout(drawerTimeout);
  }
  drawerTimeout = setTimeout(function(){
    $("#mapselect").animate(
      { right: "-500px" },
      1000,
      function(){
        $("#mapselect").css({ display: "none" });
      }
    );
  }, 8000);
  var selectLayer = e.target.id;
  if(!selectLayer){
    selectLayer = $(e.target).parent()[0].id;
  }
  if(selectLayer == basemap){
    // map unchanged
    return;
  }
  map.removeLayer(baseMapLayer);
  baseMapInternal.setOpacity(0);
  if(selectLayer != "maptype_past"){
    map.options.maxZoom = 16;
  }
  if(selectLayer != "maptype_sat"){
    if(citylimit){
      citylimit.setStyle({ color: "#000" });
    }
  }
  if(selectLayer == "maptype_map"){
    baseMapLayer = L.tileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}");
    if(map.getZoom() < basemapZoom){
      baseMapLayer.addTo(map);
    }
    else{
      baseMapInternal.setOpacity(1);
    }
  }
  else{
    if(selectLayer == "maptype_sat"){
      baseMapLayer = L.tileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map);
      if(citylimit){
        citylimit.setStyle({ color: "#fff" });
      }
    }
    else if(selectLayer == "maptype_past"){
      if(map.getZoom() > 15){
        map.setZoom(15);
      }
      map.options.maxZoom = 15;
      if(map.getZoom() >= neighborhoodZoom){
        for(var n=0;n<neighborhoods.length;n++){
          neighborhoods[n].layer.setStyle({ opacity: 1 });
        }
      }
      baseMapLayer = L.tileLayer('http://{s}.tiles.electronbolt.com/historical/{z}/{x}/{y}.png').addTo(map);
    }
  }
  $(".activemaptype").removeClass("activemaptype");
  $("#" + selectLayer + " img").addClass("activemaptype");
  basemap = selectLayer;
});

// forEach and map support for IE<=8 needed for TopoJSON layers
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn,scope){
    'use strict';
    var i, len;
    for (i = 0, len = this.length; i < len; ++i) {
      if(i in this){
        fn.call(scope, this[i], i, this);
      }
    }
  };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}

function replaceAll(src, oldr, newr){
  while(src.indexOf(oldr) > -1){
    src = src.replace(oldr, newr);
  }
  return src;
}
function getURLVar(nm){nm=nm.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var rxS="[\\?&]"+nm+"=([^&#]*)";var rx=new RegExp(rxS);var rs=rx.exec(window.location.href.toLowerCase());if(!rs){return null;}else{return rs[1];}}