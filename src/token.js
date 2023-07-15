import { PerceptionMenu } from './apps/perception.js'
import { VISIBILITY_VALUES, defaultValues } from './constants.js'
import { lineIntersectRect, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { isConcealed } from './lighting.js'
import { MODULE_ID, getFlag, getSetting, unsetFlag } from './module.js'
import { getStandardSetting, getValidTokens } from './scene.js'

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
    const data = getFlag(token, path.join('.'))
    return getFlag(token, path.join('.'))
}

export async function clearTokenData(token) {
    token = token instanceof Token ? token.document : token
    return unsetFlag(token, 'data')
}

export async function setTokenData(token, data) {
    const valid = getValidTokens(token).map(t => t.id)
    const updates = {}

    for (const tokenId in data) {
        if (!valid.includes(tokenId)) {
            delete data[tokenId]
            continue
        }

        const current = data[tokenId]
        const original = getTokenData(token, tokenId) ?? {}

        if (current.visibility === defaultValues.visibility) delete current.visibility
        if (current.cover === defaultValues.cover) delete current.cover

        if (original.cover === current.cover && original.visibility === current.visibility) continue

        if (!current.visibility && !current.cover) {
            updates[`flags.${MODULE_ID}.data.-=${tokenId}`] = true
        } else {
            for (const property of ['cover', 'visibility']) {
                if (original[property] === current[property]) continue
                if (!current[property]) updates[`flags.${MODULE_ID}.data.${tokenId}.-=${property}`] = true
                else updates[`flags.${MODULE_ID}.data.${tokenId}.${property}`] = current[property]
            }
        }
    }

    token = token instanceof Token ? token.document : token
    return token.update(updates)
}

export function hasStandardCover(origin, target) {
    const scene = origin.scene
    if (!getStandardSetting(scene)) return false

    const standard = getSetting('standard-type')
    if (standard === 'center') return lineIntersectWall(origin.center, target.center)
    else if (standard === 'points') return pointToTokenIntersectWall(origin.center, target)
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

export function getVisibility(origin, target, checkConcealed = false) {
    const systemVisibility = (() => {
        const originActor = origin.actor
        const visibilities = ['unnoticed', 'undetected', 'hidden']
        if (checkConcealed) visibilities.push('concealed')

        for (const visibility of visibilities) {
            if (originActor.hasCondition(visibility)) return visibility
        }
    })()

    const visibility = getTokenData(origin, target.id, 'visibility')
    const mergedVisibility = VISIBILITY_VALUES[systemVisibility] > VISIBILITY_VALUES[visibility] ? systemVisibility : visibility

    if (checkConcealed && VISIBILITY_VALUES[mergedVisibility] < VISIBILITY_VALUES.concealed && !target.actor.hasLowLightVision) {
        const concealed = isConcealed(origin)
        if (concealed) return 'concealed'
    }

    return mergedVisibility
}

export function updateToken(token, data, context, userId) {
    const flags = data.flags?.['pf2e-perception']
    if (flags && (flags.data || flags['-=data'] !== undefined)) {
        token.object.renderFlags.set({ refreshVisibility: true })
    }
}
