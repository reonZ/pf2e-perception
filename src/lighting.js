import { clearDebug, drawDebugLine } from './geometry.js'

export function getLightExposure(token, debug = false) {
    token = token instanceof Token ? token : token.object

    if (token.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)) return undefined

    const scene = token.scene
    if (scene !== canvas.scene || !scene.tokenVision || scene.darkness < scene.globalLightThreshold) return undefined

    if (debug) clearDebug()

    const center = token.document.center
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

        if (!light.shape.contains(center.x, center.y)) {
            if (debug) drawDebugLine(light, center, 'red')
            continue
        }

        if (light.ratio === 1) {
            if (debug) drawDebugLine(light, center, 'green')
            return 'bright'
        }

        if (light.ratio === 0) {
            if (debug) drawDebugLine(light, center, 'blue')
            exposure = 'dim'
            continue
        }

        const distance = new Ray(light, center).distance
        if (distance <= bright) {
            if (debug) {
                drawDebugLine(light, center, 'green')
                exposure = 'bright'
            } else return 'bright'
        } else {
            if (debug) {
                drawDebugLine(light, center, 'blue')
                if (exposure !== 'bright') exposure = 'dim'
            } else exposure = 'dim'
        }
    }

    return exposure
}
