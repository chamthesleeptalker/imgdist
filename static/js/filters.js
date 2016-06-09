function executeFilters(){
    var bounds = areaSelect.getBounds();
    var sw = bounds._southWest;
    var ne = bounds._northEast;
    var cloudRange = cloudSlider;

    //Updates cloud range in view
    if(cloudSlider.data().from == undefined){
      $("#currentCloudFil").html("0 - 100%");
      cloudRange.data().from = 0;
      cloudRange.data().to = 100;
    }else{
      $("#currentCloudFil").html(cloudRange.data().from+" - "+cloudRange.data().to+"%");  
    }

    var data = {
        satellite: $("#satelliteFilter").val(),
        sensor: $("#sensorFilter").val(),
        // start: $("#datefilterstart").val(),
        // end: $("#datefilterend").val(),
        start:dateformatfull(selection[0]),
        end: dateformatfull(selection[1]),
        cloudRange: "["+cloudRange.data().from+","+cloudRange.data().to+"]",
        bbox: JSON.stringify([sw.lng, sw.lat, ne.lng, ne.lat]),
        zoomtoscene:""
    };

    console.log(data);

    $.get(main_url, data, function(result){
        updateMapMarkers(result);
        updateCards(result);
        updateOnImageCartCards(imageCartEntries);
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
var removedCartEntries=[];
function addImageToCart(scene_name, image_url){

  var addImageObj ={scene_name:scene_name, image_url:image_url};
  imageCartEntries.push(addImageObj);

  var count = imageCartEntries.length;
  $('#imageCartCount').text(count);

  $("#imagetocart_"+scene_name).text('Remove from Cart');
  $("#imagetocart_"+scene_name).removeClass('btn-info');
  $("#imagetocart_"+scene_name).addClass('btn-warning');
  $("#imagetocart_"+scene_name).attr('onclick','removeImageFromCart("'+scene_name+'","'+image_url+'")');

  var imagecart_template = $('#imagecart-template').html();
  Mustache.parse(imagecart_template);

  rendered_imageCartEntries = Mustache.to_html(imagecart_template,{imageCartEntries:imageCartEntries})
  $('#imageCartList').html(rendered_imageCartEntries);

}

function removeImageFromCart(scene_name, image_url){
  var removeImageObj ={scene_name:scene_name, image_url:image_url};
  removedCartEntries.push(removeImageObj);

  var removeEntry = _.findIndex(imageCartEntries, removeImageObj);
  var newimageCartEntries = _.pullAt(imageCartEntries,removeEntry);

  var count = imageCartEntries.length;
  $('#imageCartCount').text(count);

  $("#imagetocart_"+scene_name).text('Add to Cart');
  $("#imagetocart_"+scene_name).removeClass('btn-warning');
  $("#imagetocart_"+scene_name).addClass('btn-info');
  $("#imagetocart_"+scene_name).attr('onclick','addImageToCart("'+scene_name+'","'+image_url+'")');

  var imagecart_template = $('#imagecart-template').html();
  Mustache.parse(imagecart_template);

  rendered_imageCartEntries = Mustache.to_html(imagecart_template,{imageCartEntries:imageCartEntries})
  $('#imageCartList').html(rendered_imageCartEntries);

}

function updateCards(data){
    var card_template = $('#card-template').html();
    Mustache.parse(card_template);

    data_array = data.features;

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

//Loops through the card entries in the image cart and applies the "Remove" state
function updateOnImageCartCards(imageCartEntries){
    for(var i in imageCartEntries){
      onClickRemoveFromCart(imageCartEntries[i]);
    }
}

//Changes button state for cards already in cart on card update
function onClickRemoveFromCart(imageCartEntry){
    $("#imagetocart_"+imageCartEntry.scene_name).text('Remove from Cart');
      $("#imagetocart_"+imageCartEntry.scene_name).removeClass('btn-info');
      $("#imagetocart_"+imageCartEntry.scene_name).addClass('btn-warning');
      $("#imagetocart_"+imageCartEntry.scene_name).attr('onclick','removeImageFromCart("'+imageCartEntry.scene_name+'","'+imageCartEntry.image_url+'")');
}


