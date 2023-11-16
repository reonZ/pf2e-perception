const WEAPON_PROPERTY_RUNES = {
    ancestralEchoing: {
        level: 15,
        name: 'PF2E.WeaponPropertyRune.ancestralEchoing.Name',
        price: 9500,
        rarity: 'rare',
        slug: 'ancestralEchoing',
        traits: ['dwarf', 'magical', 'saggorak'],
    },
    anchoring: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.anchoring.Name',
                    text: 'PF2E.WeaponPropertyRune.anchoring.Note.criticalSuccess',
                },
            ],
        },
        level: 10,
        name: 'PF2E.WeaponPropertyRune.anchoring.Name',
        price: 900,
        rarity: 'uncommon',
        slug: 'anchoring',
        traits: ['magical'],
    },
    ashen: {
        damage: {
            dice: [
                {
                    damageType: 'fire',
                    category: 'persistent',
                    diceNumber: 1,
                    dieSize: 'd4',
                },
            ],
            notes: [
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.ashen.Name',
                    text: 'PF2E.WeaponPropertyRune.ashen.Note.success',
                },
            ],
        },
        level: 9,
        name: 'PF2E.WeaponPropertyRune.ashen.Name',
        price: 700,
        rarity: 'common',
        slug: 'ashen',
        traits: ['magical'],
    },
    authorized: {
        level: 3,
        name: 'PF2E.WeaponPropertyRune.authorized.Name',
        price: 50,
        rarity: 'common',
        slug: 'authorized',
        traits: ['magical'],
    },
    bane: {
        level: 4,
        name: 'PF2E.WeaponPropertyRune.bane.Name',
        price: 100,
        rarity: 'uncommon',
        slug: 'bane',
        traits: ['magical'],
    },
    bloodbane: {
        level: 8,
        name: 'PF2E.WeaponPropertyRune.bloodbane.Name',
        price: 475,
        rarity: 'uncommon',
        slug: 'bloodbane',
        traits: ['dwarf', 'magical'],
    },
    bloodthirsty: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.bloodbane.Name',
                    text: 'PF2E.WeaponPropertyRune.bloodthirsty.Note.criticalSuccess',
                },
            ],
        },
        level: 16,
        name: 'PF2E.WeaponPropertyRune.bloodthirsty.Name',
        price: 8500,
        rarity: 'uncommon',
        slug: 'bloodthirsty',
        traits: ['magical'],
    },
    brilliant: {
        damage: {
            dice: [
                { damageType: 'fire', diceNumber: 1, dieSize: 'd4' },
                {
                    damageType: 'spirit',
                    diceNumber: 1,
                    dieSize: 'd4',
                    predicate: ['target:trait:fiend'],
                },
                {
                    damageType: 'vitality',
                    diceNumber: 1,
                    dieSize: 'd4',
                    predicate: ['target:mode:undead'],
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.brilliant.Name',
                    text: 'PF2E.WeaponPropertyRune.brilliant.Note.criticalSuccess',
                },
            ],
        },
        level: 12,
        name: 'PF2E.WeaponPropertyRune.brilliant.Name',
        price: 2000,
        rarity: 'common',
        slug: 'brilliant',
        traits: ['magical'],
    },
    called: {
        level: 7,
        name: 'PF2E.WeaponPropertyRune.called.Name',
        price: 350,
        rarity: 'common',
        slug: 'called',
        traits: ['magical'],
    },
    coating: {
        level: 9,
        name: 'PF2E.WeaponPropertyRune.coating.Name',
        price: 700,
        rarity: 'common',
        slug: 'coating',
        traits: ['extradimensional', 'magical'],
    },
    conducting: {
        level: 7,
        name: 'PF2E.WeaponPropertyRune.conducting.Name',
        price: 300,
        rarity: 'common',
        slug: 'conducting',
        traits: ['magical'],
    },
    corrosive: {
        damage: {
            dice: [{ damageType: 'acid', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.corrosive.Name',
                    text: 'PF2E.WeaponPropertyRune.corrosive.Note.criticalSuccess',
                },
            ],
        },
        level: 8,
        name: 'PF2E.WeaponPropertyRune.corrosive.Name',
        price: 500,
        rarity: 'common',
        slug: 'corrosive',
        traits: ['acid', 'magical'],
    },
    crushing: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.crushing.Name',
                    text: 'PF2E.WeaponPropertyRune.crushing.Note.criticalSuccess',
                },
            ],
        },
        level: 3,
        name: 'PF2E.WeaponPropertyRune.crushing.Name',
        price: 50,
        rarity: 'uncommon',
        slug: 'crushing',
        traits: ['magical'],
    },
    cunning: {
        level: 5,
        name: 'PF2E.WeaponPropertyRune.cunning.Name',
        price: 140,
        rarity: 'common',
        slug: 'cunning',
        traits: ['magical'],
    },
    dancing: {
        level: 13,
        name: 'PF2E.WeaponPropertyRune.dancing.Name',
        price: 2700,
        rarity: 'uncommon',
        slug: 'dancing',
        traits: ['magical'],
    },
    deathdrinking: {
        damage: {
            dice: [
                {
                    slug: 'deathdrinking-negative',
                    damageType: 'void',
                    diceNumber: 1,
                    dieSize: 'd6',
                    critical: true,
                    predicate: ['target:mode:living', { not: 'target:negative-healing' }],
                },
                {
                    slug: 'deathdrinking-positive',
                    damageType: 'vitality',
                    diceNumber: 1,
                    dieSize: 'd6',
                    critical: true,
                    predicate: ['target:negative-healing'],
                },
            ],
        },
        level: 7,
        name: 'PF2E.WeaponPropertyRune.deathdrinking.Name',
        price: 360,
        rarity: 'rare',
        slug: 'deathdrinking',
        traits: ['magical'],
    },
    demolishing: {
        damage: {
            dice: [
                {
                    damageType: 'force',
                    category: 'persistent',
                    diceNumber: 1,
                    dieSize: 'd6',
                    predicate: ['target:trait:construct'],
                },
            ],
        },
        level: 6,
        name: 'PF2E.WeaponPropertyRune.demolishing.Name',
        price: 225,
        rarity: 'rare',
        slug: 'demolishing',
        traits: ['magical'],
    },
    disrupting: {
        damage: {
            dice: [
                {
                    damageType: 'vitality',
                    diceNumber: 1,
                    dieSize: 'd6',
                    predicate: ['target:mode:undead'],
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.disrupting.Name',
                    text: 'PF2E.WeaponPropertyRune.disrupting.Note.criticalSuccess',
                    predicate: ['target:mode:undead'],
                },
            ],
        },
        level: 5,
        name: 'PF2E.WeaponPropertyRune.disrupting.Name',
        price: 150,
        rarity: 'common',
        slug: 'disrupting',
        traits: ['magical'],
    },
    earthbinding: {
        level: 5,
        name: 'PF2E.WeaponPropertyRune.earthbinding.Name',
        price: 125,
        rarity: 'common',
        slug: 'earthbinding',
        traits: ['magical'],
    },
    energizing: {
        level: 6,
        name: 'PF2E.WeaponPropertyRune.energizing.Name',
        price: 250,
        rarity: 'uncommon',
        slug: 'energizing',
        traits: ['magical'],
    },
    extending: {
        level: 7,
        name: 'PF2E.WeaponPropertyRune.extending.Name',
        price: 700,
        rarity: 'common',
        slug: 'extending',
        traits: ['magical'],
    },
    fanged: {
        level: 2,
        name: 'PF2E.WeaponPropertyRune.fanged.Name',
        price: 30,
        rarity: 'uncommon',
        slug: 'fanged',
        traits: ['magical'],
    },
    fearsome: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.fearsome.Name',
                    text: 'PF2E.WeaponPropertyRune.fearsome.Note.criticalSuccess',
                },
            ],
        },
        level: 5,
        name: 'PF2E.WeaponPropertyRune.fearsome.Name',
        price: 160,
        rarity: 'common',
        slug: 'fearsome',
        traits: ['emotion', 'fear', 'magical', 'mental'],
    },
    flaming: {
        damage: {
            dice: [
                { damageType: 'fire', diceNumber: 1, dieSize: 'd6' },
                {
                    damageType: 'fire',
                    category: 'persistent',
                    diceNumber: 1,
                    dieSize: 'd10',
                    critical: true,
                },
            ],
        },
        level: 8,
        name: 'PF2E.WeaponPropertyRune.flaming.Name',
        price: 500,
        rarity: 'common',
        slug: 'flaming',
        traits: ['fire', 'magical'],
    },
    flurrying: {
        level: 7,
        name: 'PF2E.WeaponPropertyRune.flurrying.Name',
        price: 360,
        rarity: 'common',
        slug: 'flurrying',
        traits: ['magical'],
    },
    frost: {
        damage: {
            dice: [{ damageType: 'cold', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.frost.Name',
                    text: 'PF2E.WeaponPropertyRune.frost.Note.criticalSuccess',
                },
            ],
        },
        level: 8,
        name: 'PF2E.WeaponPropertyRune.frost.Name',
        price: 500,
        rarity: 'common',
        slug: 'frost',
        traits: ['cold', 'magical'],
    },
    ghostTouch: {
        level: 4,
        name: 'PF2E.WeaponPropertyRune.ghostTouch.Name',
        price: 75,
        rarity: 'common',
        slug: 'ghostTouch',
        traits: ['magical'],
    },
    giantKilling: {
        damage: {
            dice: [
                {
                    slug: 'giantKilling',
                    damageType: 'mental',
                    diceNumber: 1,
                    dieSize: 'd6',
                    predicate: ['target:trait:giant'],
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['target:trait:giant'],
                    title: 'PF2E.WeaponPropertyRune.giantKilling.Name',
                    text: 'PF2E.WeaponPropertyRune.giantKilling.Note.criticalSuccess',
                },
            ],
        },
        level: 8,
        name: 'PF2E.WeaponPropertyRune.giantKilling.Name',
        price: 450,
        rarity: 'rare',
        slug: 'giantKilling',
        traits: ['magical'],
    },
    greaterAnchoring: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterAnchoring.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterAnchoring.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterAnchoring.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterAnchoring.Note.success',
                },
            ],
        },
        level: 18,
        name: 'PF2E.WeaponPropertyRune.greaterAnchoring.Name',
        price: 22_000,
        rarity: 'uncommon',
        slug: 'greaterAnchoring',
        traits: ['magical'],
    },
    greaterAshen: {
        damage: {
            dice: [
                {
                    damageType: 'fire',
                    category: 'persistent',
                    diceNumber: 1,
                    dieSize: 'd8',
                },
            ],
            notes: [
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterAshen.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterAshen.Note.success',
                },
            ],
        },
        level: 16,
        name: 'PF2E.WeaponPropertyRune.greaterAshen.Name',
        price: 9000,
        rarity: 'common',
        slug: 'greaterAshen',
        traits: ['magical'],
    },
    greaterBloodbane: {
        level: 13,
        name: 'PF2E.WeaponPropertyRune.greaterBloodbane.Name',
        price: 2800,
        rarity: 'uncommon',
        slug: 'greaterBloodbane',
        traits: ['dwarf', 'magical'],
    },
    greaterBrilliant: {
        damage: {
            dice: [
                { damageType: 'fire', diceNumber: 1, dieSize: 'd4' },
                {
                    diceNumber: 1,
                    dieSize: 'd4',
                    predicate: ['target:trait:fiend'],
                },
                {
                    damageType: 'vitality',
                    diceNumber: 1,
                    dieSize: 'd4',
                    predicate: ['target:mode:undead'],
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterBrilliant.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterBrilliant.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterBrilliant.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterBrilliant.Note.success',
                },
            ],
            ignoredResistances: [
                { type: 'fire', max: null },
                { type: 'good', max: null },
                { type: 'vitality', max: null },
            ],
        },
        level: 18,
        name: 'PF2E.WeaponPropertyRune.greaterBrilliant.Name',
        price: 24_000,
        rarity: 'common',
        slug: 'greaterBrilliant',
        traits: ['magical'],
    },
    greaterCorrosive: {
        damage: {
            dice: [{ damageType: 'acid', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterCorrosive.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterCorrosive.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterCorrosive.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterCorrosive.Note.success',
                },
            ],
        },
        level: 15,
        name: 'PF2E.WeaponPropertyRune.greaterCorrosive.Name',
        price: 6500,
        rarity: 'common',
        slug: 'greaterCorrosive',
        traits: ['acid', 'magical'],
    },
    greaterCrushing: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterCrushing.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterCrushing.Note.criticalSuccess',
                },
            ],
        },
        level: 9,
        name: 'PF2E.WeaponPropertyRune.greaterCrushing.Name',
        price: 650,
        rarity: 'uncommon',
        slug: 'greaterCrushing',
        traits: ['magical'],
    },
    greaterDisrupting: {
        damage: {
            dice: [
                {
                    damageType: 'vitality',
                    diceNumber: 2,
                    dieSize: 'd6',
                    predicate: ['target:mode:undead'],
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterDisrupting.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterDisrupting.Note.criticalSuccess',
                    predicate: ['target:mode:undead'],
                },
            ],
        },
        level: 14,
        name: 'PF2E.WeaponPropertyRune.greaterDisrupting.Name',
        price: 4300,
        rarity: 'uncommon',
        slug: 'greaterDisrupting',
        traits: ['magical'],
    },
    greaterExtending: {
        level: 13,
        name: 'PF2E.WeaponPropertyRune.greaterExtending.Name',
        price: 3000,
        rarity: 'common',
        slug: 'greaterExtending',
        traits: ['magical'],
    },
    greaterFanged: {
        level: 8,
        name: 'PF2E.WeaponPropertyRune.greaterFanged.Name',
        price: 425,
        rarity: 'uncommon',
        slug: 'greaterFanged',
        traits: ['magical'],
    },
    greaterFearsome: {
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterFearsome.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterFearsome.Note.criticalSuccess',
                },
            ],
        },
        level: 12,
        name: 'PF2E.WeaponPropertyRune.greaterFearsome.Name',
        price: 2000,
        rarity: 'common',
        slug: 'greaterFearsome',
        traits: ['emotion', 'fear', 'magical', 'mental'],
    },
    greaterFlaming: {
        damage: {
            dice: [
                { damageType: 'fire', diceNumber: 1, dieSize: 'd6' },
                {
                    damageType: 'fire',
                    category: 'persistent',
                    diceNumber: 2,
                    dieSize: 'd10',
                    critical: true,
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterFlaming.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterFlaming.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterFlaming.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterFlaming.Note.success',
                },
            ],
            ignoredResistances: [{ type: 'fire', max: null }],
        },
        level: 15,
        name: 'PF2E.WeaponPropertyRune.greaterFlaming.Name',
        price: 6500,
        rarity: 'common',
        slug: 'greaterFlaming',
        traits: ['fire', 'magical'],
    },
    greaterFrost: {
        damage: {
            dice: [{ damageType: 'cold', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterFrost.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterFrost.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterFrost.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterFrost.Note.success',
                },
            ],
            ignoredResistances: [{ type: 'cold', max: null }],
        },
        level: 15,
        name: 'PF2E.WeaponPropertyRune.greaterFrost.Name',
        price: 6500,
        rarity: 'common',
        slug: 'greaterFrost',
        traits: ['cold', 'magical'],
    },
    greaterGiantKilling: {
        damage: {
            dice: [
                {
                    slug: 'greaterGiantKilling',
                    damageType: 'mental',
                    diceNumber: 2,
                    dieSize: 'd6',
                    predicate: ['target:trait:giant'],
                },
            ],
            ignoredResistances: [{ type: 'mental', max: null }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['target:trait:giant'],
                    title: 'PF2E.WeaponPropertyRune.greaterGiantKilling.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterGiantKilling.Note.criticalSuccess',
                },
            ],
        },
        level: 15,
        name: 'PF2E.WeaponPropertyRune.greaterGiantKilling.Name',
        price: 6000,
        rarity: 'rare',
        slug: 'greaterGiantKilling',
        traits: ['magical'],
    },
    greaterHauling: {
        level: 11,
        name: 'PF2E.WeaponPropertyRune.greaterHauling.Name',
        price: 1300,
        rarity: 'uncommon',
        slug: 'greaterHauling',
        traits: ['magical'],
    },
    greaterImpactful: {
        damage: {
            dice: [{ damageType: 'force', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterImpactful.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterImpactful.Note.criticalSuccess',
                },
            ],
        },
        level: 17,
        name: 'PF2E.WeaponPropertyRune.greaterImpactful.Name',
        price: 15_000,
        rarity: 'common',
        slug: 'greaterImpactful',
        traits: ['force', 'magical'],
    },
    greaterRooting: {
        level: 11,
        name: 'PF2E.WeaponPropertyRune.greaterRooting.Name',
        price: 1400,
        rarity: 'common',
        slug: 'greaterRooting',
        traits: ['plant', 'magical', 'wood'],
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterRooting.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterRooting.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterRooting.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterRooting.Note.success',
                },
            ],
        },
    },
    greaterShock: {
        damage: {
            dice: [{ damageType: 'electricity', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterShock.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterShock.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterShock.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterShock.Note.success',
                },
            ],
            ignoredResistances: [{ type: 'electricity', max: null }],
        },
        level: 15,
        name: 'PF2E.WeaponPropertyRune.greaterShock.Name',
        price: 6500,
        rarity: 'common',
        slug: 'greaterShock',
        traits: ['electricity', 'magical'],
    },
    greaterThundering: {
        damage: {
            dice: [{ damageType: 'sonic', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.greaterThundering.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterThundering.Note.criticalSuccess',
                },
                {
                    outcome: ['success'],
                    title: 'PF2E.WeaponPropertyRune.greaterThundering.Name',
                    text: 'PF2E.WeaponPropertyRune.greaterThundering.Note.success',
                },
            ],
            ignoredResistances: [{ type: 'sonic', max: null }],
        },
        level: 15,
        name: 'PF2E.WeaponPropertyRune.greaterThundering.Name',
        price: 6500,
        rarity: 'common',
        slug: 'greaterThundering',
        traits: ['magical', 'sonic'],
    },
    grievous: {
        damage: {
            dice: [
                {
                    damageType: 'bleed',
                    diceNumber: 1,
                    dieSize: 'd6',
                    critical: true,
                    predicate: ['critical-specialization', 'item:group:dart'],
                },
            ],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:axe'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Axe',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:brawling'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Brawling',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:club'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Club',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:flail'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Flail',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:hammer'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Hammer',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:knife'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Knife',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:polearm'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Polearm',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:shield'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Shield',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:sling'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Sling',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:spear'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Spear',
                },
                {
                    outcome: ['criticalSuccess'],
                    predicate: ['item:group:sword'],
                    title: 'PF2E.WeaponPropertyRune.grievous.Name',
                    text: 'PF2E.WeaponPropertyRune.grievous.Note.Sword',
                },
            ],
            adjustments: [
                {
                    slug: 'critical-specialization',
                    test: options => new PredicatePF2e('item:group:pick').test(options),
                    getNewValue: current => current * 2,
                },
            ],
        },
        level: 9,
        name: 'PF2E.WeaponPropertyRune.grievous.Name',
        price: 700,
        rarity: 'common',
        slug: 'grievous',
        traits: ['magical'],
    },
    hauling: {
        level: 6,
        name: 'PF2E.WeaponPropertyRune.hauling.Name',
        price: 225,
        rarity: 'uncommon',
        slug: 'hauling',
        traits: ['magical'],
    },
    holy: {
        level: 11,
        name: 'PF2E.WeaponPropertyRune.holy.Name',
        price: 1400,
        rarity: 'common',
        slug: 'holy',
        traits: ['holy', 'magical'],
        damage: {
            dice: [
                {
                    damageType: 'spirit',
                    diceNumber: 1,
                    dieSize: 'd4',
                    predicate: [{ not: 'target:trait:unholy' }],
                },
                {
                    damageType: 'spirit',
                    diceNumber: 2,
                    dieSize: 'd4',
                    predicate: ['target:trait:unholy'],
                },
            ],
        },
        strikeAdjustments: [
            {
                adjustTraits: (_weapon, traits) => {
                    if (!traits.includes('holy')) traits.push('holy')
                },
            },
        ],
    },
    hopeful: {
        attack: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.hopeful.Name',
                    text: 'PF2E.WeaponPropertyRune.hopeful.Note.criticalSuccess',
                },
            ],
        },
        level: 11,
        name: 'PF2E.WeaponPropertyRune.hopeful.Name',
        price: 1200,
        rarity: 'uncommon',
        slug: 'hopeful',
        traits: ['magical'],
    },
    hooked: {
        level: 5,
        name: 'PF2E.WeaponPropertyRune.hooked.Name',
        price: 140,
        rarity: 'rare',
        slug: 'hooked',
        traits: ['magical'],
        strikeAdjustments: [
            {
                adjustWeapon: weapon => {
                    if (!weapon.system.traits.value.includes('trip')) {
                        weapon.system.traits.value.push('trip')
                    }
                },
            },
        ],
    },
    impactful: {
        damage: {
            dice: [{ damageType: 'force', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.impactful.Name',
                    text: 'PF2E.WeaponPropertyRune.impactful.Note.criticalSuccess',
                },
            ],
        },
        level: 10,
        name: 'PF2E.WeaponPropertyRune.impactful.Name',
        price: 1000,
        rarity: 'common',
        slug: 'impactful',
        traits: ['force', 'magical'],
    },
    impossible: {
        level: 20,
        name: 'PF2E.WeaponPropertyRune.impossible.Name',
        price: 70_000,
        rarity: 'common',
        slug: 'impossible',
        traits: ['magical'],
        strikeAdjustments: [
            {
                // Double the base range increment
                adjustWeapon: weapon => {
                    if (weapon.isOfType('weapon') && weapon.system.range && weapon._source.system.range) {
                        const sourceRange = weapon._source.system.range
                        const preparedRange = weapon.system.range
                        weapon.system.range = sourceRange * 2 + Math.abs(preparedRange - sourceRange)
                    }
                },
            },
        ],
    },
    keen: {
        attack: {},
        level: 13,
        name: 'PF2E.WeaponPropertyRune.keen.Name',
        price: 3000,
        rarity: 'uncommon',
        slug: 'keen',
        traits: ['magical'],
    },
    kinWarding: {
        level: 3,
        name: 'PF2E.WeaponPropertyRune.kinWarding.Name',
        price: 52,
        rarity: 'uncommon',
        slug: 'kinWarding',
        traits: ['dwarf', 'magical'],
    },
    majorFanged: {
        level: 15,
        name: 'PF2E.WeaponPropertyRune.majorFanged.Name',
        price: 6000,
        rarity: 'uncommon',
        slug: 'majorFanged',
        traits: ['magical'],
    },
    majorRooting: {
        level: 15,
        name: 'PF2E.WeaponPropertyRune.majorRooting.Name',
        price: 6500,
        rarity: 'common',
        slug: 'majorRooting',
        traits: ['plant', 'magical', 'wood'],
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.majorRooting.Name',
                    text: 'PF2E.WeaponPropertyRune.majorRooting.Note.criticalSuccess',
                },
            ],
        },
    },
    merciful: {
        strikeAdjustments: [
            {
                adjustWeapon: weapon => {
                    if (!weapon.system.traits.value.includes('nonlethal')) {
                        weapon.system.traits.value.push('nonlethal')
                    }
                },
            },
        ],
        level: 4,
        name: 'PF2E.WeaponPropertyRune.merciful.Name',
        price: 70,
        rarity: 'common',
        slug: 'merciful',
        traits: ['magical', 'mental'],
    },
    pacifying: {
        level: 5,
        name: 'PF2E.WeaponPropertyRune.pacifying.Name',
        price: 150,
        rarity: 'uncommon',
        slug: 'pacifying',
        traits: ['magical'],
    },
    returning: {
        attack: {
            notes: [{ title: 'PF2E.WeaponPropertyRune.returning.Name', text: 'PF2E.WeaponPropertyRune.returning.Note' }],
        },
        level: 3,
        name: 'PF2E.WeaponPropertyRune.returning.Name',
        price: 55,
        rarity: 'common',
        slug: 'returning',
        traits: ['magical'],
    },
    rooting: {
        level: 7,
        name: 'PF2E.WeaponPropertyRune.rooting.Name',
        price: 360,
        rarity: 'common',
        slug: 'rooting',
        traits: ['plant', 'magical', 'wood'],
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.rooting.Name',
                    text: 'PF2E.WeaponPropertyRune.rooting.Note.criticalSuccess',
                },
            ],
        },
    },
    serrating: {
        damage: {
            dice: [{ damageType: 'slashing', diceNumber: 1, dieSize: 'd4' }],
        },
        level: 10,
        name: 'PF2E.WeaponPropertyRune.serrating.Name',
        price: 1000,
        rarity: 'uncommon',
        slug: 'serrating',
        traits: ['magical'],
    },
    shifting: {
        level: 6,
        name: 'PF2E.WeaponPropertyRune.shifting.Name',
        price: 225,
        rarity: 'common',
        slug: 'shifting',
        traits: ['magical'],
    },
    shock: {
        damage: {
            dice: [{ damageType: 'electricity', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.shock.Name',
                    text: 'PF2E.WeaponPropertyRune.shock.Note.criticalSuccess',
                },
            ],
        },
        level: 8,
        name: 'PF2E.WeaponPropertyRune.shock.Name',
        price: 500,
        rarity: 'common',
        slug: 'shock',
        traits: ['electricity', 'magical'],
    },
    speed: {
        level: 16,
        name: 'PF2E.WeaponPropertyRune.speed.Name',
        price: 10_000,
        rarity: 'rare',
        slug: 'speed',
        traits: ['magical'],
    },
    spellStoring: {
        level: 13,
        name: 'PF2E.WeaponPropertyRune.spellStoring.Name',
        price: 2700,
        rarity: 'uncommon',
        slug: 'spellStoring',
        traits: ['magical'],
    },
    swarming: {
        level: 9,
        name: 'PF2E.WeaponPropertyRune.swarming.Name',
        price: 700,
        rarity: 'common',
        slug: 'swarming',
        traits: ['magical'],
    },
    thundering: {
        damage: {
            dice: [{ damageType: 'sonic', diceNumber: 1, dieSize: 'd6' }],
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.thundering.Name',
                    text: 'PF2E.WeaponPropertyRune.thundering.Note.criticalSuccess',
                },
            ],
        },
        level: 8,
        name: 'PF2E.WeaponPropertyRune.thundering.Name',
        price: 500,
        rarity: 'common',
        slug: 'thundering',
        traits: ['magical', 'sonic'],
    },
    trueRooting: {
        level: 19,
        name: 'PF2E.WeaponPropertyRune.trueRooting.Name',
        price: 40_000,
        rarity: 'common',
        slug: 'trueRooting',
        traits: ['plant', 'magical', 'wood'],
        damage: {
            notes: [
                {
                    outcome: ['criticalSuccess'],
                    title: 'PF2E.WeaponPropertyRune.trueRooting.Name',
                    text: 'PF2E.WeaponPropertyRune.trueRooting.Note.criticalSuccess',
                },
            ],
        },
    },
    underwater: {
        level: 3,
        name: 'PF2E.WeaponPropertyRune.underwater.Name',
        price: 50,
        rarity: 'common',
        slug: 'underwater',
        traits: ['magical', 'water'],
    },
    unholy: {
        level: 11,
        name: 'PF2E.WeaponPropertyRune.unholy.Name',
        price: 1400,
        rarity: 'common',
        slug: 'unholy',
        traits: ['unholy', 'magical'],
        damage: {
            dice: [
                {
                    damageType: 'spirit',
                    diceNumber: 1,
                    dieSize: 'd4',
                    predicate: [{ not: 'target:trait:holy' }],
                },
                {
                    damageType: 'spirit',
                    diceNumber: 2,
                    dieSize: 'd4',
                    predicate: ['target:trait:holy'],
                },
            ],
        },
        strikeAdjustments: [
            {
                adjustTraits: (_weapon, traits) => {
                    if (!traits.includes('unholy')) traits.push('unholy')
                },
            },
        ],
    },
    vorpal: {
        level: 17,
        name: 'PF2E.WeaponPropertyRune.vorpal.Name',
        price: 15_000,
        rarity: 'rare',
        slug: 'vorpal',
        traits: ['magical'],
    },
    wounding: {
        damage: {
            dice: [{ damageType: 'bleed', diceNumber: 1, dieSize: 'd6' }],
        },
        level: 7,
        name: 'PF2E.WeaponPropertyRune.wounding.Name',
        price: 340,
        rarity: 'common',
        slug: 'wounding',
        traits: ['magical'],
    },
}

export function getPropertyRuneStrikeAdjustments(runes) {
    return runes.flatMap(r => WEAPON_PROPERTY_RUNES[r].strikeAdjustments ?? [])
}
