// SVG margins
var bubbleMargin = {top: 10, right: 10, bottom: 10, left: 10};

var bubbleWidth = 700 - bubbleMargin.left - bubbleMargin.right,
    bubbleHeight = 700 - bubbleMargin.top - bubbleMargin.bottom;

// Create SVG
var svgBubble = d3.select("#vizBubbleChart").append("svg")
    .attr("class", "bubble")
    .attr("width", bubbleWidth + bubbleMargin.left + bubbleMargin.right)
    .attr("height", bubbleHeight + bubbleMargin.top + bubbleMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + bubbleMargin.left + "," + bubbleMargin.top + ")");

d3.csv("data/Boston_crime_data.csv", function(data) {
    var dataByDistrict = d3.nest()
        .key(function(d) { return d.DISTRICT; })
        .key(function(d) { return d.YEAR; })
        .key(function(d) {
            if(d.OFFENSE_CODE > 110 && d.OFFENSE_CODE< 115){
                return "Homicides";
            }
            if((d.OFFENSE_CODE > 210 && d.OFFENSE_CODE < 272)||
                (d.OFFENSE_CODE >1700 && d.OFFENSE_CODE < 1732)){
                return "Sex Crimes";
            }
            if((d.OFFENSE_CODE > 400 && d.OFFENSE_CODE < 434)||
                (d.OFFENSE_CODE > 800 && d.OFFENSE_CODE < 804)){
                return "Assaults";
            }
            if(d.OFFENSE_CODE > 300 && d.OFFENSE_CODE< 382){
                return "Robberies";
            }
            if(d.OFFENSE_CODE > 509 && d.OFFENSE_CODE< 563){
                return "Burglaries";
            }
            if(d.OFFENSE_CODE > 1400 && d.OFFENSE_CODE< 1500){
                return "Vandalism";
            }else{
                return "Total"}})
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

    showSelectedData(dataByDistrict);

    $(".bubblechange").change(function() {
        showSelectedData(dataByDistrict);
    });

});

// Use selections from dropdown to update bubbles
function showSelectedData (data) {
    var selectedDistrict = $("#bubbleDistricts").children("option:selected").val();
    var selectedDate = $("#bubbleChartYear").children("option:selected").val();
    var tempData1 = data.filter(function(d) {
        return (d.key == selectedDistrict);
    });
    var tempData2 = tempData1[0].values.filter(function(d) {
        return (d.key == selectedDate);
    });
    var finalData = tempData2[0].values.filter(function(d) {
        return (d.key != "Total");
    });

    createVis(finalData);

}

// Create bubble chart
function createVis(data) {

    var bubbleData = {
        "children": data
    };

    // General bubble layout adapted from https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
    // Transitions adapted from https://bl.ocks.org/HarryStevens/54d01f118bc8d1f2c4ccd98235f33848

    //Establish pack layout
    var bubble = d3.pack(bubbleData)
        .size([bubbleWidth, bubbleHeight])
        .padding(1.5);

    // Establish transition
    var t = d3.transition()
        .duration(1000);

    // Establish hierarchy
    var nodes = d3.hierarchy(bubbleData)
        .sum(function(d) {
            return d.value;
        });

    // Establish elements in chart
    var circle = svgBubble.selectAll("circle")
        .data(bubble(nodes).descendants(), function(d) { return d.data.key; });

    var title = svgBubble.selectAll("text.title")
        .data(bubble(nodes).descendants(), function(d) { return d.data.key; });

    var count = svgBubble.selectAll("text.count")
        .data(bubble(nodes).descendants(), function(d) { return d.data.key; });

    // ENTER new elements
    circle.enter().append("circle")
        .filter(function(d) {
            return !d.children
        })
        .attr("r", 1e-6)
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", "#fff")
        .transition(t)
        .style("fill", "#45b29d")
        .attr("r", function(d){ return d.r });

    title.enter().append("text")
        .attr("class", "title")
        .attr("opacity", 1e-6)
        .style("text-anchor", "middle")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .text(function(d){ return d.data.key; })
        .transition(t)
        .attr("opacity", 1);

    count.enter().append("text")
        .attr("class", "count")
        .attr("opacity", 1e-6)
        .style("text-anchor", "middle")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 20; })
        .text(function(d){ return d.data.value; })
        .transition(t)
        .attr("opacity", 1);

    // UPDATE elements
    circle
        .transition(t)
        .style("fill", "#3a403d")
        .filter(function(d) {
            return !d.children
        })
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", "#45b29d");

    title
        .transition(t)
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; });

    count
        .transition(t)
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 20; })
        .text(function(d){ return d.data.value; });

    // EXIT and REMOVE old elements
    circle.exit()
        .transition(t)
        .attr("r", 1e-6)
        .remove();

    title.exit()
        .transition(t)
        .attr("opacity", 1e-6)
        .remove();

    count.exit()
        .transition(t)
        .attr("opacity", 1e-6)
        .remove();



/*


        .enter()
        .filter(function(d) {
            return !d.children
        })
        .append("g")
        .attr("class", "node districtcounts")
        .attr("id", function(d) {
            return d.data.key;
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });

    // Establish tooltip
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
    svgBubble.call(tip);

    // Append circle to each node
    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .on("mouseover", function(d) {
            tip.show(d);
            d3.select(this).attr("fill", "#00008B");
        })
        .on("mouseout", function(d) {
            tip.hide(d);
            d3.select(this).attr("fill", "#ff5252");
        });

    // Append name and count to each node
    node.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.key;
        })
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "white");

    node.append("text")
        .attr("dy", "1.3em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d3.format(",")(d.data.value);
        })
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "white");

    d3.select(self.frameElement)
        .style("height", bubbleHeight + "px");

 */
}