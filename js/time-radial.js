(function(){
    // VISUALIZATION SET-UP for SET OF BAR CHARTS 

    // SVG AREA -------------------------------------------------------------
    var timeRadialMargin = {top: 20, right: 20, bottom: 20, left: 20};

    var timeRadialWidth = 400 - timeRadialMargin.left - timeRadialMargin.right,
        timeRadialHeight = 430 - timeRadialMargin.top - timeRadialMargin.bottom;

    var svgTimeRadial = d3.select("#vizTimeOfDay").append("svg")
        .attr("width", timeRadialWidth + timeRadialMargin.left + timeRadialMargin.right)
        .attr("height", timeRadialHeight + timeRadialMargin.top + timeRadialMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + timeRadialMargin.left + "," + timeRadialMargin.top + ")");


    // SCALES --------------------------------------------------------------


    // AXES ----------------------------------------------------------------



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




    // LOAD CSV ------------------------------------------------------------------------
    d3.csv("data/crimeData.csv", function(data){
                //console.log(data);

        var userSelection = document.getElementById("radialTimeControl");
            userSelection.addEventListener("change", updateTimeRadial);


        // STEP 1 - ORGANIZE THE DATA --------------------------------------------------

        // Collect Hours and Minutes from the data
        var parseTime = d3.timeParse("%Y-%m-%d %I:%M:%S"),
            getHour = d3.timeFormat("%H"),
            getMinute = d3.timeFormat("%M");


        // SET TIME INCREMENT (we are using 15 minute increments)
        for(c=0;c<data.length;c++){
            var formattedDate = parseTime(data[c].OCCURRED_ON_DATE);
            data[c].halfHour = Math.floor(((parseInt((getHour(formattedDate))*60))+(parseInt(getMinute(formattedDate))))/30) // the last denominator is minutes 
        }

        //An Empty Container to Hold the Path
        var points = [];
        //Set Up The Math for our Radial Graph
        var radialAreaGenerator = d3.radialArea()
            .curve(d3.curveCatmullRomClosed)
            .angle(function(d) {
                return d.angle;
            })
            .innerRadius(function(d) {
                return d.r0;
            })
            .outerRadius(function(d) {
                return d.r1;
            });

        //SCALES
        var radialValueScale = d3.scaleLinear()
            .range([0,100])

        // STEP 2 - WRANGLE DATA -----------------------------------------------------
        wrangleData();

        function wrangleData(){

            // CHECK THE DROPDOWN FOR A SELECTION
            var dataset = data.filter(function(d){
                if(userSelection.value == "all"){
                    return d;
                }
                if(userSelection.value == "homicide"){
                    return d.OFFENSE_CODE > 110 && d.OFFENSE_CODE< 115;
                }
                if(userSelection.value == "sexualAssault"){
                    return (d.OFFENSE_CODE > 210 && d.OFFENSE_CODE < 272)||(d.OFFENSE_CODE > 1700 && d.OFFENSE_CODE < 1732);
                }
                if(userSelection.value == "assault"){
                    return (d.OFFENSE_CODE > 400 && d.OFFENSE_CODE < 434)||(d.OFFENSE_CODE > 800 && d.OFFENSE_CODE < 804);
                }
                if(userSelection.value == "robbery"){
                    return d.OFFENSE_CODE > 300 && d.OFFENSE_CODE< 382;
                }
                if(userSelection.value == "burglary"){
                    return d.OFFENSE_CODE > 509 && d.OFFENSE_CODE< 563;
                }
                if(userSelection.value == "vandalism"){
                    return d.OFFENSE_CODE > 1400 && d.OFFENSE_CODE< 1500;
                }
            })


            // Add up the times per half hour, set above
            var crimeTime = d3.nest()
                  .key(function(d) { return d.halfHour; })
                  .rollup(function(code) { return code.length})
                  .entries(dataset);

                    //console.log("crimeTime");        
                    //console.log(crimeTime); 

            // Sort data by time
            crimeTime.sort(function(a,b){
                return a.key - b.key});


            for(i=0;i<48;i++){
                if (crimeTime[i]){
                    if (+crimeTime[i].key !== i){
                        crimeTime.splice(i,0,{key:i,value:0});
                    }
                }else{
                    crimeTime.splice(i,0,{key:i,value:0});
                }
            }
                    //console.log("crimeTime");
                    //console.log(crimeTime);
            
            //empty out our points array
            points = [];

            //set the DOMAIN for the SCALE
            radialTimeMax = d3.max(crimeTime, function(d){return d.value});
            radialTimeMin = d3.min(crimeTime, function(d){return d.value});
            radialValueScale.domain([radialTimeMin,radialTimeMax]);

                    //console.log(radialTimeMax + " : " +radialTimeMin);
            //generate the points
            console.log("crimeTime.length = " + crimeTime.length);
            for (i=0;i<crimeTime.length;i++){
                var timeCoordinate = {}

                timeCoordinate.angle = Math.PI * (2*(i/crimeTime.length));
                timeCoordinate.r0 = 110;
                timeCoordinate.r1 = 110 + radialValueScale(crimeTime[i].value);
                
                points.push(timeCoordinate);
            }
                    //console.log("wrangled");

            pathData = radialAreaGenerator(points);

        } //end wrangleData 


        var pathData = radialAreaGenerator(points);

        // DRAW RADIAL GRAPH (as a clip path for our gradient below)----------------
        svgTimeRadial.append("clipPath")
            .attr("id","circleClip")
            .attr("transform","translate(190,190)")
            .append('path')
            .attr("id","radialPath")
            .attr('d', pathData);


        //APPEND GRADIENT ----------------------------------------------------------

        svgTimeRadial.append("g")
            .attr("class","radialGradientGroup")
            .attr("transform", "translate(190,190)");

        var radialGradient = svgTimeRadial.append("defs")
          .append("radialGradient")
            .attr("id", "radial-gradient");

        //Gradient
        radialGradient.append("stop")
            .attr("offset", "52%")
            .attr("stop-color", "#001095");
        radialGradient.append("stop")
            .attr("offset", "60%")
            .attr("stop-color", "#2c00e3");
        radialGradient.append("stop")
            .attr("offset", "74%")
            .attr("stop-color", "#6f00de");
        radialGradient.append("stop")
            .attr("offset", "87%")
            .attr("stop-color", "#ff0dab")
        radialGradient.append("stop")
            .attr("offset", "91%")
            .attr("stop-color", "#ff5771")

        //Gradient Circle
        svgTimeRadial.append("circle")
            .attr("cx", 190)
            .attr("cy", 190)
            .attr("r", 220)
            .attr("clip-path","url(#circleClip)")
            .style("fill", "url(#radial-gradient)");
        
        // Axis
        var radialAxisData = ["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p"];
        
        svgTimeRadial.selectAll(".hour-label")
            .data(radialAxisData)
            .enter()
            .append("text")
            .attr("class","hour")
            .attr("text-anchor","middle")
            .attr("x",function(d,i){
                return 97*Math.sin((i*15)*.0174532925)+190
            })
            .attr("y",function(d,i){
                return -97*Math.cos((i*15)*.0174532925)+195
            })
            .text(function(d){return d;});
        svgTimeRadial.selectAll("line")
            .data(radialAxisData)
            .enter()
            .append("line")
            .attr("x1",function(d,i){
                return 110*Math.sin((i*15)*.0174532925)+190
            })
            .attr("y1",function(d,i){
                return -110*Math.cos((i*15)*.0174532925)+190
            })
            .attr("x2",function(d,i){
                return 222*Math.sin((i*15)*.0174532925)+190
            })
            .attr("y2",function(d,i){
                return -222*Math.cos((i*15)*.0174532925)+190
            })
            .style("stroke","rgba(8, 8, 8, 0.4)")
            .style("stroke-width",1);
            
        
        // UPDATE TIME RADIAL --------------------------------------------------------

        function updateTimeRadial(){
            wrangleData();
            svgTimeRadial.selectAll("path#radialPath")
            .transition()
            .duration(500)
            .attr('d', pathData);


        }//end update

      })//end data

})();//end self invoking functio