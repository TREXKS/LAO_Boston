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

    // Get nested data
    var dataByDistrict = nestByDistricts(data);
    var dataByType = nestByType(data);

    // Initialize bubble chart
    showSelectedData(dataByDistrict);

    // Update chart when dropdown is changed
    $(".bubblechange").change(function() {

        // Get class of circles
       var dataDisplayed = $("circle:gt(0)").attr("class");

       // Call appropriate function with relevant data
       if (dataDisplayed == "broadCategories") {
           showSelectedData(dataByDistrict);
       }
       else showSpecificData(dataByType, dataDisplayed);
    });

    // Show specific subcategories when bubbles are clicked
    $(document).on("click", "circle", function() {

        // Get class of circles
        var dataDisplayed = $("circle:gt(1)").attr("class");

        // Toggle level of specificity
        if (dataDisplayed == "broadCategories") {
            var selectedType = $(this).attr("id");
            showSpecificData(dataByType, selectedType);
        }
        else showSelectedData(dataByDistrict);
    })

});

// Use selections to update broad crime category counts
function showSelectedData(data) {
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

    createBubbleVis(finalData, "broadCategories");

}

// Use selections to update subcategories within broader crime categories
function showSpecificData(data, type) {
    var finalData;
    var selectedDistrict = $("#bubbleDistricts").children("option:selected").val();
    var selectedDate = $("#bubbleChartYear").children("option:selected").val();
    var tempData1 = data.filter(function (d) {
        return (d.key == selectedDistrict);
    });
    var tempData2 = tempData1[0].values.filter(function (d) {
        return (d.key == selectedDate);
    });
    var tempData3 = tempData2[0].values.filter(function(d) {
        return (d.key == type);
    });
    if (tempData3.length != 0) {
        finalData = tempData3[0].values.filter(function(d) {
            return (d.key != "undefined");
        });
    }
    else finalData = [{ key: "None", value: 0 }];

    createBubbleVis(finalData, type);

}


// Create bubble chart
function createBubbleVis(data, classname) {

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
        .attr("id", function(d) {
            return d.data.key;
        })
        .attr("class", classname)
        .filter(function(d) {
            return !d.children
        })
        .attr("r", 1e-6)
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("fill", "#fff")
        .transition(t)
        .attr("fill", function(d) { return setColor(d.data.key, classname); })
        .attr("r", function(d){ return d.r });

    title.enter().append("text")
        .attr("class", "title")
        .attr("opacity", 1e-6)
        .style("text-anchor", "middle")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .text(function(d){ return d.data.key; })
        .transition(t)
        .attr("fill", "#fff")
        .attr("opacity", 1);

    count.enter().append("text")
        .attr("class", "count")
        .attr("opacity", 1e-6)
        .style("text-anchor", "middle")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 20; })
        .text(function(d){ return d.data.value; })
        .transition(t)
        .attr("fill", "#fff")
        .attr("opacity", 1);

    // UPDATE elements
    circle
        .transition(t)
        .filter(function(d) {
            return !d.children
        })
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; });

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
}

// Set colors for bubbles of each crime category
function setColor(id, className) {
    if (id == 'Assaults' || className == 'Assaults') {
        return '#C21CC8';
    } else if (id == 'Burglaries' || className == 'Burglaries') {
        return '#3333FF';
    } else if (id == 'Homicides' || className == 'Homicides') {
        return '#FF00AA';
    } else if (id == 'Robberies' || className == 'Robberies') {
        return '#8B008B';
    } else if (id == 'Rape' || className == 'Rape') {
        return '#C71585';
    } else return '#2109C9';
}

// Alternate colors for bubbles
/*
function setColor(id, className) {
    if (id == 'Assaults' || className == 'Assaults') {
        return '#F08080';
    } else if (id == 'Burglaries' || className == 'Burglaries') {
        return '#0EBFE9';
    } else if (id == 'Homicides' || className == 'Homicides') {
        return '#FC1501';
    } else if (id == 'Robberies' || className == 'Robberies') {
        return '#4682B4';
    } else if (id == 'Rape' || className == 'Rape') {
        return '#BA55D3';
    } else return '#4DBD33';
}

 */

