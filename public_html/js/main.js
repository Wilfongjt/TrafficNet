//var network;
//var url = 'http://localhost:3000/network/squareville';
var url = 'data/squareville.json';
//var svg;
d3.json(url, function (error, graph) {
    //console.log(graph.network);

    var roads = d3.select("body")
            .select("#network")
            .append("g")
            .attr("id", "roads")
            .selectAll("line")
            .data(graph.network) // set data array
            .enter() // 
            .selectAll("line")
            .data(function (d) {
                return d.feature; //<-- this is your array of points
            })
            .enter()
            .append("line")
            .attr("x1", function (d) {
                //console.log("x0: " + JSON.stringify(d.coordinates[0].x));
                return d.coordinates[0].x;
            })
            .attr("y1", function (d) {
                //console.log("y0: " + JSON.stringify(d.coordinates[0].y));
                return d.coordinates[0].y;
            })
            .attr("x2", function (d) {
                //console.log("x1: " + JSON.stringify(d.coordinates[1].x));
                return d.coordinates[1].x;
            })
            .attr("y2", function (d) {
                //console.log("y1: " + JSON.stringify(d.coordinates[1].y));
                return d.coordinates[1].y;
            })
            .attr("stroke-width", function (d) {
                if (d.idx == 0) {
                    return 1.5;
                }
                return 0.5;
            })
            .attr("stroke", function (d) {
                if (d.idx == 0) {
                    return "darkgrey";
                }
                return "lightgrey";
            })
            ;

    var cars = d3.select("body")
            .select("#network")
            .append("g") // add group for cars
            .attr("id", "cars")
            .selectAll("circle") // prepare to add circles
            .data(graph.network) // set data array
            .enter() // 
            .append("circle")
            .attr("cx", function (d) {
                return d.feature[0].coordinates[0].x;
            })
            .attr("cy", function (d) {
                return d.feature[0].coordinates[0].y;
            })
            .attr("r", 5)
            .attr("fill", "blue");
    ;

    // Legend
    d3.select("#key")
            .append("circle")
            .attr("cx", 15)
            .attr("cy", 20)
            .attr("r", 5)
            .attr("fill", "blue")
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", 44)
            .attr("y", 24)
            .text("Car");
    
    d3.select("#key")
            .append("line")
            .attr("x1", 10)
            .attr("y1", 40)
            .attr("x2", 40)
            .attr("y2", 40)
            .attr("stroke-width", 2)
            .attr("stroke", "darkgray");
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", 45)
            .attr("y", 44)
            .text("Road begining");

    d3.select("#key")
            .append("line")
            .attr("x1", 10)
            .attr("y1", 60)
            .attr("x2", 40)
            .attr("y2", 60)
            .attr("stroke-width", 0.5)
            .attr("stroke", "darkgray")
            ;

    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", 45)
            .attr("y", 64)
            .text("Road end");
    ;

});

