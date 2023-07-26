import { clearDebug, drawDebugLine, rectCorners } from './geometry.js'

export function getLightExposure(token, debug = false) {
    token = token instanceof Token ? token : token.object

    if (token.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)) return undefined

    const scene = token.scene
    if (scene !== canvas.scene || !scene.tokenVision || scene.darkness < scene.globalLightThreshold) return undefined

    if (debug) clearDebug()

    const rect = token.document.bounds
    let exposure = null

    for (const light of canvas.effects.lightSources) {
        if (!light.active) continue

        const bright = light.data.bright
        const dim = light.data.dim

        if (light.object === token) {
            if (bright) return 'bright'
            if (dim) exposure = 'dim'
            continue
        }

        const contained = []
        for (const point of rectCorners(rect)) {
            if (light.shape.contains(point.x, point.y)) contained.push(point)
            else if (debug) drawDebugLine(light, point, 'red')
        }

        if (!contained.length) continue

        if (light.ratio === 1) {
            if (debug) drawDebugLine(light, contained, 'green')
            return 'bright'
        }

        if (light.ratio === 0) {
            if (debug) drawDebugLine(light, contained, 'blue')
            exposure = 'dim'
            continue
        }

        for (const point of contained) {
            const distance = new Ray(light, point).distance
            if (distance <= bright) {
                if (debug) {
                    drawDebugLine(light, point, 'green')
                    exposure = 'bright'
                } else return 'bright'
            } else {
                if (debug) {
                    drawDebugLine(light, point, 'blue')
                    if (exposure !== 'bright') exposure = 'dim'
                } else exposure = 'dim'
            }
        }
    }

    return exposure
}
