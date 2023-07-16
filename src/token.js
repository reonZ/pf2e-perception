import { PerceptionMenu } from './apps/perception.js'
import { VISIBILITY_VALUES, defaultValues } from './constants.js'
import { lineIntersectRect, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { isConcealed } from './lighting.js'
import { MODULE_ID, getFlag, getSetting, templatePath, unsetFlag } from './module.js'
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

const SIZES = {
    tiny: 0,
    sm: 1,
    med: 2,
    lg: 3,
    huge: 4,
    grg: 5,
}

export function getCreatureCover(originToken, targetToken) {
    if (!getSetting('lesser')) return undefined

    let cover = undefined
    const origin = originToken.center
    const target = targetToken.center
    const originSize = SIZES[originToken.actor.size]
    const targetSize = SIZES[targetToken.actor.size]
    const tokens = originToken.scene.tokens

    const isExtraLarge = token => {
        const size = SIZES[token.actor.size]
        return size - originSize >= 2 && size - targetSize >= 2
    }
    const hasExtraLarge = originSize < SIZES.huge && targetSize < SIZES.huge && tokens.some(isExtraLarge)

    for (const tokenDocument of tokens) {
        const token = tokenDocument.object
        if (tokenDocument.hidden || token === originToken || token === targetToken) continue
        if (!lineIntersectRect(origin, target, token.bounds)) continue

        if (!hasExtraLarge) return 'lesser'
        else if (isExtraLarge(tokenDocument)) return 'standard'
        else cover = 'lesser'
    }

    return cover
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

export function hoverToken(token, hovered) {
    if (hovered) showAllConditionals(token)
    else clearConditionals(token)
}

export function deleteToken(token) {
    clearConditionals(token)
}

export function controlToken(token) {
    clearConditionals(token)
    Hooks.once('sightRefresh', () => token.hover && showAllConditionals(token))
}

export function clearConditionals(token) {
    const tokenId = token?.id
    if (!tokenId) return $('.pf2e-conditionals').remove()
    $(`.pf2e-conditionals[data-hover-id=${token.id}]`).remove()
    $(`.pf2e-conditionals[data-token-id=${token.id}]`).remove()
}

export function showAllConditionals(token) {
    const tokens = getValidTokens(token)
    for (const target of tokens) {
        showConditionals(target, token)
    }
}

export async function showConditionals(origin, target) {
    origin = origin instanceof Token ? origin : origin.object
    if (!origin.visible || !origin.actor.isOfType('creature')) return

    const data = getTokenData(origin, target.id)
    if (isEmpty(data)) return

    const scale = origin.worldTransform.a
    const coords = canvas.clientCoordinatesFromCanvas(origin.document._source)

    let content = `<div class="pf2e-conditionals" data-hover-id="${origin.id}" data-token-id="${target.id}" `
    content += `style="top: ${coords.y}px; left: ${coords.x + (origin.hitArea.width * scale) / 2}px;">`

    Object.entries(data).map(([property, value]) => {
        const img = property === 'cover' ? 'modules/pf2e-perception/images/cover' : `systems/pf2e/icons/conditions/${value}`
        content += `<div class="conditional"><img src="../../../${img}.webp"></img></div>`
    })

    content += '</div>'

    $(document.body).append(content)
}
