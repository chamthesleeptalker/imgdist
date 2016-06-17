var main_url="http://diwataapi-lkpanganiban.rhcloud.com/api/v2/scene/multi/";
//var img_url="http://diwataapi-lkpanganiban.rhcloud.com/static";

  
// General initialization scripts. Form elements, etc.

// global cloudFilter object
var cloudSlider = $('#cloud_slide');

//global map object
var map = L.map('map');

//global image provider array
var imageTray=['hpt','mfc','wfc','smi','landsat8'];

//global sat provider array
var satTray=['diwata-1','landsat-8'];

//global date interval array
var iniDateTray =selection;

function init(){

    $.material.init()

    // $('#datefilterstart').datetimepicker({
    //     format: "YYYY-MM-DD",
    //     defaultDate: "2016-01-01"
    // });

    // $('#datefilterend').datetimepicker({
    //     format: "YYYY-MM-DD",
    //     defaultDate: new Date()
    // });

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
        color:"rgb(28,28,5)",
        weight:3,
        opacity: 1,
        fillColor:"rgb(28,28,5)",
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

    // Setup event handlers for the filters 
    $("#satelliteFilter, #sensorFilter").on('change', function(){
        executeFilters();
    });

    // $('#datefilterstart, #datefilterend').on('dp.change', function(){
    //     executeFilters();
    // });

    $(".imageFilter").on('change',function(){
        // imageTray.push($(".imageFilter").val());
        // console.log(imageTray);
        imageTray=[];
        $.each($("input[name='imgFilter']:checked"), function(){
            imageTray.push($(this).val());

        });

        var satArrayCheck = isInArray("landsat8",imageTray);

        if(satArrayCheck === true && imageTray.length >= 2){
            satTray=["diwata-1","landsat-8"];
        }else if(satArrayCheck === false && imageTray.length >= 1){
            satTray=["diwata-1"];
        }else{
            satTray=["landsat-8"];
        }

        //console.log(imageTray);
        executeFilters();
    });

    cloudSlider.on('change',function(){
        executeFilters();
    });

    // Run filters the first time
    executeFilters();
});

//cloud filter
// $("#cloud_fil").on('click',function(){
//     $("#cloudFilterContainer").slideToggle("fast");
//     $("#dateFilterContainer").css("display","none");
//     $("#imageFilterContainer").css("display","none");
// });

// //date filter
// $("#date_fil").on('click',function(){
//     $("#dateFilterContainer").slideToggle("fast");
// });

// $("#image_fil").on('click',function(){
//     $("#imageFilterContainer").slideToggle("fast");
//     $("#cloudFilterContainer").css("display","none");
//     $("#dateFilterContainer").css("display","none");
// });

//morefilter filter
$("#moreFilterShow,#imageShoppingCart").on('click',function(){
    var cloud_image_state = $("#cloud_image").css("display");
    var filter_state = $("#filtersBtn").hasClass("filter-tab-active");

    if(cloud_image_state == "none"){
        $("#cloud_image").slideToggle("fast");    
    }
});

// $("#moreFilterShow").on('click',function(){
//     var cloud_image_state = $("#cloud_image").css("display");
//     var filter_state = $("#filtersBtn").hasClass("filter-tab-active");

//     if(filter_state == true){
//         $("#cloud_image").slideToggle("fast");    
//     }
    
// });

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
    $("#cloud_fil, #image_fil").css('display','none');
    $("#image_fil_cart").css('display','block');
    $("#imagecartBtn").addClass("filter-tab-active");
    $("#filtersBtn").removeClass("filter-tab-active");
});

$('#filtersBtn,#filter_icon').on('click',function(){
    $("#cloud_fil, #image_fil").css('display','block');
    $("#image_fil_cart").css('display','none');
    $("#imagecartBtn").removeClass("filter-tab-active");
    $("#filtersBtn").addClass("filter-tab-active");
});



