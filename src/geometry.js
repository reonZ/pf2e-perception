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

export function getRectEdges(rect, margin) {
    const opposite = 1 - margin
    return {
        top: { A: getRectPoint({ x: margin, y: margin }, rect), B: getRectPoint({ x: opposite, y: margin }, rect) },
        right: { A: getRectPoint({ x: opposite, y: margin }, rect), B: getRectPoint({ x: opposite, y: opposite }, rect) },
        bottom: { A: getRectPoint({ x: opposite, y: opposite }, rect), B: getRectPoint({ x: margin, y: opposite }, rect) },
        left: { A: getRectPoint({ x: margin, y: opposite }, rect), B: getRectPoint({ x: margin, y: margin }, rect) },
    }
}

export function lineIntersectWall(origin, target, debug = false) {
    if (debug) drawDebugLine(origin, target)
    return CONFIG.Canvas.polygonBackends.move.testCollision(origin, target, { type: 'move', mode: 'any' })
}

export function pointToTokenIntersectWall(origin, token, debug = false) {
    const rect = token.bounds
    for (const point of RECT_SPREAD) {
        const coords = getRectPoint(point, rect)
        if (lineIntersectWall(origin, coords, debug)) return true
    }
    return false
}

export function getRectPoint(point, rect) {
    return { x: rect.x + rect.width * point.x, y: rect.y + rect.height * point.y }
}

export function clearDebug() {
    canvas.controls.debug.clear()
}

export function drawDebugLine(origin, target, color = 'blue') {
    const hex = color === 'blue' ? 0x0066cc : color === 'red' ? 0xff0000 : 0x16a103
    canvas.controls.debug.lineStyle(4, hex).moveTo(origin.x, origin.y).lineTo(target.x, target.y)
}
