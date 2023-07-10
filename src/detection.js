import { VISIBILITY_VALUES } from './constants.js'
import { getTokenData } from './token.js'

export function basicSightCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target)) return false
    return !isValidTarget(target) || !isUndetected(target, 'basicSight', VISIBILITY_VALUES.hidden)
}

export function hearingCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target)) return false
    if (!game.settings.get('pf2e', 'automation.rulesBasedVision')) return true
    return !visionSource.object.actor?.hasCondition('deafened') && isValidTarget(target) && !isUndetected(target, 'hearing')
}

export function feelTremorCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target)) return false
    return isValidTarget(target) && !isUndetected(target, 'feelTremor')
}

function isValidTarget(target) {
    return !!(target instanceof Token && target.actor)
}

function isUndetected(target, mode, threshold = VISIBILITY_VALUES.undetected) {
    const tokens = game.user.isGM ? canvas.tokens.controlled : target.scene.tokens.filter(t => t.isOwner)
    const filtered = tokens.filter(t => t.detectionModes.some(d => d.id === mode))

    for (const origin of filtered) {
        const visibility = getTokenData(target, origin.id, 'visibility')
        if (VISIBILITY_VALUES[visibility] >= threshold) return true
    }

    return false
}
