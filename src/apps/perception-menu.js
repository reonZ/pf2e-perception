import { isProne } from '../actor.js'
import { defaultValues } from '../constants.js'
import { MODULE_ID, localize, templatePath } from '../module.js'
import { getValidTokens, validateTokens } from '../scene.js'
import { getTokenData, setTokenData } from '../token.js'
import { sortByName } from '../utils.js'

const VISIBILITIES = ['observed', 'concealed', 'hidden', 'undetected', 'unnoticed']
const COVERS = ['none', 'lesser', 'standard', 'greater', 'greater-prone']

export class PerceptionMenu extends Application {
    #token
    #resolve
    #selected = []
    #currentData
    #validation
    #hoverTokenListener

    constructor({ token, validation, resolve }, options = {}) {
        options.title = localize('menu.title', validation ? 'validation' : 'perception', { name: token.name })
        super(options)

        this.#resolve = resolve
        this.#token = token instanceof TokenDocument ? token.object : token

        this.#hoverTokenListener = (token, hover) => {
            const tokenId = token.id
            const tokens = this.element.find('[data-token-id]')
            tokens.removeClass('hover')
            if (hover) tokens.filter(`[data-token-id=${tokenId}]`).addClass('hover')
        }

        this.#currentData = this.#getTokenData(true)
        this.#validation = validation

        Hooks.on('hoverToken', this.#hoverTokenListener)
    }

    close(options = {}) {
        Hooks.off('hoverToken', this.#hoverTokenListener)
        this.#resolve?.(options.resolve ?? false)
        super.close(options)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            minimizable: false,
            template: templatePath('perception-menu'),
        })
    }

    static async openMenu(params = {}, options = {}) {
        if (params.token instanceof TokenDocument) params.token = params.token.object
        if (!params.token) {
            ui.notifications.error(localize('menu.no-token'))
            return
        }

        options.id = `${MODULE_ID}-${params.token.document.uuid}`

        const win = Object.values(ui.windows).find(x => x.id === options.id)
        if (win) win.close()

        return new Promise(resolve => {
            params.resolve = resolve
            new PerceptionMenu(params, options).render(true)
        })
    }

    get token() {
        return this.#token
    }

    get document() {
        return this.#token.document
    }

    get actor() {
        return this.#token.actor
    }

    get scene() {
        return this.#token.scene
    }

    getData() {
        const originalData = this.#getTokenData()
        const alliance = this.actor.alliance
        const opposition = alliance === 'party' ? 'opposition' : alliance === 'opposition' ? 'party' : null
        const covers = COVERS.map(value => ({ value, label: localize(`cover.${value}`) }))

        let allies = []
        let enemies = []
        let neutral = []
        let skipAllies = false

        let tokens = getValidTokens(this.token)

        if (['cover', 'visibility'].includes(this.#validation?.property)) {
            let { property, value, selected = [] } = this.#validation
            const processValue = typeof value === 'function' ? value : () => value

            const scene = this.scene
            const propertyList = property === 'cover' ? COVERS : VISIBILITIES

            if (selected.length) selected = validateTokens(this.#token, selected)
            else {
                selected = tokens.filter(t => t.actor.alliance !== alliance).map(t => t.id)
                skipAllies = true
            }

            for (const tokenId of selected) {
                const token = scene.tokens.get(tokenId)

                const fullProperty = `${tokenId}.${property}`
                const currentValue = getProperty(this.#currentData, fullProperty) ?? defaultValues[property]

                let processedValue = processValue(token, currentValue)
                if (!propertyList.includes(processedValue)) processedValue = currentValue

                if (currentValue === processedValue) continue
                setProperty(this.#currentData, fullProperty, processedValue)
            }

            this.#selected = skipAllies || selected.length === tokens.length ? [] : selected
        }

        for (const { id, name, actor } of tokens) {
            const current = this.#currentData[id] ?? {}
            const original = originalData[id] ?? {}

            const token = {
                id,
                name,
                cover: current.cover ?? defaultValues.cover,
                visibility: current.visibility ?? defaultValues.visibility,
                originalCover: original.cover ?? defaultValues.cover,
                originalVisibility: original.visibility ?? defaultValues.visibility,
                selected: this.#selected.includes(id),
            }

            if (opposition) {
                const actorAlliance = actor.alliance
                if (!skipAllies && actorAlliance === alliance) allies.push(token)
                else if (actorAlliance === opposition) enemies.push(token)
                else if (actorAlliance === null) neutral.push(token)
            } else neutral.push(token)
        }

        return {
            i18n: key => localize(key),
            allies: allies.sort(sortByName),
            enemies: enemies.sort(sortByName),
            neutral: neutral.sort(sortByName),
            visibilities: VISIBILITIES.map(value => ({ value, label: localize(`menu.visibility.${value}`) })),
            covers: isProne(this.actor) ? covers : covers.slice(0, -1),
            default: defaultValues,
            validation: this.#validation?.property,
            hasTokens: allies.length || enemies.length || neutral.length,
        }
    }

    #getTokenData(clone) {
        const data = getTokenData(this.document) ?? {}
        return clone ? deepClone(data) : data
    }

    #setSelected() {
        this.#selected = this.element
            .find('[data-token-id].ui-selected')
            .toArray()
            .map(el => el.dataset.tokenId)
    }

    activateListeners(html) {
        html.find('[data-token-id]').on('mouseenter', event => {
            const { tokenId } = event.currentTarget.dataset
            const token = this.scene.tokens.get(tokenId)?.object
            if (!token || token.controlled) return
            token._onHoverIn(event, { hoverOutOthers: true })
        })

        html.find('select[name=visibility], select[name=cover]').on('change', event => {
            const target = event.currentTarget
            const property = target.name
            const defaultValue = defaultValues[property]
            const value = target.value || defaultValue
            const tokenId = target.closest('.token')?.dataset.tokenId
            const tokenIds = tokenId ? [tokenId] : this.#selected

            for (const tokenId of tokenIds) {
                setProperty(this.#currentData, `${tokenId}.${property}`, value)
            }

            if (tokenId) {
                target.classList.toggle('changed', value !== target.dataset.original)
                target.classList.toggle('custom', value !== defaultValue)
            } else this.render()
        })

        html.find('[data-action=accept]').on('click', event => {
            setTokenData(this.document, this.#currentData)
            this.close({ resolve: true })
        })

        html.find('[data-action=close]').on('click', () => {
            this.close()
        })

        if (this.#validation) return

        html.filter('.tokens').selectable({
            autoRefresh: false,
            filter: '.token',
            cancel: 'header,select',
            stop: () => this.#setSelected(),
        })

        html.find('[data-action=select-all]').on('click', event => {
            const section = $(event.currentTarget).closest('section')
            const tokens = (section.length ? section : html).find('[data-token-id]')
            const allSelected = tokens.filter(':not(.ui-selected)').length === 0
            tokens.toggleClass('ui-selected', !allSelected)
            this.#setSelected()
        })

        html.find('[data-action=use-selection]').on('click', event => {
            this.#selected = canvas.tokens.controlled.map(t => t.id)
            this.render()
        })

        html.find('[data-action=reset]').on('click', event => {
            this.#currentData = this.#getTokenData(true)
            this.#selected = []
            this.render()
        })
    }
}
