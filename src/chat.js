import { CoverValidationMenu, HideValidationMenu, SeekValidationMenu } from './apps/validation.js'
import { attackCheckRoll } from './constants.js'
import { MODULE_ID, getFlag, getFlags, localize, setFlag } from './module.js'
import { rollAltedCheck } from './roll.js'

export function renderChatMessage(message, html) {
    const token = message.token
    if (!token) return

    const { rollCheck, context, check, visibility, cover, selected, skipWait, validated } = getFlags(message)
    const pf2eContext = message.getFlag('pf2e', 'context')

    if (game.user.isGM) {
        if (attackCheckRoll.includes(context?.type) && check && !rollCheck) {
            html.find('[data-action=success-message]').on('click', () => {
                let content = localize('message.flat-check.success')
                content += createChatButton({
                    action: 'roll-check',
                    icon: 'fa-solid fa-dice-d20',
                    label: localize('message.flat-check.button', context.type),
                })
                createTokenMessage({ content, token, flags: { context, check, rollCheck: true } })
            })
            html.find('[data-action=failure-message]').on('click', () => {
                createTokenMessage({ content: localize('message.flat-check.failure'), token })
            })
        } else if (cover) {
            const button = createValidateButton({ property: 'cover', skipWait, validated })
            html.find('.message-content').append(button)
            html.find('[data-action=validate-cover]').on('click', () => {
                CoverValidationMenu.openMenu({ token, selected, value: cover, message })
            })
        } else if (pf2eContext?.type === 'skill-check') {
            if (pf2eContext.options.includes('action:hide')) {
                addVisibilityValidationButton({
                    token,
                    html,
                    message,
                    skipWait,
                    validated,
                    selected: pf2eContext.selected,
                    ValidationMenu: HideValidationMenu,
                })
            }
        } else if (pf2eContext?.type === 'perception-check') {
            if (pf2eContext.options.includes('action:seek') && pf2eContext.selected) {
                addVisibilityValidationButton({
                    token,
                    html,
                    message,
                    skipWait,
                    validated,
                    selected: pf2eContext.selected,
                    ValidationMenu: SeekValidationMenu,
                })
            }
        }
    } else {
        if (visibility) {
            html.find('.message-header .message-sender').text(token.name)
            html.find('.message-header .flavor-text').html(
                localize('message.flat-check.blind', { visibility: game.i18n.localize(`PF2E.condition.${visibility}.name`) })
            )
        } else if (cover && !skipWait) {
            const hint = waitHint('cover', validated)
            html.find('.message-content').append(hint)
        } else if (pf2eContext?.type === 'skill-check' && token.hasPlayerOwner) {
            if (pf2eContext.options.includes('action:hide')) {
                addBlindSkillCheckFlavor({ token, message, html, validated })
            }
        } else if (pf2eContext?.type === 'perception-check' && token.hasPlayerOwner) {
            if (pf2eContext.options.includes('action:seek') && pf2eContext.selected) {
                addBlindSkillCheckFlavor({ token, message, html, validated })
            }
        }
    }

    if (rollCheck) {
        if (token.isOwner) {
            html.find('[data-action=roll-check]').on('click', event => rollAltedCheck(event, context, check))
        } else {
            html.find('[data-action=roll-check]').remove()
        }
    }
}

export function validateMessage(message) {
    if (!getFlag(message, 'validated')) setFlag(message, 'validated', true)
}

function addBlindSkillCheckFlavor({ html, token, message, validated }) {
    html.find('.message-header .message-sender').text(token.name)
    let flavor = message.getFlag('pf2e', 'modifierName')
    flavor += waitHint('visibility', validated)
    html.find('.message-header .flavor-text').html(flavor)
}

function waitHint(property, validated) {
    let hint = localize(`message.${property}.player.${validated ? 'validated' : 'wait'}`)
    if (validated) hint = '<i class="fa-solid fa-check" style="color: green;"></i> ' + hint
    return `<i style="display: block; font-size: .9em; text-align: end;">${hint}</i>`
}

function addVisibilityValidationButton({ skipWait, validated, html, message, ValidationMenu, token, selected }) {
    const button = createValidateButton({ property: 'visibility', skipWait, validated })
    html.find('.message-header .flavor-text').append(button)
    html.find('[data-action=validate-visibility]').on('click', async () => {
        const roll = message.rolls[0].total
        ValidationMenu.openMenu({ token, message, roll, selected })
    })
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

export function createChatButton({ action, icon, label }) {
    let button = `<button type="button" style="margin: 0 0 5px; padding: 0;" data-action="${action}">`
    if (icon) button += `<i class="${icon}"></i> ${label}</button>`
    else button += label
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
