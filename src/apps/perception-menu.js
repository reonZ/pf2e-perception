import { isProne } from '../actor.js'
import { MODULE_ID, localize, templatePath } from '../module.js'
import { getValidTokens, validateTokens } from '../scene.js'
import { getTokenData, setTokenData } from '../token.js'
import { sortByName } from '../utils.js'

const VISIBILITIES = ['observed', 'concealed', 'hidden', 'undetected', 'unnoticed']
const COVERS = ['none', 'lesser', 'standard', 'greater', 'greater-prone']

export class PerceptionMenu extends Application {
    #token
    #selected
    #currentData
    #hoverTokenListener

    constructor({ token, selected, cover }, options = {}) {
        options.title = localize('menu.title', { name: token.name })
        super(options)

        this.#token = token instanceof TokenDocument ? token.object : token

        this.#hoverTokenListener = (token, hover) => {
            const tokenId = token.id
            const tokens = this.element.find('[data-token-id]')
            tokens.removeClass('hover')
            if (hover) tokens.filter(`[data-token-id=${tokenId}]`).addClass('hover')
        }

        this.#currentData = this.#getTokenData(true)

        if (selected === true) selected = getValidTokens(token).map(t => t.id)
        else if (Array.isArray(selected)) selected = validateTokens(token, selected)

        this.#selected = selected ?? []

        if (selected && COVERS.includes(cover)) {
            for (const tokenId of selected) {
                setProperty(this.#currentData, `${tokenId}.cover`, cover)
            }
        }

        Hooks.on('hoverToken', this.#hoverTokenListener)
    }

    close(options = {}) {
        Hooks.off('hoverToken', this.#hoverTokenListener)
        super.close(options)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            minimizable: false,
            template: templatePath('perception-menu'),
        })
    }

    static openMenu(token, options = {}) {
        const actor = token?.actor
        if (!actor) return

        const id = `${MODULE_ID}-${actor.uuid}`
        const win = Object.values(ui.windows).find(x => x.id === id)

        if (win) win.bringToTop()
        else new PerceptionMenu({ ...options, token }, { id }).render(true)
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

        const tokens = getValidTokens(this.token).map(({ id, name, actor }) => {
            const current = this.#currentData[id] ?? {}
            const original = originalData[id] ?? {}

            return {
                id,
                name,
                alliance: actor.alliance,
                cover: current.cover ?? 'none',
                visibility: current.visibility ?? 'observed',
                originalCover: original.cover ?? 'none',
                originalVisibility: original.visibility ?? 'observed',
                selected: this.#selected.includes(id),
            }
        })

        const filterTokens = a => tokens.filter(t => t.alliance === a).sort(sortByName)

        return {
            i18n: key => localize(`menu.${key}`),
            allies: opposition && filterTokens(alliance),
            enemies: opposition && filterTokens(opposition),
            neutral: opposition ? filterTokens(null) : tokens.sort(sortByName),
            visibilities: VISIBILITIES.map(value => ({ value, label: localize(`menu.visibility.${value}`) })),
            covers: isProne(this.actor) ? covers : covers.slice(0, -1),
            default: {
                visibility: 'observed',
                cover: 'none',
            },
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
        html.filter('.tokens').selectable({
            autoRefresh: false,
            filter: '.token',
            cancel: 'header,select',
            stop: () => this.#setSelected(),
        })

        html.find('[data-token-id]').on('mouseenter', event => {
            const { tokenId } = event.currentTarget.dataset
            const token = this.scene.tokens.get(tokenId)?.object
            if (!token || token.controlled) return
            token._onHoverIn(event, { hoverOutOthers: true })
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

        html.find('select[name=visibility], select[name=cover]').on('change', event => {
            const target = event.currentTarget
            const property = target.name
            const defaultValue = property === 'visibility' ? 'observed' : 'none'
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

        html.find('[data-action=reset]').on('click', event => {
            this.#currentData = this.#getTokenData(true)
            this.#selected = []
            this.render()
        })

        html.find('[data-action=accept]').on('click', async event => {
            await setTokenData(this.document, this.#currentData)
            this.close()
        })
    }
}
