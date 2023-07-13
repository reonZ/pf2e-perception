import { getActorToken, getCoverEffect, isProne } from './actor.js'
import { CoverValidationMenu, HideValidationMenu, SeekValidationMenu } from './apps/validation.js'
import { createTokenMessage } from './chat.js'
import { defaultValues } from './constants.js'
import { createCoverSource } from './effect.js'
import { getSetting, localize, templatePath } from './module.js'
import { validateTokens } from './scene.js'
import { createSeekTemplate, deleteTokenTemplate } from './template.js'
import { clearTokenData, getTokenData, setTokenData } from './token.js'
import { getPrototype } from './utils.js'

export function setupActions() {
    const hide = game.pf2e.actions.get('hide')
    const BaseAction = getPrototype(hide, 2).constructor
    const BaseActionVariant = getPrototype(hide.toActionVariant(), 2).constructor
    const SingleCheckAction = getPrototype(hide, 1).constructor
    const SingleCheckActionVariant = getPrototype(hide.toActionVariant(), 1).constructor

    setupCover(BaseAction, BaseActionVariant)
    setupHide(SingleCheckAction, SingleCheckActionVariant)
    setupSeek(SingleCheckAction, SingleCheckActionVariant)
}

function setupSeek(SingleCheckAction, SingleCheckActionVariant) {
    class SeekVariant extends SingleCheckActionVariant {
        async use(options = {}) {
            const action = game.i18n.localize('PF2E.Actions.Seek.Title')
            const token = getSelectedToken(options, action)
            if (!token) return

            if (!(await seek(token))) return deleteTokenTemplate(token)

            options.actors = [token.actor]
            const result = await super.use(options)

            if (game.user.isGM) {
                const { selected } = result[0].message.getFlag('pf2e', 'context')
                if (selected) openVisibilityValidationMenu({ token, result, ValidationMenu: SeekValidationMenu })
            }

            return result
        }
    }

    class Seek extends SingleCheckAction {
        constructor() {
            super({
                cost: 1,
                description: 'PF2E.Actions.Seek.Description',
                name: 'PF2E.Actions.Seek.Title',
                notes: [
                    { outcome: ['criticalSuccess'], text: 'PF2E.Actions.Seek.Notes.criticalSuccess' },
                    { outcome: ['success'], text: 'PF2E.Actions.Seek.Notes.success' },
                ],
                rollOptions: ['action:seek'],
                slug: 'seek',
                statistic: 'perception',
                traits: ['concentrate', 'secret'],
            })
        }

        toActionVariant(data) {
            return new SeekVariant(this, data)
        }
    }

    game.pf2e.actions.set('seek', new Seek())
}

async function seek(token) {
    const unit = game.i18n.localize('PF2E.Foot')

    let content = '<p style="margin: 0 0.3em; text-align: center;">'
    content += `${localize('dialog.seek.hint')}</p><p>`

    content += createButton(
        'create-cone',
        'fa-thin fa-cubes',
        game.i18n.format('PF2E.TemplateLabel', {
            size: 30,
            unit,
            shape: game.i18n.localize(CONFIG.PF2E.areaTypes.cone),
        })
    )

    content += createButton(
        'create-burst',
        'fa-thin fa-cubes',
        game.i18n.format('PF2E.TemplateLabel', {
            size: 15,
            unit,
            shape: game.i18n.localize(CONFIG.PF2E.areaTypes.burst),
        })
    )

    content += '</p>'

    return Dialog.wait(
        {
            title: `${token.name} - ${game.i18n.localize('PF2E.Actions.Seek.Title')}`,
            content,
            buttons: {
                ok: {
                    icon: '<i class="fa-solid fa-check"></i>',
                    label: localize('dialog.seek.accept'),
                    callback: () => true,
                },
                no: {
                    icon: '<i class="fa-solid fa-xmark"></i>',
                    label: localize('dialog.seek.cancel'),
                    callback: html => false,
                },
            },
            close: () => false,
            render: html => {
                const content = html.filter('.dialog-content')
                content.find('[data-action=create-cone], [data-action=create-burst]').on('click', event => {
                    const { action } = event.currentTarget.dataset
                    deleteTokenTemplate(token)
                    createSeekTemplate(action === 'create-cone' ? 'cone' : 'burst', token)
                })
            },
        },
        { width: 300, left: 10 }
    )
}

function setupHide(SingleCheckAction, SingleCheckActionVariant) {
    class HideVariant extends SingleCheckActionVariant {
        async use(options = {}) {
            const action = game.i18n.localize('PF2E.Actions.Hide.Title')
            const token = getSelectedToken(options, action)
            if (!token) return

            options.actors = [token.actor]
            const result = await super.use(options)

            if (game.user.isGM) {
                openVisibilityValidationMenu({ token, result, ValidationMenu: HideValidationMenu })
            }

            return result
        }
    }

    class Hide extends SingleCheckAction {
        constructor() {
            super({
                cost: 1,
                description: `PF2E.Actions.Hide.Description`,
                name: `PF2E.Actions.Hide.Title`,
                rollOptions: ['action:hide'],
                slug: 'hide',
                statistic: 'stealth',
                traits: ['secret'],
                notes: [{ outcome: ['success', 'criticalSuccess'], text: `PF2E.Actions.Hide.Notes.success` }],
            })
        }

        toActionVariant(data) {
            return new HideVariant(this, data)
        }
    }

    game.pf2e.actions.set('hide', new Hide())
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

    game.pf2e.actions.set('take-cover', new TakeCover())
}

async function takeCover(token) {
    const actor = token.actor
    const cover = getCoverEffect(actor)

    const targets = validateTokens(token, game.user.targets.ids)
    if (cover && !targets.length) return cover.delete()

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

                const process = async (cover, selected) => {
                    selected = selected ? targets : undefined

                    const flavor = cover === defaultValues.cover ? (selected ? 'remove' : 'remove-all') : 'take'
                    const message = await createTokenMessage({
                        content: localize(`message.cover.${flavor}`, { cover: localize(`cover.${cover}`) }),
                        flags: { selected, cover, skipWait: skip },
                        token,
                    })

                    if (skip) {
                        if (cover === defaultValues.cover && !selected) return clearTokenData(token)
                        const data = deepClone(getTokenData(token)) ?? {}
                        for (const tokenId of targets) {
                            setProperty(data, `${tokenId}.cover`, cover)
                        }
                        return setTokenData(token, data)
                    } else if (game.user.isGM) {
                        CoverValidationMenu.openMenu({ token, selected, value: cover, message })
                    }
                }

                if (level === 'remove-all') process(defaultValues.cover)
                else if (level === 'remove') process(defaultValues.cover, true)
                else if (targets.length) process(level, true)
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

function createButton(action, icon, label) {
    return `<button type="button" data-action="${action}" style="margin: 0 0 5px; padding: 0;">
    <i class="${icon}"></i> ${label}</button>
</button>`
}

function openVisibilityValidationMenu({ token, result, ValidationMenu }) {
    const roll = result[0].roll.total
    const message = result[0].message
    const selected = message.getFlag('pf2e', 'context.selected')
    ValidationMenu.openMenu({ token, roll, selected, message })
}
