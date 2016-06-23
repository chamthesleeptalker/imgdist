function createHistogram(results){
    //var formatCount = d3.format(",.0f");
    var image_section_width=$("#image_section").width();

    var formatCount = d3.format("");
    var formatDate_m = d3.time.format("%m").parse;
    var formatDate = d3.time.format("%m/%y");

    var margin = {top: 15, right: 5, bottom: 25, left: 20},
        width = image_section_width - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0,width]);

    var y = d3.scale.linear()
        .range([height,0]);

    // var xAxis = d3.svg.axis()
    //     .scale(x)
    //     .orient("bottom")
    //     .tickFormat(formatDate);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(6);

    // Create the SVG drawing area
        var svg = d3.select("#chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          //console.log(results);
     //    d3.json(results, function(error, json){

     //        //x.domain(data.map(function(d){ return d.month}));

     //        //y.domain([0, d3.max(data, function(d){return d.count})]);
     //   data = json;

     //    console.log("manse");
     //    console.log(data);
     // });
    // var monthExtent = d3.extent(data, function(d){ return d.availDate; });
    // console.log(monthExtent);
    // var monthBins = d3.time.months(d3.time.month.offset(monthExtent[0],-1),
    //                                 d3.time.month.offset(monthExtent[1],1));

    // var binByMonth = d3.layout.histogram()
    //     .value(function(d) { return d; })
    //     .bins(monthBins)

    // var histData = binByMonth(data);

    // x.domain(d3.extent(monthBins));
    // y.domain([0,d3.max(histData, function(d){ return d.y })])

    // var histogram = d3.layout.histogram()
    // .bins(12)(data);

    // console.log(histData);

    // svg.selectAll(".bar")
    //           .data(results)
    //         .enter().append("rect")
    //           .attr("class", "bar")
    //           .attr("x", function(d) { return x(d.month); })
    //           .attr("width", "20px")
    //           .attr("y", function(d) { return y(d.count); })
    //           .attr("height", function(d) { return height - y(d.count); });

    //       // Add the X Axis
    //       svg.append("g")
    //           .attr("class", "x axis")
    //           .attr("transform", "translate(0," + height + ")")
    //           .call(xAxis);

    //       // Add the Y Axis and label
    //       svg.append("g")
    //          .attr("class", "y axis")
    //          .call(yAxis)
    //         .append("text")
    //           .attr("transform", "rotate(-90)")
    //           .attr("y", 6)
    //           .attr("dy", ".71em")
    //           .style("text-anchor", "end")
    //           .text("Number of Sightings");


    var x = d3.scale.linear()
        //.domain([formatDate_m( d3.min(results,function(d){ return d.month })),formatDate(d3.max(results,function(d){ return d.month }))])
        .domain([1,12])
        .rangeRound([0, width]);

    // var x = d3.time.scale()
    //     .domain([new Date(2015, 1, 1), new Date(2015, 12, 31)])
    //     .range([0, width]);

    //console.log(d3.max(results, function(d){ return d.count}));
    var y = d3.scale.linear()
        //.domain([0, 1])
        .domain([0, d3.max(results, function(d){ return d.count})])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        //.tickFormat(formatDate);

    // var xAxis = d3.svg.axis()
    //             .scale(x)
    //             .orient("bottom");

    // var svg = d3.select("#chart").append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
          //.attr("y", function(d) { return y(d.count); })
          .attr("height", function(d) { return height - y(d.count); });

    // bar.append("text")
    //     .attr("dy", ".5em")
    //     .attr("y", 6)
    //     .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    //     .attr("text-anchor", "middle")
    //     .text(function(d) { return formatCount(d.length); });

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