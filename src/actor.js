import { COVER_UUID, VISION_LEVELS } from './constants.js'
import { findChoiceSetRule } from './effect.js'

export function getActorToken(actor, target = false) {
    if (!actor) return undefined
    const actorId = actor.id
    const isToken = actor.isToken
    const tokens = target ? game.user.targets : canvas.tokens.controlled
    return (
        tokens.find(token => (isToken ? token.actor === actor : token.actor.id === actorId)) ??
        actor.getActiveTokens().shift() ??
        null
    )
}

export function isProne(actor) {
    return actor.itemTypes.condition.some(item => item.slug === 'prone')
}

export function getCoverEffect(actor, selection = false) {
    const effect = actor.itemTypes.effect.find(x => x.sourceId === COVER_UUID)
    return selection ? findChoiceSetRule(effect)?.selection.level : effect
}

export function getFeatWithUUID(actor, uuid) {
    return actor.itemTypes.feat.find(f => f.sourceId === uuid)
}

export function visionLevel() {
    const sensesStr = this.system.traits.senses.value
    const senses = splitNPCSenses(sensesStr)

    const sensesRules = this.rules.filter(r => r.key === 'Sense').map(r => r.selector.toLowerCase())
    senses.push(...sensesRules)

    return this.getCondition('blinded')
        ? VISION_LEVELS.BLINDED
        : senses.includes('darkvision') || senses.includes('greaterdarkvision')
        ? VISION_LEVELS.DARKVISION
        : senses.includes('lowlightvision')
        ? VISION_LEVELS.LOWLIGHT
        : VISION_LEVELS.NORMAL
}

function hasSense(actor, sense) {
    if (!actor || !sense || !actor.system.traits?.senses) return false

    sense = sense.toLowerCase()

    let senses = actor.system.traits.senses
    if (Array.isArray(senses)) senses = senses.map(s => s.type.toLowerCase())
    else senses = splitNPCSenses(senses.value)

    return senses.includes(sense)
}

export function hasGreaterDarkvision(actor) {
    return hasSense(actor, 'greaterdarkvision')
}

export function seeInvisibility(actor) {
    return hasSense(actor, 'seeinvisibility')
}

function splitNPCSenses(sensesStr) {
    return sensesStr.toLowerCase().replaceAll(/[ -]/g, '').split(',')
}
