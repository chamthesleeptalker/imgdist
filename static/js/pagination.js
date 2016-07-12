//function ot create the pagination links on layout
function getPageCount(result){
	
	//Container for the numerical pages
	var page_array=[];

	//Variable for number of available pages
	var page_count = result.page_meta.page_count;

	//Variable for initial page count
	var initial_page_count;

	//Set number of li's to render
	if(page_count>5){
		initial_page_count = 5;
	}else{
		initial_page_count = page_count;
	}

	//Add 1 to the page array generated
	var page_array = _.map(_.times(initial_page_count, String),plusone);

	//Data object to feed the pagination template
	var pagination = {
		pages:page_array,
		prev_query:result.page_meta.previous_page,
		next_query:result.page_meta.next_page,
		current_query:result.page_meta.current_page,
		current_page: result.filter_meta.page //current page number string
	};



	//Call mustache templates
 	var pagination_template = $('#pagination-template').html();
    Mustache.parse(pagination_template);

    //Render mustache templates
	var rendered_pagination = Mustache.to_html(pagination_template,pagination);
	$('#imagePagination').html(rendered_pagination);
	
	//Add active class to the current page
	console.log(pagination.current_page);
	activeClassCurrentPage(pagination.current_page);

	$('#ticket_pagination').fadeIn("slow");


}

//adjust page numbering to start at 1 instead of zero
function plusone(n){
	return parseInt(n)+1;
}

//add active class to current page
function activeClassCurrentPage(current_page){
	var aValues = $("#ticket_pagination li a");
	console.log(aValues);
	for(var i in aValues ){
		if(aValues[i].text === current_page){
			$("#ticket_pagination li")[i].className = "active";
		}else{
			$("#ticket_pagination li")[i].className = "";
		}
	}
}

