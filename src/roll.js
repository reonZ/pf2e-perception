import { getActorToken } from './actor.js'
import { VISIBILITY_VALUES, attackCheckRoll, validCheckRoll } from './constants.js'
import { MODULE_ID } from './module.js'
import { validateTokens } from './scene.js'
import { getTokenTemplateTokens } from './template.js'
import { getVisibility } from './token.js'

export async function checkRoll(wrapped, ...args) {
    const context = args[1]
    if (!context) return wrapped(...args)

    if (Array.isArray(context.options)) context.options = new Set(context.options)

    const { actor, createMessage = 'true', type, token, target, isReroll } = context
    const originToken = token ?? getActorToken(actor)
    const targetToken = target?.token
    const isAttackRoll = attackCheckRoll.includes(type)

    if (isReroll || !createMessage || !originToken || !validCheckRoll.includes(type) || (isAttackRoll && !targetToken))
        return wrapped(...args)

    if (isAttackRoll) {
        const visibility = getVisibility(targetToken, originToken, true)
        if (!visibility) return wrapped(...args)

        if (visibility === 'concealed' && originToken.actor.hasLowLightVision) return wrapped(...args)

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

        const messageData = {
            flavor,
            speaker: ChatMessage.getSpeaker({ token: originToken }),
        }

        if (isUndetected) {
            context.options.add('secret')
            context.isSuccess = isSuccess
            context.visibility = visibility

            let blindCheck = `${game.i18n.localize('PF2E.FlatCheck')}:`
            blindCheck += `<strong> ${game.i18n.localize(`PF2E.condition.undetected.name`)}</strong>`
            messageData.flags = {
                [MODULE_ID]: {
                    blindCheck,
                },
            }
        }

        await roll.toMessage(messageData, { rollMode: isUndetected ? (game.user.isGM ? 'gmroll' : 'blindroll') : 'roll' })

        if (!isUndetected && !isSuccess) return
    } else if (context.options.has('action:hide')) {
        context.selected = game.user.targets.ids
    } else if (context.options.has('action:seek')) {
        const alliance = originToken.actor.alliance
        const highlighted = getTokenTemplateTokens(originToken)
        if (!highlighted) return wrapped(...args)

        context.selected = validateTokens(originToken, highlighted)
            .filter(t => {
                const otherAlliance = t.actor.alliance
                return !t.document.hidden && (!otherAlliance || otherAlliance !== alliance)
            })
            .map(t => t.id)
    }

    return wrapped(...args)
}
