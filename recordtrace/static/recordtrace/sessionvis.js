var margin = {top: 20, right: 20, bottom: 30, left: 100},
    w = 1024 - margin.left - margin.right, 
    h = 300 - margin.top - margin.bottom,
    x = d3.time.scale().range([0, w]),
    y = d3.scale.ordinal().rangeRoundBands([0, h]),
    color = d3.scale.category20c();

var svg = d3.select("#viz").append("div")
    .attr("class", "chart")
    .append("svg:svg")
    .style("width", w + margin.left + margin.right + "px")
    .style("height", h + margin.top + margin.bottom + "px")
    .append("svg:g")
    .attr("transform", "translate(" + margin.left+", "+margin.top+")");

function visualizeSession(err, data) {

    var start = data[0].ts, 
        end = data[data.length-1].ts;
        x.domain([new Date(start), new Date(end)]).nice();

    var nested = d3.nest()
	.key(function(d) { return d.cat; })
	.key(function(d) { return d.action; })
	.entries(data),
        bands = nested.reduce(
	    function(a, b) { return a.concat(b.values); },
	    []),
        count = bands.length,
        actions = bands.map(function(d) { return d.key; });

      y.domain(actions);
      var bw = y.rangeBand();

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.tickSize(-(h + margin.bottom/2), 0, 0);

    var b = svg.append("g");

    b
	.selectAll(".band")
	.data(actions)
	.enter().append("rect")
	.attr("class", "band")
	.attr("y", function(d) { return y(d) - bw/2; })
	.attr("width", w)
	.attr("height", bw)
	.style("fill", function(d, i) { return color(i); });

    b.selectAll("text")
	.data(actions)
	.enter().append("text")
	.attr("x", -6)
	.attr("y", function(d) { return y(d) - bw/2; })
	.style("text-anchor", "end")
	.text(function(d) { return d; });

    svg.append("g")
	.selectAll(".data")
	.data(data)
	.enter().append("circle")
	  .attr("class", "dot")
	  .attr("r", bw/4)
	  .attr("cx", function(d) { return x(d.ts); })
	  .attr("cy", function(d) { return y(d.action); })
	.append("title").text(function(d) { return d.label+"["+d.value+"]"; });

    var grid = svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + (h + margin.bottom/2) + ")");
	
    grid.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", w/2)
	.attr("y", -6)
	.style("text-anchor", "middle")
	.text("Time");
}
