import { COVER_UUID, COVER_VALUES } from './constants.js'
import { localize } from './module.js'

export function createFlatFootedSource(visibility) {
    const name = game.i18n.localize(`PF2E.condition.${visibility}.name`)
    const condition = game.pf2e.ConditionManager.getCondition('flat-footed', { name })
    return condition.toObject()
}

export function createCoverSource(cover) {
    const bonus = COVER_VALUES[cover]

    return {
        _id: 'I9lfZUiCwMiGogVi',
        img: 'systems/pf2e/icons/conditions-2/status_acup.webp',
        name: localize('cover', cover),
        system: {
            description: {
                gm: '',
                value: "<p>When you're behind an obstacle that could block weapons, guard you against explosions, and make you harder to detect, you're behind cover. Standard cover gives you a +2 circumstance bonus to AC, to Reflex saves against area effects, and to Stealth checks to Hide, Sneak, or otherwise avoid detection. You can increase this to greater cover using the Take Cover basic action, increasing the circumstance bonus to +4. If cover is especially light, typically when it's provided by a creature, you have lesser cover, which grants a +1 circumstance bonus to AC. A creature with standard cover or greater cover can attempt to use Stealth to Hide, but lesser cover isn't sufficient.</p>",
            },
            rules: [
                { domain: 'all', key: 'RollOption', option: `self:cover-bonus:${bonus}` },
                { domain: 'all', key: 'RollOption', option: `self:cover-level:${cover}` },
                {
                    key: 'FlatModifier',
                    predicate: [
                        { or: [{ and: ['self:condition:prone', 'item:ranged'] }, { not: 'self:cover-level:greater-prone' }] },
                    ],
                    selector: 'ac',
                    type: 'circumstance',
                    value: bonus,
                },
                {
                    key: 'FlatModifier',
                    predicate: ['area-effect', { not: 'self:cover-level:greater-prone' }],
                    selector: 'reflex',
                    type: 'circumstance',
                    value: bonus,
                },
                {
                    key: 'FlatModifier',
                    predicate: [
                        { or: ['action:hide', 'action:sneak', 'avoid-detection'] },
                        { not: 'self:cover-level:greater-prone' },
                    ],
                    selector: 'stealth',
                    type: 'circumstance',
                    value: bonus,
                },
                {
                    key: 'FlatModifier',
                    predicate: ['action:avoid-notice', { not: 'self:cover-level:greater-prone' }],
                    selector: 'initiative',
                    type: 'circumstance',
                    value: bonus,
                },
            ],
            slug: 'effect-cover',
        },
        type: 'effect',
        flags: { core: { sourceId: COVER_UUID } },
    }
}

export function findChoiceSetRule(item, flag = undefined) {
    if (!item) return undefined
    return item.system.rules.find(rule => rule.key === 'ChoiceSet' && (!flag || rule.flag === flag))
}
