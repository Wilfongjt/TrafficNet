var gisModel;
var trafficmodel;
var cars = [];
//var url = 'http://localhost:3000/network/squareville';
var url = 'data/squareville.json';
//var svg;


d3.json(url, function (error, graph) {
    //console.log(graph.network);
    //network = graph.network;
    gisModel = new GeographicModel(graph.network, graph.links);
    trafficmodel = new TrafficModel(gisModel);
    //console.log("gisModel: " + JSON.stringify(gisModel));
    loadCars();
    /*for(var i =0; i < gisModel.network.length; i++){
     console.log("road: " + JSON.stringify(gisModel.getRoad(i)));
     }*/
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

    var vehicles = d3.select("body") // initialize the cars
            .select("#network") // svg id=network
            .append("g") // add group for cars
            .attr("id", "cars")
            .selectAll("circle") // prepare to add circles
            .data(cars) // set data array
            .enter() // 
            .append("circle")
            .attr("cx", function (d) {// d=car
                //console.log("d: " + JSON.stringify(d));
                return d.coordinates[0].x;
            })
            .attr("cy", function (d) {
                return d.coordinates[0].y;
            })
            .attr("r", function (d) {
                
                switch (d.type) {
                    case 1:// normal car
                        return 4;
                    case 2: // fire truck
                        return 5;
                }
                return 6;
            })
            .attr("fill", function (d) {
                switch (d.type) {
                    case 1:// normal car
                        return "blue";
                    case 2: // fire truck
                        return "red";
                }
                return "darkgrey";
            })
            ;

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
            .attr("r", 5)
            .attr("fill", "red")
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 2) + to)
            .text("Fire Engine");
    //////////
    d3.select("#key")
            .append("line")
            .attr("x1", 0)
            .attr("y1", (sy * 3))
            .attr("x2", 40)
            .attr("y2", (sy * 3))
            .attr("stroke-width", 2)
            .attr("stroke", "darkgray");
    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 3) + to)
            .text("Road begining");
    //////////

    d3.select("#key")
            .append("line")
            .attr("x1", 0)
            .attr("y1", (sy * 4))
            .attr("x2", 40)
            .attr("y2", (sy * 4))
            .attr("stroke-width", 0.5)
            .attr("stroke", "darkgray")
            ;

    d3.select("#key")
            .append("text")
            .style("fill", "black")
            .attr("x", sx2)
            .attr("y", (sy * 4) + to)
            .text("Road end");
    ;

});

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
        d3.select(this)
                .attr('cx', d.coordinates[0].x)
                .attr('cy', d.coordinates[0].y);

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
        //console.log("UC roadSegment: " + roadSegment);
        nextCoord.x += trafficmodel.getDVX(car, roadSegment);
        nextCoord.y += trafficmodel.getDVY(car, roadSegment);

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
                //console.log("UC idxPair: " + JSON.stringify(idxPairNext));
                nextSeg = gisModel.getSegment(idxPairNext); // idxPair = {road: , seg: }
                //console.log("UC nextSeg: " + JSON.stringify(nextSeg));
                trafficmodel.addTailSegment(car, idxPairNext, nextSeg);
                // adjust location
                // estimate next coord along new segment
                var estCoord = {// just for readability
                    x: nextSeg.coordinates[0].x + trafficmodel.getDVX(car, nextSeg),
                    y: nextSeg.coordinates[0].y + trafficmodel.getDVY(car, nextSeg)
                };
                car.coordinates[0].x = estCoord.x;
                car.coordinates[0].y = estCoord.y;
                //console.log("UC car: " + JSON.stringify(car));
                //console.log("UC done");
                break;
            case 3: // extra road, extra segment but still has more segments
                console.log("3 extra road, extra segment but still has more segments");
                break;
            case 4: // extra road segement overshoot 
                //console.log("4 extra road segement overshoot");
                //console.log("UC car: " + JSON.stringify(cars[i]));
                var nextRoadList = trafficmodel
                        .getNextRoadDecision(car);
                //console.log("UC nextRoadList: " + JSON.stringify(nextRoadList));
                var idxPairNext = {
                    road: nextRoadList.idx,
                    seg: 0
                };
                //console.log("UC idxPair: " + JSON.stringify(idxPairNext));
                //console.log("nextRoadList: "+JSON.stringify(nextRoadList));
                nextSeg = gisModel.getSegment(idxPairNext); //nextSeg = nextRoadList.feature[0];
                //console.log("UC nextSeg: " + JSON.stringify(nextSeg));
                if (nextSeg === null) {
                    console.log("deadend");
                    // deadend
                    break;
                }
                //nextSeg = nextRoadList.coordinates[0]; //nextRoadList.get(0); // get first segment
                //var idxPair = {road: car.tail[0].road, seg: car.tail[0].seg + 1};
                //nextSeg = gisModel.getSegment(idxPair);
                trafficmodel.addTailSegment(car, idxPairNext, nextSeg);
                // estimate next coord
                var estCoord = {// just for readability
                    x: nextSeg.coordinates[0].x + trafficmodel.getDVX(car, nextSeg),
                    y: nextSeg.coordinates[0].y + trafficmodel.getDVY(car, nextSeg)
                };
                car.coordinates[0].x = estCoord.x;
                car.coordinates[0].y = estCoord.y;
                //console.log("UC car: " + JSON.stringify(car));
                //console.log("UC done");
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
    for (var i = 0; i < sz - fireEngines; i++) {
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

