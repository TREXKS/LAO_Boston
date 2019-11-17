
// Load CSV file
d3.csv("data/crimeData.csv", function(data){

  var byCrime = d3.nest()
      .key(function(d) { return d.OFFENSE_DESCRIPTION; })
      .key(function(d) { return d.MONTH; })
      .rollup(function(leaves) { return leaves.length; })
      .entries(data);
  console.log(byCrime)

  var timeOfDay = d3.nest()
      .key(function(d) { return d.MONTH; })
      .rollup(function(leaves) { return leaves.length; })
      .entries(data);
  console.log(timeOfDay)


  })

  // Testing Branch updates
