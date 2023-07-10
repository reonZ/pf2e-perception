import { COVER_UUID, COVER_VALUES, VISIBILITY_VALUES } from './constants.js'
import { createCoverSource, createFlatFootedSource, findChoiceSetRule } from './effect.js'
import { getTokenData, getVisibility, hasLesserCover, hasStandardCover } from './token.js'

export function getSelfRollOptions(wrapped, prefix) {
    const result = wrapped(prefix)

    if (prefix === 'origin') {
        const token = getActorToken(this)
        if (token) result.push(`origin:tokenid:${token.id}`)
    }

    return result
}

export function getContextualClone(wrapped, rollOptions, ephemeralEffects) {
    const originId = rollOptions.find(option => option.startsWith('origin:tokenid:'))?.slice(15)
    if (!originId) return wrapped(rollOptions, ephemeralEffects)

    const target = getActorToken(this, true)
    const origin = target?.scene.tokens.get(originId).object
    if (!origin || !target) return wrapped(rollOptions, ephemeralEffects)

    const conditionalCover = getConditionalCover(origin, target, rollOptions)
    if (conditionalCover) ephemeralEffects.push(createCoverSource(conditionalCover))

    const visibility = getVisibility(origin, target)
    if (VISIBILITY_VALUES[visibility] > VISIBILITY_VALUES.concealed) ephemeralEffects.push(createFlatFootedSource(visibility))

    return wrapped(rollOptions, ephemeralEffects)
}

export function getActorToken(actor, target = false) {
    if (!actor) return undefined
    const tokens = target ? game.user.targets : canvas.tokens.controlled
    return tokens.find(token => token.actor === actor) ?? actor.getActiveTokens().shift() ?? null
}

export function isProne(actor) {
    return actor.itemTypes.condition.some(item => item.slug === 'prone')
}

export function getCoverEffect(actor, selection = false) {
    const effect = actor.itemTypes.effect.find(x => x.sourceId === COVER_UUID)
    return selection ? findChoiceSetRule(effect)?.selection.level : effect
}

function getConditionalCover(origin, target, options) {
    const ranged = options.includes('item:ranged')
    const prone = ranged ? isProne(target.actor) : false

    let systemCover = getCoverEffect(target.actor, true)
    if (prone && COVER_VALUES[systemCover] > COVER_VALUES.lesser) return 'greater-prone'
    if (!prone && systemCover === 'greater-prone') systemCover = undefined

    let cover = getTokenData(target, origin.id, 'cover')
    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser) return 'greater-prone'
    if (!prone && cover === 'greater-prone') cover = undefined

    if (
        COVER_VALUES[cover] < COVER_VALUES.standard &&
        COVER_VALUES[systemCover] < COVER_VALUES.standard &&
        hasStandardCover(origin, target)
    ) {
        cover = 'standard'
    } else if (!cover && !systemCover && hasLesserCover(origin, target)) cover = 'lesser'

    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser) return 'greater-prone'

    return COVER_VALUES[cover] > COVER_VALUES[systemCover] ? cover : undefined
}
