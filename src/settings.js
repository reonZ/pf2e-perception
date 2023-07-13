import { MODULE_ID } from './module.js'
import { allowCombatTarget } from './combat.js'

export function registerSettings() {
    register('target', Boolean, true, {
        onChange: allowCombatTarget,
    })

    register('lesser', Boolean, true)

    register('standard', Boolean, true)

    register('standard-type', String, 'center', {
        choices: {
            center: path('standard-type', 'choices.center'),
            points: path('standard-type', 'choices.points'),
            // corners: path('standard-type', 'choices.corners'),
        },
    })

    register('skip-cover', Boolean, true)

    register('validation', String, 'all', {
        choices: {
            all: path('validation', 'choices.all'),
            selected: path('validation', 'choices.selected'),
            changed: path('validation', 'choices.changed'),
        },
    })
}

function path(setting, key) {
    return `${MODULE_ID}.settings.${setting}.${key}`
}

function register(name, type, defValue, extra = {}) {
    game.settings.register(MODULE_ID, name, {
        name: path(name, 'name'),
        hint: path(name, 'hint'),
        scope: 'world',
        config: true,
        type,
        default: defValue,
        ...extra,
    })
}
