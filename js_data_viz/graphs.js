//Margins for plots
var margin = {top: 10, right: 30, bottom: 20, left: 30};

//check width of containing div
var graph_width = $("#graph_onvolledig").width(), 
    width = graph_width - margin.left - margin.right,
    height = width/4 - margin.top - margin.bottom



//Er komt een tabel op de pagina, die wordt hier voor ingevuld
var table =  d3.select("#results");

var columns_merge = ["prestatie", "aantal", "tijd_totaal", "omzet"];

var thead = table.append("thead")
            .append("tr")
            .selectAll("th")
            .data(columns_merge)
            .enter()
            .append("th")
            .text(function (d) {return d; });
    
var tbody = table.append("tbody");
var tfoot = table.append("tfoot");


// A formatter for counts.
var formatCount = d3.format("0d");


var databestand, 
    aangepast;


// Om de lijnen in de grafiek te vullen hebben we eerste 
var grenzen_initieel = [120, 400, 600, 800, 1600], 
    prestaties = ["onvolledig", "kort", "middel", "intensief", "zeer intensief"];




var aanpassen = function (d, bovengrenzen) {
    if (d.tijd >= 0 && d.tijd <=120) {return "onvolledig"};
    if (d.tijd >= 121 && d.tijd <=bovengrenzen[0]) {return "kort"};
    if (d.tijd >= bovengrenzen[0] + 1 && d.tijd <=bovengrenzen[1]) {return "middel"};
    if (d.tijd >= bovengrenzen[1] + 1 && d.tijd <=bovengrenzen[2]) {return "intensief"};
    if (d.tijd >= bovengrenzen[2] + 1 && d.tijd <=bovengrenzen[3]) {return "zeer_intensief"};
}



var prijzen = function (data) {

    
    var vullen = function (d) {
            switch(d) {
                case "onvolledig":
                    return  180;
                case "kort":
                    return 400;
                case "middel":
                    return 800;    
                case "intensief":
                    return 1200;    
                case "zeer_intensief":
                    return 2400;      
        } 
    }
    
    var i; 
    for(i = 0; i < data.length; i++) {
        data[i].prijs =  vullen(data[i].prestatie)
        }
    
    return data;
}





var versimpelen = function (data) {

    
    var vullen = function (d) {
            switch(d) {
                case "Onvolledig":
                    return "onvolledig";
                case "Kort (BK)":
                    return "kort";
                case "Middel (BM)":
                    return "middel";    
                case "Intensief (BI)":
                    return "intensief";    
                case "Zeer intensief (BZ)":
                    return "zeer_intensief";    
        }
    }
    
    var i;
    for(i = 0; i < data.length; i++) {
        data[i].prestatie = vullen(data[i].prestatie)        
    }
    
    return data;
}


var x_hist = d3.scale.linear()
    .domain([0, 1600])
    .range([0, width]);


draw_graph = function (selectie, target, grens) { 

    
    
d3.csv("./data/data.csv", function (d) {
    return {
    diagnose: d.diagnose,
    id : +d.id, 
    prestatie: d.prestatie, 
    tijd: +d.tijd};
    }, function (error, dossiers) {


dossiers = versimpelen(dossiers);    
    
    
databestand = dossiers;    
aangepast = dossiers;

for (var i =0 ; i < databestand.length; i++) {
    
    aangepast[i].prestatie_nieuw = aanpassen(aangepast[i], grenzen_initieel);
}
    

    

    

// Generate a histogram using twenty uniformly-spaced bins.
var layout_hist = d3.layout.histogram()
    .value(function (d) {return d.tijd})
    .bins(x_hist.ticks(60));

// data omzetten via histogram functie 
var dossiers_hist = layout_hist(dossiers);   
    
//console.log("layout data", dossiers_hist);    
    

var xAxis_hist = d3.svg.axis()
    .scale(x_hist)
    .orient("bottom");    


dossiers = dossiers.filter(function (d) {return d.prestatie === selectie});    
    
// data omzetten via histogram functie 
var dossiers_hist_filtered = layout_hist(dossiers);   

        
var y_hist = d3.scale.linear()
    .domain([0, d3.max(dossiers_hist_filtered, function(d) { return d.y; })])
    .range([height, 0]); 
    
    
    
var svg_bggz = d3.select(target).append("svg")
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
    
svg_bggz.append("line")
    .attr("x1", x_hist(grens))  //<<== change your code here
    .attr("y1", 0)
    .attr("x2", x_hist(grens))  //<<== and here
    .attr("y2", height)
    .attr('id', "refline_" + selectie)
    .style("stroke-width", 2)
    .style("stroke", "red")
    .style("fill", "none");
    

})


}


var width_table = $('table').width(), 
    width_table_container = $('#slider').width(), 
    margin_table = (width_table_container - width_table)/2,  
    bovengrenzen = [];

//var grenzen_initieel = [120, 300, 500, 800, 1600]


var x_slider = x_hist.range([0, (width_table - margin_table) + 10]);

var xAxis_slider = d3.svg.axis()
    .scale(x_slider)
    .orient("bottom");  



for(var i = 0; i<grenzen_initieel.length; i++) {
    
    if (i === 0) {bovengrenzen.push(grenzen_initieel[i])};
    if (i > 0) {bovengrenzen.push(grenzen_initieel[i] - grenzen_initieel[i-1])};
    
    console.log(bovengrenzen);
    
    console.log("grens x", x_slider(bovengrenzen[i]));
}


var update_refline = function(target, value) {

    var id = "#refline_" + target;
    
    d3.select(id).attr('x1', value).attr('x2', value);
}





$(function(){
  $("#rangeSlider").colResizable({
      liveDrag:true, 
      fixed:false, 
      draggingClass:'dragging', 
      onDrag:onSlide
  });
});




var onSlide = function(e) {   
    
    var columns = $(e.currentTarget).find("td");
	var tijden = [], prestaties = [], prestatie, i, tijd, total;
    var ranges = [], total = 0, i, s = "Ranges: ", w;
    
    for(i = 0; i<columns.length; i++){
        
        
        w = columns.eq(i).width() + (i * 2);
		ranges.push(w);
		total+=w;
        
        console.log(ranges);
        
		//tijd = columns.eq(i).width(),
        //total += tijd,  
        prestatie = columns[i].id;
    

        
        if(prestatie != 'zeer_intensief' && total > 0) {
            update_refline(prestatie, total);
        }
	}	
    
    //console.log(prestaties);
    
}








var table_cells = d3.select('#rangeSlider').selectAll("td")
    .data(bovengrenzen)
    .style('width', function (d) {return x_slider(d) + 'px'})


var svg_slider = d3.select('#slider')
    .append('svg')
    .attr('height', '50px')
    .attr('width', width_table_container);

var scale_slider = svg_slider
    .append('g')
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin_table +  "," + 2 + ")")
    .call(xAxis_slider);    
 



var samenvatten = function (data){
    
    var samengevat = d3.nest()
                        .key(function (d) {return d.prestatie})
                        .sortKeys(function(a,b) { return prestaties.indexOf(a) - prestaties.indexOf(b); })
                        .rollup(function (e) {
                            return {
                                'aantal': e.length,
                                'tijd_totaal': d3.sum(e, function (g) {return g.tijd;}),
                                'omzet': d3.sum(e, function (g) {return g.prijs;})
                            }
                        })
                        .entries(data);
    
    
    
    //samengevatte data plat maken
    var samengevat_plat = [], i;
    
    for(i = 0; i < samengevat.length; i++){
    // de eerste waarde is de key
        
    samengevat_plat.push([samengevat[i].key]);
    
    var waarden = samengevat[i].values,
        waarden_arr = Object.keys(waarden).map(function (keys) {return waarden[keys];});
        
        $.merge(samengevat_plat[i], waarden_arr);
    
    }
    

    var totaal = d3.nest()
                .rollup(function (e) {
                        return {
                            'prestatie': 'totaal',
                            'aantal': e.length,
                            'tijd_totaal': d3.sum(e, function (g) {return g.tijd;}),
                            'omzet': d3.sum(e, function (g) {return g.prijs;})
                        }
                    })
                .entries(data);

    
    samengevat_plat.push(Object.keys(totaal).map(function (keys) {return totaal[keys];}));
    
    
    return samengevat_plat;
    
}












// Define function to update data
var update = function (databestand) {

    //console.log("table update started", databestand)
        
    //platte data maken, geeft een array die flat heet    
    var flat = samenvatten(databestand);

    var first = flat.slice(0, flat.length-1);
    
    
    var rows = tbody.selectAll('tr').data(first, function (d) {return d; });

    //////////////////////////////////////////
    // ROW UPDATE SELECTION

    // Update cells in existing rows.
    var cells = rows.selectAll('td').data(function (d) {return d; });

    cells.attr('class', 'update');

    // Cells enter selection
    cells.enter().append('td')
        .style('opacity', 0.0)
        .attr('class', 'enter')
        .transition()
        .delay(900)
        .duration(500)
        .style('opacity', 1.0);

    cells.text(function (d) {return d; });

    // Cells exit selection
    cells.exit()
        .attr('class', 'exit')
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();

    //////////////////////////////////////////
    // ROW ENTER SELECTION
    // Add new rows
    var cells_in_new_rows = rows.enter().append('tr')
                                .selectAll('td')
                                .data(function (d) {return d; });

    cells_in_new_rows.enter().append('td')
        .style('opacity', 0.0)
        .attr('class', 'enter')
        .transition()
        .delay(900)
        .duration(500)
        .style('opacity', 1.0);

    cells_in_new_rows.text(function (d) {return d; });

    /////////////////////////////////////////
    // ROW EXIT SELECTION
    // Remove old rows
    rows.exit()
        .attr('class', 'exit')
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();

    tbody.selectAll('tr').select('td').classed('row-header', true);
        
    
    //CLEAR FOOTER ROW
    var tfoot_clear = d3.select("tfoot").select("tr").remove();
    
    //APPEND NEW ROW
    var tfoot_row = tfoot.append("tr");

    //data voor totaal
    var last = flat.slice(flat.length-1, flat.length); 
    
    //ENTER NEW CELLS
    var tfoot_cells = tfoot_row.selectAll("td")
                               .data(last[0])
                               .enter()
                               .append("td")
                               .text(function (d) {return d; });
    
}






draw_graph("onvolledig", "#graph_onvolledig", grenzen_initieel[0]);
draw_graph("kort", "#graph_panel2", grenzen_initieel[1]);
draw_graph("middel", "#graph_panel3", grenzen_initieel[2]);
draw_graph("intensief", "#graph_panel4", grenzen_initieel[3]);


