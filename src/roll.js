import { createChatButton } from './chat.js'
import { VISIBILITY_VALUES } from './constants.js'
import { MODULE_ID, localize } from './module.js'
import { getVisibility } from './token.js'
import { omit } from './utils.js'

export async function checkRoll(wrapped, ...args) {
    const context = args[1]
    if (!context) return wrapped(...args)

    const { actor, rollMode = 'roll', createMessage = 'true', type, token, target, isReroll, skipPerceptionChecks } = context
    const originToken = token ?? getActorToken(actor)
    const targetToken = target?.token

    if (
        isReroll ||
        skipPerceptionChecks ||
        rollMode !== 'roll' ||
        !createMessage ||
        !originToken ||
        !targetToken ||
        !['attack-roll', 'spell-attack-roll'].includes(type)
    )
        return wrapped(...args)

    const visibility = getVisibility(targetToken, originToken)
    if (!visibility) return wrapped(...args)

    const dc = visibility === 'concealed' ? 5 : 11
    const roll = await new Roll('1d20').evaluate({ async: true })
    const total = roll.total
    const isSuccess = total >= dc
    const isSecret = VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected
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

    if (isSecret) {
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
    const flags = isSecret ? createMessageFlag(args, visibility) : {}

    await roll.toMessage({ flavor, speaker, flags }, { rollMode: isSecret ? 'blindroll' : 'roll' })

    if (isSuccess && !isSecret) return wrapped(...args)
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
        actor: game.actors.get(context.target.actor),
        token: scene.tokens.get(context.target.token),
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

function createMessageFlag([check, context], visibility) {
    return {
        [MODULE_ID]: {
            visibility,
            context: {
                ...context,
                skipPerceptionChecks: true,
                item: context.item?.id,
                actor: context.actor.id,
                token: context.token.id,
                scene: context.token.scene.id,
                target: { actor: context.target.actor.id, token: context.target.token.id },
                dc: context.dc ? omit(context.dc, ['statistic']) : null,
                options: Array.from(context.options),
            },
            check: {
                slug: check.slug,
                modifiers: check.modifiers.map(modifier => modifier.toObject()),
            },
        },
    }
}
