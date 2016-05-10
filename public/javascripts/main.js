  var main_url="http://diwataapi-lkpanganiban.rhcloud.com/api/scene/";
  var img_url="http://diwataapi-lkpanganiban.rhcloud.com/static";
  
  // Initialize Material Design
  $.material.init()

  //Initialize Map object
  var map = L.map('map');

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {
              minZoom: 2,
              maxZoom: 12,
              attribution: osmAttrib
            });

  map.setView(new L.LatLng(11.5, 121.8), 6);
  map.addLayer(osm);

  //screen dimensions
  var width,height;

  //get screen width and height
  width = $("#map_section").width();
  height = $("#map_section").height();


  var areaSelect=L.areaSelect({
      width: width-100,
      height: height-100,
    });
    areaSelect.addTo(map);

    var bounds = areaSelect.getBounds();

    areaSelect.on("change",function(){
      bounds = areaSelect.getBounds();
      executefilters(bounds);
    });

  //circlemarkeroptions
  var geojsonMarkerOptions = {
      radius: 8,
      fillColor: "#1c3166",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };

  //Image point markers in the map
  var ini_markers = L.geoJson(false,{
    pointToLayer: function(feature,latlng){
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });
  ini_markers.addTo(map);
  
  //$(document).ready(function(){
  // Create a date time picker button
  $(function() {
    $('#datefilterstart').datetimepicker({
      format: "MMM DD,YYYY",
      defaultDate: new Date()
    });
  });

  //initial data fetch
  var data = executefilters(bounds);


  //});
  
  function executefilters(bounds){
    var data = {};
    // Get the satellite type
    var satelliteType = $("#satelliteFilter").val();
    data["satellite"] = satelliteType
    // Get the sensor type
    var sensorType = $("#sensorFilter").val();
    data["sensor"] = sensorType
    // Get the current date
    var datestart = $("#dateFilterstart").val();
    data["Date1"] = datestart

    // Setup the bounds of the selected area.


    var sw = bounds._southWest;
    var ne = bounds._northEast;

    // Store the area bbox to the data array as bbox.
    data["bbox"]=JSON.stringify([sw.lng, sw.lat, ne.lng, ne.lat]);

    $.get(main_url, data, function(result){
      result = JSON.parse(result);
      /*feature = result.features;*/
      
      filterUpdate(result);

    });
  }

  function filterUpdate(data){
    if(ini_markers){
      ini_markers.clearLayers();
      currentDiv.innerHTML="";
    }
    ini_markers.addData(data);


    data_array=ini_markers._layers;


  var i;
  for(i in data_array){
    var imgsrc=img_url+data_array[i].feature.properties.thumbnail_url;
    var sensor=data_array[i].feature.properties.sensor;
    var satellite=data_array[i].feature.properties.satellite;
    var date=data_array[i].feature.properties.acquisition_date;
    console.log(data_array[i].feature.properties);
    imageCards(imgsrc,sensor,satellite,date)
  }





};
  var currentDiv = document.getElementById("imageCards");

  //on filter change data fetch
  $(document).ready(function(){
    $("#satelliteFilter,#sensorFilter,#datefilterstart").change(function(){
      //Image point markers in the map
      data = executefilters(bounds);
      }
     );
  });

  function imageCards(imgsrc,sensor,satellite,date){
  
  var col_lg_6 = document.createElement('div');
  col_lg_6.className="col-lg-6";

  var card = document.createElement('div');
  card.className="card";

  var card_height_indicator = document.createElement('div');
  card_height_indicator.className="card-height-indicator";

  var card_content = document.createElement('div');
  card_content.className="card-content";

  var card_img_div = document.createElement('div');
  card_img_div.className="card-image";

  var card_img = document.createElement('img');
  card_img.src = imgsrc;

  var card_body=document.createElement('div');
  card_body.className="card-body";

  var body_content = document.createElement('p');
  body_content.innerHTML=sensor+","+satellite;

  card_body.appendChild(body_content);
  card_img_div.appendChild(card_img);
  card_content.appendChild(card_body);
  card_content.appendChild(card_img_div);
  card_height_indicator.appendChild(card_content);
  card.appendChild(card_height_indicator);
  col_lg_6.appendChild(card);
  currentDiv.appendChild(col_lg_6);

  }


