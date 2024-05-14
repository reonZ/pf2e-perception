import { VISIBILITY_VALUES } from "./constants.js";
import { perceptionRules } from "./rule-element.js";
import { getVisibility } from "./token.js";

export function detectionModeTestVisibility(visionSource, mode, config = {}) {
    if (!mode.enabled) return false;
    if (!this._canDetect(visionSource, config.object, config)) return false;
    return config.tests.some((test) => this._testPoint(visionSource, mode, config.object, test));
}

export function basicSightCanDetect(visionSource, target, config) {
    if (target instanceof PlaceableObject && target.document.hidden) return false;
    if (!(target instanceof Token)) return true;

    const origin = visionSource.object;
    const originDocument = origin.document;
    if (
        originDocument instanceof TokenDocument &&
        originDocument.hasStatusEffect(CONFIG.specialStatusEffects.BLIND)
    )
        return false;

    if (!(origin instanceof Token)) {
        return (
            !target.document?.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE) &&
            !target.actor?.hasCondition("hidden", "undetected", "unnoticed")
        );
    }

    return !reachesThreshold(origin, target, VISIBILITY_VALUES.hidden, config);
}

export function hearingCanDetect(visionSource, target, config) {
    if (target.document.hidden || !(target instanceof Token) || !target.actor?.emitsSound)
        return false;
    if (!game.settings.get("pf2e", "automation.rulesBasedVision")) return true;

    const origin = visionSource.object;
    if (origin.actor?.hasCondition("deafened")) return false;

    if (!(origin instanceof Token)) {
        return !target.actor?.hasCondition("undetected", "unnoticed");
    }

    return !reachesThreshold(origin, target, VISIBILITY_VALUES.undetected, config);
}

export function feelTremorCanDetect(visionSource, target, config) {
    if (
        target.document.hidden ||
        !(target instanceof Token) ||
        target.document.elevation > canvas.primary.background.elevation ||
        target.actor?.isOfType("loot")
    )
        return false;

    const origin = visionSource.object;
    if (!(origin instanceof Token)) {
        return !target.actor?.hasCondition("undetected", "unnoticed");
    }

    return !reachesThreshold(origin, target, VISIBILITY_VALUES.undetected, config);
}

function reachesThreshold(origin, target, threshold, config = {}) {
    if (!config.visibility) {
        const perception = perceptionRules(origin, target);
        config.visibility = getVisibility(target, origin, { perception, affects: "target" });
    }

    return VISIBILITY_VALUES[config.visibility] >= threshold;
}
