import { VISIBILITY_VALUES } from "./constants.js";
import { perceptionRules } from "./rule-element.js";
import { getVisibility } from "./token.js";

export function detectionModeTestVisibility(visionSource, mode, config = {}) {
    if (!mode.enabled) return false;
    if (!this._canDetect(visionSource, config.object, config)) return false;
    return config.tests.some((test) => this._testPoint(visionSource, mode, config.object, test));
}

export function canDetect(threshold) {
    return function (wrapped, visionSource, target, config) {
        const canDetect = wrapped(visionSource, target);
        if (canDetect === false) return false;

        const origin = visionSource.object;
        const reachedThreshold = reachesThreshold(origin, target, threshold, config);

        return !reachedThreshold;
    };
}

function reachesThreshold(origin, target, threshold, config = {}) {
    if (!origin.actor || !target.actor) return false;

    if (!config.visibility) {
        const perception = perceptionRules(origin, target);
        config.visibility = getVisibility(target, origin, { perception, affects: "target" });
    }

    return VISIBILITY_VALUES[config.visibility] >= threshold;
}
