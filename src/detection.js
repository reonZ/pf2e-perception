import { VISIBILITY_VALUES } from './constants.js'
import { getTokenData } from './token.js'

export function basicSightCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target)) return false
    return !isValidTarget(target) || (!isUndetected(target, 'basicSight') && !isHidden(target))
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

function reachesThreshold(target, tokens, threshold) {
    for (const origin of tokens) {
        const visibility = getTokenData(target, origin.id, 'visibility')
        if (VISIBILITY_VALUES[visibility] >= threshold) return true
    }
    return false
}

function isUndetected(target, mode) {
    const tokens = game.user.isGM ? canvas.tokens.controlled : target.scene.tokens.filter(t => t.isOwner)
    const filtered = tokens.filter(t => t.detectionModes.some(d => d.id === mode))
    return reachesThreshold(target, filtered, VISIBILITY_VALUES.undetected)
}

function isHidden(target) {
    let tokens = canvas.tokens.controlled
    if (!game.user.isGM && !tokens.length) {
        tokens = target.scene.tokens.filter(t => t.isOwner)
        if (tokens.length !== 1) return false
    }
    return reachesThreshold(target, tokens, VISIBILITY_VALUES.hidden)
}
