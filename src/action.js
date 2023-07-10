import { getActorToken, getCoverEffect, isProne } from './actor.js'
import { PerceptionMenu } from './apps/perception-menu.js'
import { createTokenMessage } from './chat.js'
import { createCoverSource } from './effect.js'
import { getFlag, getSetting, localize, setFlag, templatePath } from './module.js'
import { validateTokens } from './scene.js'
import { clearTokenData, getTokenData, setTokenData } from './token.js'
import { getPrototype } from './utils.js'

export function setupActions() {
    const takeCover = game.pf2e.actions.get('take-cover')
    const BaseAction = getPrototype(takeCover, 2)
    const BaseActionVariant = getPrototype(takeCover.toActionVariant(), 2)

    setupCover(BaseAction, BaseActionVariant)
}

function setupCover(BaseAction, BaseActionVariant) {
    class TakeCoverVariant extends BaseActionVariant {
        async use(options = {}) {
            const action = localize('actions.take-cover')
            const token = getSelectedToken(options, action)
            if (token) takeCover(token)
        }
    }

    class TakeCover extends BaseAction {
        constructor() {
            super({
                cost: 1,
                description: 'PF2E.Actions.TakeCover.Description',
                img: 'systems/pf2e/icons/conditions-2/status_acup.webp',
                name: 'PF2E.Actions.TakeCover.Title',
                slug: 'take-cover',
            })
        }

        toActionVariant(data) {
            return new TakeCoverVariant(this, data)
        }
    }

    game.pf2e.actions.set('take-cover', new TakeCover(BaseAction, BaseActionVariant))
}

async function takeCover(token) {
    const actor = token.actor
    const cover = getCoverEffect(actor)
    if (cover) return cover.delete()

    const targets = validateTokens(token, game.user.targets.ids)
    const data = getTokenData(token) ?? {}
    const covers = Object.entries(data).reduce((covers, [tokenId, { cover }]) => {
        if (cover) covers[tokenId] = cover
        return covers
    }, {})

    const content = await renderTemplate(templatePath('covers-dialog'), {
        i18n: key => localize(key),
        hasTargets: !!targets.length,
        hasCovers: !isEmpty(covers),
        hasTargetCover: targets.some(id => id in covers),
        isProne: isProne(actor),
    })

    const dialog = new Dialog({
        title: `${token.name} - ${localize('actions.take-cover')}`,
        content,
        buttons: {},
        render: html => {
            html.find('button').on('click', async event => {
                const { level } = event.currentTarget.dataset
                const skip = getSetting('skip-cover')

                const process = async (selected, cover) => {
                    const flavor = cover === 'none' ? (selected === true ? 'remove-all' : 'remove') : 'take'
                    const message = await createTokenMessage({
                        content: localize(`message.cover.${flavor}`, { cover: localize(`cover.${cover}`) }),
                        flags: { selected, cover, skipWait: skip },
                        token,
                        secret: !token.document.hasPlayerOwner,
                    })

                    if (skip) {
                        if (cover === 'none' && selected === true) return clearTokenData(token)
                        const data = deepClone(getTokenData(token)) ?? {}
                        for (const tokenId of targets) {
                            setProperty(data, `${tokenId}.cover`, cover)
                        }
                        return setTokenData(token, data)
                    } else if (game.user.isGM) {
                        const validated = await PerceptionMenu.openMenu(token, { selected, cover })
                        if (validated) setFlag(message, 'validated', true)
                    }
                }

                if (level === 'remove-all') process(true, 'none')
                else if (level === 'remove') process(targets, 'none')
                else if (targets.length) process(targets, level)
                else {
                    const source = createCoverSource(level)
                    actor.createEmbeddedDocuments('Item', [source])
                }

                dialog.close()
            })
        },
    }).render(true)
}

function getSelectedToken(options, action) {
    let tokens = options.tokens ?? []
    if (!Array.isArray(tokens)) tokens = [tokens]

    let actors = options.actors ?? []
    if (!Array.isArray(actors)) actors = [actors]

    if (!tokens.length && actors.length === 1) tokens = [getActorToken(actors[0])].filter(Boolean)
    if (!tokens.length) tokens = canvas.tokens.controlled
    if (!tokens.length) tokens = [getActorToken(game.user.character)].filter(Boolean)

    if (tokens.length > 1) {
        ui.notifications.warn(localize('actions.only-one', { action }))
        return
    } else if (!tokens.length) {
        ui.notifications.warn(localize('actions.must-one', { action }))
        return
    }

    const token = tokens[0]
    if (!token?.actor.isOfType('creature')) {
        ui.notifications.warn(localize('actions.must-creature', { action }))
        return
    }

    return token
}
