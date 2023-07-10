import { getStandardSetting, localize } from './module.js'

export function renderSceneConfig(config, html) {
    const tab = html.find('.tab[data-tab="basic"]')
    const checked = getStandardSetting(config.object)

    tab.find('hr').first().after(`<div class="form-group">
    <label>${localize('settings.standard.name')}</label>
    <input type="checkbox" name="flags.pf2e-perception.standard" ${checked ? 'checked' : ''}>
    <p class="notes">${localize('settings.standard.short')}</p>
</div><hr>`)

    config.setPosition()
}

export function getValidTokens(token) {
    token = token instanceof Token ? token.document : token
    if (!(token instanceof TokenDocument)) return []
    return token.scene.tokens.filter(t => t !== token && t.actor?.isOfType('creature'))
}

export function validateTokens(token, tokens) {
    const valid = getValidTokens(token).map(t => t.id)
    return tokens.filter(t => {
        const id = t instanceof Token || t instanceof TokenDocument ? t.id : t
        return valid.includes(id)
    })
}
