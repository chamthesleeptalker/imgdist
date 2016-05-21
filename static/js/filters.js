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
        bbox: JSON.stringify([sw.lng, sw.lat, ne.lng, ne.lat])
    };

    $.get(main_url, data, function(result){
        updateMapMarkers(result);
        updateCards(result);
    });
}

function updateMapMarkers(data){
    if(image_markers) image_markers.clearLayers();
    image_markers.addData(data);
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
        }
        cards.push(card_params)
    }

    rendered_cards = Mustache.to_html(card_template, {cards: cards})
    $('#imageCards').html(rendered_cards);
};
