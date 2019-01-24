
// MRPAS
// Mingos' Restrictive Precise Angle Shadowcasting
// https://bitbucket.org/mingos/mrpas/overview

TileMap.prototype.isVisible = function (x, y) {
    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
        return false;
    }
    return this.grid[y][x].visible;
};

TileMap.prototype.computeFov = function (originX, originY, radius) {
    this.originX = originX;
    this.originY = originY;
    this.radius = radius;
    this.minX = Math.max(0, originX - radius);
    this.minY = Math.max(0, originY - radius);
    this.maxX = Math.min(this.width - 1, originX + radius);
    this.maxY = Math.min(this.height - 1, originY + radius);

    for (let y = this.minY; y <= this.maxY; y++) {
        for (let x = this.minX; x <= this.maxX; x++) {
            this.grid[y][x].seen |= this.grid[y][x].visible;
            this.grid[y][x].visible = false;
        }
    }

    this.grid[originY][originX].visible = true;

    this.computeOctantY(1, 1);
    this.computeOctantX(1, 1);
    this.computeOctantY(1, -1);
    this.computeOctantX(1, -1);
    this.computeOctantY(-1, 1);
    this.computeOctantX(-1, 1);
    this.computeOctantY(-1, -1);
    this.computeOctantX(-1, -1);
};

/**
 * Compute the FOV in an octant adjacent to the Y axis
 */
TileMap.prototype.computeOctantY = function (deltaX, deltaY) {
    const startSlopes = [];
    const endSlopes = [];
    let iteration = 1;
    let totalObstacles = 0;
    let obstaclesInLastLine = 0;
    let minSlope = 0;
    let x;
    let y;
    let halfSlope;
    let processedCell;
    let visible;
    let extended;
    let centreSlope;
    let startSlope;
    let endSlope;
    let previousEndSlope;

    for (y = this.originY + deltaY; y >= this.minY && y <= this.maxY;
        y += deltaY, obstaclesInLastLine = totalObstacles, ++iteration) {
        halfSlope = 0.5 / iteration;
        previousEndSlope = -1;
        for (processedCell = Math.floor(minSlope * iteration + 0.5),
            x = this.originX + (processedCell * deltaX);
            processedCell <= iteration && x >= this.minX && x <= this.maxX;
            x += deltaX, ++processedCell, previousEndSlope = endSlope) {
            visible = true;
            extended = false;
            centreSlope = processedCell / iteration;
            startSlope = previousEndSlope;
            endSlope = centreSlope + halfSlope;

            if (obstaclesInLastLine > 0) {
                if (!(this.grid[y - deltaY][x].visible &&
                    !this.grid[y - deltaY][x].blocked) &&
                    !(this.grid[y - deltaY][x - deltaX].visible &&
                        !this.grid[y - deltaY][x - deltaX].blocked)) {
                    visible = false;
                } else {
                    for (let idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
                        if (startSlope <= endSlopes[idx] &&
                            endSlope >= startSlopes[idx]) {
                            if (!this.grid[y][x].blocked) {
                                if (centreSlope > startSlopes[idx] &&
                                    centreSlope < endSlopes[idx]) {
                                    visible = false;
                                    break;
                                }
                            } else {
                                if (startSlope >= startSlopes[idx] &&
                                    endSlope <= endSlopes[idx]) {
                                    visible = false;
                                    break;
                                } else {
                                    startSlopes[idx] = Math.min(startSlopes[idx], startSlope);
                                    endSlopes[idx] = Math.max(endSlopes[idx], endSlope);
                                    extended = true;
                                }
                            }
                        }
                    }
                }
            }
            if (visible) {
                this.grid[y][x].visible = true;
                if (this.grid[y][x].blocked) {
                    if (minSlope >= startSlope) {
                        minSlope = endSlope;
                    } else if (!extended) {
                        startSlopes[totalObstacles] = startSlope;
                        endSlopes[totalObstacles++] = endSlope;
                    }
                }
            }
        }
    }
};

/**
 * Compute the FOV in an octant adjacent to the X axis
 */
TileMap.prototype.computeOctantX = function (deltaX, deltaY) {
    const startSlopes = [];
    const endSlopes = [];
    let iteration = 1;
    let totalObstacles = 0;
    let obstaclesInLastLine = 0;
    let minSlope = 0;
    let x;
    let y;
    let halfSlope;
    let processedCell;
    let visible;
    let extended;
    let centreSlope;
    let startSlope;
    let endSlope;
    let previousEndSlope;

    for (x = this.originX + deltaX; x >= this.minX && x <= this.maxX;
        x += deltaX, obstaclesInLastLine = totalObstacles, ++iteration) {
        halfSlope = 0.5 / iteration;
        previousEndSlope = -1;
        for (processedCell = Math.floor(minSlope * iteration + 0.5),
            y = this.originY + (processedCell * deltaY);
            processedCell <= iteration && y >= this.minY && y <= this.maxY;
            y += deltaY, ++processedCell, previousEndSlope = endSlope) {
            visible = true;
            extended = false;
            centreSlope = processedCell / iteration;
            startSlope = previousEndSlope;
            endSlope = centreSlope + halfSlope;

            if (obstaclesInLastLine > 0) {
                if (!(this.grid[y][x - deltaX].visible &&
                    !this.grid[y][x - deltaX].blocked) &&
                    !(this.grid[y - deltaY][x - deltaX].visible &&
                        !this.grid[y - deltaY][x - deltaX].blocked)) {
                    visible = false;
                } else {
                    for (let idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
                        if (startSlope <= endSlopes[idx] &&
                            endSlope >= startSlopes[idx]) {
                            if (!this.grid[y][x].blocked) {
                                if (centreSlope > startSlopes[idx] &&
                                    centreSlope < endSlopes[idx]) {
                                    visible = false;
                                    break;
                                }
                            } else {
                                if (startSlope >= startSlopes[idx] &&
                                    endSlope <= endSlopes[idx]) {
                                    visible = false;
                                    break;
                                } else {
                                    startSlopes[idx] = Math.min(startSlopes[idx], startSlope);
                                    endSlopes[idx] = Math.max(endSlopes[idx], endSlope);
                                    extended = true;
                                }
                            }
                        }
                    }
                }
            }
            if (visible) {
                this.grid[y][x].visible = true;
                if (this.grid[y][x].blocked) {
                    if (minSlope >= startSlope) {
                        minSlope = endSlope;
                    } else if (!extended) {
                        startSlopes[totalObstacles] = startSlope;
                        endSlopes[totalObstacles++] = endSlope;
                    }
                }
            }
        }
    }
};
