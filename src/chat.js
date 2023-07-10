import { PerceptionMenu } from './apps/perception-menu.js'
import { MODULE_ID, getFlag, getFlags, localize, setFlag } from './module.js'
import { rollAltedCheck } from './roll.js'

export function renderChatMessage(message, html) {
    const token = message.token
    if (!token) return

    const { rollCheck, context, check, visibility, cover, selected, skipWait, validated } = getFlags(message)

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
            let label = localize(`message.cover.gm.${skipWait ? 'check' : validated ? 'validated' : 'validate'}`)
            if (!skipWait && validated) label += '<i class="fa-solid fa-check" style="color: green; margin-left: 0.3em;"></i>'

            const button = createChatButton({
                action: 'validate-covers',
                icon: 'fa-solid fa-list',
                label,
            })

            html.find('.message-content').append(button)
            html.find('[data-action=validate-covers]').on('click', async () => {
                const validated = await PerceptionMenu.openMenu({
                    token,
                    validation: { property: 'cover', value: cover, selected },
                })
                if (validated && !getFlag(message, 'validated')) setFlag(message, 'validated', true)
            })
        }
    } else {
        if (visibility) {
            html.find('.message-header .message-sender').text(token.name)
            html.find('.message-header .flavor-text').html(
                localize('message.flat-check.blind', { visibility: game.i18n.localize(`PF2E.condition.${visibility}.name`) })
            )
        } else if (cover && !skipWait) {
            let hint = localize(`message.cover.player.${validated ? 'validated' : 'wait'}`)
            if (validated) hint = '<i class="fa-solid fa-check" style="color: green;"></i> ' + hint
            hint = `<i style="display: block; font-size: .9em; text-align: end;">${hint}</i>`
            html.find('.message-content').append(hint)
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

export async function createTokenMessage({ content, token, flags, secret }) {
    const data = { content, speaker: ChatMessage.getSpeaker({ token: token instanceof Token ? token.document : token }) }
    if (flags) setProperty(data, `flags.${MODULE_ID}`, flags)
    if (secret) {
        data.type = CONST.CHAT_MESSAGE_TYPES.WHISPER
        data.whisper = ChatMessage.getWhisperRecipients('gm')
    }
    return ChatMessage.create(data)
}
