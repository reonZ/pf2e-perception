import { IconPathMenu } from './apps/icon-path-menu.js'
import { MODULE_ID } from './module.js'

export function registerSettings() {
    register('icon-path', Object, {}, { config: false })
    game.settings.registerMenu(MODULE_ID, 'icon-path-menu', {
        name: path('icon-path', 'name'),
        label: path('icon-path', 'label'),
        icon: 'fa-solid fa-list',
        restricted: true,
        type: IconPathMenu,
    })

    register('permission', String, CONST.USER_ROLES.GAMEMASTER, {
        choices: {
            1: path('permission', 'choices.1'),
            2: path('permission', 'choices.2'),
            3: path('permission', 'choices.3'),
            4: path('permission', 'choices.4'),
        },
    })

    register('npc-vision', Boolean, false)

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

    register('dead-cover', Boolean, true)

    register('standard-type', String, 'center', {
        choices: {
            center: path('standard-type', 'choices.center'),
            points: path('standard-type', 'choices.points'),
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

    register('flat-check', String, 'roll', {
        choices: {
            none: path('flat-check', 'choices.none'),
            roll: path('flat-check', 'choices.roll'),
            cancel: path('flat-check', 'choices.cancel'),
        },
    })

    register('encounter', Boolean, false)
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
