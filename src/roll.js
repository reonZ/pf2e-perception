import { getActorToken } from './actor.js'
import { createChatButton } from './chat.js'
import { VISIBILITY_VALUES, attackCheckRoll, validCheckRoll } from './constants.js'
import { MODULE_ID, localize } from './module.js'
import { validateTokens } from './scene.js'
import { getTokenTemplateTokens } from './template.js'
import { getVisibility } from './token.js'
import { omit } from './utils.js'

export async function checkRoll(wrapped, ...args) {
    const context = args[1]
    if (!context) return wrapped(...args)

    const { actor, createMessage = 'true', type, token, target, isReroll, skipPerceptionChecks } = context
    const originToken = token ?? getActorToken(actor)
    const targetToken = target?.token
    const isAttackRoll = attackCheckRoll.includes(type)

    if (
        isReroll ||
        skipPerceptionChecks ||
        !createMessage ||
        !originToken ||
        !validCheckRoll.includes(type) ||
        (isAttackRoll && !targetToken)
    )
        return wrapped(...args)

    if (isAttackRoll) {
        const visibility = getVisibility(targetToken, originToken)
        if (!visibility || originToken.actor.hasLowLightVision) return wrapped(...args)

        const dc = visibility === 'concealed' ? 5 : 11
        const roll = await new Roll('1d20').evaluate({ async: true })
        const total = roll.total
        const isSuccess = total >= dc
        const isUndetected = VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected
        const success = isSuccess ? 2 : 1

        let flavor = `${game.i18n.localize('PF2E.FlatCheck')}:`
        flavor += `<strong> ${game.i18n.localize(`PF2E.condition.${visibility}.name`)}</strong>`

        flavor += (
            await game.pf2e.Check.createResultFlavor({
                target,
                degree: {
                    value: success,
                    unadjusted: success,
                    adjustment: null,
                    dieResult: total,
                    rollTotal: total,
                    dc: { value: dc },
                },
            })
        ).outerHTML

        if (isUndetected) {
            const addButton = type => {
                flavor += createChatButton({
                    action: `${type}-message`,
                    icon: 'fa-solid fa-message',
                    label: localize('message.flat-check.button', type),
                })
            }
            if (isSuccess) addButton('success')
            addButton('failure')
        }

        const speaker = ChatMessage.getSpeaker({ token: originToken })
        const flags = isUndetected
            ? createMessageFlag({ check: args[0], context: args[1], visibility, skipPerceptionChecks: true })
            : {}

        await roll.toMessage({ flavor, speaker, flags }, { rollMode: isUndetected ? 'blindroll' : 'roll' })
        if (!isSuccess || isUndetected) return
    } else if (context.options.has('action:hide')) {
        args[1].selected = game.user.targets.ids
    } else if (context.options.has('action:seek')) {
        const alliance = originToken.actor.alliance
        const highlighted = getTokenTemplateTokens(originToken)
        if (!highlighted) return wrapped(...args)

        args[1].selected = validateTokens(originToken, highlighted)
            .filter(t => {
                const otherAlliance = t.actor.alliance
                return !t.document.hidden && (!otherAlliance || otherAlliance !== alliance)
            })
            .map(t => t.id)
    }

    return wrapped(...args)
}

export function rollAltedCheck(event, context, check) {
    context = recreateContext(context)
    if (!context) return
    check = new game.pf2e.CheckModifier(check.slug, { modifiers: check.modifiers })
    game.pf2e.Check.roll(check, context, event)
}

function recreateContext(context) {
    const scene = game.scenes.get(context.scene)
    if (!scene) return

    const actor = game.actors.get(context.actor)
    const token = scene.tokens.get(context.token)
    const target = {
        actor: game.actors.get(context.target?.actor),
        token: scene.tokens.get(context.target?.token),
    }

    if (!actor || !token || !target.actor || !target.token) return null

    return {
        ...context,
        item: context.item ? actor.items.get(context.item) : undefined,
        actor,
        token,
        target,
        options: new Set(context.options),
    }
}

function createMessageFlag({ check, context, visibility, skipPerceptionChecks }) {
    return {
        [MODULE_ID]: {
            visibility,
            context: {
                ...context,
                skipPerceptionChecks,
                item: context.item?.id,
                actor: context.actor.id,
                token: context.token.id,
                scene: context.token.scene.id,
                target: context.target ? { actor: context.target.actor.id, token: context.target.token.id } : null,
                dc: context.dc ? omit(context.dc, ['statistic']) : null,
                options: Array.from(context.options),
            },
            check: check
                ? {
                      slug: check.slug,
                      modifiers: check.modifiers.map(modifier => modifier.toObject()),
                  }
                : undefined,
        },
    }
}
