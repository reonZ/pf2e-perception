import { getFlag, getSetting, localize } from "./module.js";

export function renderSceneConfig(config, html) {
    let settings = "";

    const list = ["standard", "npc-vision"];
    for (const setting of list) {
        const checked = getSceneSetting(config.object, setting);

        settings += `<div class="form-group pf2e-perception-injected">
    <label>${localize(`settings.${setting}.name`)}</label>
    <input type="checkbox" name="flags.pf2e-perception.${setting}" ${checked ? "checked" : ""}>
    <p class="notes">${localize(`settings.${setting}.short`)}</p>
</div>`;
    }

    settings += "<hr>";

    html.find('.tab[data-tab="basic"] hr').first().after(settings);

    const addedHeight = html
        .find(".pf2e-perception-injected")
        .toArray()
        .reduce((height, el) => ((height += el.clientHeight), height), 0);

    config.setPosition({ top: config.position.top - addedHeight / 2 });
}

export function getValidTokens(token) {
    token = token instanceof Token ? token.document : token;
    if (!(token instanceof TokenDocument)) return [];

    let tokens = token.scene.tokens.filter((t) => t !== token && t.actor?.isOfType("creature"));

    if (getSetting("encounter")) {
        const combat = game.combats.active;
        if (!combat) return tokens;

        return tokens.filter((t) => {
            const actor = t.actor;
            const traits = actor.traits;
            return (
                actor.type === "familiar" ||
                traits.has("minion") ||
                traits.has("eidolon") ||
                combat.getCombatantByToken(t.id)
            );
        });
    }

    return tokens;
}

export function validateTokens(token, tokens) {
    const validToken = getValidTokens(token).map((t) => t.id);
    return tokens.filter((t) => {
        const id = t instanceof Token || t instanceof TokenDocument ? t.id : t;
        return validToken.includes(id);
    });
}

export function getSceneSetting(scene, setting) {
    return getFlag(scene, setting) ?? getSetting(setting);
}
