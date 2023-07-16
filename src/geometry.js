const RECT_EDGES = [
    { A: { x: 0.1, y: 0.1 }, B: { x: 0.9, y: 0.1 } },
    { A: { x: 0.9, y: 0.1 }, B: { x: 0.9, y: 0.9 } },
    { A: { x: 0.9, y: 0.9 }, B: { x: 0.1, y: 0.9 } },
    { A: { x: 0.1, y: 0.9 }, B: { x: 0.1, y: 0.1 } },
]

export const RECT_CORNERS = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
]

export const RECT_SPREAD = [
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

export function lineIntersectRect(origin, target, rect) {
    for (const edge of RECT_EDGES) {
        const A = getRectPoint(edge.A, rect)
        const B = getRectPoint(edge.B, rect)
        if (lineSegmentIntersects(origin, target, A, B)) return true
    }
    return false
}

export function lineIntersectWall(origin, target) {
    return CONFIG.Canvas.polygonBackends.move.testCollision(origin, target, { type: 'move', mode: 'any' })
}

export function pointToTokenIntersectWall(origin, token) {
    const rect = token.bounds
    for (const point of RECT_SPREAD) {
        const coords = getRectPoint(point, rect)
        if (lineIntersectWall(origin, coords)) return true
    }
    return false
}

export function getRectPoint(point, rect) {
    return { x: rect.x + rect.width * point.x, y: rect.y + rect.height * point.y }
}
