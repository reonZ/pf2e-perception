import { COVERS, COVER_UUID, COVER_VALUES, VISIBILITY_VALUES } from './constants.js'
import { createCoverSource, createFlatFootedSource, findChoiceSetRule } from './effect.js'
import { optionsToObject, updateVisibilityFromOptions } from './options.js'
import { extractEphemeralEffects, getRangeIncrement, isOffGuardFromFlanking, traitSlugToObject } from './pf2e/helpers.js'
import { getConditionalCover, getVisibility } from './token.js'

export async function getRollContext(params) {
    const [selfToken, targetToken] =
        canvas.ready && !params.viewOnly
            ? [
                  canvas.tokens.controlled.find(t => t.actor === this) ?? this.getActiveTokens().shift() ?? null,
                  params.target?.token ?? params.target?.actor?.getActiveTokens().shift() ?? null,
              ]
            : [null, null]

    const selfOptions = this.getRollOptions(params.domains ?? [])

    // Get ephemeral effects from the target that affect this actor while attacking
    const originEphemeralEffects = await extractEphemeralEffects({
        affects: 'origin',
        origin: this,
        target: params.target?.actor ?? targetToken?.actor ?? null,
        item: params.item ?? null,
        domains: params.domains,
        options: [...params.options, ...(params.item?.getRollOptions('item') ?? [])],
    })

    const selfActor =
        params.viewOnly || !targetToken?.actor
            ? this
            : this.getContextualClone([...selfOptions, ...targetToken.actor.getSelfRollOptions('target')], originEphemeralEffects)

    const isStrike = params.statistic instanceof game.pf2e.StatisticModifier
    const strikeActions = isStrike ? selfActor.system.actions?.flatMap(a => [a, a.altUsages ?? []].flat()) ?? [] : []

    const statistic = params.viewOnly
        ? params.statistic
        : isStrike
        ? strikeActions.find(action => {
              // Find the matching weapon or melee item
              if (params.item?.id !== action.item.id || params?.item.name !== action.item.name) return false
              if (params.item.isOfType('melee') && action.item.isOfType('melee')) return true

              // Discriminate between melee/thrown usages by checking that both are either melee or ranged
              return (
                  params.item.isOfType('weapon') && action.item.isOfType('weapon') && params.item.isMelee === action.item.isMelee
              )
          }) ?? params.statistic
        : params.statistic

    const selfItem = (() => {
        // 1. Simplest case: no context clone, so used the item passed to this method
        if (selfActor === this) return params.item ?? null

        // 2. Get the item from the statistic if it's stored therein
        if (
            statistic &&
            'item' in statistic &&
            statistic.item instanceof Item &&
            statistic.item.isOfType('melee', 'spell', 'weapon')
        ) {
            return statistic.item
        }

        // 3. Get the item directly from the context clone
        const itemClone = selfActor.items.get(params.item?.id ?? '')
        if (itemClone?.isOfType('melee', 'spell', 'weapon')) return itemClone

        // 4 Give up :(
        return params.item ?? null
    })()

    const itemOptions = selfItem?.getRollOptions('item') ?? []
    const isAttackAction = ['attack', 'strike-damage', 'attack-spell-damage'].some(d => params.domains.includes(d))

    const traitSlugs = [
        isAttackAction ? 'attack' : [],
        // CRB p. 544: "Due to the complexity involved in preparing bombs, Strikes to throw alchemical bombs gain
        // the manipulate trait."
        isStrike && selfItem?.isOfType('weapon') && selfItem.baseType === 'alchemical-bomb' ? 'manipulate' : [],
    ].flat()

    if (selfItem?.isOfType('weapon', 'melee')) {
        for (const adjustment of this.synthetics.strikeAdjustments) {
            adjustment.adjustTraits?.(selfItem, traitSlugs)
        }
    }

    const traits = traitSlugs.map(t => traitSlugToObject(t, CONFIG.PF2E.actionTraits))
    // Calculate distance and range increment, set as a roll option
    const distance = selfToken && targetToken ? selfToken.distanceTo(targetToken) : null
    const [originDistance, targetDistance] =
        typeof distance === 'number' ? [`origin:distance:${distance}`, `target:distance:${distance}`] : [null, null]

    // Target roll options
    const getTargetRollOptions = actor => {
        const targetOptions = actor?.getSelfRollOptions('target') ?? []
        if (targetToken) {
            targetOptions.push('target') // An indicator that there is a target of any kind
            const mark = this.synthetics.targetMarks.get(targetToken.document.uuid)
            if (mark) targetOptions.push(`target:mark:${mark}`)
        }
        return targetOptions
    }
    const targetRollOptions = getTargetRollOptions(targetToken?.actor)

    // Get ephemeral effects from this actor that affect the target while being attacked
    const targetEphemeralEffects = await extractEphemeralEffects({
        affects: 'target',
        origin: selfActor,
        target: targetToken?.actor ?? null,
        item: selfItem,
        domains: params.domains,
        options: [...params.options, ...itemOptions, ...targetRollOptions],
    })

    const [reach, isMelee] = params.item?.isOfType('melee')
        ? [params.item.reach, params.item.isMelee]
        : params.item?.isOfType('weapon')
        ? [this.getReach({ action: 'attack', weapon: params.item }), params.item.isMelee]
        : [null, false]

    /**
     * WE ADDED STUFF HERE
     */
    if (selfToken && targetToken) {
        addConditionals({
            selfToken,
            targetToken,
            ephemeralEffects: targetEphemeralEffects,
            options: [...params.options, ...selfActor.getSelfRollOptions('origin'), ...itemOptions, ...targetRollOptions],
        })
    }
    /**
     * END OF THE ADDED STUFF
     */

    // Add an epehemeral effect from flanking
    const isFlankingStrike = !!(
        isMelee &&
        typeof reach === 'number' &&
        params.statistic instanceof game.pf2e.StatisticModifier &&
        targetToken &&
        selfToken?.isFlanking(targetToken, { reach })
    )
    if (isFlankingStrike && params.target?.token?.actor && isOffGuardFromFlanking(params.target.token.actor)) {
        const name = game.i18n.localize('PF2E.Item.Condition.Flanked')
        const condition = game.pf2e.ConditionManager.getCondition('flat-footed', { name })
        targetEphemeralEffects.push(condition.toObject())
    }

    // Clone the actor to recalculate its AC with contextual roll options
    const targetActor = params.viewOnly
        ? null
        : (params.target?.actor ?? targetToken?.actor)?.getContextualClone(
              [...selfActor.getSelfRollOptions('origin'), ...itemOptions, ...(originDistance ? [originDistance] : [])],
              targetEphemeralEffects
          ) ?? null

    const rollOptions = new Set([
        ...params.options,
        ...selfOptions,
        ...(targetActor ? getTargetRollOptions(targetActor) : targetRollOptions),
        ...itemOptions,
        // Backward compatibility for predication looking for an "attack" trait by its lonesome
        'attack',
    ])

    if (targetDistance) rollOptions.add(targetDistance)
    const rangeIncrement = selfItem ? getRangeIncrement(selfItem, distance) : null
    if (rangeIncrement) rollOptions.add(`target:range-increment:${rangeIncrement}`)

    const self = {
        actor: selfActor,
        token: selfToken?.document ?? null,
        statistic,
        item: selfItem,
        modifiers: [],
    }

    const target =
        targetActor && targetToken && distance !== null
            ? { actor: targetActor, token: targetToken.document, distance, rangeIncrement }
            : null

    return {
        options: rollOptions,
        self,
        target,
        traits,
    }
}

function addConditionals({ ephemeralEffects, selfToken, targetToken, options }) {
    let cover = getConditionalCover(selfToken, targetToken, options)

    options = optionsToObject(options)

    if (options.origin?.cover) {
        if (cover && options.origin.cover.reduce) {
            const reduced = ['all', cover].some(x => options.origin.cover.reduce.includes(x))
            if (reduced) {
                const index = COVERS.indexOf(cover)
                cover = COVERS[Math.max(0, index - 1)]
            }
        }
    }

    let visibility = updateVisibilityFromOptions(getVisibility(selfToken, targetToken), options.target?.visibility)
    if (options.target?.visibility?.cancel) {
        const canceled = ['all', visibility].some(x => options.target.visibility.cancel.includes(x))
        if (canceled) visibility = undefined
    }

    if (COVER_VALUES[cover] > COVER_VALUES.none) ephemeralEffects.push(createCoverSource(cover))
    if (VISIBILITY_VALUES[visibility] > VISIBILITY_VALUES.concealed) ephemeralEffects.push(createFlatFootedSource(visibility))
}

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
