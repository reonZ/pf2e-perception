import { PerceptionMenu } from './apps/perception-menu.js'
import { VISIBILITY_VALUES, defaultValues } from './constants.js'
import { lineIntersectRect, lineIntersectWall, pointToTokenPointsIntersectWall } from './geometry.js'
import { MODULE_ID, getFlag, getSetting, getStandardSetting, unsetFlag } from './module.js'
import { getValidTokens } from './scene.js'

export function renderTokenHUD(hud, html) {
    if (!hud.object.actor?.isOfType('creature')) return
    html.find('.col.left').append(`<div class="control-icon" data-action="pf2e-perception"><i class="fa-solid fa-eye"></i></div>`)
    html.find('[data-action=pf2e-perception]').on('click', event => PerceptionMenu.openMenu({ token: hud.object }))
}

export function pasteToken(originals, sources) {
    for (const source of sources) {
        delete source.flags?.[MODULE_ID]
    }
}

export function getTokenData(token, ...path) {
    path.unshift('data')
    token = token instanceof Token ? token.document : token
    return getFlag(token, path.join('.'))
}

export async function clearTokenData(token) {
    token = token instanceof Token ? token.document : token
    return unsetFlag(token, 'data')
}

export async function setTokenData(token, data) {
    const valid = getValidTokens(token).map(t => t.id)

    for (const tokenId in data) {
        if (!valid.includes(tokenId)) {
            delete data[tokenId]
            continue
        }
        const token = data[tokenId]
        if (token.visibility === defaultValues.visibility) delete token.visibility
        if (token.cover === defaultValues.cover) delete token.cover
        if (!token.visibility && !token.cover) delete data[tokenId]
    }

    token = token instanceof Token ? token.document : token

    if (isEmpty(data)) return clearTokenData(token)
    else return token.update({ [`flags.${MODULE_ID}.data`]: data }, { diff: false, recursive: false })
}

export function hasStandardCover(origin, target) {
    const scene = origin.scene
    if (!getStandardSetting(scene)) return false

    const standard = getSetting('standard-type')
    if (standard === 'center') return lineIntersectWall(origin.center, target.center)
    else if (standard === 'points') return pointToTokenPointsIntersectWall(origin.center, target, 2)
    // else return allTokenCornersToPointIntersectWall(origin, target.center)
}

export function hasLesserCover(originToken, targetToken) {
    if (!getSetting('lesser')) return false

    const origin = originToken.center
    const target = targetToken.center

    for (const tokenDocument of originToken.scene.tokens) {
        const token = tokenDocument.object
        if (token === originToken || token === targetToken) continue
        if (lineIntersectRect(origin, target, token.bounds)) return true
    }

    return false
}

export function getVisibility(origin, target) {
    const systemVisibility = (() => {
        const originActor = origin.actor
        for (const visibility of ['unnoticed', 'undetected', 'hidden', 'concealed']) {
            if (originActor.hasCondition(visibility)) return visibility
        }
    })()
    const visibility = getTokenData(origin, target.id, 'visibility')
    return VISIBILITY_VALUES[systemVisibility] > VISIBILITY_VALUES[visibility] ? systemVisibility : visibility
}

export function updateToken(token, data) {
    const flags = data.flags?.['pf2e-perception']
    if (!flags) return
    if (flags.data || flags['-=data'] !== undefined) token.object.renderFlags.set({ refreshVisibility: true })
}
