import { MODULE_ID, getFlag, localize } from './module.js'
import { highlightGrid } from './pf2e/highlight.js'

const templateConversion = {
    burst: 'circle',
    emanation: 'circle',
    line: 'ray',
    cone: 'cone',
    rect: 'rect',
}

export function createSeekTemplate({ type, token, distance }) {
    if (!checkScene(token)) return

    distance ??= type === 'cone' ? 30 : 15

    createTemplate({
        type,
        distance,
        traits: ['concentrate', 'secret'],
        flags: {
            type: 'seek',
            tokenId: token.id,
            collisionType: 'sight',
        },
    })
}

export function createDarknessTemplate({ type = 'burst', distance = 20, conceal = false }) {
    createTemplate({
        type,
        distance,
        flags: {
            type: 'darkness',
            conceal,
        },
    })
}

export function getDarknessTemplates(token) {
    if (!checkScene(token)) return null
    return token.scene.templates.filter(t => getFlag(t, 'type') === 'darkness') ?? []
}

export function getSeekTemplateTokens(token) {
    if (!checkScene(token)) return null

    const template = token.scene.templates.find(t => getFlag(t, 'type') === 'seek')
    if (!template) return null

    return getTemplateTokens(template, { collisionType: 'sight' })
}

export async function deleteSeekTemplate(token) {
    const templates = token.scene.templates.filter(t => getFlag(t, 'type') === 'seek' && getFlag(t, 'tokenId') === token.id)
    for (const template of templates) {
        await template.delete()
    }
}

function checkScene(token) {
    if (canvas.scene === token.scene) return true
    ui.notifications.error(localize('template.scene'))
    return false
}

export function createTemplate({ type, distance, traits, fillColor, width, flags }) {
    const templateData = {
        distance,
        t: templateConversion[type],
        fillColor: fillColor || game.user.color,
        flags: {
            [MODULE_ID]: flags,
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
export function getTemplateTokens(template, { collisionOrigin, collisionType = 'move' } = {}) {
    template = template instanceof MeasuredTemplateDocument ? template.object : template

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

export function highlightTemplateGrid() {
    if (!['circle', 'cone'].includes(this.type) || canvas.grid.type !== CONST.GRID_TYPES.SQUARE) {
        return MeasuredTemplate.prototype.highlightGrid.call(this)
    }

    // Refrain from highlighting if not visible
    if (!this.isVisible) {
        canvas.grid.getHighlightLayer(this.highlightId)?.clear()
        return
    }

    const collisionType = getFlag(this.document, 'collisionType')

    highlightGrid({
        areaType: this.type === 'circle' ? 'burst' : 'cone',
        object: this,
        document: this.document,
        colors: { border: this.borderColor, fill: this.fillColor },
        preview: true,
        collisionType,
    })
}

export function preCreateMeasuredTemplate(template) {
    const { slug, castLevel = 0 } = template.getFlag('pf2e', 'origin') ?? {}
    if (!['darkness', 'dance-of-darkness', 'ravenous-darkness'].includes(slug)) return

    template.updateSource({
        fillColor: '#000000',
        [`flags.${MODULE_ID}`]: { type: 'darkness', conceal: castLevel >= 4 },
    })
}

export function onMeasuredTemplate(template) {
    if (getFlag(template, 'type') === 'darkness') canvas.perception.update({ initializeVision: true })
}
