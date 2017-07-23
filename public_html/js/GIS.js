
function GeographicModel(network, links) {
    this.network = network;
    this.links = links;
};

GeographicModel.prototype.getRoad = function (idx) {
    return this.network[idx];
};
GeographicModel.prototype.getSegment = function (idxPair) {
    return this.network[idxPair.road].feature[idxPair.seg];
};
/*
GeographicModel.prototype.getDVX = function (roadSegment) {
    var dy = roadSegment.coordinates[1].y - roadSegment.coordinates[0].y;
    var dx = roadSegment.coordinates[1].x - roadSegment.coordinates[0].x;
    var vx = roadSegment.speed * (dx / (Math.abs(dx) + Math.abs(dy)));
    return vx;
};

GeographicModel.prototype.getDVY = function (roadSegment) {
    var dy = roadSegment.coordinates[1].y - roadSegment.coordinates[0].y;
    var dx = roadSegment.coordinates[1].x - roadSegment.coordinates[0].x;
    var vy = roadSegment.speed * (dy / (Math.abs(dx) + Math.abs(dy)));
    return vy;
};
*/
/*
GeographicModel.prototype.getNextRoadDecision = function (prevRoadList) {
    var nextRoad = null; // RoadList
    var nextIdx = 0;
    var randomLinkIdx = 0;

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
            //The maximum is inclusive and the minimum is inclusive 
            randomLinkIdx = getRandomInt(0, max + 1); // pick random index
    }
    // need to add random selection here
    nextIdx = prevRoadList.linkIndices[randomLinkIdx];
    var link = this.links[nextIdx]; // next link
    if (link.next > -1) {
        nextRoad = this.network[link.next];
    }
    return nextRoad;
};
*/

GeographicModel.prototype.getMBR = function (segment) {
    var mbr = [{x: 1000000, y: 1000000}, {x: -1000000, y: -1000000}];
    for (var i = 0; i < segment.coordinates.length; i++) {
        var c = segment.coordinates[i];
        if (mbr[0].x > c.x) {
            mbr[0].x = c.x;
        }
        if (mbr[1].x < c.x) {
            mbr[1].x = c.x;
        }

        if (mbr[0].y > c.y) {
            mbr[0].y = c.y;
        }
        if (mbr[1].y < c.y) {
            mbr[1].y = c.y;
        }
    }
    return mbr;
}

GeographicModel.prototype.isInMBR = function (mbr, coord) {

    if (coord.x >= mbr[0].x && coord.x <= mbr[1].x) {
        if (coord.y >= mbr[0].y && coord.y <= mbr[1].y) {
            return true;
        }
    }
    return false;
};
/*
GeographicModel.prototype.getUpdateStatus = function (currRoad, firstSegment, nextCoord) {
    // full stop
    // still in the same segment
    // segment or road has changed
    // full stop
    var inCurrentRoad = gis.isInMBR(currRoad.mbr, nextCoord);//this.getCurrentRoad().getMBR().contains(nextCoord);
    var inCurrentSegment = gis.isInMBR(getMBR(firstSegment), nextCoord);//getTail().getFirst().contains(nextCoord);

    if (inCurrentRoad) { // same segment
        if (inCurrentSegment) {
            return 1; // same segment
        }
    }

    var nextSegmentIndex = firstSegment.idx + 1; //getTail().getFirst().getIdx() + 1;
    var moreSegs = (nextSegmentIndex < currRoad.length);

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

    return 0; // full stop
};
*/
//module.exports = GeographicModel;