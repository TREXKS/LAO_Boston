
	var margin = {top: 100, right: 100, bottom: 100, left: 100},
	radar_width = Math.min(550, window.innerWidth - 10) - margin.left - margin.right,
	height = Math.min(radar_width, window.innerHeight - margin.top - margin.bottom - 20);

	var offset = 0;

	loadData();


	// Load CSV file
	function loadData() {
		d3.csv("data/crimeData.csv", function(data){

		  var byCrime = d3.nest()
		      .key(function(d) { return d.OFFENSE_DESCRIPTION; })
		      .key(function(d) { return d.MONTH; })
					.sortKeys((a, b) => a - b)
		      .rollup(function(leaves) { return leaves.length; })
		      .entries(data);

			const timeOfDay = d3.nest()
			    .key(d => +d.MONTH)
					.rollup(function(leaves) { return leaves.length; })
			    .entries(data);

			const timeOfDay_sorted = d3.nest()
			    .key(d => +d.MONTH)
			    .sortKeys((a, b) => a - b)
					.rollup(function(leaves) { return leaves.length; })
			    .entries(data);

			console.log(byCrime)

			var homocide = [byCrime[137].values]
			var rape = [byCrime[259].values]
			var assault = [byCrime[0].values]
			var robbery = [byCrime[18].values]
			var burglary = [byCrime[126].values]
			var vandalism = [byCrime[2].values]


			dataset_homo = homocide;
			dataset_rape = rape;
			dataset_assault = assault;
			dataset_robbery = robbery;
			dataset_burglary = burglary;
			dataset_vandalism = vandalism;

			updateVisualization();
		})
	}


function updateVisualization() {

			var color = d3.scaleOrdinal()
			.range(["#58D6C7","#CC333F","#00A0B0"]);

			var radarChartOptions = {
				w: radar_width,
				h: height,
				margin: margin,
				maxVal3ue: 0.5,
				levels: 5,
				roundStrokes: true,
				color: color,
				opacityCircles: 0.1
			};

			var month = [
			  {key: 1, month: "Jan.",},
				{key: 2, month: "Feb.",},
				{key: 3, month: "March",},
				{key: 4, month: "April",},
				{key: 5, month: "May",},
				{key: 6, month: "June",},
				{key: 7, month: "July",},
				{key: 8, month: "August",},
				{key: 9, month: "Sept.",},
				{key: 10, month: "Oct.",},
				{key: 11, month: "Nov.",},
				{key: 12, month: "Dec.",},


			];

		//Call function to draw the Radar chart
		RadarChart(".radarChart", dataset_homo, radarChartOptions);

	/////////// Inspired by the code of alangrafu ///////////

		function RadarChart(id, data, options) {
			var cfg = {
				w: 400,				//Width of the circle
				h: 400,				//Height of the circle
				margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
				levels: 3,				//How many levels or inner circles should there be drawn
				maxValue: 0, 			//What is the value that the biggest circle will represent
				labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
				wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
				opacityArea: 0.35, 	//The opacity of the area of the blob
				dotRadius: 4, 			//The size of the colored circles of each blog
				opacityCircles: 0.1, 	//The opacity of the circles of each blob
				strokeWidth: 2, 		//The width of the stroke around each blob
				roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
				color: d3.scaleOrdinal(d3.schemeCategory10)	//Color function
				};

		//Put all of the options into a variable called cfg
		if('undefined' !== typeof options){
			for(var i in options){
				if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
		}
		}

		//If the supplied maxValue is smaller than the actual one, replace by the max in the data
		var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(d){return d.value;}))}));
		console.log(data[0])
		console.log(month)

		var allAxis = (month.map(function(i, j){return i.month})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format(''),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

		//Scale for the radius
		var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);


		//Initiate the radar chart SVG
		var svg = d3.select(id).append("svg")
		.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
		.attr("height", cfg.h + cfg.margin.top)
		.attr("class", "radar"+id);
		//Append a g element
		var g = svg.append("g")
		.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.margin.top + 150) + ")");


	//
	// ADDITIONAL LOOK TO FIGURE
	// 	//Filter for the outside glow
		var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');


		//Wrapper for the grid & axes
		var axisGrid = g.append("g").attr("class", "axisWrapper");

		//Draw the background circles
		axisGrid.selectAll(".levels")
		.data(d3.range(1,(cfg.levels+1)).reverse())
		.enter()
		.append("circle")

		.transition().duration(1000)

		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#000000")
		.style("stroke", "#320CC2")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)")
		.style("stroke-width", "1.5px");
;

		//Text indicating at what % each level is
		axisGrid.selectAll(".axisLabel")
		.data(d3.range(1,(cfg.levels+1)).reverse())
		.enter().append("text")
		.attr("class", "axisLabel")
		.attr("x", 4)
		.attr("y", function(d){return -d*radius/cfg.levels;})
		.attr("dy", "0.4em")
		.style("font-size", "15px")
		.attr("fill", "#ffffff")
		.text(function(d,i) { return Format(maxValue * d/cfg.levels); });


		//Create the straight lines radiating outward from the center
		var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
		//Append the lines
		axis.append("line")
		.transition().duration(1500)

		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i  - Math.PI/2 - offset); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i  - Math.PI/2 - offset); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

		//Append the labels at each axis
		axis.append("text")
		.attr("class", "legend")
		.style("font-size", "15px")
		.style("stroke", "white")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i  - Math.PI/2 - offset); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i  - Math.PI/2 - offset); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);


		//The radial line function
		var radarLine = d3.radialLine()
		.curve(d3.curveLinearClosed)
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice - offset; });


	// CHANGE CIRCLE LOOK
		if(cfg.roundStrokes) {
			radarLine.curve(d3.curveCardinalClosed);
		}


	// ***************************************

		//Create a wrapper for the blobs
		var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");

		//Append the backgrounds
		blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", '#FF28CD')
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
		//Dim all blobs
		d3.selectAll(".radarArea")
		.transition().duration(200)
		.style("fill-opacity", 0.1);
		//Bring back the hovered over blob
		d3.select(this)
		.transition().duration(200)
		.style("fill-opacity", 0.7);
		})
		.on('mouseout', function(){
		//Bring back all blobs
		d3.selectAll(".radarArea")
		.transition().duration(200)
		.style("fill-opacity", cfg.opacityArea);
		})
		.on('click', function(d){
			d3.selectAll(".radarArea")
			.transition().duration(200)
			.style("fill", '#8917CE')
			 showEdition(d)
		});

		//Create the outlines
		blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke",  '#4C0AD5')
		.style("fill", "none")
		.style("filter" , "url(#glow)");


		//Wrapper for the invisible circles on top
		var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");


		//Taken from http://bl.ocks.org/mbostock/7555321
		//Wraps SVG text
		function wrap(text, width) {
			text.each(function() {
				var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
		lineHeight = 1.4, // ems
		y = text.attr("y"),
		x = text.attr("x"),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
		});
		}//wrap

		var selectBox = d3.select("#ranking-type");

		var byCrime = d3.nest()
				.key(function(d) { return d.OFFENSE_DESCRIPTION; })
				.key(function(d) { return d.MONTH; })
				.rollup(function(leaves) { return leaves.length; })
				.entries(data);

				var data2 = [byCrime];

		// WHEN RANKING TYPE IS selected
				d3.select("#ranking-type")
			    .on("change", function(d) {
			      console.log(selectBox.property('value'))

						if (selectBox.property('value') == 'homocide')
							RadarChart(".radarChart", dataset_homo, radarChartOptions);
						if (selectBox.property('value') == 'rape')
							RadarChart(".radarChart", dataset_rape, radarChartOptions);
						if (selectBox.property('value') == 'assault')
							RadarChart(".radarChart", dataset_assault, radarChartOptions);
						if (selectBox.property('value') == 'robbery')
							RadarChart(".radarChart", dataset_robbery, radarChartOptions);
						if (selectBox.property('value') == 'burglary')
							RadarChart(".radarChart", dataset_burglary, radarChartOptions);
						if (selectBox.property('value') == 'vandalism')
							RadarChart(".radarChart", dataset_vandalism, radarChartOptions);


							//Remove whatever chart with the same id/class was present before
							d3.select(id).select("svg").remove();
							//Scale for the radius
							var rScale = d3.scaleLinear()
							.domain([0, maxValue]);

							//Text indicating at what % each level is
							axisGrid.selectAll(".axisLabel")
							.data(d3.range(1,(cfg.levels+1)).reverse())
							.enter().append("text")
							.attr("class", "axisLabel")
							.attr("x", 4)
							.attr("y", function(d){return -d*radius/cfg.levels;})
							.attr("dy", "0.4em")
							.style("font-size", "15px")
							.attr("fill", "#ffffff")
							.text(function(d,i) { return Format(maxValue * d/cfg.levels); });


							//Create the straight lines radiating outward from the center
							var axis = axisGrid.selectAll(".axis")
							.data(allAxis)
							.enter()
							.append("g")
							.attr("class", "axis");
							//Append the lines
							axis.append("line")
							.attr("x1", 0)
							.attr("y1", 0)
							.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i  - Math.PI/2 - offset); })
							.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i  - Math.PI/2 - offset); })
							.attr("class", "line")
							.style("stroke", "white")
							.style("stroke-width", "2px");

							//Append the labels at each axis
							axis.append("text")
							.attr("class", "legend")
							.style("font-size", "20px")
							.attr("text-anchor", "middle")
							.attr("dy", "0.35em")
							.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i  - Math.PI/2 - offset); })
							.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i  - Math.PI/2 - offset); })
							.text(function(d){return d})
							.call(wrap, cfg.wrapWidth);

			  });
				console.log(dataset_homo)

		}//RadarChart
		function showEdition(d){
			document.getElementById("January").innerHTML = " " + d[0].value;
			document.getElementById("February").innerHTML = " " + d[1].value;
			document.getElementById("March").innerHTML = " " + d[2].value;
			document.getElementById("April").innerHTML =  " " + d[3].value;
			document.getElementById("May").innerHTML =  " " + d[4].value;
			document.getElementById("June").innerHTML =  " " + d[5].value;
			document.getElementById("July").innerHTML = " " + d[6].value;
			document.getElementById("August").innerHTML =  " " + d[7].value;
			document.getElementById("September").innerHTML = " " + d[8].value;
			document.getElementById("October").innerHTML =  " " + d[9].value;
			document.getElementById("November").innerHTML =  " " + d[10].value;
			document.getElementById("December").innerHTML =  " " + d[11].value;
		}


		}
