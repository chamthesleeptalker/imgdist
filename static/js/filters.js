function executeFilters(){
    var bounds = areaSelect.getBounds();
    var sw = bounds._southWest;
    var ne = bounds._northEast;
    var cloudRange = cloudSlider.noUiSlider.get();

    //Updates cloud range in view
    $("#cloudRange").html(cloudRange[0]+" - "+cloudRange[1]+"%");

    var data = {
        satellite: $("#satelliteFilter").val(),
        sensor: $("#sensorFilter").val(),
        start: $("#datefilterstart").val(),
        end: $("#datefilterend").val(),
        cloudRange: "["+cloudRange[0]+","+cloudRange[1]+"]",
        bbox: JSON.stringify([sw.lng, sw.lat, ne.lng, ne.lat]),
        zoomtoscene:""
    };

    $.get(main_url, data, function(result){
        updateMapMarkers(result);
        updateCards(result);
        console.log(result);
    });
}

function updateMapMarkers(data){
    if(image_markers) image_markers.clearLayers();
    image_markers.addData(data);
}

function zoomToScene(coordinates){
    if(coordinates.length < 2){
        var footprint = L.polygon(coordinates[0]);
        var centerFootprint = [footprint.getBounds().getCenter().lng,footprint.getBounds().getCenter().lat];
        map.setView(centerFootprint,8);
    }else{
        var point = L.circleMarker([coordinates[1],coordinates[0]])
        var centerPoint = [point.getLatLng().lat,point.getLatLng().lng]
        map.setView(centerPoint,8);
    }
    
}

//add to image cart
var imageCartEntries=[];
function addImageToCart(scene_name, image_url){

  var imageObj ={name:scene_name, image_url:image_url};
  imageCartEntries.push(imageObj);

  var count = imageCartEntries.length;
  $('#imageCartCount').text(count);

  var imagecart_template = $('#imagecart-template').html();
  Mustache.parse(imagecart_template);

  rendered_imageCartEntries = Mustache.to_html(imagecart_template,{imageCartEntries:imageCartEntries})
  $('#imageCartList').html(rendered_imageCartEntries);

}

function updateCards(data){
    var card_template = $('#card-template').html();
    Mustache.parse(card_template);

    data_array = data.features

    var cards = []
    for(var i in data_array){
        var card_params = {
            image_url: img_url + data_array[i].properties.thumbnail_url,
            sensor: data_array[i].properties.sensor,
            satellite: data_array[i].properties.satellite,
            date: data_array[i].properties.acquisition_date,
            receiving_station: data_array[i].properties.receiving_station,
            scene_name: data_array[i].properties.scene_name,
            cloud_cover: data_array[i].properties.cloud_cover,
            zoomtoscene: JSON.stringify(data_array[i].geometry.coordinates)
        }
        cards.push(card_params)
    }

    rendered_cards = Mustache.to_html(card_template, {cards: cards})
    $('#imageCards').html(rendered_cards);
};


