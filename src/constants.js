export const COVER_UUID = 'Compendium.pf2e.other-effects.Item.I9lfZUiCwMiGogVi'
export const BLIND_FIGHT_UUID = 'Compendium.pf2e.feats-srd.Item.y2XeMe1F18lIyo59'

export const VISIBILITY_VALUES = {
    [undefined]: 0,
    observed: 0,
    concealed: 1,
    hidden: 2,
    undetected: 3,
    unnoticed: 4,
}

export const VISIBILITIES = ['observed', 'concealed', 'hidden', 'undetected', 'unnoticed']

export const COVERS = ['none', 'lesser', 'standard', 'greater', 'greater-prone']

export const COVER_VALUES = {
    [undefined]: 0,
    none: 0,
    lesser: 1,
    standard: 2,
    greater: 3,
    'greater-prone': 4,
}

export const defaultValues = {
    cover: 'none',
    visibility: 'observed',
}

export const attackCheckRoll = ['attack-roll', 'spell-attack-roll']

export const validCheckRoll = [...attackCheckRoll, 'skill-check', 'perception-check']

export const skipConditional = {
    cover: 'conditional:cover:skip',
}

export const ICONS_PATHS = {
    cover: 'modules/pf2e-perception/images/cover.webp',
    concealed: 'systems/pf2e/icons/conditions/concealed.webp',
    hidden: 'systems/pf2e/icons/conditions/hidden.webp',
    undetected: 'systems/pf2e/icons/conditions/undetected.webp',
    unnoticed: 'systems/pf2e/icons/conditions/unnoticed.webp',
}
