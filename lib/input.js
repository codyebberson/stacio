
/**
 * @constructor
 */
wglt.Input = function() {
    this.down = false;
    this.downCount = 0;
    this.upCount = 0;
};

wglt.Input.prototype.update = function() {
    if (this.down) {
        this.downCount++;
        this.upCount = 0;
    } else {
        this.downCount = 0;
        this.upCount++;
    }
};
