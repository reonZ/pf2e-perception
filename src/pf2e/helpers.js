export async function extractEphemeralEffects({ affects, origin, target, item, domains, options }) {
    if (!(origin && target)) return []

    const [effectsFrom, effectsTo] = affects === 'target' ? [origin, target] : [target, origin]
    const fullOptions = [...options, ...effectsTo.getSelfRollOptions(affects)]
    const resolvables = item ? (item.isOfType('spell') ? { spell: item } : { weapon: item }) : {}
    return (
        await Promise.all(
            domains
                .flatMap(s => effectsFrom.synthetics.ephemeralEffects[s]?.[affects] ?? [])
                .map(d => d({ test: fullOptions, resolvables }))
        )
    ).flatMap(e => e ?? [])
}

export function traitSlugToObject(trait, dictionary) {
    // Look up trait labels from `npcAttackTraits` instead of `weaponTraits` in case a battle form attack is
    // in use, which can include what are normally NPC-only traits
    const traitObject = {
        name: trait,
        label: game.i18n.localize(dictionary[trait] ?? trait),
    }
    if (objectHasKey(CONFIG.PF2E.traitsDescriptions, trait)) {
        traitObject.description = CONFIG.PF2E.traitsDescriptions[trait]
    }

    return traitObject
}

export function objectHasKey(obj, key) {
    return (typeof key === 'string' || typeof key === 'number') && key in obj
}

export function getRangeIncrement(attackItem, distance) {
    if (attackItem.isOfType('spell')) return null

    return attackItem.rangeIncrement && typeof distance === 'number'
        ? Math.max(Math.ceil(distance / attackItem.rangeIncrement), 1)
        : null
}

export function isOffGuardFromFlanking(target, origin) {
    if (!target?.isOfType('creature')) return false

    const { flanking } = target.attributes
    return !flanking.flankable
        ? false
        : typeof flanking.offGuardable === 'number'
        ? origin.level > flanking.offGuardable
        : flanking.offGuardable
}

export function isObject(value) {
    return typeof value === 'object' && value !== null
}
