function TrafficModel(gis) {
    this.gisModel = gis;
}
;
TrafficModel.prototype.getRandomInt = function (min, max) { //Returns a random number between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

TrafficModel.prototype.getDVX = function (roadSegment) {
    var dy = roadSegment.coordinates[1].y - roadSegment.coordinates[0].y;
    var dx = roadSegment.coordinates[1].x - roadSegment.coordinates[0].x;
    
    //var vx = roadSegment.speed * (dx / (Math.abs(dx) + Math.abs(dy)));
       var vx = roadSegment.tailingspeed * (dx / (Math.abs(dx) + Math.abs(dy)));
  
    return vx;
};

TrafficModel.prototype.getDVY = function (roadSegment) {
    var dy = roadSegment.coordinates[1].y - roadSegment.coordinates[0].y;
    var dx = roadSegment.coordinates[1].x - roadSegment.coordinates[0].x;
    //var vy = roadSegment.speed * (dy / (Math.abs(dx) + Math.abs(dy)));
    
    var vy = roadSegment.tailingspeed * (dy / (Math.abs(dx) + Math.abs(dy)));
    
    return vy;
};


TrafficModel.prototype.addTailSegment = function (car, idxPairNext, nextSeg) {
//console.log("ATS nextSeg: " + JSON.stringify(nextSeg));

    var nextTailSegIdxPair = {
        road: idxPairNext.road,
        seg: idxPairNext.seg
    };
    if (!nextSeg.occupied) {
        nextSeg.occupied = true;
        // use posted speed
        nextSeg.tailingspeed = car.attitude * nextSeg.speed;
    } else {
        // use occupiers speed adjusted down
        nextSeg.tailingspeed = car.attitude * nextSeg.tailingspeed;
    }
    //console.log("nextSeg: " + JSON.stringify("nextSeg"));
    // var lastSegIdxPair = car.tail[car.tail.length - 1];
    // update the car tail
    car.tail.push(nextTailSegIdxPair); // push new segment into deque
    //console.log("A addTail: " + JSON.stringify(car));
    if (car.tail.length > 2) { // tail is 2 segments long
        //console.log("set occupied false");
        
        var seg = gisModel.getSegment(car.tail[0]);
        seg.occupied = false;
        //car.tail[0].occupied = false;
        //console.log("seg: " + JSON.stringify(seg));
        car.tail.shift();// get rid of the oldest seg in deque
    }

};
/*
 TrafficModel.prototype.addTailSegment = function (car, roadIdx, nextSeg) {
 //console.log("ATS nextSeg: " + JSON.stringify(nextSeg));
 //var nextTailSegIdxPair = {
 //  road: car.tail[car.tail.length-1].road, 
 //seg: car.tail[car.tail.length-1].seg + 1
 // };
 
 //var nextTailSegIdxPair = {
 //  road: roadIdx, 
 //seg: car.tail[car.tail.length-1].seg + 1
 //};
 var nextTailSegIdxPair = {
 road: roadIdx, 
 seg: car.tail[car.tail.length-1].seg + 1
 };
 if (!nextSeg.occupied) {
 // use posted speed
 nextSeg.tailingspeed = car.attitude * nextSeg.speed;
 } else {
 // use occupiers speed adjusted down
 nextSeg.tailingspeed = car.attitude * nextSeg.tailingspeed;
 }
 var lastSegIdxPair = car.tail[car.tail.length - 1];
 //if(nextTailSegIdxPair.road != lastSegIdxPair.road 
 //       || nextTailSegIdxPair.seg != lastSegIdxPair.seg ){
 // update the car tail
 car.tail.push(nextTailSegIdxPair); // push new segment into deque
 //console.log("A addTail: " + JSON.stringify(car));
 if (car.tail.length > 2) { // tail is 2 segments long
 car.tail[0].occupied = false;
 car.tail.shift();// get rid of the oldes seg in deque
 }
 // }else{
 //    console.log("duplicate " + JSON.stringify(nextTailSegIdxPair));
 //}
 //console.log("firstTailSegment: " + JSON.stringify(this.firstTailSegment(car)));
 //console.log("B addTail: " + JSON.stringify(car));
 };
 */

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
//xxxxxx
    var currRoad = this.getRoad(car);
    //var firstSegment = this.gisModel.getSegment(car.tail[0]);//network[car.tail[0].road].feature[car.tail[0].seg];
    var firstSegment = this.firstTailSegment(car);
    // velocity
    /*var nextCoord = {x: car.coordinates[0].x, y: car.coordinates[0].y};
     nextCoord.x += this.gisModel.getDVX(firstSegment);
     nextCoord.y += this.gisModel.getDVY(firstSegment);
     */
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
