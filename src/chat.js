import { PerceptionMenu } from './apps/perception-menu.js'
import { MODULE_ID, getFlags, localize } from './module.js'
import { rollAltedCheck } from './roll.js'

export function renderChatMessage(message, html) {
    const token = message.token
    if (!token) return

    const { rollCheck, context, check, visibility, cover, selected, skipWait } = getFlags(message)

    if (game.user.isGM) {
        if (context && check && !rollCheck) {
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
        } else if (cover && selected) {
            const button = createChatButton({
                action: 'validate-covers',
                icon: 'fa-solid fa-list',
                label: localize('message.cover.validate'),
            })

            html.find('.message-content').append(button)
            html.find('[data-action=validate-covers]').on('click', () => {
                PerceptionMenu.openMenu(token, { selected, cover })
            })
        }
    } else {
        if (visibility) {
            html.find('.message-header .message-sender').text(token.name)
            html.find('.message-header .flavor-text').html(
                localize('message.flat-check.blind', { visibility: game.i18n.localize(`PF2E.condition.${visibility}.name`) })
            )
        } else if (cover && !skipWait) {
            const wait = `<i style="display: block; font-size: .9em; text-align: end;">${localize('message.cover.wait')}</i>`
            html.find('.message-content').append(wait)
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

export function createChatButton({ action, icon, label }) {
    let button = `<button type="button" style="margin-bottom: 5px;" data-action="${action}">`
    if (icon) button += `<i class="${icon}"></i> ${label}</button>`
    else button += label
    return button
}

export function createTokenMessage({ content, token, flags, secret }) {
    const data = { content, speaker: ChatMessage.getSpeaker({ token: token instanceof Token ? token.document : token }) }
    if (flags) setProperty(data, `flags.${MODULE_ID}`, flags)
    if (secret) {
        data.type = CONST.CHAT_MESSAGE_TYPES.WHISPER
        data.whisper = ChatMessage.getWhisperRecipients('gm')
    }
    ChatMessage.create(data)
}
