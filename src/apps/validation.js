import { validateMessage } from '../chat.js'
import { COVERS, VISIBILITIES, VISIBILITY_VALUES, defaultValues } from '../constants.js'
import { MODULE_ID, getSetting, localize, templatePath } from '../module.js'
import { getValidTokens } from '../scene.js'
import { deleteTokenTemplate } from '../template.js'
import { getTokenData } from '../token.js'
import { BaseMenu } from './base-menu.js'

class ValidationMenu extends BaseMenu {
    static async openMenu(params, options) {
        const validated = await super.openMenu(params, options)
        if (validated && params.message) validateMessage(params.message)
        return validated
    }

    get title() {
        return localize('menu.validation.title', { name: this.token.name })
    }

    get template() {
        return templatePath('validation')
    }

    getSavedData(converted = true) {
        const data = super.getSavedData()
        return converted ? this._convertData(data) : data
    }

    _convertData(data) {
        const property = this.property
        const scene = this.scene
        const selected = this.selected
        const defaultValue = defaultValues[property]
        const propertyList = property === 'cover' ? COVERS : VISIBILITIES

        for (const tokenId of selected) {
            const token = scene.tokens.get(tokenId)
            const fullProperty = `${tokenId}.${property}`
            const currentValue = getProperty(data, fullProperty) ?? defaultValue

            let processedValue = this.processValue({ token, value: currentValue })
            if (!propertyList.includes(processedValue)) processedValue = currentValue

            if (currentValue === processedValue) continue
            setProperty(data, fullProperty, processedValue)
        }

        return data
    }

    processValue(params) {
        throw new Error(`${this.constructor.name} doesn't have a 'processValue' method defined`)
    }

    getData(options) {
        const { covers, visibilities, i18n } = super.getData(options)
        const currentData = this.currentData
        const originalData = this.getSavedData(false)
        const property = this.property

        let selected = this.selected
        let tokens = getValidTokens(this.token)

        tokens = tokens.map(({ id, name, actor }) => {
            const current = currentData[id] ?? {}
            const original = originalData[id] ?? {}

            return {
                id,
                name,
                alliance: actor.alliance,
                selected: selected.includes(id),
                ...BaseMenu.createPropertyData(original, current, property),
            }
        })

        const validation = getSetting('validation')
        if (validation === 'selected') tokens = tokens.filter(t => t.selected)
        else if (validation === 'changed') tokens = tokens.filter(t => t.changed)

        return {
            ...this._spliIntoAlliances(tokens),
            i18n,
            property: property,
            options: property === 'cover' ? covers : visibilities,
            showSelected: validation === 'all',
            showChanges: validation !== 'changed',
        }
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find('[data-action=cancel]').on('click', event => {
            this.close()
        })
    }
}

export class CoverValidationMenu extends ValidationMenu {
    #value

    constructor(params, options = {}) {
        super(params, options)
        this.#value = params.value
    }

    get property() {
        return 'cover'
    }

    processValue() {
        return this.#value
    }
}

class VisibilityValidationMenu extends ValidationMenu {
    #roll

    constructor(params, options = {}) {
        super(params, options)
        this.#roll = params.roll
    }

    get property() {
        return 'visibility'
    }

    get roll() {
        return this.#roll
    }
}

export class HideValidationMenu extends VisibilityValidationMenu {
    get selected() {
        const selected = super.selected
        if (selected.length) return selected

        const token = this.token
        const alliance = token.actor.alliance
        return getValidTokens(token)
            .filter(t => t.actor.alliance !== alliance)
            .map(t => t.id)
    }

    processValue({ token, value }) {
        const roll = this.roll
        const dc = token.actor.perception.dc.value
        const visibility = VISIBILITY_VALUES[value]

        if (roll >= dc && visibility < VISIBILITY_VALUES.hidden) return 'hidden'
        else if (roll < dc && visibility >= VISIBILITY_VALUES.hidden) return 'observed'
        else return value
    }
}

export class PointOutValidationMenu extends VisibilityValidationMenu {
    #originator

    constructor(params, options = {}) {
        super(params, options)
        this.#originator = params.originator
    }

    get selected() {
        const token = this.token
        const alliance = token.actor.alliance
        const originatorId = this.#originator.id
        const data = getTokenData(token) ?? {}

        return getValidTokens(token)
            .filter(t => {
                if (t.id === originatorId || t.actor.alliance === alliance) return false
                const visibility = getProperty(data, `${t.id}.visibility`)
                return VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected
            })
            .map(t => t.id)
    }

    processValue({ token, value }) {
        return VISIBILITY_VALUES[value] >= VISIBILITY_VALUES.undetected ? 'hidden' : value
    }
}

class ReverseVisibilityValidationMenu extends VisibilityValidationMenu {
    processValue({ token, value }) {
        const roll = this.roll
        const dc = token.actor.skills.stealth.dc.value
        const visibility = VISIBILITY_VALUES[value]

        if (roll >= dc + 10 && visibility >= VISIBILITY_VALUES.hidden) return 'observed'
        else if (roll >= dc && visibility === VISIBILITY_VALUES.hidden) return 'observed'
        else if (roll >= dc && visibility >= VISIBILITY_VALUES.undetected) return 'hidden'
        else return value
    }

    getSavedData(converted = true) {
        const thisId = this.token.id
        const tokens = getValidTokens(this.token)
        const data = {}

        for (const token of tokens) {
            const tokenData = getTokenData(token, thisId)
            if (tokenData) data[token.id] = deepClone(tokenData)
        }

        return converted ? this._convertData(data) : data
    }

    getData() {
        const parentData = super.getData()
        parentData.isReversed = true
        parentData.options = VISIBILITIES.map(value => ({ value, label: localize(`visibility.reversed.${value}`) }))
        return parentData
    }

    _saveData(currentData) {
        const scene = this.scene
        const thisId = this.token.id
        const updates = []

        for (const [tokenId, data] of Object.entries(currentData)) {
            let update = { _id: tokenId }
            const token = scene.tokens.get(tokenId)

            if (token) {
                if (data.visibility === defaultValues.visibility) delete data.visibility

                const original = getTokenData(token, thisId)
                if (original?.visibility === data.visibility) continue

                if (!original.cover && !data.visibility) {
                    update[`flags.${MODULE_ID}.data.-=${thisId}`] = true
                } else if (!data.visibility) {
                    update[`flags.${MODULE_ID}.data.${thisId}.-=visibility`] = true
                } else {
                    update[`flags.${MODULE_ID}.data.${thisId}.visibility`] = data.visibility
                }
            } else update[`flags.${MODULE_ID}.data.-=${thisId}`] = true

            updates.push(update)
        }

        scene.updateEmbeddedDocuments('Token', updates)
    }
}

export class SeekValidationMenu extends ReverseVisibilityValidationMenu {
    static async openMenu(params, options) {
        const validated = await super.openMenu(params, options)
        if (validated) deleteTokenTemplate(params.token)
    }
}
