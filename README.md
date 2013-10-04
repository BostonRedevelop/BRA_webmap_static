## Boston Redevelopment Authority Web Map (STATIC)

* Developed by Boston Redevelopment Authority and City of Boston.

* Built on open source tools (<a href="http://jquery.com">jQuery</a>, <a href="http://leafletjs.com">Leaflet</a>, <a href="https://github.com/mbostock/topojson/wiki">TopoJSON</a>).

* Extensible so you can add layers using <a href="http://leafletjs.com/plugins.html">Leaflet plugins</a>, <a href="http://esri.github.io/esri-leaflet/">Esri-Leaflet</a>, <a href="http://arthur-e.github.io/Wicket/">Wicket</a>, and <a href="https://github.com/proj4js/proj4js#using">Proj4JS</a>

* Static for easy hosting on GitHub Pages

* Free and open source for your input and for reuse!

* Includes open data layers: Boston City Limits and Neighborhood Boundaries.

## Map Controls

***Address Box*** is a search box. It queries Boston's parcel database on an ArcGIS Server / MapServer.

<img src="https://raw.github.com/mapmeld/BRA_webmap_static/gh-pages/screenshots/addressbox.png"/>

***View Box*** is a layer control. It can switch between multiple layers with an icon and label

<img src="https://raw.github.com/mapmeld/BRA_webmap_static/gh-pages/screenshots/viewbox.png"/>

***Filter Box*** is a category control. It can filter down the features shown from the View Box's selected layer.

<img src="https://raw.github.com/mapmeld/BRA_webmap_static/gh-pages/screenshots/filterbox.png"/>

***Map View Drawer*** is a basemap selector. Click to reveal any number of layers, click a layer to change the basemap, and click again to hide the selector.

<img src="https://raw.github.com/mapmeld/BRA_webmap_static/gh-pages/screenshots/mapview.png"/>

***Zoom Slider*** is a custom-styled zoom control based on <a href="https://github.com/kartena/Leaflet.zoomslider">Kartena's ZoomSlider</a>.

<img src="https://raw.github.com/mapmeld/BRA_webmap_static/gh-pages/screenshots/zoomslider.png"/>

## Map Layers

* <a href="https://github.com/mapmeld/BRA_webmap_static/blob/gh-pages/data/citylimit.topojson">citylimit.topojson</a> is the boundary of the City of Boston

* <a href="https://github.com/mapmeld/BRA_webmap_static/blob/gh-pages/data/neighborhoods.topojson">neighborhoods.topojson</a> is an unofficial set of neighborhood boundaries within the City of Boston

## Additional Tweaks

* TopoJSON is supported in older versions of IE using a polyfill for Array.prototype.forEach and Array.prototype.map

* The map changes the theme and works around <a href="https://github.com/kartena/Leaflet.zoomslider/issues/55">an iOS bug</a> in ZoomSlider