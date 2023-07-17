import { getFlag, getSetting, localize } from './module.js'

export function renderSceneConfig(config, html) {
    let settings = ''

    for (const setting of ['standard', 'concealed']) {
        const checked = getSceneSetting(config.object, setting)

        settings += `<div class="form-group">
    <label>${localize(`settings.${setting}.name`)}</label>
    <input type="checkbox" name="flags.pf2e-perception.${setting}" ${checked ? 'checked' : ''}>
    <p class="notes">${localize(`settings.${setting}.short`)}</p>
</div>`
    }

    settings += '<hr>'

    html.find('.tab[data-tab="basic"] hr').first().after(settings)
    config.setPosition()
}

export function getValidTokens(token) {
    token = token instanceof Token ? token.document : token
    if (!(token instanceof TokenDocument)) return []
    return token.scene.tokens.filter(t => t !== token && t.actor?.isOfType('creature'))
}

export function validateTokens(token, tokens) {
    const validToken = getValidTokens(token).map(t => t.id)
    return tokens.filter(t => {
        const id = t instanceof Token || t instanceof TokenDocument ? t.id : t
        return validToken.includes(id)
    })
}

export function getSceneSetting(scene, setting) {
    return getFlag(scene, setting) ?? getSetting(setting)
}
