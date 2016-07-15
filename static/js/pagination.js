var globalPagination;
//function ot create the pagination links on layout
function getPageCount(result){
	
	//Container for the numerical pages
	var page_array=[];

	//Variable for number of available pages
	var page_count = result.page_meta.page_count;

	//Container for all the page numbers
	var page_array_full= _.map(_.times(page_count, String),plusone);

	var page_offset = 4;
	var page_bullets = page_offset+1;


	//Set number of li's to render
	if(page_count>page_bullets){
		//difference of the totall number of page and the current page number
		var pageDiff = page_count-parseInt(result.filter_meta.page);

			if(pageDiff< page_bullets){
				page_array = page_array_full.slice(page_count-page_offset,page_count);		
			}else{
				page_array = page_array_full.slice(parseInt(result.filter_meta.page)-1,parseInt(result.filter_meta.page)+page_offset);		
			}
		
	}else{
		page_array = page_array_full;
	}

	//Data object to feed the pagination template
	var pagination = {
		pages:page_array,
		prev_query:result.page_meta.previous_page,
		next_query:result.page_meta.next_page,
		current_query:result.page_meta.current_page,
		current_page: result.filter_meta.page, //current page number string
		no_of_pages:page_count
	};

	//Call mustache templates
 	var pagination_template = $('#pagination-template').html();
    Mustache.parse(pagination_template);

    //Render mustache templates
	var rendered_pagination = Mustache.to_html(pagination_template,pagination);
	$('#imagePagination').html(rendered_pagination);
	
	//Add active class to the current page
	activeClassCurrentPage(pagination.current_page);

	//Add/remove 'disabled' class in prev/next chevrons
	disablePrevNextChevrons(pagination.pages,page_count,pagination.current_page);

	//Show pagination on layout
	$('#ticket_pagination').fadeIn("slow");


	return globalPagination = pagination;

}

//adjust page numbering to start at 1 instead of zero
function plusone(n){
	return parseInt(n)+1;
}

//add active class to current page
function activeClassCurrentPage(current_page){
	var aValues = $("#ticket_pagination li a");

	for(var i in aValues ){
		if(aValues[i].text === current_page){
			$("#ticket_pagination li")[i].className = "active";

		}else{
			$("#ticket_pagination li")[i].className = "";
		}
	}
}

//Add/remove 'disabled' class in chevron prev/next buttons
function disablePrevNextChevrons(page_array,no_of_pages,current_page){
	var firstInArr = _.findIndex(page_array,function(o){return o === 1;});
	var lastInArr = _.findIndex(page_array,function(o){return o === no_of_pages;});
	var lastIndex = $("#ticket_pagination li").length -1;
	if( firstInArr != -1){
		$("#ticket_pagination li")[0].className ="disabled";
	}else{
		$("#ticket_pagination li")[0].className ="";
	}

	if(lastInArr != -1){
		$("#ticket_pagination li")[lastIndex].className ="disabled";
	}else{
		$("#ticket_pagination li")[lastIndex].className =""; 		
	}
}

//slice  current query url and change it to the query url for a particular page
function generateUrlPerPage(current_page,page_no){
	var current_page_url = current_page;
	var current_page_url_page = current_page.split('&');
	var page_no_split = current_page_url_page[current_page_url_page.length-1];
	var offset = page_no_split.length
	var page_url = current_page.slice(0,-offset) +"page="+page_no;	
	return page_url;
}



//fetch a specific page into the image cards container
function paginatedExecuteFilters(queryURL,event){
	//Runs the loading spinner when query is called
    $("#imageSpinner").fadeIn("slow",function(){
      $("#cloud_image").addClass("cloudImageOpacity");
      $("#imageSpinner").css("display","block");
      $("#imageSpinner").css("z-index","1000");
      $("#imageCards").fadeOut("fast");
    });

	//call the built query
  	$.get(queryURL, function(result){
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










