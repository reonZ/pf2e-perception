import { getSetting, localize, setSetting } from './module.js'

export function renderCombatTracker(tracker, html) {
    if (getSetting('target')) setupToggleTarget(html)
    // hideUndetected(html)
}

function hideUndetected(html) {
    if (!canvas.ready) return

    const combatants = game.combats.viewed?.combatants
    if (!combatants?.size) return

    html.find('#combat-tracker .combatant').each((i, li) => {
        const { combatantId } = li.dataset
        const token = combatants.get(combatantId ?? '')?.token
        if (!token) return

        // if (isUndetected(token, 'basicSight', true)) li.remove()
    })
}

function setupToggleTarget(html) {
    html.find('[data-control=toggleTarget]').each((_, el) => {
        el.addEventListener(
            'click',
            event => {
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()

                const { combatantId } = event.currentTarget.closest('.combatant').dataset
                const combatant = game.combats.viewed.combatants.get(combatantId ?? '')
                const token = combatant?.token
                if (!token) return

                const isTargeted = Array.from(game.user.targets).some(t => t.document === token)
                token.object.setTarget(!isTargeted, { releaseOthers: !event.shiftKey })
            },
            true
        )
    })
}

export function renderCombatTrackerConfig(config, html) {
    const checked = getSetting('encounter')

    html.find('.form-group').last().after(`<div class="form-group">
    <label>${localize('settings.encounter.name')}</label>
    <input type="checkbox" name="pf2e-perception.encounter" ${checked ? 'checked' : ''}>
    <p class="notes">${localize('settings.encounter.short')}</p>
</div>`)

    html.find('input[name="pf2e-perception.encounter"]').on('change', event => {
        const checked = event.currentTarget.checked
        setSetting('encounter', checked)
    })
}
