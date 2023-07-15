import { MODULE_ID, getFlag, localize } from './module.js'

const templateConversion = {
    burst: 'circle',
    emanation: 'circle',
    line: 'ray',
    cone: 'cone',
    rect: 'rect',
}

export function createSeekTemplate(type, token) {
    createTemplate({
        type,
        token,
        distance: type === 'cone' ? 30 : 15,
        traits: ['concentrate', 'secret'],
    })
}

export function getTokenTemplate(token) {
    return token.scene.templates.find(t => getFlag(t, 'tokenId') === token.id)
}

export function getTokenTemplateTokens(token) {
    if (!checkScene(token)) return null

    const template = getTokenTemplate(token)
    if (!template) return null

    return getTokens(template.object)
}

export async function deleteTokenTemplate(token) {
    const templates = token.scene.templates.filter(t => getFlag(t, 'tokenId') === token.id)
    for (const template of templates) {
        await template.delete()
    }
}

function checkScene(token) {
    if (canvas.scene === token.scene) return true
    ui.notifications.error(localize('template.scene'))
    return false
}

function createTemplate({ type, distance, traits, fillColor, width, token }) {
    if (!checkScene(token)) return

    const templateData = {
        distance,
        t: templateConversion[type],
        fillColor: fillColor || game.user.color,
        flags: {
            [MODULE_ID]: {
                tokenId: token.id,
            },
        },
    }

    if (templateData.t === 'ray') {
        templateData.width = width || CONFIG.MeasuredTemplate.defaults.width * (canvas.dimensions?.distance ?? 1)
    } else if (templateData.t === 'cone') {
        templateData.angle = CONFIG.MeasuredTemplate.defaults.angle
    }

    if (traits) setProperty(templateData, 'flags.pf2e.origin.traits', traits)

    const templateDoc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene })
    new CONFIG.MeasuredTemplate.objectClass(templateDoc).drawPreview()
}

// TODO remove once it is in the system
function getTokens(template, { collisionOrigin, collisionType = 'move' } = {}) {
    if (!canvas.scene) return []
    const { grid, dimensions } = canvas
    if (!(grid && dimensions)) return []

    const gridHighlight = grid.getHighlightLayer(template.highlightId)
    if (!gridHighlight || grid.type !== CONST.GRID_TYPES.SQUARE) return []
    const origin = collisionOrigin ?? template.center

    // Get all the tokens that are inside the highlight bounds
    const tokens = canvas.tokens.quadtree.getObjects(gridHighlight.getLocalBounds(undefined, true))

    const containedTokens = []
    for (const token of tokens) {
        const tokenDoc = token.document

        // Collect the position of all grid squares that this token occupies as "x.y"
        const tokenPositions = []
        for (let h = 0; h < tokenDoc.height; h++) {
            const y = token.y + h * grid.size
            tokenPositions.push(`${token.x}.${y}`)
            if (tokenDoc.width > 1) {
                for (let w = 1; w < tokenDoc.width; w++) {
                    tokenPositions.push(`${token.x + w * grid.size}.${y}`)
                }
            }
        }

        for (const position of tokenPositions) {
            // Check if a position exists within this GridHiglight
            if (!gridHighlight.positions.has(position)) {
                continue
            }
            // Position of cell's top-left corner, in pixels
            const [gx, gy] = position.split('.').map(s => Number(s))
            // Position of cell's center in pixels
            const destination = {
                x: gx + dimensions.size * 0.5,
                y: gy + dimensions.size * 0.5,
            }
            if (destination.x < 0 || destination.y < 0) continue

            const hasCollision =
                canvas.ready &&
                collisionType &&
                CONFIG.Canvas.polygonBackends[collisionType].testCollision(origin, destination, {
                    type: collisionType,
                    mode: 'any',
                })

            if (!hasCollision) {
                containedTokens.push(token)
                break
            }
        }
    }
    return containedTokens
}
