import {
    DARKNESS_COLOR,
    DARKNESS_SLUGS,
    MIST_COLOR,
    MIST_SLUGS,
    POISON_GREEN,
} from "./constants.js";
import { MODULE_ID, getFlag, localize } from "./module.js";
import { highlightGrid } from "./pf2e/highlight.js";

const templateConversion = {
    burst: "circle",
    cone: "cone",
    cube: "rect",
    cylinder: "circle",
    emanation: "circle",
    line: "ray",
    square: "rect",
};

export function createTemplate({ type, distance, traits, fillColor, width, flags }) {
    const templateData = {
        t: templateConversion[type],
        distance,
        fillColor: fillColor || game.user.color,
        flags: {
            [MODULE_ID]: flags,
        },
    };

    switch (templateData.t) {
        case "ray":
            templateData.width =
                Number(width) ||
                CONFIG.MeasuredTemplate.defaults.width * canvas.dimensions.distance;
            break;
        case "cone":
            templateData.angle = CONFIG.MeasuredTemplate.defaults.angle;
            break;
        case "rect": {
            const distance = templateData.distance ?? 0;
            templateData.distance = Math.hypot(distance, distance);
            templateData.width = distance;
            templateData.direction = 45;
            break;
        }
    }

    if (traits) foundry.utils.setProperty(templateData, "flags.pf2e.origin.traits", traits);

    canvas.templates.createPreview(templateData);
}

export function createSeekTemplate({ type = "burst", token, distance }) {
    if (!checkScene(token)) return;

    distance ??= type === "cone" ? 30 : 15;

    createTemplate({
        type,
        distance,
        traits: ["concentrate", "secret"],
        flags: {
            type: "seek",
            tokenId: token.id,
            collisionType: "sight",
            collisionOrigin: token.center,
        },
    });
}

export function createDarknessTemplate({ type = "burst", distance = 20, conceal = false } = {}) {
    createTemplate({
        type,
        distance,
        fillColor: DARKNESS_COLOR,
        flags: {
            type: "darkness",
            conceal,
        },
    });
}

export function createMistTemplate({ type = "burst", distance = 20 } = {}) {
    createTemplate({
        type,
        distance,
        fillColor: MIST_COLOR,
        flags: {
            type: "mist",
        },
    });
}

function getTemplates(type, token) {
    if (token && !checkScene(token)) return null;
    return canvas.scene.templates.filter((t) => getFlag(t, "type") === type) ?? [];
}

export function getDarknessTemplates(token) {
    return getTemplates("darkness", token);
}

export function getMistTemplates(token) {
    return getTemplates("mist", token);
}

export function getSeekTemplateTokens(token) {
    if (!checkScene(token)) return null;

    const template = canvas.scene.templates.find((t) => getFlag(t, "type") === "seek");
    if (!template) return null;

    const tokenDoc = token instanceof Token ? token.document : token;

    return getTemplateTokens(template, {
        collisionType: "sight",
        collisionOrigin: tokenDoc.center,
    });
}

export async function deleteSeekTemplate(token) {
    const templates = token.scene.templates.filter(
        (t) => getFlag(t, "type") === "seek" && getFlag(t, "tokenId") === token.id
    );
    for (const template of templates) {
        await template.delete();
    }
}

function checkScene(token) {
    if (canvas.scene === token.scene) return true;
    ui.notifications.error(localize("template.scene"));
    return false;
}

export function getTemplateTokens(
    measuredTemplate,
    { collisionOrigin, collisionType = "move" } = {}
) {
    const grid = canvas.interface.grid;
    const dimensions = canvas.dimensions;
    const template =
        measuredTemplate instanceof MeasuredTemplateDocument
            ? measuredTemplate.object
            : measuredTemplate;
    if (!canvas.scene || !template?.highlightId || !grid || !dimensions) return [];

    const gridHighlight = grid.getHighlightLayer(template.highlightId);
    if (!gridHighlight || canvas.grid.type !== CONST.GRID_TYPES.SQUARE) return [];

    const gridSize = canvas.grid.size;
    const containedTokens = [];
    const origin = collisionOrigin ?? template.center;
    const tokens = canvas.tokens.quadtree.getObjects(gridHighlight.getLocalBounds(undefined, true));

    for (const token of tokens) {
        const tokenDoc = token.document;
        const tokenPositions = [];

        for (let h = 0; h < tokenDoc.height; h++) {
            const tokenX = Math.floor(token.x / gridSize) * gridSize;
            const tokenY = Math.floor(token.y / gridSize) * gridSize;
            const y = tokenY + h * gridSize;

            tokenPositions.push(`${tokenX},${y}`);

            if (tokenDoc.width > 1) {
                for (let w = 1; w < tokenDoc.width; w++) {
                    tokenPositions.push(`${tokenX + w * gridSize},${y}`);
                }
            }
        }

        for (const position of tokenPositions) {
            if (!gridHighlight.positions.has(position)) {
                continue;
            }

            const [gx, gy] = position.split(",").map((s) => Number(s));
            const destination = {
                x: gx + dimensions.size * 0.5,
                y: gy + dimensions.size * 0.5,
            };
            if (destination.x < 0 || destination.y < 0) continue;

            const hasCollision = CONFIG.Canvas.polygonBackends[collisionType].testCollision(
                origin,
                destination,
                {
                    type: collisionType,
                    mode: "any",
                }
            );

            if (!hasCollision) {
                containedTokens.push(token);
                break;
            }
        }
    }

    return containedTokens;
}

export function highlightTemplateGrid() {
    const isCircleOrCone = ["circle", "cone"].includes(this.document.t);
    const hasSquareGrid = canvas.grid.type === CONST.GRID_TYPES.SQUARE;
    if (!isCircleOrCone || !hasSquareGrid) {
        return MeasuredTemplate.prototype.highlightGrid.call(this);
    }

    // Refrain from highlighting if not visible
    if (!this.isVisible) {
        canvas.interface.grid.getHighlightLayer(this.highlightId)?.clear();
        return;
    }

    const collisionType = getFlag(this.document, "collisionType");
    const collisionOrigin = getFlag(this.document, "collisionOrigin");

    highlightGrid({
        areaShape: this.areaShape,
        object: this,
        document: this.document,
        colors: {
            border: Number(this.document.borderColor),
            fill: Number(this.document.fillColor),
        },
        preview: true,
        // added stuff
        collisionType,
        collisionOrigin,
    });
}

export function preCreateMeasuredTemplate(template) {
    const { type, slug, castLevel = 0 } = template.getFlag("pf2e", "origin") ?? {};
    if (type !== "spell") return;

    if (DARKNESS_SLUGS.includes(slug)) {
        template.updateSource({
            fillColor: DARKNESS_COLOR,
            [`flags.${MODULE_ID}`]: { type: "darkness", conceal: castLevel >= 4 },
        });
    } else if (MIST_SLUGS.includes(slug)) {
        template.updateSource({
            fillColor: MIST_COLOR,
            [`flags.${MODULE_ID}`]: { type: "mist" },
        });
    } else if (slug === "cloudkill") {
        template.updateSource({
            fillColor: POISON_GREEN,
            [`flags.${MODULE_ID}`]: { type: "mist" },
        });
    }
}

export function onMeasuredTemplate(template) {
    if (getFlag(template, "type") === "darkness")
        canvas.perception.update({ initializeVision: true });
}
