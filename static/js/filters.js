function executeFilters(){
    var bounds = areaSelect.getBounds();
    var sw = bounds._southWest;
    var ne = bounds._northEast;
    var cloudRange = cloudSlider;
    var daterange = [];

    //Updates cloud range in view
    if(cloudSlider.data().from == undefined){
      $("#currentCloudFil").html("  0 - 100%");
      cloudRange.data().from = 0;
      cloudRange.data().to = 100;
    }else{
      $("#currentCloudFil").html("   "+cloudRange.data().from+" - "+cloudRange.data().to+"%");  
    }

    //gets and updates image selection
    $("#currentImgFil").html("  "+imageTray.toString());

    var data = {
        sat: satTray.toString(),
        payload: imageTray.toString(),
        start:"2015-8-1",
        end: "2015-12-10",
        cloud: "["+cloudRange.data().from+","+cloudRange.data().to+"]",
        bbox: JSON.stringify([sw.lng, sw.lat, ne.lng, ne.lat]),
        limit:"100"
    };

    //updates date range
    if(start_date != undefined){
      daterange=[start_date,end_date];
      data.start = daterange[0];
      data.end = daterange[1];
    }

    $.get(main_url, data, function(result){
        //updates the footprints in the map view      
        updateMapMarkers(result);

        //updates ticket results
        updateCards(result);

        //update added tickets in the image cart
        updateOnImageCartCards(imageCartEntries);

        //create or update Image Availability Histogram
        createHistogram(result);
        

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
function addImageToCart(scene_id, image_url, published, bundlink){

  var addImageObj ={scene_id:scene_id, image_url:image_url, published:published, bundlink: bundlink};
  imageCartEntries.push(addImageObj);

  var count = imageCartEntries.length;
  $('.imageCartCount').text(count);

  $("#imagetocart_"+scene_id).text('Remove from Cart');
  $("#imagetocart_"+scene_id).removeClass('btn-info');
  $("#imagetocart_"+scene_id).addClass('btn-warning');
  $("#imagetocart_"+scene_id).attr('onclick','removeImageFromCart("'+scene_id+'","'+image_url+'")');

  var imagecart_template = $('#imagecart-template').html();
  Mustache.parse(imagecart_template);

  rendered_imageCartEntries = Mustache.to_html(imagecart_template,{imageCartEntries:imageCartEntries})
  $('#image_fil_cart').html(rendered_imageCartEntries);

}

function removeImageFromCart(scene_id, image_url, published,bundlink){
  var removeImageObj ={scene_id:scene_id, image_url:image_url, published: published, bundlink: bundlink};
  removedCartEntries.push(removeImageObj);

  var removeEntry = _.findIndex(imageCartEntries, removeImageObj);
  var newimageCartEntries = _.pullAt(imageCartEntries,removeEntry);

  var count = imageCartEntries.length;
  $('.imageCartCount').text(count);

  $("#imagetocart_"+scene_id).text('Add to Cart');
  $("#imagetocart_"+scene_id).removeClass('btn-warning');
  $("#imagetocart_"+scene_id).addClass('btn-info');
  $("#imagetocart_"+scene_id).attr('onclick','addImageToCart("'+scene_id+'","'+image_url+'")');

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
            image_url: data_array[i].properties.links.thumbnail_url,
            payload: data_array[i].properties.payload,
            sat_id: data_array[i].properties.sat.sat_id,
            published: data_array[i].properties.published_time.split("T")[0],
            receiving_station: data_array[i].properties.receiving_station,
            scene_id: data_array[i].properties.scene_id,
            cloud_cover: data_array[i].properties.cloud_cover,
            bundlink: data_array[i].properties.links.bundle_url,
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
    $("#imagetocart_"+imageCartEntry.scene_id).text('Remove from Cart');
      $("#imagetocart_"+imageCartEntry.scene_id).removeClass('btn-info');
      $("#imagetocart_"+imageCartEntry.scene_id).addClass('btn-warning');
      $("#imagetocart_"+imageCartEntry.scene_id).attr('onclick','removeImageFromCart("'+imageCartEntry.scene_id+'","'+imageCartEntry.image_url+'")');
}

function isInArray(value,array){
  return array.indexOf(value) !== -1;
}

function downloadAllImages(){
  for(var i in imageCartEntries){
    var win = window.open(imageCartEntries[i].image_url,'_blank');
    win.focus();
  }

}

function dateHistogramData(data){
  var data_array = data.features;
  var availableDates = [];
  var month_count=[]

  for(var i in data_array){
    var entry = data_array[i].properties.published_time;
    var split_T_= entry.split("T")[0].split("-");
    availableDates.push(parseInt(split_T_[1]));
  }

  //create 12 months
  for(var i = 1;i<13;i++){
    month_count.push({"month":i,"count":0});
  }

  //create counts for each month
  for(var i = 0;i<availableDates.length;i++){
    if(month_count[availableDates[i]-1].month == availableDates[i]){
      month_count[availableDates[i]-1].count++ 
    }
  }

  return month_count;

}

function countAvailableDates(availableDates){
  createHistogram(availableDates);
}

function updateCalendarFilter(result){
  data_array = result.features;
  start_date = data_array[0].properties.published_time.split("T")[0]
  end_date = data_array[data_array.length - 1].properties.published_time.split("T")[0]
  
  $('#currentDateFil').html(start_date + ' - ' + end_date );
}



