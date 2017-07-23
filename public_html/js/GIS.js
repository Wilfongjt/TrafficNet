
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
