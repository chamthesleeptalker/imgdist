//function ot create the pagination links on layout
function getPageCount(result){

	var page_array=[];
	var page_count = result.page_meta.page_count;
	var initial_page;
	if(page_count>5){
		initial_page = 5;
	}else{
		initial_page = page_count;
	} 
	var page_array = _.map(_.times(initial_page, String),plusone);

	var pagination = {
		pages:page_array,
		prev_query:result.page_meta.previous_page,
		next_query:result.page_meta.next_page,
		current_query:result.page_meta.current_page,
		current_page: result.filter_meta.page 
	};

 	var pagination_template = $('#pagination-template').html();
    Mustache.parse(pagination_template);

	var rendered_pagination = Mustache.to_html(pagination_template,pagination);
	$('#imagePagination').html(rendered_pagination);
}

//adjust page numbering to start at 1 instead of zero
function plusone(n){
	return parseInt(n)+1;
}

