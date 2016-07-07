function getPageCount(result){

	var page_array=[];
	var page_count = result.page_meta.page_count; 
	var page_array = _.map(_.times(page_count, String),plusone);
	console.log(page_array);

	var pagination = {
		pages:page_array,
		prev_query:result.page_meta.previous_page,
		next_query:result.page_meta.next_page,
		current_query:result.page_meta.current_page,
		current_page: result.filter_meta.page 
	};

 	var pagination_template="{{#pages}}<li><a>{{.}}</a></li>{{/pages}}"

	var rendered_pagination = Mustache.to_html(pagination_template,pagination);
	$('.pagination_prev').after(rendered_pagination);
}

function plusone(n){
	return parseInt(n)+1;
}
