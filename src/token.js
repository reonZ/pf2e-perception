import { PerceptionMenu } from './apps/perception.js'
import { VISIBILITY_VALUES, defaultValues } from './constants.js'
import { clearDebug, drawDebugLine, getRectEdges, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { isConcealed } from './lighting.js'
import { MODULE_ID, getFlag, getSetting, unsetFlag } from './module.js'
import { getSceneSetting, getValidTokens } from './scene.js'

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
    const updates = {}

    for (const tokenId in data) {
        if (!valid.includes(tokenId)) {
            updates[`flags.${MODULE_ID}.data.-=${tokenId}`] = true
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

export function hasStandardCover(origin, target, debug = false) {
    const scene = origin.scene
    if (!getSceneSetting(scene, 'standard')) return false

    if (debug) clearDebug()

    const standard = getSetting('standard-type')
    if (standard === 'center') return lineIntersectWall(origin.center, target.center, debug)
    else if (standard === 'points') return pointToTokenIntersectWall(origin.center, target, debug)
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

export function getCreatureCover(originToken, targetToken, debug = false) {
    const setting = getSetting('lesser')
    if (setting === 'none') return undefined

    let cover = undefined
    const origin = originToken.center
    const target = targetToken.center

    if (debug) {
        clearDebug()
        drawDebugLine(origin, target)
    }

    const isExtraLarge = token => {
        const size = SIZES[token.actor.size]
        return size - originSize >= 2 && size - targetSize >= 2
    }

    const originSize = SIZES[originToken.actor.size]
    const targetSize = SIZES[targetToken.actor.size]

    const tokens = originToken.scene.tokens.contents.sort((a, b) => SIZES[b.actor.size] - SIZES[a.actor.size])

    let extralarges = originSize < SIZES.huge && targetSize < SIZES.huge && tokens.filter(isExtraLarge).length

    const margin = setting === 'ten' ? 0.1 : setting === 'twenty' ? 0.2 : 0

    const intersectsEdge = edge => {
        if (debug) drawDebugLine(edge.A, edge.B, 'red')
        return lineSegmentIntersects(origin, target, edge.A, edge.B)
    }
    const intersectsWith =
        setting === 'cross'
            ? edges => {
                  return (
                      (intersectsEdge(edges.top) && intersectsEdge(edges.bottom)) ||
                      (intersectsEdge(edges.left) && intersectsEdge(edges.right))
                  )
              }
            : edges => Object.values(edges).some(edge => intersectsEdge(edge))

    for (const tokenDocument of tokens) {
        const token = tokenDocument.object
        if (tokenDocument.hidden || token === originToken || token === targetToken) continue

        const edges = getRectEdges(token.bounds, margin)

        if (intersectsWith(edges)) return extralarges ? 'standard' : 'lesser'
        else if (isExtraLarge(tokenDocument)) extralarges--
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

        if (game.user.isGM) return

        const hk = Hooks.on('refreshToken', refreshed => {
            if (!token.object === refreshed) return
            Hooks.off('refreshToken', hk)
            if (game.combat?.getCombatantByToken(token.id)) ui.combat.render()
        })
    }
}

export function hoverToken(token, hovered) {
    if (hovered) showAllConditionals(token)
    else clearConditionals(token)
}

export function deleteToken(token) {
    clearConditionals(token)
    if (!game.user.isGM) ui.combat.render()
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
    const onlyGm = getSetting('show-conditions-only-gm')
    if (!origin.visible || !origin.actor.isOfType('creature') || (onlyGm && !game.user.isGM)) return

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
