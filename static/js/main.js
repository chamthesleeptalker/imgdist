var main_url = "http://api.images.phl-microsat.xyz/scene/multi/?format=json&date_hist=day";
// General initialization scripts. Form elements, etc.

// global cloudFilter object
var cloudSlider = $('#cloud_slide');

//global map object
var map = L.map('map',{
    zoomControl:false
});

//global image provider array
var imageTray = ['hpt','mfc','wfc','smi','landsat8'];

//global sat provider array
var satTray= ['diwata-1','landsat8'];

//global calendar variable
var calendar_fil,start_date,end_date;


/*************Scripts for initializing various objects***************/
function init(){

    //required bootstrap material design initialization
    $.material.init()

    //initialization the cloud cover slider using Ion Range Slider
   cloudSlider.ionRangeSlider({
        type: "double",
        min: 0,
        max: 100,
        from:0,
        to:100,
        grid: true,
        onFinish: function(){
            executeFilters();
        }
    });
}

/**********Scripts for initializing the map************/
function init_map(){
    
    //basemap tiles objects
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 5,
        maxZoom: 8,
        attribution: osmAttrib
    });

    //set the map's initial view to a specified center and zoom level
    map.setView(new L.LatLng(11.5, 121.8), 5);
    map.addLayer(osm);

    //placename geocoder   
    var geocoder = L.Control.Geocoder.Nominatim();
    var control = L.Control.geocoder({
        geocoder: geocoder,
        position:"topleft"
    });
    control.addTo(map);

    //zoom control
    var zoomControl = L.control.zoom({position:'topleft'});
    zoomControl.addTo(map);

    // Screen dimensions
    var width, height;

    // Get screen width and height
    width = $("#map_section").width();
    height = $("#map_section").height();

    //Bounding box filter plugin
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

    //Footprint options
    var footprintOptions = {
        color:"transparent",
        weight:3,
        opacity: 1,
        fillColor:"rgba(45, 96, 210,0.5)",
        fillOpacity:0.5
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
                return footprintOptions;
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


/***********Execute Filters***********/
$(function(){
    // Initialize everything
    init();
    init_map();

    //Execute Qquery after change in image filter cart
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

    //Handles query run when cloud cover with "no data" values are included
    $(".ccNoDataFilter").on('change',function(){
        var ccNoDataValue = $('.ccNoDataFilter').val();
        executeFilters();
    });

    //Handles the query when the date range is changed
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

/*********Filter Interface*********/
//When the Filter/Cart Icon are clicked and the filter div is not yet displayed
$("#moreFilterShow,#imageShoppingCart").on('click',function(){
    // var cloud_image_state = $("#cloud_image").css("display");

    // if(cloud_image_state == "none"){
    //     $("#mainFilterCon").animate({height: ['500px','swing']},750,'swing');  
    //     $("#cloud_image").fadeIn("slow")
    // }

    openFilters();
});

//When the filter div is open and is closed using the close button
$("#filterCloseButton").on('click', function(){
    $("#mainFilterCon").animate({height: ['0px','swing']},750,'swing');  
    $("#cloud_image").fadeOut("slow");   
});

//Scroll plugin setup for the resulting images
$('#imageCards').perfectScrollbar({
    maxScrollbarLength: 100
});

//Scroll plugin setup for images in cart
$('#image_fil_cart').perfectScrollbar({
    maxScrollbarLength: 100
});

//Handles the higlight background and content swap when the cart icon or the cart tab is clicked
$('#imagecartBtn,#cart_fil').on('click',function(){
    
    $("#imagecartBtn").addClass("filter-tab-active");
    $("#filtersBtn").removeClass("filter-tab-active");

    $("#cloud_fil, #image_fil,#date_fil_container").fadeOut("slow");
    setTimeout(function(){$("#image_fil_cart").fadeIn("slow");},500);
    
});

//Handles the higlight background and content swap when the filter icon or the filter tab is clicked
$('#filtersBtn,#filter_icon').on('click',function(){
    
    $("#imagecartBtn").removeClass("filter-tab-active");
    $("#filtersBtn").addClass("filter-tab-active");

    
    $("#image_fil_cart").css('display','none');
    $("#cloud_fil, #image_fil,#date_fil_container").fadeIn("slow");
    
});





