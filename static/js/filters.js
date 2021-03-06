function executeFilters(){
    //query parameters objects
    var bounds = areaSelect.getBounds();
    var sw = bounds._southWest;
    var ne = bounds._northEast;
    var cloudRange = cloudSlider;
    var daterange = [];

    //Removes "No results" prompt and "Change Filters" button on filter run 
    if($('#noResults')){
        $('#noResults').fadeOut("slow");
        $("#changeMyFilters").fadeOut("slow");
    }

    //Runs the loading spinner when query is called
    $("#imageSpinner").fadeIn("slow",function(){
      $("#cloud_image").addClass("cloudImageOpacity");
      $("#imageSpinner").css("display","block");
      $("#imageSpinner").css("z-index","1000");
      $("#imageCards").fadeOut("fast");
    });

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

    //Creating an object array of the necessary query params
    var data = {
        sat: satTray.toString(),
        payload: imageTray.toString(),
        start:"2015-8-1",
        end: "2015-12-10",
        cloud: "["+cloudRange.data().from+","+cloudRange.data().to+"]",
        bbox: JSON.stringify([sw.lng, sw.lat, ne.lng, ne.lat]),
        limit:"100",
        page:1
    };

    //Updates date range
    if(start_date != undefined){
      daterange=[start_date,end_date];
      data.start = daterange[0];
      data.end = daterange[1];
    }

  //call the built query
  $.get(main_url, data, function(result){
      var resultCount = result.features.length;

      if(resultCount === 0){
        $("#ticket_pagination").fadeOut("slow");
        $("#imageCards div").fadeOut("slow");
  
        setTimeout(function(){
          $("#imagePagination").html("<h1 id='noResults' style='display:none;'>No image matched your query.<br>Please try again.</h1>");
          $("#noResults").fadeIn("slow");

          $("#imagePagination").append("<button id='changeMyFilters' type='button' class='btn btn-primary button_class' style='display:none;' onClick='openFilters()'>change filters</button>");
          $("#changeMyFilters").fadeIn("slow");
          
        },500);

      }else{
        //updates the footprints in the map view      
        updateMapMarkers(result);

        //updates ticket results
        updateCards(result);

        //update added tickets in the image cart
        updateOnImageCartCards(imageCartEntries);

        //create or update Image Availability Histogram
        updateData(result);

        //Generate pagination
        getPageCount(result,this.url);
      }
    })
    .done(function(){
      //Runs the loading spinner when query is done
      $("#imageSpinner").fadeOut("slow",function(){
        $("#imageSpinner").css("display","none");
        $("#imageSpinner").css("z-index","-1");
        $("#imageCards").fadeIn("slow");
        $("#cloud_image").removeClass("cloudImageOpacity");
      });
    });
}

//update geojson footprints in the map
function updateMapMarkers(data){

    if(image_markers) image_markers.clearLayers();
    image_markers.addData(data);
}

//On click function. When clicked zoom in the selected footprint onscreen
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

//Image cart object
var imageCartEntries=[];

//On click function. When clicked, adds the selected image to the image cart
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
  $('#image_fil_cart_list').html(rendered_imageCartEntries);

  if(count != 0){
    if($("#image_cart_dl_all").length === 0){
      $("#image_fil_cart").append("<button id='image_cart_dl_all' type='button' class='btn btn-primary button_class' onClick='downloadAllImages()'>Download All</button>");
    }
  }
}

//On click function. When clicked, removes the selected image to the image cart
function removeImageFromCart(scene_id, image_url, published,bundlink){
  //initialize template for image cart entries
  var imagecart_template = $('#imagecart-template').html();
  Mustache.parse(imagecart_template);

  var removeImageObj ={'bundlink': bundlink, 'image_url':image_url, 'published': published, 'scene_id':scene_id };

  var removeEntry = _.findIndex(imageCartEntries, ['scene_id',removeImageObj.scene_id]);
  var newimageCartEntries = _.pullAt(imageCartEntries,removeEntry);

  var count = imageCartEntries.length;
  $('.imageCartCount').text(count);

  $("#imagetocart_"+scene_id).text('Add to Cart');
  $("#imagetocart_"+scene_id).removeClass('btn-warning');
  $("#imagetocart_"+scene_id).addClass('btn-info');
  $("#imagetocart_"+scene_id).attr('onclick','addImageToCart("'+scene_id+'","'+image_url+'")');

  rendered_imageCartEntries = Mustache.to_html(imagecart_template,{imageCartEntries:imageCartEntries})
  $('#image_fil_cart_list').html(rendered_imageCartEntries);

  if(count === 0){
    $("#image_fil_cart_list").html("<h3 id='cart_noimage'>No images in cart.</h3>");
    $("#image_cart_dl_all").remove();
  }

  if(count != 0){
    if($("#image_cart_dl_all").length === 0){
      $("#image_fil_cart").append("<button id='image_cart_dl_all' type='button' class='btn btn-primary button_class' onClick='downloadAllImages()'>Download All</button>");
    }
  }

}

//Creates the tickets of the images in the query result
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

//On click function to download all the images in the image cart
function downloadAllImages(){
  for(var i in imageCartEntries){
    var win = window.open(imageCartEntries[i].image_url,'_blank');
    win.focus();
  }
}

//Open Filters div when there are no results for the previous query
function openFilters(){
      var cloud_image_state = $("#cloud_image").css("display");

    if(cloud_image_state == "none"){
        $("#mainFilterCon").animate({height: ['500px','swing']},750,'swing');  
        $("#cloud_image").fadeIn("slow")
    }
}





