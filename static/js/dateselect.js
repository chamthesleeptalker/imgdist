function createHistogram(results){

    //get mainFilterCon screen width
    var image_section_width=$("#image_section").width()-60;

    //format date info
    var formatDate_m = d3.time.format("%m").parse;
    var formatDate = d3.time.format("%m/%y");

    //set margins for the graph
    var margin = {top: 15, right: 5, bottom: 25, left: 20},
        width = image_section_width - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    //start and end date based scale
    var x = d3.time.scale()
        .domain([new Date(start_date),d3.time.day.offset(new Date(end_date)),1])
        .rangeRound([0,width-margin.left - margin.right]);

    //scale for count or frequency for each temporal bins
    var y = d3.scale.linear()
        .domain([0, d3.max(results, function(d){ return d.count})])
        .range([height, 0]);

    //xAxis formatting
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    //yAxis formatting
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(6);

    //Create the SVG drawing area
    var svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //create the rect for the scaled frequency/count
    var bar = svg.selectAll(".bar")
        .data(results)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { 
            var xTranslate = x(d.month) - 0.5*((width*0.5)/results.length);
            return "translate(" + xTranslate + "," + y(d.count) + ")"; 
        });

    bar.append("rect")
          .attr("x", function(d,i) { return i*0; })
          .attr("width", (width*0.5)/results.length)
          .attr("height", function(d) { return height - y(d.count); });

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .attr("stroke","white")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0," + width + ")")
        .attr("stroke","white")
        .call(yAxis);
}

function updateHistogram(){

}