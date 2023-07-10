export function allowCombatTarget(allow) {
    Hooks[allow ? 'on' : 'off']('renderCombatTracker', renderCombatTracker)
    ui.combat?.render()
}

function renderCombatTracker(tracker, html) {
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
