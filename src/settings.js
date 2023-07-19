import { MODULE_ID } from './module.js'

export function registerSettings() {
    register('target', Boolean, true, {
        onChange: () => ui.combat?.render(),
    })

    register('lesser', String, 'ten', {
        choices: {
            none: path('lesser', 'choices.none'),
            cross: path('lesser', 'choices.cross'),
            zero: path('lesser', 'choices.zero'),
            ten: path('lesser', 'choices.ten'),
            twenty: path('lesser', 'choices.twenty'),
        },
    })

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

    register('concealed', Boolean, true)

    register('encounter', Boolean, false)

    register('show-conditions-only-gm', Boolean, true)
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
