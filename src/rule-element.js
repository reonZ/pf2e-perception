import { COVERS, VISIBILITIES } from "./constants.js";

const DATA = {
    cover: {
        cancel: { targets: ["lesser", "standard", "greater", "greater-prone"] },
        set: {
            targets: ["none", "lesser", "standard", "greater", "greater-prone"],
            value: ["none", "lesser", "standard", "greater", "greater-prone"],
        },
        reduce: { targets: ["lesser", "standard", "greater", "greater-prone"] },
        ignore: { targets: "string" },
        ignored: { targets: ["allies", "enemies"] },
        ac: { targets: ["lesser", "standard", "greater", "greater-prone"], value: ["number"] },
    },
    visibility: {
        cancel: { targets: ["concealed", "hidden", "undetected", "unnoticed"] },
        set: {
            targets: ["observed", "concealed", "hidden", "undetected", "unnoticed"],
            value: ["observed", "concealed", "hidden", "undetected", "unnoticed"],
        },
        reduce: { targets: ["concealed", "hidden", "undetected", "unnoticed"] },
        noff: { targets: ["hidden", "undetected", "unnoticed"] },
        noinvis: {},
        dc: { targets: ["concealed", "hidden"], value: ["number", "string"] },
    },
};

const SELECTORS = {
    cover: Object.keys(DATA.cover),
    visibility: Object.keys(DATA.visibility),
    all: [...Object.keys(DATA.cover), ...Object.keys(DATA.visibility)],
};

export function setupRuleElement() {
    const rollOptionSchema = game.pf2e.RuleElements.builtin.RollOption.defineSchema();
    const PredicateField = rollOptionSchema.predicate.constructor;
    const ResolvableValueField = rollOptionSchema.value.constructor;

    class PF2ePerceptionRuleElement extends game.pf2e.RuleElement {
        constructor(source, options) {
            if (typeof source.targets === "string") source.targets = [source.targets];

            super({ priority: CONST.ACTIVE_EFFECT_MODES.CUSTOM, ...source }, options);

            const selectorType = SELECTORS[source.type];
            if (!selectorType) return;

            if (!selectorType?.includes(source.selector)) {
                this.failValidation(
                    `The type "${
                        source.type
                    }" only accepts the following selectors: ${selectorType.join(", ")}.`
                );
                return;
            }

            const selector = DATA[source.type]?.[source.selector];
            if (!selector) return;

            const selectorWarn = (msg) => {
                const { name, uuid } = this.item;
                console.warn(
                    `PF2e System | PF2ePerception rules element on item ${name} (${uuid}) simple warning: ${msg}`
                );
            };

            const targetsType = Array.isArray(selector.targets)
                ? [...selector.targets, "all"]
                : selector.targets;
            const joinedTargets = Array.isArray(targetsType) ? targetsType.join(", ") : null;

            if (!targetsType && source.targets?.length) {
                selectorWarn(
                    `The selector "${source.selector}" doesn't accept any targets property.`
                );
                return;
            }

            if (source.selector === "ignore" && !source.targets?.length) {
                const msg = `The selector "${source.selector}" requires a targets property with the ids of the tokens on the scene that should not give cover.`;
                this.failValidation(msg);
                return;
            }

            if (joinedTargets && source.targets?.some((t) => !targetsType.includes(t))) {
                const msg = `The targets property of selector "${source.selector}" only accepts the following: ${joinedTargets}.`;
                this.failValidation(msg);
                return;
            } else if (
                !joinedTargets &&
                targetsType &&
                source.targets?.some((t) => typeof t !== targetsType)
            ) {
                const msg = `The targets property of selector "${source.selector}" needs to be of type "${targetsType}".`;
                this.failValidation(msg);
                return;
            }

            if (!selector.value && source.value) {
                selectorWarn(
                    `The selector "${source.selector}" doesn't accept any value property.`
                );
                return;
            }

            if (source.selector === "set") {
                if (!selector.value.includes(source.value)) {
                    const joinedValues = selector.value.join(", ");
                    const msg = `The selector "${source.selector}" only accepts the following: ${joinedValues}.`;
                    this.failValidation(msg);
                }
            } else {
                const sourcevalueType = typeof source.value;
                if (selector.value && !selector.value.includes(sourcevalueType)) {
                    const msg = `The selector "${source.selector}" does not accept a value property of type ${sourcevalueType}.`;
                    this.failValidation(msg);
                }
            }
        }

        static defineSchema() {
            const { fields } = foundry.data;

            return {
                ...super.defineSchema(),

                type: new fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                    choices: ["visibility", "cover"],
                }),

                affects: new fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                    initial: "self",
                    choices: ["self", "other"],
                }),

                selector: new fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                }),

                targets: new fields.ArrayField(
                    new fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                        initial: undefined,
                    }),
                    {
                        required: true,
                        nullable: false,
                        initial: ["all"],
                    }
                ),

                predicate: new PredicateField({
                    required: false,
                    nullable: false,
                }),

                value: new ResolvableValueField({
                    required: false,
                    initial: undefined,
                }),
            };
        }

        test(rollOptions, password) {
            if (!password) return false;
            return super.test(rollOptions);
        }

        addToPerception(affects, perception, options) {
            if (!this.test(options, true)) return;

            const prefix =
                this.affects === "self" ? affects : affects === "origin" ? "target" : "origin";
            const root = `${prefix}.${this.type}.${this.selector}`;
            const verificator = DATA[this.type][this.selector];

            if (!verificator.targets) {
                foundry.utils.setProperty(perception, root, true);
                return;
            }

            const targets = this.targets.includes("all") ? verificator.targets : this.targets;

            if (!verificator.value) {
                for (const target of targets) {
                    const path = `${root}.${target}`;
                    foundry.utils.setProperty(perception, path, true);
                }
                return;
            }

            for (const target of targets) {
                const path = `${root}.${target}`;

                let value = foundry.utils.getProperty(perception, path);
                if (value) value.add(this.value);
                else value = new Set([this.value]);

                foundry.utils.setProperty(perception, path, value);
            }
        }
    }

    game.pf2e.RuleElements.custom.PF2ePerception = PF2ePerceptionRuleElement;
}

export function perceptionRules(origin, target, { distance, extraOptions = [] } = {}) {
    const originActor = origin.actor;
    const targetActor = target.actor;
    if (!originActor || !targetActor) return {};

    const rules = {
        origin: originActor.rules.filter((r) => !r.ignored && r.key === "PF2ePerception") ?? [],
        target: targetActor.rules.filter((r) => !r.ignored && r.key === "PF2ePerception") ?? [],
    };
    if (!rules.origin.length && !rules.target.length) return {};

    const selfOptions = {
        origin: originActor.getRollOptions(),
        target: targetActor.getRollOptions(),
    };

    const otherOptions = {
        origin: targetActor.getSelfRollOptions("target"),
        target: originActor.getSelfRollOptions("origin"),
    };

    origin = origin instanceof Token ? origin : origin.object;
    target = target instanceof Token ? target : target.object;

    distance ??= origin.distanceTo(target);
    const distances = [`origin:distance:${distance}`, `target:distance:${distance}`];

    const perception = {};

    for (const prefix of ["origin", "target"]) {
        const testOptions = [
            ...extraOptions,
            ...selfOptions[prefix],
            ...otherOptions[prefix],
            ...distances,
        ];
        for (const rule of rules[prefix]) {
            rule.addToPerception(prefix, perception, testOptions);
        }
    }

    return perception;
}

export function getIgnoredPerception(token) {
    const actor = token.actor;
    if (!actor) return [];

    const rules =
        actor.rules.filter(
            (r) =>
                !r.ignored &&
                r.key === "PF2ePerception" &&
                r.type === "cover" &&
                r.selector === "ignored"
        ) ?? [];

    return rules.flatMap((r) => r.targets);
}

export function getPerception(perception, affects, type, selector, targets) {
    let cursor = perception[affects]?.[type]?.[selector];
    return targets ? cursor?.[targets] : cursor;
}

export function updateFromPerceptionRules(perception, affects, type, value) {
    if (value === undefined) {
        value = type === "cover" ? "none" : "observed";
    }

    const list = type === "cover" ? COVERS : VISIBILITIES;

    if (value && getPerception(perception, affects, type, "cancel", value)) return undefined;

    const setValue = getPerception(perception, affects, type, "set", value)?.first();
    if (setValue && list.includes(setValue)) {
        value = setValue;
    } else if (value && getPerception(perception, affects, type, "reduce", value)) {
        const index = list.indexOf(value);
        value = list[Math.max(0, index - 1)];
    }

    return value === list[0] ? undefined : value;
}
