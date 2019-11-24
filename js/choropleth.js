// Initialize datasets so they can be global

var crimedata;
var geodistrict;
var totalcrimes = [];
var DatabyDistrict = {};
var whichvar;
var whichlod;

// Create SVG drawing area
var width = 800,
    height = 800;

var svg = d3.select("#vizChoropleth_top").append("svg")
    .attr("width", width)
    .attr("height", height);


// Create the projection
var projection = d3.geoAlbers()
                   .scale(190000)
                   .rotate([71.057,0])
                   .center([0, 42.313])
                   .translate([width/2,height/2]);

var path = d3.geoPath()
             .projection(projection);


// Create tooltip
var tip = d3.tip()
    .attr("class", "tooltip")
    .offset([-5, 0]);

svg.call(tip);


// Event listener
d3.select("#choroplethYear").on("change", function()  { updateChoropleth(); });
d3.select("#choroplethCrime").on("change", function() { updateChoropleth(); });
d3.select("#choroplethLoD").on("change", function()   { updateChoropleth(); });

// Police_Districts has map draw out by districts like A1, E4, etc.
queue()
    .defer(d3.json, "data/Police_Districts.geojson")
    .defer(d3.csv, "data/tmppsbn_zff.csv")
    .await(function(error, police, crimecsv) {

            // Process data
            crimecsv.forEach(function(d) {
                        if (d.OFFENSE_CODE > 110 && d.OFFENSE_CODE < 115) {
                                d.crimetype = "HOMICIDE";
                        }
                        if ((d.OFFENSE_CODE > 210 && d.OFFENSE_CODE < 272) || (d.OFFENSE_CODE > 1700 && d.OFFENSE_CODE < 1732)) {
                                d.crimetype = "SEXUAL";
                        }
                        if ((d.OFFENSE_CODE > 400 && d.OFFENSE_CODE < 434) || (d.OFFENSE_CODE > 800 && d.OFFENSE_CODE < 804)) {
                                d.crimetype = "ASSAULT";
                        }
                        if (d.OFFENSE_CODE > 300 && d.OFFENSE_CODE < 382) {
                                d.crimetype = "ROBBERY";
                        }
                        if (d.OFFENSE_CODE > 509 && d.OFFENSE_CODE < 563) {
                                d.crimetype = "BURGLARY";
                        }
                        if (d.OFFENSE_CODE > 1400 && d.OFFENSE_CODE < 1500) {
                                d.crimetype = "VANDALISM";
                        }
            });
            console.log(crimecsv);

            // Subset to exclude the external and unnamed districts
            crimecsv = crimecsv.filter(function(d){
                        return d.DISTRICT !== "External" && d.DISTRICT !== "";
                }
            );

            // Write these to the global datasets
            crimedata = crimecsv;
            geodistrict = police.features;

            totalcrimes = d3.nest()
                .key(function(d) { return d.DISTRICT; })
                .rollup(function(d) { return {

                        // Total  crimes
                        totcrimes: d.length,

                        // By year
                        tot2015: d3.sum(d, function(d){ if(d.YEAR == "2015"){ return 1; } }),
                        tot2016: d3.sum(d, function(d){ if(d.YEAR == "2016"){ return 1; } }),
                        tot2017: d3.sum(d, function(d){ if(d.YEAR == "2017"){ return 1; } }),
                        tot2018: d3.sum(d, function(d){ if(d.YEAR == "2018"){ return 1; } }),
                        tot2019: d3.sum(d, function(d){ if(d.YEAR == "2019"){ return 1; } }),

                        // By crime type
                        tothom:  d3.sum(d, function(d){ if(d.crimetype == "HOMICIDE"){ return 1; } }),
                        totaslt: d3.sum(d, function(d){ if(d.crimetype == "ASSAULT"){ return 1; } }),
                        totburg: d3.sum(d, function(d){ if(d.crimetype == "BURGLARY"){ return 1; } }),
                        totrob:  d3.sum(d, function(d){ if(d.crimetype == "ROBBERY"){ return 1; } }),
                        totsex:  d3.sum(d, function(d){ if(d.crimetype == "SEXUAL"){ return 1; } }),
                        totvand: d3.sum(d, function(d){ if(d.crimetype == "VANDALISM"){ return 1; } }),

                        // By both crime type and year
                        hom2015:  d3.sum(d, function(d){ if(d.crimetype == "HOMICIDE" && d.YEAR == "2015"){ return 1; } }),
                        aslt2015: d3.sum(d, function(d){ if(d.crimetype == "ASSAULT" && d.YEAR == "2015"){ return 1; } }),
                        burg2015: d3.sum(d, function(d){ if(d.crimetype == "BURGLARY" && d.YEAR == "2015"){ return 1; } }),
                        rob2015:  d3.sum(d, function(d){ if(d.crimetype == "ROBBERY" && d.YEAR == "2015"){ return 1; } }),
                        sex2015:  d3.sum(d, function(d){ if(d.crimetype == "SEXUAL" && d.YEAR == "2015"){ return 1; } }),
                        vand2015: d3.sum(d, function(d){ if(d.crimetype == "VANDALISM" && d.YEAR == "2015"){ return 1; } }),

                        hom2016:  d3.sum(d, function(d){ if(d.crimetype == "HOMICIDE" && d.YEAR == "2016"){ return 1; } }),
                        aslt2016: d3.sum(d, function(d){ if(d.crimetype == "ASSAULT" && d.YEAR == "2016"){ return 1; } }),
                        burg2016: d3.sum(d, function(d){ if(d.crimetype == "BURGLARY" && d.YEAR == "2016"){ return 1; } }),
                        rob2016:  d3.sum(d, function(d){ if(d.crimetype == "ROBBERY" && d.YEAR == "2016"){ return 1; } }),
                        sex2016:  d3.sum(d, function(d){ if(d.crimetype == "SEXUAL" && d.YEAR == "2016"){ return 1; } }),
                        vand2016: d3.sum(d, function(d){ if(d.crimetype == "VANDALISM" && d.YEAR == "2016"){ return 1; } }),

                        hom2017:  d3.sum(d, function(d){ if(d.crimetype == "HOMICIDE" && d.YEAR == "2017"){ return 1; } }),
                        aslt2017: d3.sum(d, function(d){ if(d.crimetype == "ASSAULT" && d.YEAR == "2017"){ return 1; } }),
                        burg2017: d3.sum(d, function(d){ if(d.crimetype == "BURGLARY" && d.YEAR == "2017"){ return 1; } }),
                        rob2017:  d3.sum(d, function(d){ if(d.crimetype == "ROBBERY" && d.YEAR == "2017"){ return 1; } }),
                        sex2017:  d3.sum(d, function(d){ if(d.crimetype == "SEXUAL" && d.YEAR == "2017"){ return 1; } }),
                        vand2017: d3.sum(d, function(d){ if(d.crimetype == "VANDALISM" && d.YEAR == "2017"){ return 1; } }),

                        hom2018:  d3.sum(d, function(d){ if(d.crimetype == "HOMICIDE" && d.YEAR == "2018"){ return 1; } }),
                        aslt2018: d3.sum(d, function(d){ if(d.crimetype == "ASSAULT" && d.YEAR == "2018"){ return 1; } }),
                        burg2018: d3.sum(d, function(d){ if(d.crimetype == "BURGLARY" && d.YEAR == "2018"){ return 1; } }),
                        rob2018:  d3.sum(d, function(d){ if(d.crimetype == "ROBBERY" && d.YEAR == "2018"){ return 1; } }),
                        sex2018:  d3.sum(d, function(d){ if(d.crimetype == "SEXUAL" && d.YEAR == "2018"){ return 1; } }),
                        vand2018: d3.sum(d, function(d){ if(d.crimetype == "VANDALISM" && d.YEAR == "2018"){ return 1; } }),

                        hom2019:  d3.sum(d, function(d){ if(d.crimetype == "HOMICIDE" && d.YEAR == "2019"){ return 1; } }),
                        aslt2019: d3.sum(d, function(d){ if(d.crimetype == "ASSAULT" && d.YEAR == "2019"){ return 1; } }),
                        burg2019: d3.sum(d, function(d){ if(d.crimetype == "BURGLARY" && d.YEAR == "2019"){ return 1; } }),
                        rob2019:  d3.sum(d, function(d){ if(d.crimetype == "ROBBERY" && d.YEAR == "2019"){ return 1; } }),
                        sex2019:  d3.sum(d, function(d){ if(d.crimetype == "SEXUAL" && d.YEAR == "2019"){ return 1; } }),
                        vand2019: d3.sum(d, function(d){ if(d.crimetype == "VANDALISM" && d.YEAR == "2019"){ return 1; } })

                }; })
                .entries(crimecsv);
            console.log(totalcrimes);

            totalcrimes.forEach(function (d) {
                  DatabyDistrict[d.key] = d;      // To be able to look up data by district

                  if(d.key == "A1") { d.value.areapop = 42776;  d.area = "Downtown"; }
                  if(d.key == "A7") { d.value.areapop = 46665;  d.area = "East Boston"; }
                  if(d.key == "A15"){ d.value.areapop = 18901;  d.area = "Charlestown"; }
                  if(d.key == "B2") { d.value.areapop = 70350;  d.area = "Roxbury"; }
                  if(d.key == "B3") { d.value.areapop = 25586;  d.area = "Mattapan"; }
                  if(d.key == "C6") { d.value.areapop = 39655;  d.area = "South Boston"; }
                  if(d.key == "C11"){ d.value.areapop = 126269; d.area = "Dorchester"; }
                  if(d.key == "D4") { d.value.areapop = 88203;  d.area = "South End"; }
                  if(d.key == "D14"){ d.value.areapop = 71148;  d.area = "Brighton"; }
                  if(d.key == "E5") { d.value.areapop = 63136;  d.area = "West Roxbury"; }
                  if(d.key == "E13"){ d.value.areapop = 39314;  d.area = "Jamaica Plain"; }
                  if(d.key == "E18"){ d.value.areapop = 37094;  d.area = "Hyde Park"; }
            });
            console.log(DatabyDistrict);


            // Initial map
            svg.selectAll("path")
                .data(geodistrict)
                .enter()
                .append("path")
                .attr("class", "maplines")
                .attr( "fill", "#ccc" )
                .attr( "stroke", "#333")
                .attr("d", path);

            // Update choropleth map
            updateChoropleth();
    });


function updateChoropleth() {

        varsformap();

        // Color scale
        var mapcolor = d3.scaleQuantize();

        mapcolor.domain([d3.min(totalcrimes, function (d) {
                                if (whichlod == "Total") {
                                        return d.value[whichvar];
                                }
                                if (whichlod == "perCapita"){
                                        return d.value[whichvar]/d.value["areapop"];
                                }}),
                         d3.max(totalcrimes, function (d) {
                                 if (whichlod == "Total") {
                                         return d.value[whichvar];
                                 }
                                 if (whichlod == "perCapita"){
                                         return d.value[whichvar]/d.value["areapop"];
                                 }})])
                .range(["#f524c8", "#c21cc8", "#8917ce", "#6e13cd", "#320cc2"]);
                //.range(["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"]);



        // Information shown in the tooltip
        // e.g. of d.properties.DISTRICT: geodistrict[0].properties.DISTRICT = "A15"
        tip.html(function (d) {
                var dataRow = DatabyDistrict[d.properties.DISTRICT];
                var format = d3.format(",");

                if (whichlod == "Total"){
                        return dataRow.area + ": " + format(dataRow["value"][whichvar]);
                }
                if (whichlod == "perCapita"){
                        return dataRow.area + ": " + format((dataRow["value"][whichvar])/(dataRow.value.areapop));
                }
        });

        // Choropleth update
        svg.selectAll(".maplines")
            .attr("fill", function (d) {
                    if (whichlod == "Total") {
                            return mapcolor((DatabyDistrict[d.properties.DISTRICT])["value"][whichvar]);
                    }
                    if (whichlod == "perCapita"){
                            return mapcolor(((DatabyDistrict[d.properties.DISTRICT])["value"][whichvar])/((DatabyDistrict[d.properties.DISTRICT])["value"]["areapop"]));
                    }
            })
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        // Create legend
        var legend = svg.selectAll("g.legendentry")
            .data(mapcolor.range().reverse());

        // Enter legend
        var legendinit = legend.enter()
            .append("g")
            .attr("class", "legendentry");

        legendinit.append("rect")
            .attr("x", 50)
            .attr("y", function(d,i){
                    return i*20 + 50;
            })
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", function(d){ return d; });

        legendinit.append("text")
            .attr("x", 90)
            .attr("y", function(d,i){
                    return i*20 + 65;
            })
            .text(function(d,i){
                    var extent = mapcolor.invertExtent(d);
                    var format = d3.format(".3s");

                    return format(+extent[0]) + " - " + format(+extent[1]);
            })
            .attr("fill", "white");

        // Update legend
        legend.selectAll("text")
            .text(function(d,i){
                    var extent = mapcolor.invertExtent(d);
                    var format = d3.format(".3s");

                    return format(+extent[0]) + " - " + format(+extent[1]);
            });

        legend.exit().remove();
}


function varsformap(){

        // Capture selection from combobox in a variable
        var whichyear = d3.select("#choroplethYear").property("value");
        console.log(whichyear);
        var whichtype = d3.select("#choroplethCrime").property("value");
        console.log(whichtype);
        var percap = d3.select("#choroplethLoD").property("value");
        console.log(percap);

        whichlod = percap;

        if (whichyear == "All"  && whichtype == "All"){whichvar = "totcrimes";};

        if (whichyear == "2015" && whichtype == "All"){whichvar = "tot2015";};
        if (whichyear == "2016" && whichtype == "All"){whichvar = "tot2016";};
        if (whichyear == "2017" && whichtype == "All"){whichvar = "tot2017";};
        if (whichyear == "2018" && whichtype == "All"){whichvar = "tot2018";};
        if (whichyear == "2019" && whichtype == "All"){whichvar = "tot2019";};

        if (whichyear == "All" && whichtype == "Homicide") {whichvar = "tothom";};
        if (whichyear == "All" && whichtype == "Assault")  {whichvar = "totaslt";};
        if (whichyear == "All" && whichtype == "Burglary") {whichvar = "totburg";};
        if (whichyear == "All" && whichtype == "Robbery")  {whichvar = "totrob";};
        if (whichyear == "All" && whichtype == "Sexual")   {whichvar = "totsex";};
        if (whichyear == "All" && whichtype == "Vandalism"){whichvar = "totvand";};

        if (whichyear == "2015" && whichtype == "Homicide") {whichvar = "hom2015";};
        if (whichyear == "2015" && whichtype == "Assault")  {whichvar = "aslt2015";};
        if (whichyear == "2015" && whichtype == "Burglary") {whichvar = "burg2015";};
        if (whichyear == "2015" && whichtype == "Robbery")  {whichvar = "rob2015";};
        if (whichyear == "2015" && whichtype == "Sexual")   {whichvar = "sex2015";};
        if (whichyear == "2015" && whichtype == "Vandalism"){whichvar = "vand2015";};

        if (whichyear == "2016" && whichtype == "Homicide") {whichvar = "hom2016";};
        if (whichyear == "2016" && whichtype == "Assault")  {whichvar = "aslt2016";};
        if (whichyear == "2016" && whichtype == "Burglary") {whichvar = "burg2016";};
        if (whichyear == "2016" && whichtype == "Robbery")  {whichvar = "rob2016";};
        if (whichyear == "2016" && whichtype == "Sexual")   {whichvar = "sex2016";};
        if (whichyear == "2016" && whichtype == "Vandalism"){whichvar = "vand2016";};

        if (whichyear == "2017" && whichtype == "Homicide") {whichvar = "hom2017";};
        if (whichyear == "2017" && whichtype == "Assault")  {whichvar = "aslt2017";};
        if (whichyear == "2017" && whichtype == "Burglary") {whichvar = "burg2017";};
        if (whichyear == "2017" && whichtype == "Robbery")  {whichvar = "rob2017";};
        if (whichyear == "2017" && whichtype == "Sexual")   {whichvar = "sex2017";};
        if (whichyear == "2017" && whichtype == "Vandalism"){whichvar = "vand2017";};

        if (whichyear == "2018" && whichtype == "Homicide") {whichvar = "hom2018";};
        if (whichyear == "2018" && whichtype == "Assault")  {whichvar = "aslt2018";};
        if (whichyear == "2018" && whichtype == "Burglary") {whichvar = "burg2018";};
        if (whichyear == "2018" && whichtype == "Robbery")  {whichvar = "rob2018";};
        if (whichyear == "2018" && whichtype == "Sexual")   {whichvar = "sex2018";};
        if (whichyear == "2018" && whichtype == "Vandalism"){whichvar = "vand2018";};

        if (whichyear == "2019" && whichtype == "Homicide") {whichvar = "hom2019";};
        if (whichyear == "2019" && whichtype == "Assault")  {whichvar = "aslt2019";};
        if (whichyear == "2019" && whichtype == "Burglary") {whichvar = "burg2019";};
        if (whichyear == "2019" && whichtype == "Robbery")  {whichvar = "rob2019";};
        if (whichyear == "2019" && whichtype == "Sexual")   {whichvar = "sex2019";};
        if (whichyear == "2019" && whichtype == "Vandalism"){whichvar = "vand2019";};

        console.log(whichvar);
        console.log(whichlod);
