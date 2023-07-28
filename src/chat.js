import {
    CoverValidationMenu,
    HideValidationMenu,
    PointOutValidationMenu,
    SeekValidationMenu,
    UnHideValidationMenu,
} from './apps/validation.js'
import { attackCheckRoll } from './constants.js'
import { MODULE_ID, getFlag, getFlags, localize, setFlag } from './module.js'
import { deleteSeekTemplate } from './template.js'

export function renderChatMessage(message, html) {
    const token = message.token
    if (!token) return

    const isGM = game.user.isGM
    const hasPlayerOwner = token.hasPlayerOwner
    const { cover, selected, skipWait, validated, pointOut } = getFlags(message)
    const pf2eContext = message.getFlag('pf2e', 'context')

    if (cover) {
        if (isGM) {
            const button = createValidateButton({ property: 'cover', skipWait, validated })
            html.find('.message-content').append(button)
            html.find('[data-action=validate-cover]').on('click', () => {
                CoverValidationMenu.openMenu({ token, selected, value: cover, message })
            })
        } else if (!skipWait) {
            const hint = createWaitHint('cover', validated)
            html.find('.message-content').append(hint)
        }
    } else if (pf2eContext?.pf2ePerception?.visibility) {
        if (!validated) html.find('.message-buttons').remove()

        const flavor = html.find('.flavor-text')

        if (!isGM && hasPlayerOwner) {
            html.find('.message-sender').text(token.name)
            flavor.empty()
        }

        const msg = localize(`message.flat-check.${validated === undefined ? 'blind' : validated ? 'success' : 'failure'}`)
        const hint = createHint(msg, validated)
        flavor.append(hint)

        if (isGM) {
            for (const type of ['success', 'failure']) {
                flavor.append(
                    createChatButton({
                        action: `${type}-message`,
                        icon: 'fa-solid fa-message',
                        label: localize('message.flat-check.button', type),
                    })
                )
                html.find(`[data-action=${type}-message]`).on('click', () => {
                    setFlag(message, 'validated', type === 'success')
                })
            }
        }
    } else if (pf2eContext?.type === 'skill-check' && pf2eContext.pf2ePerception) {
        if (isGM) {
            if (pf2eContext.options.includes('action:hide')) {
                const button = createValidateButton({ property: 'visibility', skipWait, validated })
                html.find('.flavor-text').append(button)
                html.find('[data-action=validate-visibility]').on('click', () => {
                    HideValidationMenu.openMenu({
                        token,
                        message,
                        roll: message.rolls[0],
                        selected: pf2eContext.pf2ePerception.selected,
                    })
                })
            }
        } else if (hasPlayerOwner) {
            if (pf2eContext.options.includes('action:hide')) {
                addBlindSkillCheckFlavor({ token, message, html, validated })
            }
        }
    } else if (pf2eContext?.type === 'perception-check' && pf2eContext.pf2ePerception) {
        if (isGM) {
            if (pf2eContext.options.includes('action:seek')) {
                const buttons = createValidateCombo({
                    skipWait,
                    validated,
                    smallAction: 'delete-template',
                    smallIcon: 'fa-thin fa-cubes',
                    smallSlashed: true,
                })

                html.find('.flavor-text').append(buttons)

                html.find('[data-action=validate-visibility]').on('click', () => {
                    SeekValidationMenu.openMenu({
                        token,
                        message,
                        roll: message.rolls[0],
                        selected: pf2eContext.pf2ePerception.selected,
                        fromTemplate: pf2eContext.pf2ePerception.fromTemplate,
                    })
                })

                html.find('[data-action=delete-template').on('click', () => {
                    deleteSeekTemplate(token)
                })
            }
        } else if (hasPlayerOwner) {
            if (pf2eContext.options.includes('action:seek')) {
                addBlindSkillCheckFlavor({ token, message, html, validated })
            }
        }
    } else if (pointOut) {
        const selectedToken = token.scene.tokens.get(pointOut)
        if (!selectedToken) return

        if (isGM) {
            const buttons = createValidateCombo({
                skipWait,
                validated,
                smallAction: 'ping-token',
                smallIcon: 'fa-solid fa-signal-stream',
            })

            html.find('.message-content').append(buttons)

            html.find('[data-action=validate-visibility]').on('click', () => {
                PointOutValidationMenu.openMenu({
                    message,
                    token: selectedToken,
                    originator: token,
                    selected: canvas.tokens.controlled.map(t => t.id),
                })
            })

            html.find('[data-action=ping-token]').on('click', () => {
                canvas.ping(selectedToken.center)
            })
        } else if (hasPlayerOwner) {
            const hint = createWaitHint('visibility', validated)
            html.find('.message-content').append(hint)
        }
    }

    if (isGM && attackCheckRoll.includes(pf2eContext?.type)) {
        const tooltip = localize('message.unhide.tooltip')
        const button = `<span style="position: absolute; right: 0px; bottom: 1px;">
    <button data-action="unhide" title="${tooltip}" style="width: 22px; height: 22px; font-size: 10px; line-height: 1px;">
        <i class="fa-duotone fa-eye-slash" style="right: 1px;"></i>
    </button>
</span>`
        html.find('.dice-result .dice-total').append(button)
        html.find('[data-action=unhide]').on('click', event => {
            event.stopPropagation()
            UnHideValidationMenu.openMenu({ token })
        })
    }
}

export function validateMessage(message) {
    if (!getFlag(message, 'validated')) setFlag(message, 'validated', true)
}

function createValidateCombo({ skipWait, validated, smallIcon, smallAction, smallSlashed }) {
    let buttons = '<div style="display: grid; grid-template-columns: 1fr auto; gap: 3px">'

    buttons += createValidateButton({ property: 'visibility', skipWait, validated })
    buttons += createChatButton({
        action: smallAction,
        icon: smallIcon,
        slashed: smallSlashed,
        tooltip: localize(`message.visibility.small-button.${smallAction}`),
    })

    buttons += '</div>'

    return buttons
}

function addBlindSkillCheckFlavor({ html, token, message, validated }) {
    html.find('.message-sender').text(token.name)
    let flavor = message.getFlag('pf2e', 'modifierName')
    flavor += createWaitHint('visibility', validated)
    html.find('.flavor-text').html(flavor)
}

function createWaitHint(property, validated) {
    const hint = localize(`message.${property}.player.${validated ? 'validated' : 'wait'}`)
    return createHint(hint, validated)
}

function createHint(hint, validated) {
    if (validated === true) hint = '<i class="fa-solid fa-check" style="color: green;"></i> ' + hint
    else if (validated === false) hint = '<i class="fa-solid fa-xmark" style="color: red;"></i> ' + hint
    return `<i style="display: block; font-size: .9em; text-align: end;">${hint}</i>`
}

function createValidateButton({ skipWait, validated, property }) {
    let label = localize(`message.${property}.gm.${skipWait ? 'check' : validated ? 'validated' : 'validate'}`)
    if (!skipWait && validated) label += '<i class="fa-solid fa-check" style="color: green; margin-left: 0.3em;"></i>'
    return createChatButton({
        action: `validate-${property}`,
        icon: 'fa-solid fa-list',
        label,
    })
}

export function createChatButton({ action, icon, label, tooltip, slashed = false }) {
    let button = `<button type="button" style="margin: 0 0 5px; padding-block: 0; position: relative;" data-action="${action}" title="${tooltip}">`

    if (icon) {
        button += `<i class="${icon}" ${label ? '' : `style="margin: 0;"`}></i>`
        if (slashed) {
            const style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2em;'
            button += `<i class="fa-solid fa-slash-forward" style="${style}"></i>`
        }
    }
    if (label) button += `${icon ? ' ' : ''}${label}`

    button += '</button>'

    return button
}

export async function createTokenMessage({ content, token, flags, secret }) {
    const data = { content, speaker: ChatMessage.getSpeaker({ token: token instanceof Token ? token.document : token }) }
    if (flags) setProperty(data, `flags.${MODULE_ID}`, flags)
    if (secret) {
        data.type = CONST.CHAT_MESSAGE_TYPES.WHISPER
        data.whisper = ChatMessage.getWhisperRecipients('gm')
    }
    return ChatMessage.create(data)
}
