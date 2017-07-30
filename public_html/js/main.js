var gisModel;
var trafficmodel;
var cars = [];
//var url = 'http://localhost:3000/network/squareville';
var url = 'data/squareville.json';
//var svg;
function getCarColor(carType) {
    switch (carType) {
        case 1:// normal car
            return "blue";
        case 2: // fire truck
            return "red";
    }
    return "darkgrey";
}
function getCarSize(carType) {
    switch (carType) {
        case 1:// normal car
            return 5;
        case 2: // fire truck
            return 8;
    }
    return 6;
}

function getRoadColor(segmentIdx) {

    if (segmentIdx === 0) {
        return "darkgray";
    }
    return "lightgray";
}
function getRoadWidth(segmentIdx) {

    return 6;
}


function initiateNetwork() {
    d3.json(url, function (error, graph) {
        gisModel = new GeographicModel(graph.network, graph.links);
        trafficmodel = new TrafficModel(gisModel);
        loadCars();

        var roads = d3.select("body") // initialize the road
                .select("#network")
                .append("g")
                .attr("id", "roads")
                .selectAll("line")
                .data(gisModel.network) // set data array
                .enter() // 
                .selectAll("line")
                .data(function (d) {
                    return d.feature; //<-- this is your array of points
                })
                .enter()
                .append("line")
                .attr("x1", function (d) {

                    return d.coordinates[0].x;
                })
                .attr("y1", function (d) {

                    return d.coordinates[0].y;
                })
                .attr("x2", function (d) {

                    return d.coordinates[1].x;
                })
                .attr("y2", function (d) {

                    return d.coordinates[1].y;
                })
                .attr("stroke-width", function (d) {

                    return getRoadWidth(d.idx)
                })
                .attr("stroke", function (d) {

                    return getRoadColor(d.idx);
                })
                ;
        var vehicles = d3.select("body") // initialize the cars
                .select("#network") // svg id=network
                .append("g") // add group for cars
                .attr("id", "cars")
                .selectAll("circle") // prepare to add circles
                .data(cars) // set data array
                .enter() // 
                .append("circle")
                .attr("cx", function (d) {// d=car
                    return d.coordinates[0].x;
                })
                .attr("cy", function (d) {
                    return d.coordinates[0].y;
                })
                .attr("r", function (d) {
                    return getCarSize(d.type);
                })
                .attr("fill", function (d) {
                    return getCarColor(d.type);
                })
                ;


    });


}


function drawLegend() {
    console.log("drawLegend");
    // Legend
    var sx = 20;
    var sx2 = 44;
    var sy = 20
    var to = 5;
    d3.select("#key")
            .append("circle")
            .attr("cx", sx)
            .attr("cy", sy)
            .attr("r", 5)
            .attr("fill", "blue")
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", sy + to)
            .text("Car");
    /////////
    d3.select("#key")
            .append("circle")
            .attr("cx", sx)
            .attr("cy", sy * 2)
            .attr("r", getCarSize(2))
            .attr("fill", "red")
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 2) + to)
            .text("Fire Engine");
    //////////
    
      d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 3) + to)
            .text("All Roads are one-way");
    
    d3.select("#key")
            .append("line")
            .attr("x1", 0)
            .attr("y1", (sy * 4))
            .attr("x2", 40)
            .attr("y2", (sy * 4))
            .attr("stroke-width", getRoadWidth())
            .attr("stroke", getRoadColor(0));
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 4) + to)
            .text("Road begining");
    //////////

    d3.select("#key")
            .append("line")
            .attr("x1", 0)
            .attr("y1", (sy * 5))
            .attr("x2", 40)
            .attr("y2", (sy * 5))
            .attr("stroke-width", getRoadWidth())
            .attr("stroke", getRoadColor(1))
            ;

    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 5) + to)
            .text("Road end");
    ;

}

function update() {
    updateCars();
}

function draw() {

    //drawNetwork();
    drawCars();
}
function state() {
    for (var i = 0; i < cars.length; i++) {
        console.log("car: " + JSON.stringify(cars[i]));
    }
    console.log("----------")
    for (var i = 0; i < gisModel.network.length; i++) {
        console.log("road: " + JSON.stringify(gisModel.network[i]));
    }
}

function drawCars() {
    d3.select("#cars").selectAll("circle").each(function (d) {
        var pos = 0;
        if (d.coordinates.length == 2) {// 2=fire engine
            pos = 1;
        }
        d3.select(this)
                .attr('cx', d.coordinates[pos].x)
                .attr('cy', d.coordinates[pos].y);
    });
}

function updateCars() {

    for (var i = 0; i < cars.length; i++) {
        //console.log(".........")
        //console.log("UC car: " + JSON.stringify(cars[i]));
        var car = cars[i];
        //console.log("UC tail[0]: " + JSON.stringify(trafficmodel.firstTailSegment(car)) );
        var nextCoord = {x: car.coordinates[0].x, y: car.coordinates[0].y};
        //var roadSegment = network[car.tail[0].road].feature[car.tail[0].seg];
        //var roadSegment = gisModel.getSegment(car.tail[0]);//network[car.tail[0].road].feature[car.tail[0].seg];
        var roadSegment = trafficmodel.firstTailSegment(car);
        // velocity

        var dx = trafficmodel.getDVX(car, roadSegment);
        var dy = trafficmodel.getDVY(car, roadSegment);
        nextCoord.x += dx;
        nextCoord.y += dy;

        var nextSeg = null;

        switch (trafficmodel.getState(car, nextCoord)) {
            case 0: // full stop in place
                //console.log("0 full stop ");
                //setColour(Color.RED);   // Dead in the Road RED
                break;
            case 1: // update location on current segment
                //console.log("1 update location on current segment");

                car.coordinates[0].x = nextCoord.x;
                car.coordinates[0].y = nextCoord.y;

                break;
            case 2: // inner road segment with overshoot aka next segment
                //console.log("2 inner road segment with overshoot aka next segment");
                // deque
                // var queue = [];
                // queue.push(2);         // queue is now [2]
                // queue.push(5);         // queue is now [2, 5]
                // var i = queue.shift(); // queue is now [5]

                // next seg in same road

                var idxPairNext = {
                    road: car.tail[car.tail.length - 1].road,
                    seg: car.tail[car.tail.length - 1].seg + 1
                };

                nextSeg = gisModel.getSegment(idxPairNext); // idxPair = {road: , seg: }

                trafficmodel.addTailSegment(car, idxPairNext, nextSeg);
                // adjust location
                // estimate next coord along new segment
                dx = trafficmodel.getDVX(car, nextSeg);
                dy = trafficmodel.getDVY(car, nextSeg);

                var estCoord = {// just for readability
                    x: nextSeg.coordinates[0].x + dx,
                    y: nextSeg.coordinates[0].y + dy
                };
                car.coordinates[0].x = estCoord.x;
                car.coordinates[0].y = estCoord.y;
                // }
                break;
            case 3: // extra road, extra segment but still has more segments
                //console.log("3 extra road, extra segment but still has more segments");
                //console.log("3 car: " + JSON.stringify(car));
                //console.log("3 car.coord[0]: " + JSON.stringify(car.coordinates[0]));
                break;
            case 4: // extra road segement overshoot 
                //console.log("4 extra road segement overshoot");

                var nextRoadList = trafficmodel
                        .getNextRoadDecision(car);

                var idxPairNext = {
                    road: nextRoadList.idx,
                    seg: 0
                };

                nextSeg = gisModel.getSegment(idxPairNext); //nextSeg = nextRoadList.feature[0];

                if (nextSeg === null) {
                    console.log("deadend");
                    // deadend
                    break;
                }

                trafficmodel.addTailSegment(car, idxPairNext, nextSeg);
                // estimate next coord
                dx = trafficmodel.getDVX(car, nextSeg);
                dy = trafficmodel.getDVY(car, nextSeg);
                // get rid of pullover
                var estCoord = {// just for readability
                    x: nextSeg.coordinates[0].x + dx,
                    y: nextSeg.coordinates[0].y + dy
                };
                car.coordinates[0].x = estCoord.x;
                car.coordinates[0].y = estCoord.y;

                break;

            default:
                console.log("undefined situation");
        }
    }
}

function getAttitude() {
    var focus = 1.0;
    focus = Math.random();
    if (focus < 0.4) {
        focus = 0.4 + focus;
    }
    return focus;
}

function loadCars() {

    var sz = gisModel.network.length;

    var fireEngines = 1;
    //for (var i = 0; i < sz - fireEngines; i++) {
    for (var i = 0; i < sz - fireEngines; i++) {
        //console.log("loadCars Car"); 
        var feature = gisModel.network[i].feature; // road
        // for (var k = 0; k < feature.length; k++) {

        var car = {
            idx: i,
            attitude: getAttitude(),
            coordinates: [{"x": feature[0].coordinates[0].x, "y": feature[0].coordinates[0].y}],
            tail: [{road: i, seg: 0}],
            type: 1
        };
        cars.push(car);

        // initialize the road
        //feature[0].occupied = true;
        feature[0].state.occupied = car.idx;
        feature[0].tailingspeed = feature[0].speed * car.attitude;
        //console.log("car: " + JSON.stringify(car));

    }
    
    for (var i = 0; i < fireEngines; i++) {
        //console.log("loadCars fire engine"); 
        var feature = gisModel.network[i].feature; // road
        // for (var k = 0; k < feature.length; k++) {

        var car = {
            idx: cars.length,
            attitude: 1, // max speed
            coordinates: [{"x": feature[0].coordinates[0].x, "y": feature[0].coordinates[0].y}],
            tail: [{road: i, seg: 0}],
            type: 2
        };

        cars.push(car);
        // initialize the road
        //feature[0].occupied = true;
        feature[0].state.occupied = car.idx;
        feature[0].state.supressTraffic = true;
        feature[0].tailingspeed = feature[0].speed * car.attitude;
        feature[1].state.supressTraffic = true;
        //console.log("car: " + JSON.stringify(car));

    }
}

