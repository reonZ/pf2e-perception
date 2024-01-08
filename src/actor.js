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

function hasSense(actor, sense) {
    if (!actor || !sense || !actor.system.perception?.senses) return false
    sense = sense.toLowerCase()
    return !!actor.system.perception.senses.find(({ type }) => type === sense)
}

export function hasGreaterDarkvision(actor) {
    return hasSense(actor, 'greater-darkvision')
}

export function seeInvisibility(actor) {
    return hasSense(actor, 'see-invisibility')
}
