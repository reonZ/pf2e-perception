import { getCoverEffect, hasGreaterDarkvision, isProne } from './actor.js'
import { PerceptionMenu } from './apps/perception.js'
import { COVER_VALUES, ICONS_PATHS, VISIBILITY_VALUES, defaultValues } from './constants.js'
import { clearDebug, drawDebugLine, getRectEdges, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { getLightExposure } from './lighting.js'
import { MODULE_ID, getFlag, getSetting, hasPermission, unsetFlag } from './module.js'
import { optionsToObject, updateFromOptions } from './options.js'
import { getSceneSetting, getValidTokens } from './scene.js'
import { getDarknessTemplates, getMistTemplates, getTemplateTokens } from './template.js'

export function renderTokenHUD(hud, html) {
    if (!hasPermission() || !hud.object.actor?.isOfType('creature')) return
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

    return false
}

const SIZES = {
    tiny: 0,
    sm: 1,
    med: 2,
    lg: 3,
    huge: 4,
    grg: 5,
}

export function getCreatureCover(originToken, targetToken, options = {}, debug = false) {
    const setting = getSetting('lesser')
    if (setting === 'none') return undefined

    originToken = originToken instanceof Token ? originToken.document : originToken
    targetToken = targetToken instanceof Token ? targetToken.document : targetToken

    options = optionsToObject(options)

    const ignoreIds = (() => {
        const originIds = options.origin?.cover?.ignore ?? []
        const targetIds = options.target?.cover?.ignore ?? []
        return new Set([...originIds, ...targetIds])
    })()

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

    const tokens = originToken.scene.tokens.contents
        .filter(t => t.actor && !t.hidden && t !== originToken && t !== targetToken && !ignoreIds.has(t.id))
        .sort((a, b) => SIZES[b.actor.size] - SIZES[a.actor.size])

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
        const edges = getRectEdges(token.bounds, margin)

        if (intersectsWith(edges)) return extralarges ? 'standard' : 'lesser'
        else if (isExtraLarge(tokenDocument)) extralarges--
    }

    return cover
}

export function getVisibility(origin, target, options = {}, affects = 'origin', debug = false) {
    origin = origin instanceof Token ? origin : origin.object
    target = target instanceof Token ? target : target.object

    const originActor = origin.actor
    const targetActor = target.actor

    let systemVisibility = (() => {
        const visibilities = ['unnoticed', 'undetected', 'hidden', 'concealed']

        for (const visibility of visibilities) {
            if (originActor.hasCondition(visibility)) return visibility
        }
    })()

    // if (originActor.hasCondition('invisible')) {
    //     const seeinvis = testOption('all', options, 'visibility', 'seeinvis')
    //     if (seeinvis) systemVisibility = 'concealed'
    //     else if (VISIBILITY_VALUES[systemVisibility] < VISIBILITY_VALUES.hidden) systemVisibility = 'hidden'
    // }

    const returnValue = value => {
        value = updateFromOptions(value, options, 'visibility', affects)
        if (VISIBILITY_VALUES[value] >= VISIBILITY_VALUES.hidden || !originActor.hasCondition('invisible')) return value

        return value
    }

    const visibility = getTokenData(origin, target.id, 'visibility')
    let mergedVisibility = VISIBILITY_VALUES[systemVisibility] > VISIBILITY_VALUES[visibility] ? systemVisibility : visibility

    if (VISIBILITY_VALUES[mergedVisibility] >= VISIBILITY_VALUES.hidden) return returnValue(mergedVisibility)

    const targetLowlight = targetActor?.hasLowLightVision
    const targetDarkvision = targetActor?.hasDarkvision
    const targetGreaterDarkvision = targetActor && hasGreaterDarkvision(targetActor)
    if (targetGreaterDarkvision && mergedVisibility === 'concealed') return returnValue(mergedVisibility)

    let inDarkness
    if (!targetGreaterDarkvision) {
        const darknessTemplates = getDarknessTemplates(origin)
        if (darknessTemplates?.length) {
            let darknessVisibility

            for (const template of darknessTemplates) {
                const darknessTokens = getTemplateTokens(template)
                if (!darknessTokens.length) continue

                const inTemplate = darknessTokens.includes(origin) || darknessTokens.includes(target)
                if (inTemplate) inDarkness = true
                else continue

                if (!targetDarkvision) return returnValue('hidden')

                const templateConceals = getFlag(template, 'conceal')
                if (templateConceals) darknessVisibility = 'concealed'
            }

            if (darknessVisibility === 'concealed') mergedVisibility = 'concealed'
            if (inDarkness && mergedVisibility === 'concealed') return returnValue(mergedVisibility)
        }
    }

    if (mergedVisibility !== 'concealed') {
        const mistTemplates = getMistTemplates(origin)
        if (mistTemplates?.length) {
            for (const template of mistTemplates) {
                const mistTokens = getTemplateTokens(template)
                if (!mistTokens.length) continue

                const inTemplate = mistTokens.includes(origin) || mistTokens.includes(target)
                if (inTemplate) return returnValue('concealed')
            }
        }
    }

    if (inDarkness || targetGreaterDarkvision) return returnValue(mergedVisibility)

    const exposure = getLightExposure(origin, debug)
    let exposedVisibility = exposure === 'dim' ? 'concealed' : exposure === null ? 'hidden' : undefined
    if (exposedVisibility === 'concealed' && targetLowlight) exposedVisibility = undefined
    else if (exposedVisibility === 'hidden' && targetDarkvision) exposedVisibility = undefined

    if (VISIBILITY_VALUES[exposedVisibility] > VISIBILITY_VALUES[mergedVisibility]) mergedVisibility = exposedVisibility
    return returnValue(mergedVisibility)
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
    if (!origin.visible || !origin.actor?.isOfType('creature')) return

    let data = getTokenData(origin, target.id)
    if (isEmpty(data)) return

    if (!game.user.isGM && !target.document.hasPlayerOwner && VISIBILITY_VALUES[data.visibility] >= VISIBILITY_VALUES.hidden) {
        if (!data.cover) return
        data = { cover: data.cover }
    }

    const scale = origin.worldTransform.a
    const coords = canvas.clientCoordinatesFromCanvas(origin.document._source)

    let content = `<div class="pf2e-conditionals" data-hover-id="${origin.id}" data-token-id="${target.id}" `
    content += `style="top: ${coords.y}px; left: ${coords.x + (origin.hitArea.width * scale) / 2}px;">`

    const savedPaths = getSetting('icon-path')
    Object.entries(data).map(([property, value]) => {
        const icon = property === 'cover' ? 'cover' : value
        let path = savedPaths[icon] || ICONS_PATHS[icon]
        if (path.startsWith('systems') || path.startsWith('modules')) path = `../../../${path}`
        content += `<div class="conditional"><img src="${path}"></img></div>`
    })

    content += '</div>'

    $(document.body).append(content)
}

export function getCover(origin, target, options = {}, affects, debug = false) {
    options = optionsToObject(options)

    const ranged = options.isRanged
    const prone = ranged ? isProne(target.actor) : false

    const returnValue = value => {
        return updateFromOptions(value, options, 'cover', affects)
    }

    let systemCover = getCoverEffect(target.actor, true)
    if (prone && COVER_VALUES[systemCover] > COVER_VALUES.lesser) return returnValue('greater-prone')
    if (!prone && systemCover === 'greater-prone') systemCover = undefined

    let cover = getTokenData(target, origin.id, 'cover')
    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser) return returnValue('greater-prone')
    if (!prone && cover === 'greater-prone') cover = undefined

    if (
        COVER_VALUES[cover] < COVER_VALUES.standard &&
        COVER_VALUES[systemCover] < COVER_VALUES.standard &&
        hasStandardCover(origin, target, debug)
    ) {
        cover = 'standard'
    } else if (!cover && !systemCover && origin.distanceTo(target) > 5) {
        cover = getCreatureCover(origin, target, options, debug)
    }

    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser) return returnValue('greater-prone')

    return returnValue(COVER_VALUES[cover] > COVER_VALUES[systemCover] ? cover : undefined)
}

export function rulesBasedVision() {
    return !!(this.sight.enabled && this.actor?.isOfType('creature') && this.scene?.rulesBasedVision)
}

export function preCreateToken(token) {
    if (!getSceneSetting(token.scene, 'npc-vision')) return
    if (!token.actor?.isOfType('npc')) return
    token.updateSource({ 'sight.enabled': true })
}
