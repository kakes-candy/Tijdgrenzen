
// A formatter for counts.
var formatCount = d3.format("0d");

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var databestand;


draw_graph = function (selectie) { 

    
    
d3.csv("./data/data.csv", function (d) {
    return {
    diagnose: d.diagnose,
    id : +d.id, 
    prestatie: d.prestatie, 
    tijd: +d.tijd};
    }, function (error, dossiers) {

    
    
databestand = dossiers;    


    
var x_hist = d3.scale.linear()
    .domain([0, 1800])
    .range([0, width]);


    

// Generate a histogram using twenty uniformly-spaced bins.
var layout_hist = d3.layout.histogram()
    .value(function (d) {return d.tijd})
    .bins(x_hist.ticks(20));

// data omzetten via histogram functie 
var dossiers_hist = layout_hist(dossiers);   
    
console.log("layout data", dossiers_hist);    
    
    
var y_hist = d3.scale.linear()
    .domain([0, d3.max(dossiers_hist, function(d) { return d.y; })])
    .range([height, 0]);


var xAxis_hist = d3.svg.axis()
    .scale(x_hist)
    .orient("bottom");    


dossiers = dossiers.filter(function (d) {return d.prestatie === selectie});    
    
// data omzetten via histogram functie 
var dossiers_hist_filtered = layout_hist(dossiers);   
    
    
var svg_bggz = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");    

    
var bar_bggz = svg_bggz.selectAll(".bar")
    .data(dossiers_hist_filtered)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x_hist(d.x) + "," + y_hist(d.y) + ")"; });
    
  
bar_bggz.append("rect")
    .attr("x", 1)
    .attr("width", x_hist(dossiers_hist_filtered[0].dx) - 1)
    .attr("height", function(d) {return height - y_hist(d.y); });    

bar_bggz.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", x_hist(dossiers_hist_filtered[0].dx) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.y); });

svg_bggz.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis_hist);    
    


})


}


draw_graph("Middel (BM)");

