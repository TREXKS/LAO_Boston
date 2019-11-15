/* main JS file */

d3.csv("data/Boston_crime_data.csv", function(data) {

    var dataByType = d3.nest()
        .key(function(d) { return d.OFFENSE_CODE_GROUP; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

    var dataByDistrict = d3.nest()
        .key(function(d) { return d.OFFENSE_CODE_GROUP })
        .key(function(d) { return d.DISTRICT; })
        .rollup(function(leaves) { return leaves.length.toString(); })
        .entries(data);

    console.log(dataByType);
    console.log(dataByDistrict);

    createVis(dataByType, "typecounts", 5000, 0);

$(".typecounts").on("click", function() {
    var id = $(this).attr("id");
    d3.select(".bubbledistrictcounts").remove();
    var crimeType = dataByDistrict.filter(function(d) {
        return (d.key == id);
    });

    createVis(crimeType[0].values, "districtcounts", 0, 0);


});


});


function createVis(data, classname, limit, startpoint) {

    var bubbleData = {
        "children": data
    };

    // General bubble layout adapted from https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
    var diameter = 800;

    var bubble = d3.pack(bubbleData)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#bubblechart")
        .append("svg")
        .attr("class", "bubble" + classname)
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + startpoint + ", 0)");

    var nodes = d3.hierarchy(bubbleData)
        .sum(function(d) {
            return d.value;
        });

    var node = svg.selectAll(".node")
        .data(bubble(nodes).descendants())
        .enter()
        .filter(function(d) {
            return !d.children
        })
        .append("g")
        .attr("class", "node " + classname)
        .attr("id", function(d) {
            return d.data.key;
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });

    var tip = d3.tip()
        .attr("class", "tooltip")
        .offset([-5, 0])
        .html(function(d) {
            if (d.data.key && d.data.value) {
                return d.data.key + ": " + d3.format(",")(d.data.value);
            }
            else {
                return "No data";
            }
        });

    // Call tooltip
    svg.call(tip);

    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    node.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) {
            if (d.data.value > limit) {
                return d.data.key;
            }
            else return "";
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "black");

    node.append("text")
        .attr("dy", "1.3em")
        .style("text-anchor", "middle")
        .text(function(d) {
            if (d.data.value > limit) {
                return d3.format(",")(d.data.value);
            }
            else return "";
        })
        .attr("font-family",  "Gill Sans", "Gill Sans MT")
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "black");

    node.exit().remove();

    d3.select(self.frameElement)
        .style("height", diameter + "px");
}
