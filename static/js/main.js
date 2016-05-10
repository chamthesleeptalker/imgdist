var main_url="http://diwataapi-lkpanganiban.rhcloud.com/api/scene/multi/";
var img_url="http://diwataapi-lkpanganiban.rhcloud.com/static";

  
// General initialization scripts. Form elements, etc.
function init(){

    $.material.init()

    $('#datefilterstart').datetimepicker({
        format: "YYYY-MM-DD",
        defaultDate: "2016-01-01"
    });

    $('#datefilterend').datetimepicker({
        format: "YYYY-MM-DD",
        defaultDate: new Date()
    });
}

// Scripts for initializing the map
function init_map(){
    

    map = L.map('map');
    
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 2,
        maxZoom: 12,
        attribution: osmAttrib
    });

    map.setView(new L.LatLng(11.5, 121.8), 6);
    map.addLayer(osm);

    // Screen dimensions
    var width, height;

    // Get screen width and height
    width = $("#map_section").width();
    height = $("#map_section").height();

    // Area select plugin
    areaSelect=L.areaSelect({
        width: width-100,
        height: height-100,
    });
    areaSelect.addTo(map);
    areaSelect.on("change",function(){
        bounds = areaSelect.getBounds();
        executeFilters(bounds);
    });

    // Circle Marker Options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#1c3166",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //Image point markers in the map
    image_markers = L.geoJson(false,{
        pointToLayer: function(feature,latlng){
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });
    image_markers.addTo(map);
}


$(function(){

    // Initialize everything
    init();
    init_map();

    // Setup event handlers for the filters 
    $("#satelliteFilter, #sensorFilter").on('change', function(){
        executeFilters();
    });

    $('#datefilterstart, #datefilterend').on('dp.change', function(){
        executeFilters();
    });

    // Run filters the first time
    executeFilters();
});
