import { getActorToken, getFeatWithUUID } from './actor.js'
import { BLIND_FIGHT_UUID, COVER_UUID, VISIBILITY_VALUES, attackCheckRoll, skipConditional, validCheckRoll } from './constants.js'
import { MODULE_ID, getFlag, localize } from './module.js'
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

        const blindFight = getFeatWithUUID(actor, BLIND_FIGHT_UUID)
        if (visibility === 'concealed' && blindFight) return wrapped(...args)

        const dc = visibility === 'concealed' || blindFight ? 5 : 11
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
            speaker: ChatMessage.getSpeaker({ token: originToken instanceof Token ? originToken.document : originToken }),
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
        // } else if (context.options.has('action:sneak')) {
        //     context.selected = game.user.targets.ids
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

export function renderCheckModifiersDialog(dialog, html) {
    const appid = html.attr('data-appid')

    const { createMessage = 'true', type, token, target, isReroll, options, dc } = dialog.context
    const originToken = token
    const targetToken = target?.token
    const targetActor = target?.actor

    if (isReroll || !createMessage || !originToken || !targetToken || !targetActor || !attackCheckRoll.includes(type)) return

    const originalCover =
        dialog[MODULE_ID]?.originalCover ??
        targetActor.itemTypes.effect.find(e => e.sourceId === COVER_UUID && getFlag(e, 'canSkip'))?.toObject()

    if (!originalCover) return

    if (!dialog[MODULE_ID]?.originalCover) setProperty(dialog, `${MODULE_ID}.originalCover`, originalCover)

    const skipCover = options.has(skipConditional.cover)

    html.find('.roll-mode-panel').before(`<div class="pf2e-perception">
        <div class="dialog-row ${skipCover ? '' : 'disabled'}">
            <span class="mod">${localize('dice-checks.covers')}</span>
            <label class="exclude toggle">
                <input type="checkbox" id="app-${appid}-perception-covers" ${skipCover ? 'checked' : ''} />
                <label for="app-${appid}-perception-covers"></label>
            </label>
        </div>
    </div><hr>`)

    html.find(`#app-${appid}-perception-covers`).on('change', event => {
        const checked = event.currentTarget.checked

        if (checked) options.add(skipConditional.cover)
        else options.delete(skipConditional.cover)

        const items = deepClone(targetActor._source.items)
        const index = items.findIndex(
            i => getProperty(i, 'flags.core.sourceId') === COVER_UUID && getProperty(i, `flags.${MODULE_ID}.canSkip`)
        )

        if (checked && index !== -1) items.splice(index, 1)
        else if (!checked && index === -1) items.push(originalCover)

        target.actor = targetActor.clone({ items }, { keepId: true })

        if (dc?.slug) {
            const statistic = target.actor.getStatistic(dc.slug)?.dc
            if (statistic) {
                dc.value = statistic.value
                dc.statistic = statistic
            }
        }

        dialog.render()
    })

    dialog.setPosition()
}
