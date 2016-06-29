//get mainFilterCon screen width
var image_section_width=$("#image_section").width()-60;

//set margins for the graph
var margin = {top: 15, right: 5, bottom: 25, left: 20},
    width = image_section_width - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

// function createHistogram(){
    //start and end date based scale
    var x = d3.time.scale()
        .rangeRound([0,width-margin.left - margin.right]);

    //scale for count or frequency for each temporal bins
    var y = d3.scale.linear()
        .range([height, 0]);

    //xAxis formatting
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%m/%d"))
        .tickSize(3)
        .tickPadding(12);

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

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("stroke","white")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0," + width + ")")
        .attr("stroke","white")
        .call(yAxis);


function updateData(result) {
    if(result.length == 0){

    }else{
        //get date array
        var data = getAllDates(result);
        
        //get the histogram start date
        var start_date = data[0].date;

        //get the histogram end date
        var end_date = data[data.length - 1].date;

        //compute for appropriate tick interval
        var tick_interval = Math.floor(data.length/6);

        // Get the data again
        data = getAllDates(result);
        //get the histogram start date
        start_date = data[0].date;

        //get the histogram end date
        end_date = data[data.length - 1].date;

        // Scale the range of the data again 
        x.domain([d3.time.day.offset(new Date(start_date),-10),d3.time.day.offset(new Date(end_date),10)]);
        y.domain([0, d3.max(data, function(d) { return d.f; })]);

        xAxis.ticks(d3.time.days, tick_interval);

        svg.select('.x.axis').transition().duration(300).call(xAxis);
        svg.select('.y.axis').transition().duration(300).call(yAxis);

        //create the rect for the scaled frequency/count
        var bars = svg.selectAll(".bar").data(data);

        bars.exit()
            .transition()
                .duration(300)
            .attr("y", y(0))
            .attr("height", height - y(0))
            .style('fill-opacity', 1e-6)
            .remove();
          
        bars.enter().append("rect")
            .attr("class","bar")
            .attr("transform", function(d) {
                var xTranslate = x(new Date(d.date)) - 0.5*((width*0.5)/data.length);
                return "translate(" + xTranslate + "," + y(d.f) + ")"; 
            });

        bars.transition().duration(300)
            //.attr("x", function(d){ return x(new Date(d.date));})
            .attr("width", (width*0.5)/data.length)
            .attr("transform", function(d) {
                var xTranslate = x(new Date(d.date)) - 0.5*((width*0.5)/data.length);
                return "translate(" + xTranslate + "," + y(d.f) + ")"; 
            })
            .attr("height",function(d){ return height - y(d.f)});    
    }
    
}

function getAllDates(result){
    var data_array = result.histogram;
    var c = Object.keys(data_array)
    var date = c.map(function(d){ return new Date(d) });
    var date_lodash = _.sortBy(date, function(value) {return new Date(value);});
    var date_keys = date_lodash.map(function(d){ return (moment(d).format('YYYY-M-D')).toString()});
    var date_keys_values = date_keys.map(function(d){ return {'date':moment(d).format('YYYY-MM-DD'),'f':data_array[d]}});
    
    return date_keys_values;
}