import { isProne } from '../actor.js'
import { COVERS, VISIBILITIES, defaultValues } from '../constants.js'
import { MODULE_ID, localize } from '../module.js'
import { validateTokens } from '../scene.js'
import { getTokenData, setTokenData } from '../token.js'
import { sortByName } from '../utils.js'

export class BaseMenu extends Application {
    #token
    #resolve
    #selected
    #_currentData
    #hoverTokenListener

    constructor({ token, resolve, selected = [] }, options = {}) {
        super(options)

        this.#token = token
        this.#resolve = resolve
        this.#selected = selected

        this.#hoverTokenListener = (token, hover) => {
            const tokenId = token.id
            const tokens = this.element.find('[data-token-id]')
            tokens.removeClass('hover')
            if (hover) tokens.filter(`[data-token-id=${tokenId}]`).addClass('hover')
        }

        Hooks.on('hoverToken', this.#hoverTokenListener)
    }

    async close(options = {}) {
        Hooks.off('hoverToken', this.#hoverTokenListener)
        this.#resolve?.(options.resolve ?? false)
        super.close(options)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            minimizable: false,
        })
    }

    static async openMenu(params, options = {}) {
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
            new this(params, options).render(true)
        })
    }

    static createPropertyData(original, current, property) {
        const defaultValue = defaultValues[property]
        const originalValue = original[property] ?? defaultValue
        const currentValue = current[property] ?? defaultValue
        return {
            original: originalValue,
            current: currentValue,
            changed: originalValue !== currentValue,
            custom: currentValue !== defaultValue,
            originalCustom: originalValue !== defaultValue,
        }
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

    get selected() {
        return this.#selected.length ? validateTokens(this.token, this.#selected) : []
    }

    get currentData() {
        return deepClone(this.#currentData)
    }

    get #currentData() {
        if (!this.#_currentData) this.#_currentData = this.getSavedData()
        return this.#_currentData
    }

    getSavedData() {
        const data = getTokenData(this.document) ?? {}
        return deepClone(data)
    }

    reset() {
        this.#_currentData = this.getSavedData()
        this.#selected = []
        this.render()
    }

    isSelected(token) {
        const id = typeof token === 'object' ? token.id : token
        return this.#selected.includes(id)
    }

    getData(options) {
        const covers = COVERS.map(value => ({ value, label: localize(`cover.${value}`) }))

        return {
            i18n: localize,
            covers: isProne(this.actor) ? covers : covers.slice(0, -1),
            visibilities: VISIBILITIES.map(value => ({ value, label: localize(`visibility.${value}`) })),
        }
    }

    activateListeners(html) {
        html.find('[data-token-id]').on('mouseenter', event => {
            const { tokenId } = event.currentTarget.dataset
            const token = this.scene.tokens.get(tokenId)?.object
            if (!token || token.controlled) return
            token._onHoverIn(event, { hoverOutOthers: true })
        })

        html.find('[data-action=close]').on('click', () => {
            this.close({ resolve: true })
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
            this._saveData(this.#currentData)
            this.close({ resolve: true })
        })
    }

    _saveData(currentData) {
        setTokenData(this.document, currentData)
    }

    _setSelected(selected) {
        this.#selected =
            selected ??
            this.element
                .find('[data-token-id].ui-selected')
                .toArray()
                .map(el => el.dataset.tokenId)
    }

    _spliIntoAlliances(tokens) {
        const allies = []
        const enemies = []
        const neutral = []

        const alliance = this.actor.alliance
        const opposition = alliance === 'party' ? 'opposition' : alliance === 'opposition' ? 'party' : null

        for (const token of tokens) {
            if (opposition) {
                const actorAlliance = token.actor ? token.actor.alliance : token.alliance
                if (actorAlliance === alliance) allies.push(token)
                else if (actorAlliance === opposition) enemies.push(token)
                else if (actorAlliance === null) neutral.push(token)
            } else neutral.push(token)
        }

        return {
            allies: allies.sort(sortByName),
            neutral: neutral.sort(sortByName),
            enemies: enemies.sort(sortByName),
            hasTokens: allies.length || enemies.length || neutral.length,
        }
    }
}
