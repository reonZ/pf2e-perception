import { getActorToken, getCoverEffect, isProne } from './actor.js'
import { COVERS, COVER_UUID, VISIBILITY_VALUES, attackCheckRoll, validCheckRoll } from './constants.js'
import { createCoverSource, findChoiceSetRule } from './effect.js'
import { MODULE_ID, getFlag, getSetting, localize } from './module.js'
import { getPerception, perceptionRules } from './rule-element.js'
import { validateTokens } from './scene.js'
import { getSeekTemplateTokens } from './template.js'
import { getVisibility } from './token.js'
import { asNumberOnly } from './utils.js'

export async function checkRoll(wrapped, ...args) {
    const context = args[1]
    if (!context) return wrapped(...args)

    if (Array.isArray(context.options)) context.options = new Set(context.options)

    const { actor, createMessage = 'true', type, token, target, isReroll } = context
    const originToken = token ?? getActorToken(actor)
    const targetToken = target?.token
    const isAttackRoll = attackCheckRoll.includes(type)
    const flatCheck = getSetting('flat-check')

    if (
        isReroll ||
        !createMessage ||
        !originToken ||
        !validCheckRoll.includes(type) ||
        (isAttackRoll && (!targetToken || flatCheck === 'none'))
    )
        return wrapped(...args)

    if (isAttackRoll && targetToken.actor) {
        const event = args[2]
        const perception = perceptionRules(originToken, targetToken, {
            extraOptions: context.options.filter(o => o.startsWith('item:')),
        })

        const visibility = getVisibility(targetToken, originToken, { perception, affects: 'target' })
        if (!visibility) return wrapped(...args)

        let dc = asNumberOnly(getPerception(perception, 'target', 'visibility', 'dc', visibility)?.first())
        if (dc === 0) return wrapped(...args)

        const isUndetected = VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected
        const isBlind = event?.ctrlKey || event?.metaKey

        const roll = await new originToken.actor.perception.constructor(originToken.actor, {
            slug: 'visibility-check',
            label: `${game.i18n.localize('PF2E.FlatCheck')}: ${game.i18n.localize(`PF2E.condition.${visibility}.name`)}`,
            check: { type: 'flat-check' },
        }).roll({
            dc: dc ?? visibility === 'concealed' ? 5 : 11,
            target: targetToken.actor,
            rollMode: isUndetected || isBlind ? (game.user.isGM ? 'gmroll' : 'blindroll') : 'roll',
        })

        const isSuccess = roll.degreeOfSuccess > 1

        if (isUndetected) {
            context.options.add('secret')
            context.pf2ePerception = {
                isSuccess: isSuccess,
                visibility,
            }
        }

        if (flatCheck !== 'roll' && !isUndetected && !isSuccess) return
    } else if (context.options.has('action:hide')) {
        setProperty(context, 'pf2ePerception.selected', game.user.targets.ids)
        // } else if (context.options.has('action:sneak')) {
        //     context.selected = game.user.targets.ids
    } else if (context.options.has('action:seek')) {
        const highlighted = getSeekTemplateTokens(originToken)
        const tokens = highlighted ?? Array.from(game.user.targets)
        const selected = validateTokens(originToken, tokens)
            .filter(t => !t.document.hidden)
            .map(t => t.id)

        setProperty(context, 'pf2ePerception.selected', selected)
        setProperty(context, 'pf2ePerception.fromTemplate', !!highlighted)
    }

    return wrapped(...args)
}

export function renderCheckModifiersDialog(dialog, html) {
    const { createMessage = 'true', type, token, target, isReroll, options, dc } = dialog.context
    const originToken = token
    const targetToken = target?.token
    const targetActor = target?.actor

    if (isReroll || !createMessage || !originToken || !targetToken || !targetActor || !attackCheckRoll.includes(type)) return

    const coverEffect = getCoverEffect(targetActor)
    const currentCover = coverEffect
        ? findChoiceSetRule(coverEffect)?.selection.level ?? getFlag(coverEffect, 'level')
        : undefined
    let coverOverride = dialog[MODULE_ID]?.coverOverride ?? currentCover

    let template = '<div class="roll-mode-panel">'
    template += `<div class="label">${localize('dice-checks.cover.label')}</div>`
    template += `<select name="overrideCover"><option value="">${localize('dice-checks.cover.none')}</option>`

    const covers = isProne(targetActor) ? COVERS.slice(1) : COVERS.slice(1, -1)

    covers.forEach(slug => {
        const selected = slug === coverOverride ? 'selected' : ''
        const label = localize(`cover.${slug}`)
        template += `<option value="${slug}" ${selected}>${label}</option>`
    })

    template += '</select></div>'

    // visibility override here

    template += '<hr>'

    html.find('.roll-mode-panel').before(template)

    html.find('select[name=overrideCover]').on('change', event => {
        const value = event.currentTarget.value || undefined
        setProperty(dialog, `${MODULE_ID}.coverOverride`, value)
        coverOverride = value
    })

    html.find('button.roll')[0].addEventListener(
        'click',
        event => {
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()

            let modified = false
            const items = deepClone(targetActor._source.items)

            if (coverOverride !== currentCover) {
                modified = true

                const coverIndex = items.findIndex(i => getProperty(i, 'flags.core.sourceId') === COVER_UUID)
                if (coverIndex !== -1) items.splice(coverIndex, 1)

                if (coverOverride) {
                    const source = createCoverSource(coverOverride)
                    items.push(source)
                }
            }

            if (modified) {
                target.actor = targetActor.clone({ items }, { keepId: true })

                if (dc?.slug) {
                    const statistic = target.actor.getStatistic(dc.slug)?.dc
                    if (statistic) {
                        dc.value = statistic.value
                        dc.statistic = statistic
                    }
                }
            }

            dialog.resolve(true)
            dialog.isResolved = true
            dialog.close()
        },
        true
    )

    dialog.setPosition()
}
