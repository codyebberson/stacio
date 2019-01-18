
function Rect(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;

    // For compatibility with DOMRect
    this.left = this.x1;
    this.top = this.y1;
    this.right = this.x2;
    this.bottom = this.y2;
    this.width = w;
    this.height = h;

    this.getCenter = function () {
        return {
            x: ((this.x1 + this.x2) / 2) | 0,
            y: ((this.y1 + this.y2) / 2) | 0
        };
    }

    this.intersects = function (other) {
        return this.x1 <= other.x2 && this.x2 >= other.x1 &&
            this.y1 <= other.y2 && this.y2 >= other.y1;
    }
}