import { ICONS_PATHS } from '../constants.js'
import { getSetting, localize, setSetting, templatePath } from '../module.js'

const ICONS = ['cover', 'concealed', 'hidden', 'undetected', 'unnoticed']

export class IconPathMenu extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: templatePath('icon-path-menu'),
            title: localize('settings.icon-path.name'),
            width: 500,
        })
    }

    getData() {
        const saved = getSetting('icon-path')

        const icons = ICONS.map(name => ({
            name,
            placeholder: ICONS_PATHS[name],
            value: saved[name] ?? '',
            label: name === 'cover' ? localize('icon-path.cover') : game.i18n.localize(CONFIG.PF2E.conditionTypes[name]),
        }))

        return {
            icons,
            i18n: localize,
        }
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find('button[name=cancel]').on('click', event => {
            event.prefentDefault()
            this.close()
        })
    }

    async _updateObject(event, formData) {
        setSetting('icon-path', formData)
    }
}
