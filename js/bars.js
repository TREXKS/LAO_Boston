// VISUALIZATION SET-UP for SET OF BAR CHARTS 
if("no" == NaN){
    console.log("NAN");
}
// SVG AREA -------------------------------------------------------------
var barsMargin = {top: 0, right: 10, bottom: 0, left: 35};

var barsWidth = 1200 - barsMargin.left - barsMargin.right,
    barsHeight = 570 - barsMargin.top - barsMargin.bottom;

var svgBars = d3.select("#vizSmBarCharts").append("svg")
    .attr("width", barsWidth + barsMargin.left + barsMargin.right)
    .attr("height", barsHeight + barsMargin.top + barsMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barsMargin.left + "," + barsMargin.top + ")");


// SCALES --------------------------------------------------------------
var barsX = d3.scaleBand()
    .rangeRound([0, barsWidth])
	.paddingInner(0.1)

var barsY = d3.scaleLinear()
    .range([0,100])
    .domain([0,1])

var brushScale = d3.scaleLinear()
    .range([0,1440])
    .domain([300,1040])

var labels = d3.scaleBand()
  .domain(['Homicide', "Rape", "Assault", "Robbery", "Burglary", "Vandalism"])
  .range([0, 250])

var timeOfDay = d3.scaleBand()
    .domain(["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p","12a."])
    .range([0, 770])
    


// AXES ----------------------------------------------------------------
var barsXaxis = d3.axisBottom()
    .scale(labels);

var brushAxis = d3.axisBottom()
    .scale(timeOfDay)
    


// OTHER DATA -----------------------------------------------------------
var districtKey={
    E13:"JamaicaPlain",
    C11:"Dorchester",
    B3:"Mattapan",
    C6:"SouthBoston",
    D4:"SouthEnd",
    D14:"Brighton",
    E5:"WestRoxbury",
    E18:"HydePark",
    A1:"Downtown",
    A15:"Charlestown",
    A7:"EastBoston",
    B2:"Roxbury"
}

var districtPop={
    E13:39314,
    C11:126269,
    B3:25586,
    C6:39655,
    D4:88203,
    D14:71148,
    E5:63136,
    E18:37094,
    A1:42776,
    A15:18901,
    A7:46665,
    B2:70350
}




// LOAD CSV -----------------------------------------------------------
d3.csv("data/crimeData.csv", function(data){
  console.log(data);
    
    // STEP 1 - ORGANIZE THE DATA -------------------------------------
    

    // Add a minutes field to each data point
    var parseTime = d3.timeParse("%Y-%m-%d %I:%M:%S"),
        getHour = d3.timeFormat("%H"),
        getMinute = d3.timeFormat("%M");
    
    for(c=0;c<data.length;c++){
        var formattedDate = parseTime(data[c].OCCURRED_ON_DATE);
        data[c].MINUTES = (parseInt(getHour(formattedDate))*60)+(parseInt(getMinute(formattedDate)));  
    }
        
    // I will show 6 types of offenses, each spans several offense codes
    // I need to combine several codes into a single data point
        // The first key function organizes my data by district
        // The second key function combines similar offense codes
        // The rollup function pulls the total number of offenses for the combined codes
    var timeStart = 0,
        timeEnd = 1440,
        dataset,
        crimeByDistrict,
        crimeByDistrictCleaned,
        individualCrimeTallies;
    
    wrangleData();
    
    function wrangleData(){
        var dataset = data.filter(function(d){
            return d.MINUTES<= timeEnd && d.MINUTES >= timeStart;
        });
        //console.log("Start: " + timeStart + "End: " + timeEnd);
        crimeByDistrict = d3.nest()
          .key(function(d) { return d.DISTRICT; })
          .key(function(d) { 
              if(d.OFFENSE_CODE > 110 && d.OFFENSE_CODE< 115){
                return "homicides";   
              }
              if((d.OFFENSE_CODE > 210 && d.OFFENSE_CODE < 272)||
                 (d.OFFENSE_CODE >1700 && d.OFFENSE_CODE < 1732)){
                return "sexCrimes";   
              }
              if((d.OFFENSE_CODE > 400 && d.OFFENSE_CODE < 434)||
                (d.OFFENSE_CODE > 800 && d.OFFENSE_CODE < 804)){
                return "assaults";   
              }
              if(d.OFFENSE_CODE > 300 && d.OFFENSE_CODE< 382){
                return "robberies";   
              }
              if(d.OFFENSE_CODE > 509 && d.OFFENSE_CODE< 563){
                return "burglaries"; 
              }
              if(d.OFFENSE_CODE > 1400 && d.OFFENSE_CODE< 1500){
                return "vandalism"; 
              }else{
                  return "total"}})
          .rollup(function(code) { return code.length})
          .entries(dataset);
    
    
        // Sanity check
        //console.log(crimeByDistrict) // close but has some problems, see Step 2




        // STEP 2 - CLEAN THE DATA -----------------------------------------------------

        // Not all districts have crime data for every category
        // The key order for each district was set by what data it encountred first (no bueno)
        // I need to
            // 1. Add in the missing offense types with a value of 0
            // 2. Order my Data so it can be pushed to an array cleanly
            // 3. create a "crime" array for each district

        // Create an empty Array for our "cleaned" dataset
        crimeByDistrictCleaned = [];


        // iterate through each district
        for(i=0;i<crimeByDistrict.length;i++){

                // create a new object for each district
                var districtData = {};

                // give it a name value
                districtData.district =districtKey[crimeByDistrict[i].key]

                // FILL IN BLANKS & SET ORDER OF DATA ----------------------------------
                // Create a key/value pair for each type of crime
                // (this order is the order of bars in our chart)
                districtData.homicides = 0;
                districtData.sexCrimes = 0;
                districtData.assaults = 0;
                districtData.robberies = 0;
                districtData.burglaries = 0;
                districtData.vandalism = 0;

                // Replace the 0 placeholders with actual values

                // Iterate through the value array for each district
                // (the above key names match the value names from crimeByDistrict)
                for(a=0;a<crimeByDistrict[i].values.length;a++){
                    districtData[crimeByDistrict[i].values[a].key] = crimeByDistrict[i].values[a].value
                }

                // Create an empty array, this will hold our crime numbers for our bar chart
                var crimeArray = [] 

                //Populate crimeArray by iterating through the keys we created for districtData
                var keys = Object.keys(districtData)
                for (var key of keys) {
                    if(typeof districtData[key] == 'number' && key != "total"){
                        crimeArray.push(districtData[key]);
                    }
                }

                // Add the array to the object
                districtData.crimes = crimeArray;

                //Add the population for each district
                districtData.population = districtPop[crimeByDistrict[i].key];

                //Add the population % of the city
                districtData.popPercent = (districtPop[crimeByDistrict[i].key]/669158);

                //Add the population adjustment
                districtData.popAdjustment = (districtPop[crimeByDistrict[i].key]/669158)/(1/12);

                // Now push the whole big object all out to crimeByDistrictCleaned
                crimeByDistrictCleaned.push(districtData);
        }//end of for loop

        // Sanity Check
        //console.log(crimeByDistrictCleaned);
    
    
    
    
        // FILTER OUT THE REMAINING JUNK DATA ----------------------------------------------
        // Looking in the console I see we have some "undefined" districts to remove

        crimeByDistrictCleaned = crimeByDistrictCleaned.filter(function(foo){ 
            return foo.district;
        });

        // Sanity Check
        //onsole.log(crimeByDistrictCleaned);
        
            //Get the totals for each type of crime to use calculating percentages attributred to each district
    individualCrimeTallies = []
    
    for(i=0;i<crimeByDistrictCleaned.length;i++){
        console.log(i);
        if(i==0){ //fill the array with the data from the first district
            for(a=0;a<crimeByDistrictCleaned[i].crimes.length;a++){
                individualCrimeTallies.push(crimeByDistrictCleaned[i].crimes[a]);
            } 
        }else{ //add to the values as we cycle through the remaining districts
            for(a=0;a<crimeByDistrictCleaned[i].crimes.length;a++){
                individualCrimeTallies[a] += crimeByDistrictCleaned[i].crimes[a];
            }}}
        //console.log(individualCrimeTallies);
    }
    
    
    
    
    //VISUALIZATION TIME!!!! -----------------------------------------------------------

    var columnIterator = 3,
        rowIterator = -1;
    //Create a group for each district
    svgBars.selectAll("g")
            .data(crimeByDistrictCleaned)
            .enter()
            .append("g")
            .attr("id",function(d){ return d.district;})
            .attr("class","rowGroup")
            .attr("transform", function(d, i) {
                    if(columnIterator == 3){
                        columnIterator = 0;
                        rowIterator++;
                    }else{
                        columnIterator++;
                    }
                   
                    return "translate(" + columnIterator*280 + "," + (rowIterator*160+96) + ")"; });
    
    

    
    
    
    initViz();
    
    
    
    // GENERATE THE BARS ------------------------------------------------
    function initViz(){  
        // Loop through the districts, create a bar chart for each
        for(i=0;i<crimeByDistrictCleaned.length;i++){

            // draw the bars
            svgBars.select("g#" + crimeByDistrictCleaned[i].district)
                .selectAll("rect")
                .data(crimeByDistrictCleaned[i].crimes)
                .enter()
                .append("rect")
                .attr("x", function(d,b){return b*40;})
                .attr("y", function(d,b){return 0-(barsY(d/individualCrimeTallies[b]))})
                .attr("width", 35)
                .attr("height", function(d,b){return barsY(d/individualCrimeTallies[b])})
                .style("fill",function(d,b){ return "rgb(" + Math.round((d/individualCrimeTallies[b]-.085)*1500) + "," + Math.round((d/individualCrimeTallies[b]-.05)*180) +",200)"});

            // add the label
            svgBars.select("g#" + crimeByDistrictCleaned[i].district)
                .append("text") 
                .attr("x",-5)
                .attr("y",45)
                .text(crimeByDistrictCleaned[i].district);

            // draw the axis
            svgBars.select("g#" + crimeByDistrictCleaned[i].district)
                .append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + 1 + ")")
                .call(barsXaxis)
                .selectAll("text")
                .attr("y", -6)
                .attr("x", -10)
                .attr("transform", "translate(0,8)rotate(-15)");

        }
        
    }//end of initViz
    
    
    
    // USER INPUT --------------------------------------------------------------------
    var userSelection = document.getElementById("barsControl1");
        userSelection.addEventListener("change", updateBars);
    
        // Set up our Brush
    var brush = d3.brushX()
        .extent([[300, 0], [1040, 30]])
        .on("brush", brushed);
    
        //Brush scale
    
    function brushed() {
        var selectionRange = d3.brushSelection(d3.select(".brush").node());
        timeStart = brushScale(selectionRange[0]);
        timeEnd = brushScale(selectionRange[1]);
        wrangleData();
        updateBars()
    }
    
    svgBars.append("g")
        .attr("class", "brush")
        .call(brush)
        .selectAll("rect")
        .attr("transform", "translate(0,500)")
        .attr("y", 0)
        .attr("height", 30);
    
    svgBars.select("g.brush")
        .append("g")
        .attr("class", "brushAxis")
        .attr("transform", "translate(284,532)")
        .call(brushAxis)
        .selectAll("text")
        .style("fill","darkgrey");

    svgBars.select("g.brushAxis") 
        .selectAll("line")
        .attr("y1",-30);
    
    //UPDATE ------------------------------------------------------------------------
    function updateBars(){
        
        for(i=0;i<crimeByDistrictCleaned.length;i++){

            // update the data
            svgBars.select("g#" + crimeByDistrictCleaned[i].district)
                .selectAll("rect")
                .data(crimeByDistrictCleaned[i].crimes)
                .enter();
            //console.log(crimeByDistrictCleaned[i].district + " Crimes " + crimeByDistrictCleaned[i].crimes);
        }
        
        if(userSelection.value == "perCapita_average"){
            barsY = d3.scaleSqrt()
                    .range([0,12])
                    .domain([0,1])
            
            for(i=0;i<crimeByDistrictCleaned.length;i++){
                // update the bars
                svgBars.select("g#" + crimeByDistrictCleaned[i].district)
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .attr("y", function(d,b){ 
                        if(d ==0 ||individualCrimeTallies[b] ==0 || crimeByDistrictCleaned[i] ==0){ return -40;
                                        }else{
                    
                            if(((d/individualCrimeTallies[b])/crimeByDistrictCleaned[i].popPercent)>1){ 
                                return -barsY(((d/individualCrimeTallies[b]) / (crimeByDistrictCleaned[i].popPercent))-1)-41;

                            }else{
                                return -39;
                            }}})
                
                    .attr("height", function(d,b){ 
                        if(d ==0 ||individualCrimeTallies[b] ==0 || crimeByDistrictCleaned[i] ==0){ return 45;
                                        }else{
                                            
                             if(((d/individualCrimeTallies[b]) / (crimeByDistrictCleaned[i].popPercent)>1)){
                                return barsY(((d/individualCrimeTallies[b]) / (crimeByDistrictCleaned[i].popPercent))-1);

                             }else{
                                return barsY((1/((d/individualCrimeTallies[b]) / (crimeByDistrictCleaned[i].popPercent))));
                             }}})
                
                    .style("fill",function(d,b){ 
                    
                        if(d==0){
                            return "green";
                        }else{
                            if (((d/individualCrimeTallies[b])/crimeByDistrictCleaned[i].popPercent)>1){ 
                            return "rgb(" + Math.round((((d/individualCrimeTallies[b]) / (crimeByDistrictCleaned[i].popPercent))-1)*45) + "," + Math.round((d/individualCrimeTallies[b]-.05)*180) +",200)"
                            
                        }else{
                            return "rgb(0," + Math.round((1/((d/individualCrimeTallies[b]) / (crimeByDistrictCleaned[i].popPercent))*25)+100) + ",200)"
                }}});
                //console.log(individualCrimeTallies);
                svgBars.selectAll(".axis path")
                    .transition()
                    .duration(500)
                    .attr("transform", "translate(0," + -41 + ")")
                    .style("stroke","darkgrey");                   
            }//end for loop
        }//end if statement 
        
        if(userSelection.value == "city_percentage"){
            
            barsY = d3.scaleLinear()
                .range([0,100])
                .domain([0,1])
            
            for(i=0;i<crimeByDistrictCleaned.length;i++){
                
                svgBars.select("g#" + crimeByDistrictCleaned[i].district)
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .attr("y", function(d,b){if (Number.isNaN(barsY(d/individualCrimeTallies[b]))){ return 0 }else{ return 0-barsY(d/individualCrimeTallies[b])}})
                    .attr("height", function(d,b){if (Number.isNaN(barsY(d/individualCrimeTallies[b]))){ return 0 }else{ return barsY(d/individualCrimeTallies[b])}})
                    .style("fill",function(d,b){ return "rgb(" + Math.round((d/individualCrimeTallies[b]-.085)*1500) + "," + Math.round((d/individualCrimeTallies[b]-.05)*180) +",200)"});


            // draw the axis
            svgBars.selectAll(".axis path")
                    .transition()
                    .duration(500)
                    .attr("transform", "translate(0," + 1 + ")")
                    .style("stroke","black");
            }
        }
        
         //console.log(crimeByDistrictCleaned);
    }//end updateBars()


  })

