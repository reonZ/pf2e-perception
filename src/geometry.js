const EDGES = ['topEdge', 'rightEdge', 'bottomEdge', 'leftEdge']
const POINTS = [
    { x: 0.25, y: 0.25 },
    { x: 0.5, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.75, y: 0.5 },
    { x: 0.25, y: 0.75 },
    { x: 0.5, y: 0.75 },
    { x: 0.75, y: 0.75 },
]
const CORNERS = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
]

export function lineIntersectRect(origin, target, rect) {
    for (const edgeName of EDGES) {
        const edge = rect[edgeName]
        if (lineSegmentIntersects(origin, target, edge.A, edge.B)) return true
    }
    return false
}

export function lineIntersectWall(origin, target) {
    return CONFIG.Canvas.polygonBackends.move.testCollision(origin, target, { type: 'move', mode: 'any' })
}

export function pointToTokenPointsIntersectWall(origin, token, nb) {
    const rect = token.bounds
    let intersected = 0

    for (const point of POINTS) {
        const coords = getRectPoint(point, rect)
        if (lineIntersectWall(origin, coords)) intersected++
        if (intersected === nb) return true
    }

    return false
}

export function allTokenCornersToPointIntersectWall(token, target) {
    const rect = token.bounds
    let intersected = 0

    for (const point of CORNERS) {
        const coords = getRectPoint(point, rect)
        if (lineIntersectWall(coords, target)) intersected++
    }

    return intersected === 4
}

function getRectPoint(point, rect) {
    return { x: rect.x + rect.width * point.x, y: rect.y + rect.height * point.y }
}
