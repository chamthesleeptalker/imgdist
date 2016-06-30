//var main_url="http://diwataapi-lkpanganiban.rhcloud.com/api/v2/scene/multi/";
var main_url = "http://api.images.phl-microsat.xyz/scene/multi/?format=json&date_hist=day";
// General initialization scripts. Form elements, etc.

// global cloudFilter object
var cloudSlider = $('#cloud_slide');

//global map object
var map = L.map('map');

//global image provider array
var imageTray = ['hpt','mfc','wfc','smi','landsat8'];

//global sat provider array
var satTray= ['diwata-1','landsat8'];

//global calendar variable
var calendar_fil,start_date,end_date;

function init(){

    $.material.init()

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
    
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 5,
        maxZoom: 8,
        attribution: osmAttrib
    });

    map.setView(new L.LatLng(11.5, 121.8), 5);
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
        color:"#2956bd",
        weight:3,
        opacity: 1,
        fillColor:"rgba(45, 96, 210,0.5)",
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
            content +="<p><b>Acquisition Date:</b> "+feature.properties.published+"</p>"; //acquisition date
            content +="<p><b>Cloud Cover:</b> "+feature.properties.cloud_cover+"</p>"; //cloud cover
            content +="<p><b>Receiving Station:</b> "+feature.properties.receiving_station+"</p>"; //receiving station
            content +="<p><b>Satellite:</b> "+feature.properties.sat.sat_id+"</p>"; //satellite
            content +="<p><b>Scene Name:</b> "+feature.properties.scene_id+"</p>"; //scene name
            content +="<p><b>Sensor:</b> "+feature.properties.payload+"</p>"; //sensor

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
    //createHistogram();

    // Setup event handlers for the filters 
    $("#satelliteFilter, #sensorFilter").on('change', function(){
        executeFilters();
    });

    $(".imageFilter").on('change',function(){
        imageTray=[];
        $.each($("input[name='imgFilter']:checked"), function(){
            imageTray.push($(this).val());

        });

        var satArrayCheck = isInArray("landsat8",imageTray);

        if(satArrayCheck === true && imageTray.length >= 2){
            satTray=["diwata-1","landsat8"];
        }else if(satArrayCheck === false && imageTray.length >= 1){
            satTray=["diwata-1"];
        }else{
            satTray=["landsat8"];
        }

        executeFilters();
    });

    $(".ccNoDataFilter").on('change',function(){
        var ccNoDataValue = $('.ccNoDataFilter').val();
        //console.log(ccNoDataValue);

        executeFilters();
    });



    cloudSlider.on('change',function(){
        executeFilters();
    });

    calendar_fil = $('#date_fil').daterangepicker({
                        "showDropdowns": true,
                        "autoApply": true,
                        "linkedCalendars": false,
                        "startDate": "01/1/2015",
                        "endDate": "12/31/2015",
                        "drops": "up"
                        }, function(start, end, label) {
                            $('#currentDateFil').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD') );

                            start_date = start.format('YYYY-MM-DD');
                            end_date = end.format('YYYY-MM-DD');

                            executeFilters();
                    });

    // Run filters the first time
    executeFilters();
});

//morefilter filter
$("#moreFilterShow,#imageShoppingCart").on('click',function(){
    var cloud_image_state = $("#cloud_image").css("display");
    var filter_state = $("#filtersBtn").hasClass("filter-tab-active");

    if(cloud_image_state == "none"){
        $("#cloud_image").slideToggle("fast");    
    }
});

$("#filterCloseButton").on('click', function(){
    $("#cloud_image").slideToggle("fast");
});

$('#imageCards').perfectScrollbar({
    maxScrollbarLength: 100
});

$('#image_fil_cart').perfectScrollbar({
    maxScrollbarLength: 70
});

$('#imagecartBtn,#cart_fil').on('click',function(){
    $("#cloud_fil, #image_fil,#date_fil_container").css('display','none');
    $("#image_fil_cart").css('display','block');
    $("#imagecartBtn").addClass("filter-tab-active");
    $("#filtersBtn").removeClass("filter-tab-active");
});

$('#filtersBtn,#filter_icon').on('click',function(){
    $("#cloud_fil, #image_fil,#date_fil_container").css('display','block');
    $("#image_fil_cart").css('display','none');
    $("#imagecartBtn").removeClass("filter-tab-active");
    $("#filtersBtn").addClass("filter-tab-active");
});



