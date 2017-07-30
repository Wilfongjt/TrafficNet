
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

GeographicModel.prototype.getPerpPoint = function (coordA, coordB, distance) {
    // vec2d M = (A + B) / 2;
    var mx = (coordA.x + coordB.x) / 2.0;
    var my = (coordA.y + coordB.y) / 2.0;
    console.log("M(" + mx + ", " + my + ")");

    var px = coordB.x + (-1.0 * coordA.x);
    var py = coordB.y + (-1.0 * coordA.y);
    /*
    var px = coordB.x + (-1.0 * coordA.x);
    var py = coordB.y + (-1.0 * coordA.y); 
     */
    console.log("p(" + px + ", " + py + ")");
    var nx = -1 * py;
    var ny = px;
    console.log("n(" + nx + ", " + ny + ")");
   
    var norm_length = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
    console.log("N: " + norm_length);
 
    var rx = nx / norm_length;
    var ry = ny / norm_length;
    console.log("r(" + rx + ", " + ry + ")");

    var rcx = (mx + (distance * rx));
    var rcy = (my + (distance * ry));
    console.log("rcx: " + rcx + " rcy: " + rcy);
    return {x: rcx, y: rcy}; // coordinate
};
/*
 public static Coordinate calculate_perp_point(Coordinate A, Coordinate B, double distance) {
 //System.out.println("A: " + A);
 //System.out.println("B: " + B);
 // vec2d M = (A + B) / 2;
 double mx = (A.x + B.x) / 2.0;
 double my = (A.y + B.y) / 2.0;
 //System.out.println("M(" + mx + ", " + my + ")");
 
 double px = B.x + ( - 1.0 * A.x);
 double py = B.y + ( - 1.0 * A.y);
 //System.out.println("p(" + px + ", " + py + ")");
 double nx = - 1 * py;
 double ny = px;
 //System.out.println("n(" + nx + ", " + ny + ")");
 double norm_length = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
 //System.out.println("N: " + norm_length);
 
 double rx = nx / norm_length;
 double ry = ny / norm_length;
 //System.out.println("r(" + rx + ", " + ry + ")");
 
 double rcx = (mx + (distance * rx));
 double rcy = (my + (distance * ry));
 //System.out.println("rc(" + rcx + ", " + rcy + ")");
 
 return new Coordinate((double) rcx, (double) rcy);
 }
 */
