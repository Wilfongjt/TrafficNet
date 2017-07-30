function TrafficModel(gis) {
    this.gisModel = gis;

    this.normal = 1;
    this.fireEngine = 2;
}
;
TrafficModel.prototype.getRandomInt = function (min, max) { //Returns a random number between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

TrafficModel.prototype.getDVX = function (car, roadSegment) {
    if (roadSegment.state.supressTraffic
            && car.type != this.fireEngine) {
        return 0.0;  // add nothing
    }
    var dy = roadSegment.coordinates[1].y - roadSegment.coordinates[0].y;
    var dx = roadSegment.coordinates[1].x - roadSegment.coordinates[0].x;
    //var vx = roadSegment.speed * (dx / (Math.abs(dx) + Math.abs(dy)));
    var vx = roadSegment.tailingspeed * (dx / (Math.abs(dx) + Math.abs(dy)));

    return vx;
};

TrafficModel.prototype.getDVY = function (car, roadSegment) {
    if (roadSegment.state.supressTraffic
            && car.type != this.fireEngine) {
        return 0.0; // add nothing
    }
    var dy = roadSegment.coordinates[1].y - roadSegment.coordinates[0].y;
    var dx = roadSegment.coordinates[1].x - roadSegment.coordinates[0].x;
    //var vy = roadSegment.speed * (dy / (Math.abs(dx) + Math.abs(dy)));
    var vy = roadSegment.tailingspeed * (dy / (Math.abs(dx) + Math.abs(dy)));

    return vy;
};
TrafficModel.prototype.getPullOverCoordinate = function (car) {
    //console.log("car: " + JSON.stringify(car));
    var tailSeg = this.firstTailSegment(car);
    //console.log("tailSeg: " + JSON.stringify(tailSeg));
    var coordA = tailSeg.coordinates[0];
    //console.log("coordA: " + JSON.stringify(coordA));
    var coordB = car.coordinates[0];
    //console.log("coordB: " + JSON.stringify(coordB));
    var distance = 7.0;
    return this.gisModel.getPerpPoint(coordA, coordB, distance);
};


TrafficModel.prototype.addTailSegment = function (car, idxPairNext, nextSeg) {
//console.log("ATS nextSeg: " + JSON.stringify(nextSeg));

    var tailEnd = 0;// end is at zero... really
    var nextTailSegIdxPair = {
        road: idxPairNext.road,
        seg: idxPairNext.seg
    };

    switch (car.type) {
        case this.normal:// car
            //   if (!(nextSeg.state.occupied > -1)) { 
            if (nextSeg.state.occupied < 0) {// not occupied
                nextSeg.state.occupied = car.idx;
                // use posted speed
                nextSeg.tailingspeed = car.attitude * nextSeg.speed;
            }
            break;
        case this.fireEngine:
            //if (!(nextSeg.state.occupied > -1)   ) { 
            if (nextSeg.state.occupied < 0) {// not occupied
                nextSeg.state.occupied = car.idx;

                // use posted speed
                nextSeg.tailingspeed = car.attitude * nextSeg.speed;
            }
            nextSeg.state.supressTraffic = true;// cars may follow
            // supress traffic in front of engine
            // supress current segment 
            // supress one segment ahead
            var nextSegPlusOne
                    = this.gisModel
                    .getSegment({road: idxPairNext.road, seg: idxPairNext.seg + 1});// look ahead one
            if (nextSegPlusOne) {
                //console.log("supress traffic");
                nextSegPlusOne.state.supressTraffic = true;
            }
            //console.log("nextSegPlusOne: " + JSON.stringify(nextSegPlusOne));

            break;
    }

    /*
     if (!(nextSeg.state.occupied > -1)) {
     //nextSeg.occupied = true;
     nextSeg.state.occupied = car.idx;
     // use posted speed
     nextSeg.tailingspeed = car.attitude * nextSeg.speed;
     } else {
     // use occupiers speed adjusted down
     //nextSeg.tailingspeed = car.attitude * nextSeg.tailingspeed;
     }
     */
    //console.log("nextSeg: " + JSON.stringify("nextSeg"));
    // var lastSegIdxPair = car.tail[car.tail.length - 1];
    // update the car tail
    car.tail.push(nextTailSegIdxPair); // push new segment into deque
    //console.log("A addTail: " + JSON.stringify(car));

    if (car.tail.length > 2) { // tail is 2 segments long
        //console.log("set occupied false");

        var seg = gisModel.getSegment(car.tail[tailEnd]);
        seg.state.occupied = -1;
        seg.state.supressTraffic = false;
        //seg.occupied = false;
        //car.tail[0].occupied = false;
        //console.log("seg: " + JSON.stringify(seg));
        car.tail.shift();// get rid of the oldest seg in deque

    }
};


TrafficModel.prototype.getRoad = function (car) {
    return this.gisModel.getRoad(car.tail[car.tail.length - 1].road);
};

TrafficModel.prototype.firstTailSegment = function (car) {
    // first is really the last
    return this.gisModel.getSegment(car.tail[car.tail.length - 1]);
};
//TrafficModel.prototype.getNextRoadDecision = function (prevRoadList) {
TrafficModel.prototype.getNextRoadDecision = function (car) {
    var head = car.tail.length - 1;
    var prevRoadList = gisModel.getRoad(car.tail[head].road);
    var nextRoad = null; // RoadList
    var nextIdx = 0;
    var randomLinkIdx = 0;


    //console.log("...........");
    //console.log("NRD prevRoadList: " + JSON.stringify(prevRoadList));
    switch (prevRoadList.linkIndices.length) {
        case 0: /// no more road then blocked
            //blocked = Constants.blocked;// 
            return null;
            //break;
        case 1:// pick first cause it is only choice
            randomLinkIdx = 0;
            break;
        default:
            // more than one road
            // select random index

            var max = prevRoadList.linkIndices.length;
            //console.log("NRD link sz: " + max);
            //The maximum is inclusive and the minimum is inclusive 
            randomLinkIdx = this.getRandomInt(0, max - 1); // pick random index
            //console.log("NRD randomLinkIdx: " + randomLinkIdx);
    }
    // need to add random selection here
    nextIdx = prevRoadList.linkIndices[randomLinkIdx];
    //console.log("NRD nextIdx: " + nextIdx);
    // console.log("this.links: " + this.gisModel.links);
    var link = this.gisModel.links[nextIdx]; // next link
    // console.log("NRD link: " + JSON.stringify(link))
    if (link.next > -1) {
        //console.log("NRD link.next: " + link.next)
        //nextRoad = this.network[link.next];
        nextRoad = this.gisModel.getRoad(link.next);

    }
    //console.log("NRD nextRoad.idx: " + nextRoad.idx);
    return nextRoad;
};
//TrafficModel.prototype.getUpdateStatus = function (currRoad, firstSegment, nextCoord) {
TrafficModel.prototype.getState = function (car, nextCoord) {
    // full stop
    // still in the same segment
    // segment or road has changed
    // full stop
    var currRoad = this.getRoad(car);
    //var firstSegment = this.gisModel.getSegment(car.tail[0]);//network[car.tail[0].road].feature[car.tail[0].seg];
    var firstSegment = this.firstTailSegment(car);
    // 
    var inCurrentRoad = this.gisModel.isInMBR(currRoad.mbr, nextCoord);//this.getCurrentRoad().getMBR().contains(nextCoord);
    var inCurrentSegment = this.gisModel.isInMBR(this.gisModel.getMBR(firstSegment), nextCoord);//getTail().getFirst().contains(nextCoord);

    if (inCurrentRoad) { // same segment
        if (inCurrentSegment) {
            return 1; // same segment
        }
    }

    var nextSegmentIndex = firstSegment.idx + 1; //getTail().getFirst().getIdx() + 1;
    var moreSegs = (nextSegmentIndex < currRoad.feature.length);

    if (inCurrentRoad && !inCurrentSegment) {// in road, not in seg
        if (moreSegs) {  // next segment with overshoot
            return 2; // overshoot segment
        }
    }

    if (!inCurrentRoad && !inCurrentSegment) {// out of road, not in seg
        if (moreSegs) { // next segment with overshoot
            return 3; // out of road but more segments
        }
    }
    // extra road segment overshoot
    if (!inCurrentRoad && !inCurrentSegment) { // out of road, not in seg
        if (!moreSegs) { // no more segments
            return 4; // out of road and no more segments
        }
    }
    //console.log("currRoad: " + JSON.stringify(currRoad));
    //console.log("nextSegmentIndex: " + nextSegmentIndex + "  currRoad.length: " + currRoad.length)
    //console.log("getUpdateStatus: inCurrentRoad:" + inCurrentRoad + "  inCurrentSegment: " + inCurrentSegment + "  moreSegs: " + moreSegs)
    return 0; // full stop
};
