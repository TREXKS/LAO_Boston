
var width = 700,
    height = 700;

var svg = d3.select("#vizBubbleChart")
    .append("svg")
    .attr("class", "bubble")
    .attr("width", width)
    .attr("height", height);

d3.csv("data/Boston_crime_data.csv", function(data) {

    var dataByDistrict = d3.nest()
        .key(function(d) { return d.DISTRICT; })
        .key(function(d) { return d.YEAR; })
        .key(function(d) { return d.OFFENSE_CODE_GROUP; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);



    var openingDistrict = document.getElementById("bubbleDistricts").value;
    var openingDate = document.getElementById("bubbleChartYear").value;
    var tempData = dataByDistrict.filter(function(d) {
        return (d.key == openingDistrict);
    });
    var finalData = tempData[0].values.filter(function(d) {
        return (d.key == openingDate);
    });

    createVis(finalData[0].values, "districtcounts", 80);


    $(".bubblechange").change(function() {
        openingDistrict = $("#bubbleDistricts").children("option:selected").val();
        openingDate = $("#bubbleChartYear").children("option:selected").val();
        var tempData = dataByDistrict.filter(function(d) {
            return (d.key == openingDistrict);
        });
        var finalData = tempData[0].values.filter(function(d) {
            return (d.key == openingDate);
        });
        d3.selectAll(".districtcounts").remove();

        createVis(finalData[0].values, "districtcounts", 80);
    });

});

function createVis(data, classname, limit) {

    var bubbleData = {
        "children": data
    };

    // General bubble layout adapted from https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
    var bubble = d3.pack(bubbleData)
        .size([width, height])
        .padding(1.5);

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
            if ((d.data.key != "") && d.data.value) {
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
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "black");

    d3.select(self.frameElement)
        .style("height", height + "px");
}