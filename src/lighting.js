import { RECT_CORNERS, RECT_SPREAD, getRectPoint } from './geometry.js'
import { getConcealedSetting } from './scene.js'

export function isConcealed(token) {
    token = token instanceof Token ? token : token.object

    if (token.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)) return false

    const scene = token.scene
    if (
        scene !== canvas.scene ||
        !scene.tokenVision ||
        scene.darkness < scene.globalLightThreshold ||
        !getConcealedSetting(scene)
    )
        return false

    return !inBrightLight(token)
}

function inBrightLight(token) {
    const rect = token.bounds

    for (const light of canvas.effects.lightSources) {
        if (!light.active || light.data.bright === 0) continue

        if (light.object === token) return true

        if (!inBrightRange(light.object.center, rect, light.data.bright)) continue

        if (light.data.walls === false) return true

        for (const point of RECT_SPREAD) {
            const { x, y } = getRectPoint(point, rect)
            if (light.shape.contains(x, y)) return true
        }
    }

    return false
}

function inBrightRange(origin, rect, bright) {
    for (const point of RECT_CORNERS) {
        const rectPoint = getRectPoint(point, rect)
        const distance = new Ray(origin, rectPoint).distance
        if (distance < bright) return true
    }
    return false
}
