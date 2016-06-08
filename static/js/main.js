var main_url="http://diwataapi-lkpanganiban.rhcloud.com/api/scene/multi/";
var img_url="http://diwataapi-lkpanganiban.rhcloud.com/static";

  
// General initialization scripts. Form elements, etc.

// global cloudFilter object
var cloudSlider = $('#cloud_slide');
var map = L.map('map');

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

    // noUiSlider.create(cloudSlider, {
    //     start: [0, 100],
    //     connect: true,
    //     margin: 5,
    //     step: 5,
    //     range: {
    //         'min': 0,
    //         'max': 100
    //     }
    // });

   cloudSlider.ionRangeSlider({
        type: "double",
        min: 0,
        max: 100,
        from:0,
        to:100,
        grid: true
    });

}

// Scripts for initializing the map
function init_map(){
    

    //map = L.map('map');
    
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
        keepAspectRatio:false
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
        fillOpacity: 0.4
    };

    //Footprint options
    var footprintOptions = {
        color:"#1C0021",
        weight:3,
        opacity: 1,
        fillColor:"#1C0021",
        fillOpacity:0.3
    };

    //Layer popup options
    var popupOptions ={
        closeOnClick: true,
        className: "popup",
        closeButton: false
    };

    //Image point markers in the map
    image_markers = L.geoJson(false,{
        style: function(feature){
            if (feature.geometry.type == "Point") {
                return geojsonMarkerOptions;
            } else{                
                return footprintOptions;
            }
        },
        pointToLayer: function(feature,latlng){
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: function(feature, layer){
            
            var popup = new L.popup(popupOptions);

            var content ="<h4>SCENE INFO</h4>";
            content +="<p><b>Acquisition Date:</b> "+feature.properties.acquisition_date+"</p>"; //acquisition date
            content +="<p><b>Cloud Cover:</b> "+feature.properties.cloud_cover+"</p>"; //cloud cover
            content +="<p><b>Receiving Station:</b> "+feature.properties.receiving_station+"</p>"; //receiving station
            content +="<p><b>Satellite:</b> "+feature.properties.satellite+"</p>"; //satellite
            content +="<p><b>Scene Name:</b> "+feature.properties.scene_name+"</p>"; //scene name
            content +="<p><b>Sensor:</b> "+feature.properties.sensor+"</p>"; //sensor

            popup.setContent(content);

            layer.bindPopup(popup);
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

    cloudSlider.on('change',function(){
        executeFilters();
    });

    // Run filters the first time
    executeFilters();
});

//cloud filter
$("#cloud_fil").on('click',function(){
    $("#cloudFilterContainer").slideToggle("fast");
});


