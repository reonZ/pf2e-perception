import { COVER_VALUES, VISIBILITY_VALUES } from "../constants";
import { createCoverSource, createFlatFootedSource } from "../effect";
import { R } from "../remeda";
import { getPerception, perceptionRules } from "../rule-element";
import { getCover, getVisibility } from "../token";
import { asNumberOnly } from "../utils";
import { extractEphemeralEffects, getRangeIncrement, isOffGuardFromFlanking } from "./helpers";
import { getPropertyRuneStrikeAdjustments } from "./rune";

export async function getRollContext(params) {
    const [selfToken, targetToken] =
        canvas.ready && !params.viewOnly
            ? [
                  canvas.tokens.controlled.find((t) => t.actor === this) ??
                      this.getActiveTokens().shift() ??
                      null,
                  params.target?.token ?? params.target?.actor?.getActiveTokens().shift() ?? null,
              ]
            : [null, null];

    const isAttackAction = ["attack", "attack-roll", "attack-damage"].some((d) =>
        params.domains.includes(d)
    );
    const isMelee = !!(
        params.melee ||
        (params.item?.isOfType("weapon", "melee") && params.item.isMelee)
    );
    const reach =
        isMelee && params.item?.isOfType("action", "weapon", "melee")
            ? this.getReach({ action: "attack", weapon: params.item })
            : this.getReach({ action: "attack" });
    const isFlankingAttack = !!(
        isAttackAction &&
        isMelee &&
        typeof reach === "number" &&
        targetToken?.actor &&
        selfToken?.isFlanking(targetToken, { reach })
    );

    // Get ephemeral effects from the target that affect this actor while attacking
    const originEphemeralEffects = await extractEphemeralEffects({
        affects: "origin",
        origin: this,
        target: params.target?.actor ?? targetToken?.actor ?? null,
        item: params.item ?? null,
        domains: params.domains,
        options: [...params.options, ...(params.item?.getRollOptions("item") ?? [])],
    });

    const targetMarkOption = (() => {
        const tokenMark = targetToken
            ? this.synthetics.tokenMarks.get(targetToken.document.uuid)
            : null;
        return tokenMark ? `target:mark:${tokenMark}` : null;
    })();
    const initialActionOptions = params.traits?.map((t) => `self:action:trait:${t}`) ?? [];

    const selfActor =
        params.viewOnly || !targetToken?.actor
            ? this
            : this.getContextualClone(
                  R.compact([
                      ...Array.from(params.options),
                      ...targetToken.actor.getSelfRollOptions("target"),
                      targetMarkOption,
                      ...initialActionOptions,
                      isFlankingAttack ? "self:flanking" : null,
                  ]),
                  originEphemeralEffects
              );

    const isStrike = params.statistic instanceof game.pf2e.StatisticModifier;
    const strikeActions = isStrike
        ? selfActor.system.actions?.flatMap((a) => [a, a.altUsages ?? []].flat()) ?? []
        : [];

    const statistic = params.viewOnly
        ? params.statistic
        : isStrike
        ? strikeActions.find((action) => {
              // Find the matching weapon or melee item
              if (params.item?.id !== action.item.id || params?.item.name !== action.item.name)
                  return false;
              if (params.item.isOfType("melee") && action.item.isOfType("melee")) return true;

              // Discriminate between melee/thrown usages by checking that both are either melee or ranged
              return (
                  params.item.isOfType("weapon") &&
                  action.item.isOfType("weapon") &&
                  params.item.isMelee === action.item.isMelee
              );
          }) ?? params.statistic
        : params.statistic;

    const selfItem = (() => {
        // 1. Simplest case: no context clone, so used the item passed to this method
        if (selfActor === this) return params.item ?? null;

        // 2. Get the item from the statistic if it's stored therein
        if (
            statistic &&
            "item" in statistic &&
            statistic.item instanceof Item &&
            statistic.item.isOfType("action", "melee", "spell", "weapon")
        ) {
            return statistic.item;
        }

        // 3. Get the item directly from the context clone
        const itemClone = selfActor.items.get(params.item?.id ?? "");
        if (itemClone?.isOfType("melee", "weapon")) return itemClone;

        // 4 Give up :(
        return params.item ?? null;
    })();

    const itemOptions = selfItem?.getRollOptions("item") ?? [];

    const actionTraits = (() => {
        const traits = R.compact([params.traits].flat());
        if (selfItem?.isOfType("weapon", "melee")) {
            const strikeAdjustments = [
                selfActor.synthetics.strikeAdjustments,
                getPropertyRuneStrikeAdjustments(selfItem.system.runes.property),
            ].flat();
            for (const adjustment of strikeAdjustments) {
                adjustment.adjustTraits?.(selfItem, traits);
            }
        }

        return R.uniq(traits).sort();
    })();

    // Calculate distance and range increment, set as a roll option
    const distance = selfToken && targetToken ? selfToken.distanceTo(targetToken) : null;
    const [originDistance, targetDistance] =
        typeof distance === "number"
            ? [`origin:distance:${distance}`, `target:distance:${distance}`]
            : [null, null];

    const originMarkOption = (() => {
        const tokenMark = selfToken
            ? targetToken?.actor?.synthetics.tokenMarks.get(selfToken.document.uuid)
            : null;
        return tokenMark ? `origin:mark:${tokenMark}` : null;
    })();
    const originRollOptions =
        selfToken && targetToken
            ? R.compact(
                  R.uniq([
                      ...selfActor.getSelfRollOptions("origin"),
                      ...actionTraits.map((t) => `origin:action:trait${t}`),
                      ...(originDistance ? [originDistance] : []),
                      originMarkOption,
                  ])
              )
            : [];

    // Target roll options
    const getTargetRollOptions = (actor) => {
        const targetOptions = actor?.getSelfRollOptions("target") ?? [];
        if (targetToken) {
            targetOptions.push("target"); // An indicator that there is a target of any kind
            if (targetMarkOption) targetOptions.push(targetMarkOption);
        }
        return targetOptions.sort();
    };
    const targetRollOptions = getTargetRollOptions(targetToken?.actor);

    // Get ephemeral effects from this actor that affect the target while being attacked
    const targetEphemeralEffects = await extractEphemeralEffects({
        affects: "target",
        origin: selfActor,
        target: targetToken?.actor ?? null,
        item: selfItem,
        domains: params.domains,
        options: [...params.options, ...itemOptions, ...targetRollOptions],
    });

    /**
     * WE ADDED STUFF HERE
     */
    if (selfToken?.actor && targetToken?.actor && !params.viewOnly) {
        const perception = perceptionRules(selfToken, targetToken, {
            extraOptions: itemOptions,
            distance,
        });

        let visibility = getVisibility(selfToken, targetToken, { perception, affects: "origin" });

        if (visibility && getPerception(perception, "target", "visibility", "noff", visibility)) {
            visibility = undefined;
        }

        if (VISIBILITY_VALUES[visibility] > VISIBILITY_VALUES.concealed)
            targetEphemeralEffects.push(createFlatFootedSource(visibility));

        let cover = getCover(selfToken, targetToken, {
            perception,
            affects: "target",
            options: itemOptions,
        });
        let coverBonus = undefined;

        if (cover) {
            let ac = getPerception(perception, "target", "cover", "ac", cover)?.first();
            if (ac != null) ac = Math.clamped(asNumberOnly(ac), 0, 4);
            if (ac === 0) cover = undefined;
            else if (ac) coverBonus = ac;
        }

        if (COVER_VALUES[cover] > COVER_VALUES.none)
            targetEphemeralEffects.push(createCoverSource(cover, coverBonus));
    }
    /**
     * END OF THE ADDED STUFF
     */

    // Add an epehemeral effect from flanking
    if (
        isFlankingAttack &&
        isOffGuardFromFlanking(targetToken.actor, selfActor, originRollOptions)
    ) {
        const name = game.i18n.localize("PF2E.Item.Condition.Flanked");
        const condition = game.pf2e.ConditionManager.getCondition("off-guard", { name });
        targetEphemeralEffects.push(condition.toObject());
    }

    // Clone the actor to recalculate its AC with contextual roll options
    const targetActor = params.viewOnly
        ? null
        : (params.target?.actor ?? targetToken?.actor)?.getContextualClone(
              R.compact([...params.options, ...itemOptions, ...originRollOptions]),
              targetEphemeralEffects
          ) ?? null;

    const rollOptions = new Set(
        R.compact([
            ...params.options,
            ...selfActor.getRollOptions(params.domains),
            ...(targetActor ? getTargetRollOptions(targetActor) : targetRollOptions),
            ...actionTraits.map((t) => `self:action:trait:${t}`),
            ...itemOptions,
            // Backward compatibility for predication looking for an "attack" trait by its lonesome
            isAttackAction ? "attack" : null,
        ]).sort()
    );

    if (targetDistance) rollOptions.add(targetDistance);
    const rangeIncrement = selfItem ? getRangeIncrement(selfItem, distance) : null;
    if (rangeIncrement) rollOptions.add(`target:range-increment:${rangeIncrement}`);

    const self = {
        actor: selfActor,
        token: selfToken?.document ?? null,
        statistic,
        item: selfItem,
        modifiers: [],
    };

    const target =
        targetActor && targetToken && distance !== null
            ? { actor: targetActor, token: targetToken.document, distance, rangeIncrement }
            : null;

    return {
        options: rollOptions,
        self,
        target,
        traits: actionTraits,
    };
}
