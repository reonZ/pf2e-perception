/**
 * Measure distance using Pathfinder 2e grid-counting rules
 * @param p0 The origin point
 * @param p1 The destination point
 */
function measureDistance(p0, p1) {
    if (!canvas.dimensions) return NaN

    if (canvas.grid.type !== CONST.GRID_TYPES.SQUARE) {
        return canvas.grid.measureDistance(p0, p1)
    }

    return measureDistanceOnGrid(new Ray(p0, p1))
}

/**
 * Given the distance in each dimension, measure the distance in grid units
 * @param segment A pair of x/y distances constituting the line segment between two points
 * @param [reach] If this is a reach measurement, the origin actor's reach
 */
function measureDistanceOnGrid(segment, { reach = null } = {}) {
    if (!canvas.dimensions) return NaN

    const gridSize = canvas.dimensions.size
    const gridDistance = canvas.dimensions.distance

    const nx = Math.ceil(Math.abs(segment.dx / gridSize))
    const ny = Math.ceil(Math.abs(segment.dy / gridSize))
    const nz = Math.ceil(Math.abs((segment.dz || 0) / gridSize))

    // ingore the lowest difference
    const sortedDistance = [nx, ny, nz].sort((a, b) => a - b)
    // Get the number of straight and diagonal moves
    const squares = {
        doubleDiagonal: sortedDistance[0],
        diagonal: sortedDistance[1] - sortedDistance[0],
        straight: sortedDistance[2] - sortedDistance[1],
    }

    // "Unlike with measuring most distances, 10-foot reach can reach 2 squares diagonally." (CRB pg 455)
    const reduction = squares.diagonal + squares.doubleDiagonal > 1 && reach === 10 ? 1 : 0

    // Diagonals in PF pretty much count as 1.5 times a straight
    // for diagonals across the x, y, and z axis count it as 1.75 as a best guess
    const distance = Math.floor(squares.doubleDiagonal * 1.75 + squares.diagonal * 1.5 + squares.straight) - reduction

    return distance * gridDistance
}

/** Highlight grid according to Pathfinder 2e effect-area shapes */
export function highlightGrid({
    areaShape,
    object,
    colors,
    document,
    collisionType = 'move',
    preview = false,
    // added stuff
    collisionOrigin,
}) {
    // Only highlight for objects that are non-previews (have IDs)
    if (!object.id && !preview) return

    const { grid, dimensions } = canvas
    if (!(grid && dimensions)) return

    // Set data defaults
    const angle = document.angle ?? 0
    const direction = document.direction ?? 45

    // Clear existing highlight
    const highlightLayer = grid.getHighlightLayer(object.highlightId)?.clear()
    if (!highlightLayer) return

    const [cx, cy] = grid.getCenter(document.x, document.y)
    const [col0, row0] = grid.grid.getGridPositionFromPixels(cx, cy)
    const minAngle = (360 + ((direction - angle * 0.5) % 360)) % 360
    const maxAngle = (360 + ((direction + angle * 0.5) % 360)) % 360
    const snappedOrigin = canvas.grid.getSnappedPosition(document.x, document.y, object.layer.gridPrecision)
    const withinAngle = (min, max, value) => {
        min = (360 + (min % 360)) % 360
        max = (360 + (max % 360)) % 360
        value = (360 + (value % 360)) % 360

        if (min < max) return value >= min && value <= max
        return value >= min || value <= max
    }

    // Offset measurement for cones to ensure that cones only start measuring from cell borders
    const coneOriginOffset = (() => {
        if (areaShape !== 'cone') return { x: 0, y: 0 }

        // Degrees anticlockwise from pointing right. In 45-degree increments from 0 to 360
        const dir = (direction >= 0 ? 360 - direction : -direction) % 360
        // If we're not on a border for X, offset by 0.5 or -0.5 to the border of the cell in the direction we're looking on X axis
        const xOffset =
            snappedOrigin.x % dimensions.size !== 0
                ? Math.sign((1 * Math.round(Math.cos(Math.toRadians(dir)) * 100)) / 100) / 2
                : 0
        // Same for Y, but cos Y goes down on screens, we invert
        const yOffset =
            snappedOrigin.y % dimensions.size !== 0
                ? -Math.sign((1 * Math.round(Math.sin(Math.toRadians(dir)) * 100)) / 100) / 2
                : 0
        return { x: xOffset * dimensions.size, y: yOffset * dimensions.size }
    })()

    // Point we are measuring distances from
    const padding = Math.clamped(document.width ?? 0, 1.5, 2)
    const docDistance = document.distance ?? 0
    const padded = (docDistance * padding) / dimensions.distance
    const rowCount = Math.ceil(padded / (dimensions.size / grid.h))
    const columnCount = Math.ceil(padded / (dimensions.size / grid.w))

    // If this is an emanation, measure from the outer squares of the token's space
    const offsetEmanationOrigin = destination => {
        if (!(areaShape === 'emanation' && object instanceof Token)) {
            return { x: 0, y: 0 }
        }

        // No offset is needed for medium and smaller creatures
        if (object.w <= dimensions.size) return { x: 0, y: 0 }

        const offset = (object.w - dimensions.size) / 2
        const getCoordinate = (centerCoord, destCoord) =>
            destCoord === centerCoord ? 0 : destCoord > centerCoord ? offset : -offset

        return {
            x: getCoordinate(object.center.x, destination.x),
            y: getCoordinate(object.center.y, destination.y),
        }
    }

    for (let a = -columnCount; a < columnCount; a++) {
        for (let b = -rowCount; b < rowCount; b++) {
            // Position of cell's top-left corner, in pixels
            const [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(col0 + a, row0 + b)
            // Position of cell's center in pixels
            const destination = {
                x: gx + dimensions.size * 0.5,
                y: gy + dimensions.size * 0.5,
            }
            if (destination.x < 0 || destination.y < 0) continue

            // Determine point of origin
            const emanationOriginOffset = offsetEmanationOrigin(destination)
            const origin = {
                x: snappedOrigin.x + coneOriginOffset.x + emanationOriginOffset.x,
                y: snappedOrigin.y + coneOriginOffset.y + emanationOriginOffset.y,
            }

            if (areaShape === 'cone') {
                const ray = new Ray(origin, destination)
                const rayAngle = (360 + ((ray.angle / (Math.PI / 180)) % 360)) % 360
                if (ray.distance > 0 && !withinAngle(minAngle, maxAngle, rayAngle)) {
                    continue
                }
            }

            // Determine grid-square point to which we're measuring the distance
            const distance = measureDistance(destination, origin)
            if (distance > docDistance) continue

            const hasCollision =
                canvas.ready &&
                CONFIG.Canvas.polygonBackends[collisionType].testCollision(collisionOrigin ?? origin, destination, {
                    type: collisionType,
                    mode: 'any',
                })

            if (hasCollision) {
                grid.grid.highlightGridPosition(highlightLayer, {
                    x: gx,
                    y: gy,
                    border: 0x000001,
                    color: 0x000000,
                })
                highlightLayer
                    .beginFill(0x000000, 0.5)
                    .moveTo(gx, gy)
                    .lineTo(gx + dimensions.size, gy + dimensions.size)
                    .endFill()
            } else {
                grid.grid.highlightGridPosition(highlightLayer, {
                    x: gx,
                    y: gy,
                    border: colors.border,
                    color: colors.fill,
                })
            }
        }
    }
}
