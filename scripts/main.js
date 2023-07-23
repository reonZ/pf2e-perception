(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // src/constants.js
  var COVER_UUID = "Compendium.pf2e.other-effects.Item.I9lfZUiCwMiGogVi";
  var VISIBILITY_VALUES = {
    [void 0]: 0,
    observed: 0,
    concealed: 1,
    hidden: 2,
    undetected: 3,
    unnoticed: 4
  };
  var VISIBILITIES = ["observed", "concealed", "hidden", "undetected", "unnoticed"];
  var COVERS = ["none", "lesser", "standard", "greater", "greater-prone"];
  var COVER_VALUES = {
    [void 0]: 0,
    none: 0,
    lesser: 1,
    standard: 2,
    greater: 3,
    "greater-prone": 4
  };
  var defaultValues = {
    cover: "none",
    visibility: "observed"
  };
  var attackCheckRoll = ["attack-roll", "spell-attack-roll"];
  var validCheckRoll = [...attackCheckRoll, "skill-check", "perception-check"];
  var ICONS_PATHS = {
    cover: "modules/pf2e-perception/images/cover.webp",
    concealed: "systems/pf2e/icons/conditions/concealed.webp",
    hidden: "systems/pf2e/icons/conditions/hidden.webp",
    undetected: "systems/pf2e/icons/conditions/undetected.webp",
    unnoticed: "systems/pf2e/icons/conditions/unnoticed.webp"
  };

  // src/module.js
  var MODULE_ID = "pf2e-perception";
  function templatePath(template) {
    return `modules/${MODULE_ID}/templates/${template}.hbs`;
  }
  __name(templatePath, "templatePath");
  function localize(...args) {
    const data = args.at(-1);
    const useFormat = typeof data === "object";
    const keys = useFormat ? args.slice(0, -1) : args;
    keys.unshift(MODULE_ID);
    return game.i18n[useFormat ? "format" : "localize"](keys.join("."), data);
  }
  __name(localize, "localize");
  function getFlag(doc, flag) {
    return doc.getFlag(MODULE_ID, flag);
  }
  __name(getFlag, "getFlag");
  function setFlag(doc, flag, value) {
    return doc.setFlag(MODULE_ID, flag, value);
  }
  __name(setFlag, "setFlag");
  function unsetFlag(doc, flag) {
    return doc.unsetFlag(MODULE_ID, flag, true);
  }
  __name(unsetFlag, "unsetFlag");
  function getFlags(doc) {
    return getProperty(doc, `flags.${MODULE_ID}`) ?? {};
  }
  __name(getFlags, "getFlags");
  function getSetting(setting) {
    return game.settings.get(MODULE_ID, setting);
  }
  __name(getSetting, "getSetting");
  function setSetting(setting, value) {
    return game.settings.set(MODULE_ID, setting, value);
  }
  __name(setSetting, "setSetting");
  function hasPermission() {
    return game.user.role >= getSetting("permission");
  }
  __name(hasPermission, "hasPermission");

  // src/effect.js
  function createFlatFootedSource(visibility) {
    const name = game.i18n.localize(`PF2E.condition.${visibility}.name`);
    const condition = game.pf2e.ConditionManager.getCondition("flat-footed", { name });
    return condition.toObject();
  }
  __name(createFlatFootedSource, "createFlatFootedSource");
  function createCoverSource(level) {
    const bonus = COVER_VALUES[level] === 3 ? 4 : COVER_VALUES[level];
    return {
      _id: "I9lfZUiCwMiGogVi",
      img: "systems/pf2e/icons/conditions-2/status_acup.webp",
      name: localize("cover", level),
      system: {
        description: {
          gm: "",
          value: "<p>When you're behind an obstacle that could block weapons, guard you against explosions, and make you harder to detect, you're behind cover. Standard cover gives you a +2 circumstance bonus to AC, to Reflex saves against area effects, and to Stealth checks to Hide, Sneak, or otherwise avoid detection. You can increase this to greater cover using the Take Cover basic action, increasing the circumstance bonus to +4. If cover is especially light, typically when it's provided by a creature, you have lesser cover, which grants a +1 circumstance bonus to AC. A creature with standard cover or greater cover can attempt to use Stealth to Hide, but lesser cover isn't sufficient.</p>"
        },
        rules: [
          { domain: "all", key: "RollOption", option: `self:cover-bonus:${bonus}` },
          { domain: "all", key: "RollOption", option: `self:cover-level:${level}` },
          {
            key: "FlatModifier",
            predicate: [
              { or: [{ and: ["self:condition:prone", "item:ranged"] }, { not: "self:cover-level:greater-prone" }] }
            ],
            selector: "ac",
            type: "circumstance",
            value: bonus
          },
          {
            key: "FlatModifier",
            predicate: ["area-effect", { not: "self:cover-level:greater-prone" }],
            selector: "reflex",
            type: "circumstance",
            value: bonus
          },
          {
            key: "FlatModifier",
            predicate: [
              { or: ["action:hide", "action:sneak", "avoid-detection"] },
              { not: "self:cover-level:greater-prone" }
            ],
            selector: "stealth",
            type: "circumstance",
            value: bonus
          },
          {
            key: "FlatModifier",
            predicate: ["action:avoid-notice", { not: "self:cover-level:greater-prone" }],
            selector: "initiative",
            type: "circumstance",
            value: bonus
          }
        ],
        slug: "effect-cover"
      },
      type: "effect",
      flags: {
        core: { sourceId: COVER_UUID },
        [MODULE_ID]: {
          level,
          bonus
        }
      }
    };
  }
  __name(createCoverSource, "createCoverSource");
  function findChoiceSetRule(item, flag = void 0) {
    if (!item)
      return void 0;
    return item.system.rules.find((rule) => rule.key === "ChoiceSet" && (!flag || rule.flag === flag));
  }
  __name(findChoiceSetRule, "findChoiceSetRule");

  // src/options.js
  function optionsToObject(options, affects = "origin") {
    const obj = {};
    options.forEach((o) => {
      const split = o.split(":");
      if (split.at(1) !== "pf2perception")
        return;
      const first = split.at(0) === "self" ? affects : split.at(0);
      const last = split.at(-1);
      const path2 = [first, ...split.slice(2, -1)].join(".");
      let value = getProperty(obj, path2);
      if (value)
        value.push(last);
      else
        value = [last];
      setProperty(obj, path2, value);
    });
    return obj;
  }
  __name(optionsToObject, "optionsToObject");
  function updateVisibilityFromOptions(visibility, options) {
    if (!visibility || !options)
      return visibility;
    if (options.reduce) {
      const reduced = ["all", visibility].some((x) => options.reduce.includes(x));
      if (reduced) {
        const index = VISIBILITIES.indexOf(visibility);
        visibility = VISIBILITIES[Math.max(0, index - 1)];
      }
    }
    return visibility;
  }
  __name(updateVisibilityFromOptions, "updateVisibilityFromOptions");

  // src/pf2e/predicate.js
  var PredicatePF2e = class extends Array {
    constructor(...statements) {
      super(...Array.isArray(statements[0]) ? statements[0] : statements);
      this.isValid = PredicatePF2e.isValid(this);
    }
    /** Structurally validate the predicates */
    static isValid(statements) {
      return this.isArray(statements);
    }
    /** Is this an array of predicatation statements? */
    static isArray(statements) {
      return super.isArray(statements) && statements.every((s) => StatementValidator.isStatement(s));
    }
    /** Test if the given predicate passes for the given list of options. */
    static test(predicate = [], options) {
      return predicate instanceof PredicatePF2e ? predicate.test(options) : new PredicatePF2e(...predicate).test(options);
    }
    /** Test this predicate against a domain of discourse */
    test(options) {
      if (this.length === 0) {
        return true;
      } else if (!this.isValid) {
        console.warn("PF2e System | The provided predicate set is malformed.");
        return false;
      }
      const domain = options instanceof Set ? options : new Set(options);
      return this.every((s) => this.#isTrue(s, domain));
    }
    toObject() {
      return deepClone([...this]);
    }
    clone() {
      return new PredicatePF2e(this.toObject());
    }
    /** Is the provided statement true? */
    #isTrue(statement, domain) {
      return typeof statement === "string" && domain.has(statement) || StatementValidator.isBinaryOp(statement) && this.#testBinaryOp(statement, domain) || StatementValidator.isCompound(statement) && this.#testCompound(statement, domain);
    }
    #testBinaryOp(statement, domain) {
      if ("eq" in statement) {
        return domain.has(`${statement.eq[0]}:${statement.eq[1]}`);
      } else {
        const operator = Object.keys(statement)[0];
        const [left, right] = Object.values(statement)[0];
        const domainArray = Array.from(domain);
        const getValues = /* @__PURE__ */ __name((operand) => {
          const maybeNumber = Number(operand);
          if (!Number.isNaN(maybeNumber))
            return [maybeNumber];
          const pattern = new RegExp(String.raw`^${operand}:([^:]+)$`);
          return domainArray.map((s) => Number(pattern.exec(s)?.[1] || NaN)).filter((v) => !Number.isNaN(v));
        }, "getValues");
        const leftValues = getValues(left);
        const rightValues = getValues(right);
        switch (operator) {
          case "gt":
            return leftValues.some((l) => rightValues.every((r) => l > r));
          case "gte":
            return leftValues.some((l) => rightValues.every((r) => l >= r));
          case "lt":
            return leftValues.some((l) => rightValues.every((r) => l < r));
          case "lte":
            return leftValues.some((l) => rightValues.every((r) => l <= r));
          default:
            console.warn("PF2e System | Malformed binary operation encountered");
            return false;
        }
      }
    }
    /** Is the provided compound statement true? */
    #testCompound(statement, domain) {
      return "and" in statement && statement.and.every((subProp) => this.#isTrue(subProp, domain)) || "nand" in statement && !statement.nand.every((subProp) => this.#isTrue(subProp, domain)) || "or" in statement && statement.or.some((subProp) => this.#isTrue(subProp, domain)) || "xor" in statement && statement.xor.filter((subProp) => this.#isTrue(subProp, domain)).length === 1 || "nor" in statement && !statement.nor.some((subProp) => this.#isTrue(subProp, domain)) || "not" in statement && !this.#isTrue(statement.not, domain) || "if" in statement && !(this.#isTrue(statement.if, domain) && !this.#isTrue(statement.then, domain));
    }
  };
  __name(PredicatePF2e, "PredicatePF2e");
  var _binaryOperators;
  var StatementValidator = class {
    static isStatement(statement) {
      return statement instanceof Object ? this.isCompound(statement) || this.isBinaryOp(statement) : typeof statement === "string" ? this.isAtomic(statement) : false;
    }
    static isAtomic(statement) {
      return typeof statement === "string" && statement.length > 0 || this.isBinaryOp(statement);
    }
    static isBinaryOp(statement) {
      if (!isObject(statement))
        return false;
      const entries = Object.entries(statement);
      if (entries.length > 1)
        return false;
      const [operator, operands] = entries[0];
      return __privateGet(this, _binaryOperators).has(operator) && Array.isArray(operands) && operands.length === 2 && typeof operands[0] === "string" && ["string", "number"].includes(typeof operands[1]);
    }
    static isCompound(statement) {
      return isObject(statement) && (this.isAnd(statement) || this.isOr(statement) || this.isNand(statement) || this.isXor(statement) || this.isNor(statement) || this.isNot(statement) || this.isIf(statement));
    }
    static isAnd(statement) {
      return Object.keys(statement).length === 1 && Array.isArray(statement.and) && statement.and.every((subProp) => this.isStatement(subProp));
    }
    static isNand(statement) {
      return Object.keys(statement).length === 1 && Array.isArray(statement.nand) && statement.nand.every((subProp) => this.isStatement(subProp));
    }
    static isOr(statement) {
      return Object.keys(statement).length === 1 && Array.isArray(statement.or) && statement.or.every((subProp) => this.isStatement(subProp));
    }
    static isXor(statement) {
      return Object.keys(statement).length === 1 && Array.isArray(statement.xor) && statement.xor.every((subProp) => this.isStatement(subProp));
    }
    static isNor(statement) {
      return Object.keys(statement).length === 1 && Array.isArray(statement.nor) && statement.nor.every((subProp) => this.isStatement(subProp));
    }
    static isNot(statement) {
      return Object.keys(statement).length === 1 && !!statement.not && this.isStatement(statement.not);
    }
    static isIf(statement) {
      return Object.keys(statement).length === 2 && this.isStatement(statement.if) && this.isStatement(statement.then);
    }
  };
  __name(StatementValidator, "StatementValidator");
  _binaryOperators = new WeakMap();
  __privateAdd(StatementValidator, _binaryOperators, /* @__PURE__ */ new Set(["eq", "gt", "gte", "lt", "lte"]));

  // src/pf2e/helpers.js
  async function extractEphemeralEffects({ affects, origin, target, item, domains, options }) {
    if (!(origin && target))
      return [];
    const [effectsFrom, effectsTo] = affects === "target" ? [origin, target] : [target, origin];
    const fullOptions = [...options, ...effectsTo.getSelfRollOptions(affects)];
    const resolvables = item ? item.isOfType("spell") ? { spell: item } : { weapon: item } : {};
    return (await Promise.all(
      domains.flatMap((s) => effectsFrom.synthetics.ephemeralEffects[s]?.[affects] ?? []).map((d) => d({ test: fullOptions, resolvables }))
    )).flatMap((e) => e ?? []);
  }
  __name(extractEphemeralEffects, "extractEphemeralEffects");
  function traitSlugToObject(trait, dictionary) {
    const traitObject = {
      name: trait,
      label: game.i18n.localize(dictionary[trait] ?? trait)
    };
    if (objectHasKey(CONFIG.PF2E.traitsDescriptions, trait)) {
      traitObject.description = CONFIG.PF2E.traitsDescriptions[trait];
    }
    return traitObject;
  }
  __name(traitSlugToObject, "traitSlugToObject");
  function objectHasKey(obj, key) {
    return (typeof key === "string" || typeof key === "number") && key in obj;
  }
  __name(objectHasKey, "objectHasKey");
  function getRangeIncrement(attackItem, distance) {
    if (attackItem.isOfType("spell"))
      return null;
    return attackItem.rangeIncrement && typeof distance === "number" ? Math.max(Math.ceil(distance / attackItem.rangeIncrement), 1) : null;
  }
  __name(getRangeIncrement, "getRangeIncrement");
  function isOffGuardFromFlanking(actor) {
    if (!actor.isOfType("creature"))
      return false;
    const { flanking } = actor.attributes;
    if (!flanking.flankable)
      return false;
    const rollOptions = actor.getRollOptions();
    if (typeof flanking.flatFootable === "number") {
      return !PredicatePF2e.test([{ lte: ["origin:level", flanking.flatFootable] }], rollOptions);
    }
    return flanking.flatFootable;
  }
  __name(isOffGuardFromFlanking, "isOffGuardFromFlanking");
  function isObject(value) {
    return typeof value === "object" && value !== null;
  }
  __name(isObject, "isObject");

  // src/scene.js
  function renderSceneConfig(config, html) {
    let settings = "";
    for (const setting of ["standard", "exposure"]) {
      const checked = getSceneSetting(config.object, setting);
      settings += `<div class="form-group">
    <label>${localize(`settings.${setting}.name`)}</label>
    <input type="checkbox" name="flags.pf2e-perception.${setting}" ${checked ? "checked" : ""}>
    <p class="notes">${localize(`settings.${setting}.short`)}</p>
</div>`;
    }
    settings += "<hr>";
    html.find('.tab[data-tab="basic"] hr').first().after(settings);
    config.setPosition();
  }
  __name(renderSceneConfig, "renderSceneConfig");
  function getValidTokens(token) {
    token = token instanceof Token ? token.document : token;
    if (!(token instanceof TokenDocument))
      return [];
    let tokens = token.scene.tokens.filter((t) => t !== token && t.actor?.isOfType("creature"));
    if (getSetting("encounter")) {
      const combat = game.combats.active;
      if (!combat)
        return tokens;
      return tokens.filter((t) => {
        const actor = t.actor;
        const traits = actor.traits;
        return actor.type === "familiar" || traits.has("minion") || traits.has("eidolon") || combat.getCombatantByToken(t.id);
      });
    }
    return tokens;
  }
  __name(getValidTokens, "getValidTokens");
  function validateTokens(token, tokens) {
    const validToken = getValidTokens(token).map((t) => t.id);
    return tokens.filter((t) => {
      const id = t instanceof Token || t instanceof TokenDocument ? t.id : t;
      return validToken.includes(id);
    });
  }
  __name(validateTokens, "validateTokens");
  function getSceneSetting(scene, setting) {
    return getFlag(scene, setting) ?? getSetting(setting);
  }
  __name(getSceneSetting, "getSceneSetting");

  // src/utils.js
  function getPrototype(obj, depth = 1) {
    const prototype = Object.getPrototypeOf(obj);
    if (depth > 1)
      return getPrototype(prototype, depth - 1);
    return prototype;
  }
  __name(getPrototype, "getPrototype");
  function sortByName(a, b) {
    return a.name.localeCompare(b.name);
  }
  __name(sortByName, "sortByName");

  // src/apps/base-menu.js
  var BaseMenu = class extends Application {
    #token;
    #resolve;
    #selected;
    #_currentData;
    #hoverTokenListener;
    constructor({ token, resolve, selected = [] }, options = {}) {
      super(options);
      this.#token = token;
      this.#resolve = resolve;
      this.#selected = selected;
      this.#hoverTokenListener = (token2, hover) => {
        const tokenId = token2.id;
        const tokens = this.element.find("[data-token-id]");
        tokens.removeClass("hover");
        if (hover)
          tokens.filter(`[data-token-id=${tokenId}]`).addClass("hover");
      };
      Hooks.on("hoverToken", this.#hoverTokenListener);
    }
    async close(options = {}) {
      Hooks.off("hoverToken", this.#hoverTokenListener);
      this.#resolve?.(options.resolve ?? false);
      super.close(options);
    }
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        minimizable: false
      });
    }
    static async openMenu(params, options = {}) {
      if (params.token instanceof TokenDocument)
        params.token = params.token.object;
      if (!params.token) {
        ui.notifications.error(localize("menu.no-token"));
        return;
      }
      options.id = `${MODULE_ID}-${params.token.document.uuid}`;
      const win = Object.values(ui.windows).find((x) => x.id === options.id);
      if (win)
        win.close();
      return new Promise((resolve) => {
        params.resolve = resolve;
        new this(params, options).render(true);
      });
    }
    static createPropertyData(original, current, property) {
      const defaultValue = defaultValues[property];
      const originalValue = original[property] ?? defaultValue;
      const currentValue = current[property] ?? defaultValue;
      return {
        original: originalValue,
        current: currentValue,
        changed: originalValue !== currentValue,
        custom: currentValue !== defaultValue,
        originalCustom: originalValue !== defaultValue
      };
    }
    get token() {
      return this.#token;
    }
    get document() {
      return this.#token.document;
    }
    get actor() {
      return this.#token.actor;
    }
    get scene() {
      return this.#token.scene;
    }
    get selected() {
      return this.#selected.length ? validateTokens(this.token, this.#selected) : [];
    }
    get currentData() {
      return deepClone(this.#currentData);
    }
    get #currentData() {
      if (!this.#_currentData)
        this.#_currentData = this.getSavedData();
      return this.#_currentData;
    }
    getSavedData() {
      const data = getTokenData(this.document) ?? {};
      return deepClone(data);
    }
    reset() {
      this.#_currentData = this.getSavedData();
      this.#selected = [];
      this.render();
    }
    isSelected(token) {
      const id = typeof token === "object" ? token.id : token;
      return this.#selected.includes(id);
    }
    getData(options) {
      const covers = COVERS.map((value) => ({ value, label: localize(`cover.${value}`) }));
      return {
        i18n: localize,
        covers: isProne(this.actor) ? covers : covers.slice(0, -1),
        visibilities: VISIBILITIES.map((value) => ({ value, label: localize(`visibility.${value}`) }))
      };
    }
    activateListeners(html) {
      html.find("[data-token-id]").on("mouseenter", (event) => {
        const { tokenId } = event.currentTarget.dataset;
        const token = this.scene.tokens.get(tokenId)?.object;
        if (!token || token.controlled)
          return;
        token._onHoverIn(event, { hoverOutOthers: true });
      });
      html.find("[data-action=close]").on("click", () => {
        this.close({ resolve: true });
      });
      html.find("select[name=visibility], select[name=cover]").on("change", (event) => {
        const target = event.currentTarget;
        const property = target.name;
        const defaultValue = defaultValues[property];
        const value = target.value || defaultValue;
        const tokenId = target.closest(".token")?.dataset.tokenId;
        const tokenIds = tokenId ? [tokenId] : this.#selected;
        for (const tokenId2 of tokenIds) {
          setProperty(this.#currentData, `${tokenId2}.${property}`, value);
        }
        if (tokenId) {
          target.classList.toggle("changed", value !== target.dataset.original);
          target.classList.toggle("custom", value !== defaultValue);
        } else
          this.render();
      });
      html.find("[data-action=accept]").on("click", (event) => {
        this._saveData(this.#currentData);
        this.close({ resolve: true });
      });
    }
    _saveData(currentData) {
      setTokenData(this.document, currentData);
    }
    _setSelected(selected) {
      this.#selected = selected ?? this.element.find("[data-token-id].ui-selected").toArray().map((el) => el.dataset.tokenId);
    }
    _spliIntoAlliances(tokens) {
      const allies = [];
      const enemies = [];
      const neutral = [];
      const alliance = this.actor.alliance;
      const opposition = alliance === "party" ? "opposition" : alliance === "opposition" ? "party" : null;
      for (const token of tokens) {
        if (opposition) {
          const actorAlliance = token.actor ? token.actor.alliance : token.alliance;
          if (actorAlliance === alliance)
            allies.push(token);
          else if (actorAlliance === opposition)
            enemies.push(token);
          else if (actorAlliance === null)
            neutral.push(token);
        } else
          neutral.push(token);
      }
      return {
        allies: allies.sort(sortByName),
        neutral: neutral.sort(sortByName),
        enemies: enemies.sort(sortByName),
        hasTokens: allies.length || enemies.length || neutral.length
      };
    }
  };
  __name(BaseMenu, "BaseMenu");

  // src/apps/perception.js
  var PerceptionMenu = class extends BaseMenu {
    get title() {
      return localize("menu.perception.title", { name: this.token.name });
    }
    get template() {
      return templatePath("perception");
    }
    getData(options) {
      const selected = this.selected;
      const currentData = this.currentData;
      const originalData = this.getSavedData();
      const tokens = getValidTokens(this.token).map(({ id, name, actor }) => {
        const current = currentData[id] ?? {};
        const original = originalData[id] ?? {};
        return {
          id,
          name,
          alliance: actor.alliance,
          cover: BaseMenu.createPropertyData(original, current, "cover"),
          visibility: BaseMenu.createPropertyData(original, current, "visibility"),
          selected: selected.includes(id)
        };
      });
      return {
        ...super.getData(options),
        ...this._spliIntoAlliances(tokens)
      };
    }
    activateListeners(html) {
      super.activateListeners(html);
      html.filter(".tokens").selectable({
        autoRefresh: false,
        filter: ".token",
        cancel: "header,select",
        stop: () => this._setSelected()
      });
      html.find("[data-action=select-all]").on("click", (event) => {
        const section = $(event.currentTarget).closest("section");
        const tokens = (section.length ? section : html).find("[data-token-id]");
        const allSelected = tokens.filter(":not(.ui-selected)").length === 0;
        tokens.toggleClass("ui-selected", !allSelected);
        this._setSelected();
      });
      html.find("[data-action=use-selection]").on("click", (event) => {
        this._setSelected(canvas.tokens.controlled.map((t) => t.id));
        this.render();
      });
      html.find("[data-action=reset]").on("click", (event) => this.reset());
    }
  };
  __name(PerceptionMenu, "PerceptionMenu");

  // src/geometry.js
  var RECT_CORNERS = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ];
  var RECT_SPREAD = [
    { x: 0.25, y: 0.25 },
    { x: 0.5, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.75, y: 0.5 },
    { x: 0.25, y: 0.75 },
    { x: 0.5, y: 0.75 },
    { x: 0.75, y: 0.75 }
  ];
  function getRectEdges(rect, margin) {
    const opposite = 1 - margin;
    return {
      top: { A: getRectPoint({ x: margin, y: margin }, rect), B: getRectPoint({ x: opposite, y: margin }, rect) },
      right: { A: getRectPoint({ x: opposite, y: margin }, rect), B: getRectPoint({ x: opposite, y: opposite }, rect) },
      bottom: { A: getRectPoint({ x: opposite, y: opposite }, rect), B: getRectPoint({ x: margin, y: opposite }, rect) },
      left: { A: getRectPoint({ x: margin, y: opposite }, rect), B: getRectPoint({ x: margin, y: margin }, rect) }
    };
  }
  __name(getRectEdges, "getRectEdges");
  function lineIntersectWall(origin, target, debug = false) {
    if (debug)
      drawDebugLine(origin, target);
    return CONFIG.Canvas.polygonBackends.move.testCollision(origin, target, { type: "move", mode: "any" });
  }
  __name(lineIntersectWall, "lineIntersectWall");
  function pointToTokenIntersectWall(origin, token, debug = false) {
    for (const point of rectSpread(token.bounds)) {
      if (lineIntersectWall(origin, point, debug))
        return true;
    }
    return false;
  }
  __name(pointToTokenIntersectWall, "pointToTokenIntersectWall");
  function getRectPoint(point, rect) {
    return { x: rect.x + rect.width * point.x, y: rect.y + rect.height * point.y };
  }
  __name(getRectPoint, "getRectPoint");
  function clearDebug() {
    canvas.controls.debug.clear();
  }
  __name(clearDebug, "clearDebug");
  function drawDebugLine(origin, target, color = "blue") {
    const hex = color === "blue" ? 26316 : color === "red" ? 16711680 : 1483011;
    canvas.controls.debug.lineStyle(4, hex).moveTo(origin.x, origin.y).lineTo(target.x, target.y);
  }
  __name(drawDebugLine, "drawDebugLine");
  function* rectSpread(rect) {
    for (const point of RECT_SPREAD) {
      yield getRectPoint(point, rect);
    }
  }
  __name(rectSpread, "rectSpread");
  function* rectCorners(rect) {
    for (const point of RECT_CORNERS) {
      yield getRectPoint(point, rect);
    }
  }
  __name(rectCorners, "rectCorners");

  // src/lighting.js
  function getLightExposure(token, debug = false) {
    token = token instanceof Token ? token : token.object;
    if (token.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE))
      return void 0;
    const scene = token.scene;
    if (scene !== canvas.scene || !scene.tokenVision || scene.darkness < scene.globalLightThreshold || !getSceneSetting(scene, "exposure"))
      return void 0;
    if (debug)
      clearDebug();
    const rect = token.document.bounds;
    let exposure = null;
    for (const light of canvas.effects.lightSources) {
      if (!light.active)
        continue;
      const bright = light.data.bright;
      const dim = light.data.dim;
      if (light.object === token) {
        if (bright)
          return "bright";
        if (dim)
          exposure = "dim";
        continue;
      }
      const contained = [];
      for (const point of rectCorners(rect)) {
        if (light.shape.contains(point.x, point.y))
          contained.push(point);
        else if (debug)
          drawDebugLine(light, point, "red");
      }
      if (!contained.length)
        continue;
      if (light.ratio === 1) {
        if (debug)
          drawDebugLine(light, contained, "green");
        return "bright";
      }
      if (light.ratio === 0) {
        if (debug)
          drawDebugLine(light, contained, "blue");
        exposure = "dim";
        continue;
      }
      for (const point of contained) {
        const distance = new Ray(light, point).distance;
        if (distance <= bright) {
          if (debug) {
            drawDebugLine(light, point, "green");
            exposure = "bright";
          } else
            return "bright";
        } else {
          if (debug) {
            drawDebugLine(light, point, "blue");
            if (exposure !== "bright")
              exposure = "dim";
          } else
            exposure = "dim";
        }
      }
    }
    return exposure;
  }
  __name(getLightExposure, "getLightExposure");

  // src/token.js
  function renderTokenHUD(hud, html) {
    if (!hasPermission() || !hud.object.actor?.isOfType("creature"))
      return;
    html.find(".col.left").append(`<div class="control-icon" data-action="pf2e-perception"><i class="fa-solid fa-eye"></i></div>`);
    html.find("[data-action=pf2e-perception]").on("click", (event) => PerceptionMenu.openMenu({ token: hud.object }));
  }
  __name(renderTokenHUD, "renderTokenHUD");
  function pasteToken(originals, sources) {
    for (const source of sources) {
      delete source.flags?.[MODULE_ID];
    }
  }
  __name(pasteToken, "pasteToken");
  function getTokenData(token, ...path2) {
    path2.unshift("data");
    token = token instanceof Token ? token.document : token;
    return getFlag(token, path2.join("."));
  }
  __name(getTokenData, "getTokenData");
  async function clearTokenData(token) {
    token = token instanceof Token ? token.document : token;
    return unsetFlag(token, "data");
  }
  __name(clearTokenData, "clearTokenData");
  async function setTokenData(token, data) {
    const valid = getValidTokens(token).map((t) => t.id);
    const updates = {};
    for (const tokenId in data) {
      if (!valid.includes(tokenId)) {
        updates[`flags.${MODULE_ID}.data.-=${tokenId}`] = true;
        continue;
      }
      const current = data[tokenId];
      const original = getTokenData(token, tokenId) ?? {};
      if (current.visibility === defaultValues.visibility)
        delete current.visibility;
      if (current.cover === defaultValues.cover)
        delete current.cover;
      if (original.cover === current.cover && original.visibility === current.visibility)
        continue;
      if (!current.visibility && !current.cover) {
        updates[`flags.${MODULE_ID}.data.-=${tokenId}`] = true;
      } else {
        for (const property of ["cover", "visibility"]) {
          if (original[property] === current[property])
            continue;
          if (!current[property])
            updates[`flags.${MODULE_ID}.data.${tokenId}.-=${property}`] = true;
          else
            updates[`flags.${MODULE_ID}.data.${tokenId}.${property}`] = current[property];
        }
      }
    }
    token = token instanceof Token ? token.document : token;
    return token.update(updates);
  }
  __name(setTokenData, "setTokenData");
  function hasStandardCover(origin, target, debug = false) {
    const scene = origin.scene;
    if (!getSceneSetting(scene, "standard"))
      return false;
    if (debug)
      clearDebug();
    const standard = getSetting("standard-type");
    if (standard === "center")
      return lineIntersectWall(origin.center, target.center, debug);
    else if (standard === "points")
      return pointToTokenIntersectWall(origin.center, target, debug);
  }
  __name(hasStandardCover, "hasStandardCover");
  var SIZES = {
    tiny: 0,
    sm: 1,
    med: 2,
    lg: 3,
    huge: 4,
    grg: 5
  };
  function getCreatureCover(originToken, targetToken, debug = false) {
    const setting = getSetting("lesser");
    if (setting === "none")
      return void 0;
    let cover = void 0;
    const origin = originToken.center;
    const target = targetToken.center;
    if (debug) {
      clearDebug();
      drawDebugLine(origin, target);
    }
    const isExtraLarge = /* @__PURE__ */ __name((token) => {
      const size = SIZES[token.actor.size];
      return size - originSize >= 2 && size - targetSize >= 2;
    }, "isExtraLarge");
    const originSize = SIZES[originToken.actor.size];
    const targetSize = SIZES[targetToken.actor.size];
    const tokens = originToken.scene.tokens.contents.filter((t) => t.actor).sort((a, b) => SIZES[b.actor.size] - SIZES[a.actor.size]);
    let extralarges = originSize < SIZES.huge && targetSize < SIZES.huge && tokens.filter(isExtraLarge).length;
    const margin = setting === "ten" ? 0.1 : setting === "twenty" ? 0.2 : 0;
    const intersectsEdge = /* @__PURE__ */ __name((edge) => {
      if (debug)
        drawDebugLine(edge.A, edge.B, "red");
      return lineSegmentIntersects(origin, target, edge.A, edge.B);
    }, "intersectsEdge");
    const intersectsWith = setting === "cross" ? (edges) => {
      return intersectsEdge(edges.top) && intersectsEdge(edges.bottom) || intersectsEdge(edges.left) && intersectsEdge(edges.right);
    } : (edges) => Object.values(edges).some((edge) => intersectsEdge(edge));
    for (const tokenDocument of tokens) {
      const token = tokenDocument.object;
      if (tokenDocument.hidden || token === originToken || token === targetToken)
        continue;
      const edges = getRectEdges(token.bounds, margin);
      if (intersectsWith(edges))
        return extralarges ? "standard" : "lesser";
      else if (isExtraLarge(tokenDocument))
        extralarges--;
    }
    return cover;
  }
  __name(getCreatureCover, "getCreatureCover");
  function getVisibility(origin, target) {
    const systemVisibility = (() => {
      const originActor = origin.actor;
      const visibilities = ["unnoticed", "undetected", "hidden", "concealed"];
      for (const visibility2 of visibilities) {
        if (originActor.hasCondition(visibility2))
          return visibility2;
      }
    })();
    const visibility = getTokenData(origin, target.id, "visibility");
    const mergedVisibility = VISIBILITY_VALUES[systemVisibility] > VISIBILITY_VALUES[visibility] ? systemVisibility : visibility;
    const mergedVisibilityValue = VISIBILITY_VALUES[mergedVisibility];
    if (mergedVisibilityValue >= VISIBILITY_VALUES.undetected)
      return mergedVisibility;
    const exposure = getLightExposure(origin);
    let exposedVisibility = exposure === "dim" ? "concealed" : exposure === null ? "hidden" : void 0;
    return mergedVisibilityValue > VISIBILITY_VALUES[exposedVisibility] ? mergedVisibility : exposedVisibility;
  }
  __name(getVisibility, "getVisibility");
  function updateToken(token, data, context, userId) {
    const flags = data.flags?.["pf2e-perception"];
    if (flags && (flags.data || flags["-=data"] !== void 0)) {
      token.object.renderFlags.set({ refreshVisibility: true });
      if (game.user.isGM)
        return;
      const hk = Hooks.on("refreshToken", (refreshed) => {
        if (!token.object === refreshed)
          return;
        Hooks.off("refreshToken", hk);
        if (game.combat?.getCombatantByToken(token.id))
          ui.combat.render();
      });
    }
  }
  __name(updateToken, "updateToken");
  function hoverToken(token, hovered) {
    if (hovered)
      showAllConditionals(token);
    else
      clearConditionals(token);
  }
  __name(hoverToken, "hoverToken");
  function deleteToken(token) {
    clearConditionals(token);
    if (!game.user.isGM)
      ui.combat.render();
  }
  __name(deleteToken, "deleteToken");
  function controlToken(token) {
    clearConditionals(token);
    Hooks.once("sightRefresh", () => token.hover && showAllConditionals(token));
  }
  __name(controlToken, "controlToken");
  function clearConditionals(token) {
    const tokenId = token?.id;
    if (!tokenId)
      return $(".pf2e-conditionals").remove();
    $(`.pf2e-conditionals[data-hover-id=${token.id}]`).remove();
    $(`.pf2e-conditionals[data-token-id=${token.id}]`).remove();
  }
  __name(clearConditionals, "clearConditionals");
  function showAllConditionals(token) {
    const tokens = getValidTokens(token);
    for (const target of tokens) {
      showConditionals(target, token);
    }
  }
  __name(showAllConditionals, "showAllConditionals");
  async function showConditionals(origin, target) {
    origin = origin instanceof Token ? origin : origin.object;
    if (!origin.visible || !origin.actor?.isOfType("creature"))
      return;
    let data = getTokenData(origin, target.id);
    if (isEmpty(data))
      return;
    if (!game.user.isGM && !target.document.hasPlayerOwner && VISIBILITY_VALUES[data.visibility] >= VISIBILITY_VALUES.hidden) {
      if (!data.cover)
        return;
      data = { cover: data.cover };
    }
    const scale = origin.worldTransform.a;
    const coords = canvas.clientCoordinatesFromCanvas(origin.document._source);
    let content = `<div class="pf2e-conditionals" data-hover-id="${origin.id}" data-token-id="${target.id}" `;
    content += `style="top: ${coords.y}px; left: ${coords.x + origin.hitArea.width * scale / 2}px;">`;
    const savedPaths = getSetting("icon-path");
    Object.entries(data).map(([property, value]) => {
      const icon = property === "cover" ? "cover" : value;
      let path2 = savedPaths[icon] || ICONS_PATHS[icon];
      if (path2.startsWith("systems") || path2.startsWith("modules"))
        path2 = `../../../${path2}`;
      content += `<div class="conditional"><img src="${path2}"></img></div>`;
    });
    content += "</div>";
    $(document.body).append(content);
  }
  __name(showConditionals, "showConditionals");
  function getConditionalCover(origin, target, options, debug = false) {
    const ranged = options.includes("item:ranged");
    const prone = ranged ? isProne(target.actor) : false;
    let systemCover = getCoverEffect(target.actor, true);
    if (prone && COVER_VALUES[systemCover] > COVER_VALUES.lesser)
      return "greater-prone";
    if (!prone && systemCover === "greater-prone")
      systemCover = void 0;
    let cover = getTokenData(target, origin.id, "cover");
    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser)
      return "greater-prone";
    if (!prone && cover === "greater-prone")
      cover = void 0;
    if (COVER_VALUES[cover] < COVER_VALUES.standard && COVER_VALUES[systemCover] < COVER_VALUES.standard && hasStandardCover(origin, target, debug)) {
      cover = "standard";
    } else if (!cover && !systemCover && origin.distanceTo(target) > 5) {
      cover = getCreatureCover(origin, target, debug);
    }
    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser)
      return "greater-prone";
    return COVER_VALUES[cover] > COVER_VALUES[systemCover] ? cover : void 0;
  }
  __name(getConditionalCover, "getConditionalCover");

  // src/actor.js
  async function getRollContext(params) {
    const [selfToken, targetToken] = canvas.ready && !params.viewOnly ? [
      canvas.tokens.controlled.find((t) => t.actor === this) ?? this.getActiveTokens().shift() ?? null,
      params.target?.token ?? params.target?.actor?.getActiveTokens().shift() ?? null
    ] : [null, null];
    const selfOptions = this.getRollOptions(params.domains ?? []);
    const originEphemeralEffects = await extractEphemeralEffects({
      affects: "origin",
      origin: this,
      target: params.target?.actor ?? targetToken?.actor ?? null,
      item: params.item ?? null,
      domains: params.domains,
      options: [...params.options, ...params.item?.getRollOptions("item") ?? []]
    });
    const selfActor = params.viewOnly || !targetToken?.actor ? this : this.getContextualClone([...selfOptions, ...targetToken.actor.getSelfRollOptions("target")], originEphemeralEffects);
    const isStrike = params.statistic instanceof game.pf2e.StatisticModifier;
    const strikeActions = isStrike ? selfActor.system.actions?.flatMap((a) => [a, a.altUsages ?? []].flat()) ?? [] : [];
    const statistic = params.viewOnly ? params.statistic : isStrike ? strikeActions.find((action) => {
      if (params.item?.id !== action.item.id || params?.item.name !== action.item.name)
        return false;
      if (params.item.isOfType("melee") && action.item.isOfType("melee"))
        return true;
      return params.item.isOfType("weapon") && action.item.isOfType("weapon") && params.item.isMelee === action.item.isMelee;
    }) ?? params.statistic : params.statistic;
    const selfItem = (() => {
      if (selfActor === this)
        return params.item ?? null;
      if (statistic && "item" in statistic && statistic.item instanceof Item && statistic.item.isOfType("melee", "spell", "weapon")) {
        return statistic.item;
      }
      const itemClone = selfActor.items.get(params.item?.id ?? "");
      if (itemClone?.isOfType("melee", "spell", "weapon"))
        return itemClone;
      return params.item ?? null;
    })();
    const itemOptions = selfItem?.getRollOptions("item") ?? [];
    const isAttackAction = ["attack", "strike-damage", "attack-spell-damage"].some((d) => params.domains.includes(d));
    const traitSlugs = [
      isAttackAction ? "attack" : [],
      // CRB p. 544: "Due to the complexity involved in preparing bombs, Strikes to throw alchemical bombs gain
      // the manipulate trait."
      isStrike && selfItem?.isOfType("weapon") && selfItem.baseType === "alchemical-bomb" ? "manipulate" : []
    ].flat();
    if (selfItem?.isOfType("weapon", "melee")) {
      for (const adjustment of this.synthetics.strikeAdjustments) {
        adjustment.adjustTraits?.(selfItem, traitSlugs);
      }
    }
    const traits = traitSlugs.map((t) => traitSlugToObject(t, CONFIG.PF2E.actionTraits));
    const distance = selfToken && targetToken ? selfToken.distanceTo(targetToken) : null;
    const [originDistance, targetDistance] = typeof distance === "number" ? [`origin:distance:${distance}`, `target:distance:${distance}`] : [null, null];
    const getTargetRollOptions = /* @__PURE__ */ __name((actor) => {
      const targetOptions = actor?.getSelfRollOptions("target") ?? [];
      if (targetToken) {
        targetOptions.push("target");
        const mark = this.synthetics.targetMarks.get(targetToken.document.uuid);
        if (mark)
          targetOptions.push(`target:mark:${mark}`);
      }
      return targetOptions;
    }, "getTargetRollOptions");
    const targetRollOptions = getTargetRollOptions(targetToken?.actor);
    const targetEphemeralEffects = await extractEphemeralEffects({
      affects: "target",
      origin: selfActor,
      target: targetToken?.actor ?? null,
      item: selfItem,
      domains: params.domains,
      options: [...params.options, ...itemOptions, ...targetRollOptions]
    });
    const [reach, isMelee] = params.item?.isOfType("melee") ? [params.item.reach, params.item.isMelee] : params.item?.isOfType("weapon") ? [this.getReach({ action: "attack", weapon: params.item }), params.item.isMelee] : [null, false];
    if (selfToken && targetToken) {
      addConditionals({
        selfToken,
        targetToken,
        ephemeralEffects: targetEphemeralEffects,
        options: [...params.options, ...selfActor.getSelfRollOptions("origin"), ...itemOptions, ...targetRollOptions]
      });
    }
    const isFlankingStrike = !!(isMelee && typeof reach === "number" && params.statistic instanceof game.pf2e.StatisticModifier && targetToken && selfToken?.isFlanking(targetToken, { reach }));
    if (isFlankingStrike && params.target?.token?.actor && isOffGuardFromFlanking(params.target.token.actor)) {
      const name = game.i18n.localize("PF2E.Item.Condition.Flanked");
      const condition = game.pf2e.ConditionManager.getCondition("flat-footed", { name });
      targetEphemeralEffects.push(condition.toObject());
    }
    const targetActor = params.viewOnly ? null : (params.target?.actor ?? targetToken?.actor)?.getContextualClone(
      [...selfActor.getSelfRollOptions("origin"), ...itemOptions, ...originDistance ? [originDistance] : []],
      targetEphemeralEffects
    ) ?? null;
    const rollOptions = /* @__PURE__ */ new Set([
      ...params.options,
      ...selfOptions,
      ...targetActor ? getTargetRollOptions(targetActor) : targetRollOptions,
      ...itemOptions,
      // Backward compatibility for predication looking for an "attack" trait by its lonesome
      "attack"
    ]);
    if (targetDistance)
      rollOptions.add(targetDistance);
    const rangeIncrement = selfItem ? getRangeIncrement(selfItem, distance) : null;
    if (rangeIncrement)
      rollOptions.add(`target:range-increment:${rangeIncrement}`);
    const self = {
      actor: selfActor,
      token: selfToken?.document ?? null,
      statistic,
      item: selfItem,
      modifiers: []
    };
    const target = targetActor && targetToken && distance !== null ? { actor: targetActor, token: targetToken.document, distance, rangeIncrement } : null;
    return {
      options: rollOptions,
      self,
      target,
      traits
    };
  }
  __name(getRollContext, "getRollContext");
  function addConditionals({ ephemeralEffects, selfToken, targetToken, options }) {
    let cover = getConditionalCover(selfToken, targetToken, options);
    options = optionsToObject(options);
    if (options.origin?.cover) {
      if (cover && options.origin.cover.reduce) {
        const reduced = ["all", cover].some((x) => options.origin.cover.reduce.includes(x));
        if (reduced) {
          const index = COVERS.indexOf(cover);
          cover = COVERS[Math.max(0, index - 1)];
        }
      }
    }
    let visibility = updateVisibilityFromOptions(getVisibility(selfToken, targetToken), options.target?.visibility);
    if (options.target?.visibility?.cancel) {
      const canceled = ["all", visibility].some((x) => options.target.visibility.cancel.includes(x));
      if (canceled)
        visibility = void 0;
    }
    if (COVER_VALUES[cover] > COVER_VALUES.none)
      ephemeralEffects.push(createCoverSource(cover));
    if (VISIBILITY_VALUES[visibility] > VISIBILITY_VALUES.concealed)
      ephemeralEffects.push(createFlatFootedSource(visibility));
  }
  __name(addConditionals, "addConditionals");
  function getActorToken(actor, target = false) {
    if (!actor)
      return void 0;
    const actorId = actor.id;
    const isToken = actor.isToken;
    const tokens = target ? game.user.targets : canvas.tokens.controlled;
    return tokens.find((token) => isToken ? token.actor === actor : token.actor.id === actorId) ?? actor.getActiveTokens().shift() ?? null;
  }
  __name(getActorToken, "getActorToken");
  function isProne(actor) {
    return actor.itemTypes.condition.some((item) => item.slug === "prone");
  }
  __name(isProne, "isProne");
  function getCoverEffect(actor, selection = false) {
    const effect = actor.itemTypes.effect.find((x) => x.sourceId === COVER_UUID);
    return selection ? findChoiceSetRule(effect)?.selection.level : effect;
  }
  __name(getCoverEffect, "getCoverEffect");

  // src/chat.js
  function renderChatMessage(message, html) {
    const token = message.token;
    if (!token)
      return;
    const isGM = game.user.isGM;
    const hasPlayerOwner = token.hasPlayerOwner;
    const { cover, selected, skipWait, validated, blindCheck, pointOut: pointOut2 } = getFlags(message);
    const pf2eContext = message.getFlag("pf2e", "context");
    if (blindCheck && !isGM && hasPlayerOwner) {
      html.find(".message-sender").text(token.name);
      html.find(".flavor-text").html(blindCheck);
    } else if (cover) {
      if (isGM) {
        const button = createValidateButton({ property: "cover", skipWait, validated });
        html.find(".message-content").append(button);
        html.find("[data-action=validate-cover]").on("click", () => {
          CoverValidationMenu.openMenu({ token, selected, value: cover, message });
        });
      } else if (!skipWait) {
        const hint = createWaitHint("cover", validated);
        html.find(".message-content").append(hint);
      }
    } else if (pf2eContext?.visibility) {
      if (!validated)
        html.find(".message-buttons").remove();
      const flavor = html.find(".flavor-text");
      if (!isGM && hasPlayerOwner) {
        html.find(".message-sender").text(token.name);
        flavor.empty();
      }
      const msg = localize(`message.flat-check.${validated === void 0 ? "blind" : validated ? "success" : "failure"}`);
      const hint = createHint(msg, validated);
      flavor.append(hint);
      if (isGM) {
        for (const type of ["success", "failure"]) {
          flavor.append(
            createChatButton({
              action: `${type}-message`,
              icon: "fa-solid fa-message",
              label: localize("message.flat-check.button", type)
            })
          );
          html.find(`[data-action=${type}-message]`).on("click", () => {
            setFlag(message, "validated", type === "success");
          });
        }
      }
    } else if (pf2eContext?.type === "skill-check") {
      if (isGM) {
        if (pf2eContext.options.includes("action:hide")) {
          addVisibilityValidationButton({
            token,
            html,
            message,
            skipWait,
            validated,
            selected: pf2eContext.selected,
            ValidationMenu: HideValidationMenu
          });
        }
      } else if (hasPlayerOwner) {
        if (pf2eContext.options.includes("action:hide")) {
          addBlindSkillCheckFlavor({ token, message, html, validated });
        }
      }
    } else if (pf2eContext?.type === "perception-check") {
      if (isGM) {
        if (pf2eContext.options.includes("action:seek")) {
          addVisibilityValidationButton({
            token,
            html,
            message,
            skipWait,
            validated,
            selected: pf2eContext.selected,
            ValidationMenu: SeekValidationMenu
          });
        }
      } else if (hasPlayerOwner) {
        if (pf2eContext.options.includes("action:seek")) {
          addBlindSkillCheckFlavor({ token, message, html, validated });
        }
      }
    } else if (pointOut2) {
      const selectedToken = token.scene.tokens.get(pointOut2);
      if (!selectedToken)
        return;
      if (isGM) {
        let buttons = '<div style="display: grid; grid-template-columns: 1fr auto; gap: 3px">';
        buttons += createValidateButton({ property: "visibility", skipWait, validated });
        buttons += createChatButton({ action: "ping-token", icon: "fa-solid fa-signal-stream" });
        buttons += "</div>";
        html.find(".message-content").append(buttons);
        html.find("[data-action=validate-visibility]").on("click", async () => {
          PointOutValidationMenu.openMenu({
            message,
            token: selectedToken,
            originator: token,
            selected: canvas.tokens.controlled.map((t) => t.id)
          });
        });
        html.find("[data-action=ping-token]").on("click", () => {
          canvas.ping(selectedToken.center);
        });
      } else if (hasPlayerOwner) {
        const hint = createWaitHint("visibility", validated);
        html.find(".message-content").append(hint);
      }
    }
  }
  __name(renderChatMessage, "renderChatMessage");
  function validateMessage(message) {
    if (!getFlag(message, "validated"))
      setFlag(message, "validated", true);
  }
  __name(validateMessage, "validateMessage");
  function addBlindSkillCheckFlavor({ html, token, message, validated }) {
    html.find(".message-sender").text(token.name);
    let flavor = message.getFlag("pf2e", "modifierName");
    flavor += createWaitHint("visibility", validated);
    html.find(".flavor-text").html(flavor);
  }
  __name(addBlindSkillCheckFlavor, "addBlindSkillCheckFlavor");
  function createWaitHint(property, validated) {
    const hint = localize(`message.${property}.player.${validated ? "validated" : "wait"}`);
    return createHint(hint, validated);
  }
  __name(createWaitHint, "createWaitHint");
  function createHint(hint, validated) {
    if (validated === true)
      hint = '<i class="fa-solid fa-check" style="color: green;"></i> ' + hint;
    else if (validated === false)
      hint = '<i class="fa-solid fa-xmark" style="color: red;"></i> ' + hint;
    return `<i style="display: block; font-size: .9em; text-align: end;">${hint}</i>`;
  }
  __name(createHint, "createHint");
  function addVisibilityValidationButton({ skipWait, validated, html, message, ValidationMenu: ValidationMenu2, token, selected }) {
    const button = createValidateButton({ property: "visibility", skipWait, validated });
    html.find(".flavor-text").append(button);
    html.find("[data-action=validate-visibility]").on("click", async () => {
      const roll = message.rolls[0];
      ValidationMenu2.openMenu({ token, message, roll, selected });
    });
  }
  __name(addVisibilityValidationButton, "addVisibilityValidationButton");
  function createValidateButton({ skipWait, validated, property }) {
    let label = localize(`message.${property}.gm.${skipWait ? "check" : validated ? "validated" : "validate"}`);
    if (!skipWait && validated)
      label += '<i class="fa-solid fa-check" style="color: green; margin-left: 0.3em;"></i>';
    return createChatButton({
      action: `validate-${property}`,
      icon: "fa-solid fa-list",
      label
    });
  }
  __name(createValidateButton, "createValidateButton");
  function createChatButton({ action, icon, label }) {
    let button = `<button type="button" style="margin: 0 0 5px; padding-block: 0;" data-action="${action}">`;
    if (icon)
      button += `<i class="${icon}" ${label ? "" : 'style="margin: 0;"'}></i>`;
    if (label)
      button += `${icon ? " " : ""}${label}`;
    button += "</button>";
    return button;
  }
  __name(createChatButton, "createChatButton");
  async function createTokenMessage({ content, token, flags, secret }) {
    const data = { content, speaker: ChatMessage.getSpeaker({ token: token instanceof Token ? token.document : token }) };
    if (flags)
      setProperty(data, `flags.${MODULE_ID}`, flags);
    if (secret) {
      data.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
      data.whisper = ChatMessage.getWhisperRecipients("gm");
    }
    return ChatMessage.create(data);
  }
  __name(createTokenMessage, "createTokenMessage");

  // src/pf2e/success.js
  var DEGREE_ADJUSTMENT_AMOUNTS = {
    LOWER_BY_TWO: -2,
    LOWER: -1,
    INCREASE: 1,
    INCREASE_BY_TWO: 2,
    TO_CRITICAL_FAILURE: "criticalFailure",
    TO_FAILURE: "failure",
    TO_SUCCESS: "success",
    TO_CRITICAL_SUCCESS: "criticalSuccess"
  };
  var DEGREE_OF_SUCCESS_STRINGS = ["criticalFailure", "failure", "success", "criticalSuccess"];
  var _getDegreeAdjustment, getDegreeAdjustment_fn, _adjustDegreeOfSuccess, adjustDegreeOfSuccess_fn, _adjustDegreeByDieValue, adjustDegreeByDieValue_fn, _calculateDegreeOfSuccess, calculateDegreeOfSuccess_fn;
  var _DegreeOfSuccess = class {
    constructor(roll, dc, dosAdjustments = null) {
      __privateAdd(this, _getDegreeAdjustment);
      __privateAdd(this, _adjustDegreeOfSuccess);
      /**
       * @param degree The current success value
       * @return The new success value
       */
      __privateAdd(this, _adjustDegreeByDieValue);
      __privateAdd(this, _calculateDegreeOfSuccess);
      if (roll instanceof Roll) {
        this.dieResult = (roll.isDeterministic ? roll.terms.find((t) => t instanceof NumericTerm) : roll.dice.find((d) => d instanceof Die && d.faces === 20))?.total ?? 1;
        this.rollTotal = roll.total;
      } else {
        this.dieResult = roll.dieValue;
        this.rollTotal = roll.dieValue + roll.modifier;
      }
      this.dc = typeof dc === "number" ? { value: dc } : dc;
      this.unadjusted = __privateMethod(this, _calculateDegreeOfSuccess, calculateDegreeOfSuccess_fn).call(this);
      this.adjustment = __privateMethod(this, _getDegreeAdjustment, getDegreeAdjustment_fn).call(this, this.unadjusted, dosAdjustments);
      this.value = this.adjustment ? __privateMethod(this, _adjustDegreeOfSuccess, adjustDegreeOfSuccess_fn).call(this, this.adjustment.amount, this.unadjusted) : this.unadjusted;
    }
  };
  var DegreeOfSuccess = _DegreeOfSuccess;
  __name(DegreeOfSuccess, "DegreeOfSuccess");
  _getDegreeAdjustment = new WeakSet();
  getDegreeAdjustment_fn = /* @__PURE__ */ __name(function(degree, adjustments) {
    if (!adjustments)
      return null;
    for (const outcome of ["all", ...DEGREE_OF_SUCCESS_STRINGS]) {
      const { label, amount } = adjustments[outcome] ?? {};
      if (amount && label && !(degree === _DegreeOfSuccess.CRITICAL_SUCCESS && amount === DEGREE_ADJUSTMENT_AMOUNTS.INCREASE) && !(degree === _DegreeOfSuccess.CRITICAL_FAILURE && amount === DEGREE_ADJUSTMENT_AMOUNTS.LOWER) && (outcome === "all" || DEGREE_OF_SUCCESS_STRINGS.indexOf(outcome) === degree)) {
        return { label, amount };
      }
    }
    return null;
  }, "#getDegreeAdjustment");
  _adjustDegreeOfSuccess = new WeakSet();
  adjustDegreeOfSuccess_fn = /* @__PURE__ */ __name(function(amount, degreeOfSuccess) {
    switch (amount) {
      case "criticalFailure":
        return 0;
      case "failure":
        return 1;
      case "success":
        return 2;
      case "criticalSuccess":
        return 3;
      default:
        return Math.clamped(degreeOfSuccess + amount, 0, 3);
    }
  }, "#adjustDegreeOfSuccess");
  _adjustDegreeByDieValue = new WeakSet();
  adjustDegreeByDieValue_fn = /* @__PURE__ */ __name(function(degree) {
    if (this.dieResult === 20) {
      return __privateMethod(this, _adjustDegreeOfSuccess, adjustDegreeOfSuccess_fn).call(this, DEGREE_ADJUSTMENT_AMOUNTS.INCREASE, degree);
    } else if (this.dieResult === 1) {
      return __privateMethod(this, _adjustDegreeOfSuccess, adjustDegreeOfSuccess_fn).call(this, DEGREE_ADJUSTMENT_AMOUNTS.LOWER, degree);
    }
    return degree;
  }, "#adjustDegreeByDieValue");
  _calculateDegreeOfSuccess = new WeakSet();
  calculateDegreeOfSuccess_fn = /* @__PURE__ */ __name(function() {
    const dc = this.dc.value;
    if (this.rollTotal - dc >= 10) {
      return __privateMethod(this, _adjustDegreeByDieValue, adjustDegreeByDieValue_fn).call(this, _DegreeOfSuccess.CRITICAL_SUCCESS);
    } else if (dc - this.rollTotal >= 10) {
      return __privateMethod(this, _adjustDegreeByDieValue, adjustDegreeByDieValue_fn).call(this, _DegreeOfSuccess.CRITICAL_FAILURE);
    } else if (this.rollTotal >= dc) {
      return __privateMethod(this, _adjustDegreeByDieValue, adjustDegreeByDieValue_fn).call(this, _DegreeOfSuccess.SUCCESS);
    }
    return __privateMethod(this, _adjustDegreeByDieValue, adjustDegreeByDieValue_fn).call(this, _DegreeOfSuccess.FAILURE);
  }, "#calculateDegreeOfSuccess");
  __publicField(DegreeOfSuccess, "CRITICAL_FAILURE", 0);
  __publicField(DegreeOfSuccess, "FAILURE", 1);
  __publicField(DegreeOfSuccess, "SUCCESS", 2);
  __publicField(DegreeOfSuccess, "CRITICAL_SUCCESS", 3);

  // src/template.js
  var templateConversion = {
    burst: "circle",
    emanation: "circle",
    line: "ray",
    cone: "cone",
    rect: "rect"
  };
  function createSeekTemplate(type, token) {
    createTemplate({
      type,
      token,
      distance: type === "cone" ? 30 : 15,
      traits: ["concentrate", "secret"]
    });
  }
  __name(createSeekTemplate, "createSeekTemplate");
  function getTokenTemplate(token) {
    return token.scene.templates.find((t) => getFlag(t, "tokenId") === token.id);
  }
  __name(getTokenTemplate, "getTokenTemplate");
  function getTokenTemplateTokens(token) {
    if (!checkScene(token))
      return null;
    const template = getTokenTemplate(token);
    if (!template)
      return null;
    return getTokens(template.object);
  }
  __name(getTokenTemplateTokens, "getTokenTemplateTokens");
  async function deleteTokenTemplate(token) {
    const templates = token.scene.templates.filter((t) => getFlag(t, "tokenId") === token.id);
    for (const template of templates) {
      await template.delete();
    }
  }
  __name(deleteTokenTemplate, "deleteTokenTemplate");
  function checkScene(token) {
    if (canvas.scene === token.scene)
      return true;
    ui.notifications.error(localize("template.scene"));
    return false;
  }
  __name(checkScene, "checkScene");
  function createTemplate({ type, distance, traits, fillColor, width, token }) {
    if (!checkScene(token))
      return;
    const templateData = {
      distance,
      t: templateConversion[type],
      fillColor: fillColor || game.user.color,
      flags: {
        [MODULE_ID]: {
          tokenId: token.id
        }
      }
    };
    if (templateData.t === "ray") {
      templateData.width = width || CONFIG.MeasuredTemplate.defaults.width * (canvas.dimensions?.distance ?? 1);
    } else if (templateData.t === "cone") {
      templateData.angle = CONFIG.MeasuredTemplate.defaults.angle;
    }
    if (traits)
      setProperty(templateData, "flags.pf2e.origin.traits", traits);
    const templateDoc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene });
    new CONFIG.MeasuredTemplate.objectClass(templateDoc).drawPreview();
  }
  __name(createTemplate, "createTemplate");
  function getTokens(template, { collisionOrigin, collisionType = "move" } = {}) {
    if (!canvas.scene)
      return [];
    const { grid, dimensions } = canvas;
    if (!(grid && dimensions))
      return [];
    const gridHighlight = grid.getHighlightLayer(template.highlightId);
    if (!gridHighlight || grid.type !== CONST.GRID_TYPES.SQUARE)
      return [];
    const origin = collisionOrigin ?? template.center;
    const tokens = canvas.tokens.quadtree.getObjects(gridHighlight.getLocalBounds(void 0, true));
    const containedTokens = [];
    for (const token of tokens) {
      const tokenDoc = token.document;
      const tokenPositions = [];
      for (let h = 0; h < tokenDoc.height; h++) {
        const y = token.y + h * grid.size;
        tokenPositions.push(`${token.x}.${y}`);
        if (tokenDoc.width > 1) {
          for (let w = 1; w < tokenDoc.width; w++) {
            tokenPositions.push(`${token.x + w * grid.size}.${y}`);
          }
        }
      }
      for (const position of tokenPositions) {
        if (!gridHighlight.positions.has(position)) {
          continue;
        }
        const [gx, gy] = position.split(".").map((s) => Number(s));
        const destination = {
          x: gx + dimensions.size * 0.5,
          y: gy + dimensions.size * 0.5
        };
        if (destination.x < 0 || destination.y < 0)
          continue;
        const hasCollision = canvas.ready && collisionType && CONFIG.Canvas.polygonBackends[collisionType].testCollision(origin, destination, {
          type: collisionType,
          mode: "any"
        });
        if (!hasCollision) {
          containedTokens.push(token);
          break;
        }
      }
    }
    return containedTokens;
  }
  __name(getTokens, "getTokens");

  // src/apps/validation.js
  var ValidationMenu = class extends BaseMenu {
    static async openMenu(params, options) {
      const validated = await super.openMenu(params, options);
      if (validated && params.message)
        validateMessage(params.message);
      return validated;
    }
    get title() {
      return localize("menu.validation.title", { name: this.token.name });
    }
    get template() {
      return templatePath("validation");
    }
    get selected() {
      const selected = super.selected;
      if (selected.length)
        return selected;
      const token = this.token;
      const alliance = token.actor.alliance;
      return getValidTokens(token).filter((t) => t.actor.alliance !== alliance).map((t) => t.id);
    }
    getSavedData(converted = true) {
      const data = super.getSavedData();
      return converted ? this._convertData(data) : data;
    }
    _convertData(data) {
      const property = this.property;
      const scene = this.scene;
      const selected = this.selected;
      const defaultValue = defaultValues[property];
      const propertyList = property === "cover" ? COVERS : VISIBILITIES;
      for (const tokenId of selected) {
        const token = scene.tokens.get(tokenId);
        const fullProperty = `${tokenId}.${property}`;
        const currentValue = getProperty(data, fullProperty) ?? defaultValue;
        let processedValue = this.processValue({ token, value: currentValue });
        if (!propertyList.includes(processedValue))
          processedValue = currentValue;
        if (currentValue === processedValue)
          continue;
        setProperty(data, fullProperty, processedValue);
      }
      return data;
    }
    processValue(params) {
      throw new Error(`${this.constructor.name} doesn't have a 'processValue' method defined`);
    }
    getData(options) {
      const { covers, visibilities, i18n } = super.getData(options);
      const currentData = this.currentData;
      const originalData = this.getSavedData(false);
      const property = this.property;
      let selected = this.selected;
      let tokens = getValidTokens(this.token);
      tokens = tokens.map(({ id, name, actor }) => {
        const current = currentData[id] ?? {};
        const original = originalData[id] ?? {};
        return {
          id,
          name,
          alliance: actor.alliance,
          selected: selected.includes(id),
          ...BaseMenu.createPropertyData(original, current, property)
        };
      });
      const validation = getSetting("validation");
      if (validation === "selected")
        tokens = tokens.filter((t) => t.selected);
      else if (validation === "changed")
        tokens = tokens.filter((t) => t.changed);
      return {
        ...this._spliIntoAlliances(tokens),
        i18n,
        property,
        options: property === "cover" ? covers : visibilities,
        showSelected: validation === "all",
        showChanges: validation !== "changed"
      };
    }
    activateListeners(html) {
      super.activateListeners(html);
      html.find("[data-action=cancel]").on("click", (event) => {
        this.close();
      });
    }
  };
  __name(ValidationMenu, "ValidationMenu");
  var CoverValidationMenu = class extends ValidationMenu {
    #value;
    constructor(params, options = {}) {
      super(params, options);
      this.#value = params.value;
    }
    get property() {
      return "cover";
    }
    processValue() {
      return this.#value;
    }
  };
  __name(CoverValidationMenu, "CoverValidationMenu");
  var VisibilityValidationMenu = class extends ValidationMenu {
    #roll;
    constructor(params, options = {}) {
      super(params, options);
      this.#roll = params.roll;
    }
    get property() {
      return "visibility";
    }
    get roll() {
      return this.#roll;
    }
  };
  __name(VisibilityValidationMenu, "VisibilityValidationMenu");
  var HideValidationMenu = class extends VisibilityValidationMenu {
    processValue({ token, value }) {
      const roll = this.roll;
      const dc = token.actor.perception.dc.value;
      const visibility = VISIBILITY_VALUES[value];
      const success = new DegreeOfSuccess(roll, dc).value;
      if (success >= DegreeOfSuccess.SUCCESS && visibility < VISIBILITY_VALUES.hidden)
        return "hidden";
      else if (success <= DegreeOfSuccess.FAILURE && visibility >= VISIBILITY_VALUES.hidden)
        return "observed";
      else
        return value;
    }
  };
  __name(HideValidationMenu, "HideValidationMenu");
  var PointOutValidationMenu = class extends VisibilityValidationMenu {
    #originator;
    constructor(params, options = {}) {
      super(params, options);
      this.#originator = params.originator;
    }
    get selected() {
      const token = this.token;
      const alliance = token.actor.alliance;
      const originatorId = this.#originator.id;
      const data = getTokenData(token) ?? {};
      return getValidTokens(token).filter((t) => {
        if (t.id === originatorId || t.actor.alliance === alliance)
          return false;
        const visibility = getProperty(data, `${t.id}.visibility`);
        return VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected;
      }).map((t) => t.id);
    }
    processValue({ token, value }) {
      return VISIBILITY_VALUES[value] >= VISIBILITY_VALUES.undetected ? "hidden" : value;
    }
  };
  __name(PointOutValidationMenu, "PointOutValidationMenu");
  var ReverseVisibilityValidationMenu = class extends VisibilityValidationMenu {
    getSavedData(converted = true) {
      const thisId = this.token.id;
      const tokens = getValidTokens(this.token);
      const data = {};
      for (const token of tokens) {
        const tokenData = getTokenData(token, thisId);
        if (tokenData)
          data[token.id] = deepClone(tokenData);
      }
      return converted ? this._convertData(data) : data;
    }
    getData() {
      const parentData = super.getData();
      parentData.isReversed = true;
      parentData.options = VISIBILITIES.map((value) => ({ value, label: localize(`visibility.reversed.${value}`) }));
      return parentData;
    }
    _saveData(currentData) {
      const scene = this.scene;
      const thisId = this.token.id;
      const updates = [];
      for (const [tokenId, data] of Object.entries(currentData)) {
        let update = { _id: tokenId };
        const token = scene.tokens.get(tokenId);
        if (token) {
          if (data.visibility === defaultValues.visibility)
            delete data.visibility;
          const original = getTokenData(token, thisId);
          if (original?.visibility === data.visibility)
            continue;
          if (!original.cover && !data.visibility) {
            update[`flags.${MODULE_ID}.data.-=${thisId}`] = true;
          } else if (!data.visibility) {
            update[`flags.${MODULE_ID}.data.${thisId}.-=visibility`] = true;
          } else {
            update[`flags.${MODULE_ID}.data.${thisId}.visibility`] = data.visibility;
          }
        } else
          update[`flags.${MODULE_ID}.data.-=${thisId}`] = true;
        updates.push(update);
      }
      scene.updateEmbeddedDocuments("Token", updates);
    }
  };
  __name(ReverseVisibilityValidationMenu, "ReverseVisibilityValidationMenu");
  var SeekValidationMenu = class extends ReverseVisibilityValidationMenu {
    static async openMenu(params, options) {
      const validated = await super.openMenu(params, options);
      if (validated)
        deleteTokenTemplate(params.token);
    }
    processValue({ token, value }) {
      const roll = this.roll;
      const dc = token.actor.skills.stealth.dc.value;
      const visibility = VISIBILITY_VALUES[value];
      const success = new DegreeOfSuccess(roll, dc).value;
      if (success >= DegreeOfSuccess.CRITICAL_SUCCESS && visibility >= VISIBILITY_VALUES.hidden)
        return "observed";
      else if (success >= DegreeOfSuccess.SUCCESS && visibility === VISIBILITY_VALUES.hidden)
        return "observed";
      else if (success >= DegreeOfSuccess.SUCCESS && visibility >= VISIBILITY_VALUES.undetected)
        return "hidden";
      else
        return value;
    }
  };
  __name(SeekValidationMenu, "SeekValidationMenu");

  // src/action.js
  function setupActions() {
    const hide = game.pf2e.actions.get("hide");
    const BaseAction = getPrototype(hide, 2).constructor;
    const BaseActionVariant = getPrototype(hide.toActionVariant(), 2).constructor;
    const SingleCheckAction = getPrototype(hide, 1).constructor;
    const SingleCheckActionVariant = getPrototype(hide.toActionVariant(), 1).constructor;
    setupCover(BaseAction, BaseActionVariant);
    setupHide(SingleCheckAction, SingleCheckActionVariant);
    setupSeek(SingleCheckAction, SingleCheckActionVariant);
    setupPointOut(BaseAction, BaseActionVariant);
  }
  __name(setupActions, "setupActions");
  function setupPointOut(BaseAction, BaseActionVariant) {
    class PointOutVariant extends BaseActionVariant {
      async use(options = {}) {
        const action = localize("action.point-out");
        const token = getSelectedToken(options, action);
        if (token)
          pointOut(this, token);
      }
    }
    __name(PointOutVariant, "PointOutVariant");
    class PointOut extends BaseAction {
      constructor() {
        super({
          cost: 1,
          name: `${MODULE_ID}.action.point-out`,
          description: `${MODULE_ID}.action.point-out.description`,
          rollOptions: ["action:point-out"],
          slug: "point-out",
          traits: ["auditory", "manipulate", "visual"]
        });
      }
      toActionVariant(data = {}) {
        data.name ??= this.name;
        return new PointOutVariant(this, data);
      }
    }
    __name(PointOut, "PointOut");
    game.pf2e.actions.set("point-out", new PointOut());
  }
  __name(setupPointOut, "setupPointOut");
  async function pointOut({ name, traits }, token) {
    const target = game.user.targets.filter((t) => t.actor).first();
    const visibility = target ? getTokenData(target, token.id, "visibility") : void 0;
    const isVisible = target && VISIBILITY_VALUES[visibility] < VISIBILITY_VALUES.undetected;
    let description;
    if (isVisible) {
      const dc = target.actor.skills.stealth.dc.value;
      description = localize("message.point-out.short-check", {
        check: `@Check[type:perception|dc:${dc}|traits:auditory,manipulate,visual|showDC:gm]`
      });
    } else
      description = localize("message.point-out.short");
    const content = await renderTemplate(templatePath("point-out"), {
      description,
      name,
      traits: traits.map((slug) => ({
        slug,
        tooltip: CONFIG.PF2E.traitsDescriptions[slug],
        name: CONFIG.PF2E.actionTraits[slug]
      }))
    });
    const flags = {
      pointOut: isVisible ? target.id : void 0
    };
    createTokenMessage({ content, token, flags });
  }
  __name(pointOut, "pointOut");
  function setupSeek(SingleCheckAction, SingleCheckActionVariant) {
    class SeekVariant extends SingleCheckActionVariant {
      async use(options = {}) {
        const action = game.i18n.localize("PF2E.Actions.Seek.Title");
        const token = getSelectedToken(options, action);
        if (!token)
          return;
        if (!await seek(token))
          return deleteTokenTemplate(token);
        options.actors = [token.actor];
        const result = await super.use(options);
        if (game.user.isGM) {
          const { selected } = result[0].message.getFlag("pf2e", "context");
          if (selected)
            openVisibilityValidationMenu({ token, result, ValidationMenu: SeekValidationMenu });
        }
        return result;
      }
    }
    __name(SeekVariant, "SeekVariant");
    class Seek extends SingleCheckAction {
      constructor() {
        super({
          cost: 1,
          description: "PF2E.Actions.Seek.Description",
          name: "PF2E.Actions.Seek.Title",
          notes: [
            { outcome: ["criticalSuccess"], text: "PF2E.Actions.Seek.Notes.criticalSuccess" },
            { outcome: ["success"], text: "PF2E.Actions.Seek.Notes.success" }
          ],
          rollOptions: ["action:seek"],
          slug: "seek",
          statistic: "perception",
          traits: ["concentrate", "secret"]
        });
      }
      toActionVariant(data) {
        return new SeekVariant(this, data);
      }
    }
    __name(Seek, "Seek");
    game.pf2e.actions.set("seek", new Seek());
  }
  __name(setupSeek, "setupSeek");
  async function seek(token) {
    const unit = game.i18n.localize("PF2E.Foot");
    let content = '<p style="margin: 0 0.3em; text-align: center;">';
    content += `${localize("dialog.seek.hint")}</p><p>`;
    content += createButton(
      "create-cone",
      "fa-thin fa-cubes",
      game.i18n.format("PF2E.TemplateLabel", {
        size: 30,
        unit,
        shape: game.i18n.localize(CONFIG.PF2E.areaTypes.cone)
      })
    );
    content += createButton(
      "create-burst",
      "fa-thin fa-cubes",
      game.i18n.format("PF2E.TemplateLabel", {
        size: 15,
        unit,
        shape: game.i18n.localize(CONFIG.PF2E.areaTypes.burst)
      })
    );
    content += "</p>";
    return Dialog.wait(
      {
        title: `${token.name} - ${game.i18n.localize("PF2E.Actions.Seek.Title")}`,
        content,
        buttons: {
          ok: {
            icon: '<i class="fa-solid fa-check"></i>',
            label: localize("dialog.seek.accept"),
            callback: () => true
          },
          no: {
            icon: '<i class="fa-solid fa-xmark"></i>',
            label: localize("dialog.seek.cancel"),
            callback: (html) => false
          }
        },
        close: () => false,
        render: (html) => {
          const content2 = html.filter(".dialog-content");
          content2.find("[data-action=create-cone], [data-action=create-burst]").on("click", (event) => {
            const { action } = event.currentTarget.dataset;
            deleteTokenTemplate(token);
            createSeekTemplate(action === "create-cone" ? "cone" : "burst", token);
          });
        }
      },
      { width: 300, left: 10 }
    );
  }
  __name(seek, "seek");
  function setupHide(SingleCheckAction, SingleCheckActionVariant) {
    class HideVariant extends SingleCheckActionVariant {
      async use(options = {}) {
        const action = game.i18n.localize("PF2E.Actions.Hide.Title");
        const token = getSelectedToken(options, action);
        if (!token)
          return;
        options.actors = [token.actor];
        const result = await super.use(options);
        if (game.user.isGM) {
          openVisibilityValidationMenu({ token, result, ValidationMenu: HideValidationMenu });
        }
        return result;
      }
    }
    __name(HideVariant, "HideVariant");
    class Hide extends SingleCheckAction {
      constructor() {
        super({
          cost: 1,
          description: `PF2E.Actions.Hide.Description`,
          name: `PF2E.Actions.Hide.Title`,
          rollOptions: ["action:hide"],
          slug: "hide",
          statistic: "stealth",
          traits: ["secret"],
          notes: [{ outcome: ["success", "criticalSuccess"], text: `PF2E.Actions.Hide.Notes.success` }]
        });
      }
      toActionVariant(data) {
        return new HideVariant(this, data);
      }
    }
    __name(Hide, "Hide");
    game.pf2e.actions.set("hide", new Hide());
  }
  __name(setupHide, "setupHide");
  function setupCover(BaseAction, BaseActionVariant) {
    class TakeCoverVariant extends BaseActionVariant {
      async use(options = {}) {
        const action = localize("action.take-cover");
        const token = getSelectedToken(options, action);
        if (token)
          takeCover(token);
      }
    }
    __name(TakeCoverVariant, "TakeCoverVariant");
    class TakeCover extends BaseAction {
      constructor() {
        super({
          cost: 1,
          description: "PF2E.Actions.TakeCover.Description",
          img: "systems/pf2e/icons/conditions-2/status_acup.webp",
          name: "PF2E.Actions.TakeCover.Title",
          slug: "take-cover"
        });
      }
      toActionVariant(data) {
        return new TakeCoverVariant(this, data);
      }
    }
    __name(TakeCover, "TakeCover");
    game.pf2e.actions.set("take-cover", new TakeCover());
  }
  __name(setupCover, "setupCover");
  async function takeCover(token) {
    const actor = token.actor;
    const cover = getCoverEffect(actor);
    const targets = validateTokens(token, game.user.targets.ids);
    if (cover && !targets.length)
      return cover.delete();
    const data = getTokenData(token) ?? {};
    const covers = Object.entries(data).reduce((covers2, [tokenId, { cover: cover2 }]) => {
      if (cover2)
        covers2[tokenId] = cover2;
      return covers2;
    }, {});
    const content = await renderTemplate(templatePath("covers-dialog"), {
      i18n: localize,
      hasTargets: !!targets.length,
      hasCovers: !isEmpty(covers),
      hasTargetCover: targets.some((id) => id in covers),
      isProne: isProne(actor)
    });
    const dialog = new Dialog({
      title: `${token.name} - ${localize("action.take-cover")}`,
      content,
      buttons: {},
      render: (html) => {
        html.find("button").on("click", async (event) => {
          const { level } = event.currentTarget.dataset;
          const skip = getSetting("skip-cover");
          const process = /* @__PURE__ */ __name(async (cover2, selected) => {
            selected = selected ? targets : void 0;
            const flavor = cover2 === defaultValues.cover ? selected ? "remove" : "remove-all" : "take";
            const message = await createTokenMessage({
              content: localize(`message.cover.${flavor}`, { cover: localize(`cover.${cover2}`) }),
              flags: { selected, cover: cover2, skipWait: skip },
              token
            });
            if (skip) {
              if (cover2 === defaultValues.cover && !selected)
                return clearTokenData(token);
              const data2 = deepClone(getTokenData(token)) ?? {};
              for (const tokenId of targets) {
                setProperty(data2, `${tokenId}.cover`, cover2);
              }
              return setTokenData(token, data2);
            } else if (game.user.isGM) {
              CoverValidationMenu.openMenu({ token, selected, value: cover2, message });
            }
          }, "process");
          if (level === "remove-all")
            process(defaultValues.cover);
          else if (level === "remove")
            process(defaultValues.cover, true);
          else if (targets.length)
            process(level, true);
          else {
            const source = createCoverSource(level);
            actor.createEmbeddedDocuments("Item", [source]);
          }
          dialog.close();
        });
      }
    }).render(true);
  }
  __name(takeCover, "takeCover");
  function getSelectedToken(options, action) {
    let tokens = options.tokens?.filter((t) => t.actor) ?? [];
    if (!Array.isArray(tokens))
      tokens = [tokens];
    let actors = options.actors ?? [];
    if (!Array.isArray(actors))
      actors = [actors];
    if (!tokens.length && actors.length === 1)
      tokens = [getActorToken(actors[0])].filter(Boolean);
    if (!tokens.length)
      tokens = canvas.tokens.controlled.filter((t) => t.actor);
    if (!tokens.length)
      tokens = [getActorToken(game.user.character)].filter(Boolean);
    if (tokens.length > 1) {
      ui.notifications.warn(localize("action.only-one", { action }));
      return;
    } else if (!tokens.length) {
      ui.notifications.warn(localize("action.must-one", { action }));
      return;
    }
    const token = tokens[0];
    if (!token?.actor?.isOfType("creature")) {
      ui.notifications.warn(localize("action.must-creature", { action }));
      return;
    }
    return token;
  }
  __name(getSelectedToken, "getSelectedToken");
  function createButton(action, icon, label) {
    return `<button type="button" data-action="${action}" style="margin: 0 0 5px; padding: 0;">
    <i class="${icon}"></i> ${label}</button>
</button>`;
  }
  __name(createButton, "createButton");
  function openVisibilityValidationMenu({ token, result, ValidationMenu: ValidationMenu2 }) {
    const roll = result[0].roll;
    const message = result[0].message;
    const selected = message.getFlag("pf2e", "context.selected");
    ValidationMenu2.openMenu({ token, roll, selected, message });
  }
  __name(openVisibilityValidationMenu, "openVisibilityValidationMenu");

  // src/check.js
  async function checkRoll(wrapped, ...args) {
    const context = args[1];
    if (!context)
      return wrapped(...args);
    if (Array.isArray(context.options))
      context.options = new Set(context.options);
    const { actor, createMessage = "true", type, token, target, isReroll } = context;
    const originToken = token ?? getActorToken(actor);
    const targetToken = target?.token;
    const isAttackRoll = attackCheckRoll.includes(type);
    const flatCheck = getSetting("flat-check");
    if (isReroll || !createMessage || !originToken || !validCheckRoll.includes(type) || isAttackRoll && (!targetToken || flatCheck === "none"))
      return wrapped(...args);
    if (isAttackRoll && targetToken.actor) {
      const options = optionsToObject(context.options).origin;
      const visibility = updateVisibilityFromOptions(getVisibility(targetToken, originToken), options?.visibility);
      if (!visibility)
        return wrapped(...args);
      if (visibility === "concealed" && originToken.actor?.hasLowLightVision)
        return wrapped(...args);
      const optionDC = options?.[visibility]?.dc?.[0];
      if (optionDC == 0)
        return wrapped(...args);
      const dc = optionDC ?? (visibility === "concealed" ? 5 : 11);
      const roll = await new Roll("1d20").evaluate({ async: true });
      const total = roll.total;
      const isSuccess = total >= dc;
      const isUndetected2 = VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected;
      const success = isSuccess ? 2 : 1;
      let flavor = `${game.i18n.localize("PF2E.FlatCheck")}:`;
      flavor += `<strong> ${game.i18n.localize(`PF2E.condition.${visibility}.name`)}</strong>`;
      flavor += (await game.pf2e.Check.createResultFlavor({
        target,
        degree: {
          value: success,
          unadjusted: success,
          adjustment: null,
          dieResult: total,
          rollTotal: total,
          dc: { value: dc }
        }
      })).outerHTML;
      const messageData = {
        flavor,
        speaker: ChatMessage.getSpeaker({ token: originToken instanceof Token ? originToken.document : originToken })
      };
      if (isUndetected2) {
        context.options.add("secret");
        context.isSuccess = isSuccess;
        context.visibility = visibility;
        let blindCheck = `${game.i18n.localize("PF2E.FlatCheck")}:`;
        blindCheck += `<strong> ${game.i18n.localize(`PF2E.condition.undetected.name`)}</strong>`;
        messageData.flags = {
          [MODULE_ID]: {
            blindCheck
          }
        };
      }
      await roll.toMessage(messageData, { rollMode: isUndetected2 ? game.user.isGM ? "gmroll" : "blindroll" : "roll" });
      if (flatCheck !== "roll" && !isUndetected2 && !isSuccess)
        return;
    } else if (context.options.has("action:hide")) {
      context.selected = game.user.targets.ids;
    } else if (context.options.has("action:seek")) {
      const highlighted = getTokenTemplateTokens(originToken);
      if (highlighted === void 0)
        return wrapped(...args);
      const tokens = highlighted ?? Array.from(game.user.targets);
      context.selected = validateTokens(originToken, tokens).filter((t) => !t.document.hidden).map((t) => t.id);
    }
    return wrapped(...args);
  }
  __name(checkRoll, "checkRoll");
  function renderCheckModifiersDialog(dialog, html) {
    const { createMessage = "true", type, token, target, isReroll, options, dc } = dialog.context;
    const originToken = token;
    const targetToken = target?.token;
    const targetActor = target?.actor;
    if (isReroll || !createMessage || !originToken || !targetToken || !targetActor || !attackCheckRoll.includes(type))
      return;
    const coverEffect = getCoverEffect(targetActor);
    const currentCover = coverEffect ? findChoiceSetRule(coverEffect)?.selection.level ?? getFlag(coverEffect, "level") : void 0;
    let coverOverride = dialog[MODULE_ID]?.coverOverride ?? currentCover;
    let template = '<div class="roll-mode-panel">';
    template += `<div class="label">${localize("dice-checks.cover.label")}</div>`;
    template += `<select name="overrideCover"><option value="">${localize("dice-checks.cover.none")}</option>`;
    const covers = isProne(targetActor) ? COVERS.slice(1) : COVERS.slice(1, -1);
    covers.forEach((slug) => {
      const selected = slug === coverOverride ? "selected" : "";
      const label = localize(`cover.${slug}`);
      template += `<option value="${slug}" ${selected}>${label}</option>`;
    });
    template += "</select></div>";
    template += "<hr>";
    html.find(".roll-mode-panel").before(template);
    html.find("select[name=overrideCover]").on("change", (event) => {
      const value = event.currentTarget.value || void 0;
      setProperty(dialog, `${MODULE_ID}.coverOverride`, value);
      coverOverride = value;
    });
    html.find("button.roll")[0].addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        let modified = false;
        const items = deepClone(targetActor._source.items);
        if (coverOverride !== currentCover) {
          modified = true;
          const coverIndex = items.findIndex((i) => getProperty(i, "flags.core.sourceId") === COVER_UUID);
          if (coverIndex !== -1)
            items.splice(coverIndex, 1);
          if (coverOverride) {
            const source = createCoverSource(coverOverride);
            items.push(source);
          }
        }
        if (modified) {
          target.actor = targetActor.clone({ items }, { keepId: true });
          if (dc?.slug) {
            const statistic = target.actor.getStatistic(dc.slug)?.dc;
            if (statistic) {
              dc.value = statistic.value;
              dc.statistic = statistic;
            }
          }
        }
        dialog.resolve(true);
        dialog.isResolved = true;
        dialog.close();
      },
      true
    );
    dialog.setPosition();
  }
  __name(renderCheckModifiersDialog, "renderCheckModifiersDialog");

  // src/detection.js
  function basicSightCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target))
      return false;
    return !isValidTarget(target) || !isUndetected(target, "basicSight") && !isHidden(target);
  }
  __name(basicSightCanDetect, "basicSightCanDetect");
  function hearingCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target))
      return false;
    if (!game.settings.get("pf2e", "automation.rulesBasedVision"))
      return true;
    return !visionSource.object.actor?.hasCondition("deafened") && isValidTarget(target) && !isUndetected(target, "hearing");
  }
  __name(hearingCanDetect, "hearingCanDetect");
  function feelTremorCanDetect(wrapped, visionSource, target) {
    if (!wrapped(visionSource, target))
      return false;
    return isValidTarget(target) && !isUndetected(target, "feelTremor");
  }
  __name(feelTremorCanDetect, "feelTremorCanDetect");
  function isValidTarget(target) {
    return !!(target instanceof Token && target.actor);
  }
  __name(isValidTarget, "isValidTarget");
  function reachesThreshold(target, tokens, threshold) {
    for (const origin of tokens) {
      const visibility = getTokenData(target, origin.id, "visibility");
      if (VISIBILITY_VALUES[visibility] >= threshold)
        return true;
    }
    return false;
  }
  __name(reachesThreshold, "reachesThreshold");
  function isUndetected(target, mode, unnoticed = false) {
    const tokens = game.user.isGM ? canvas.tokens.controlled : target.scene.tokens.filter((t) => t.isOwner);
    const filtered = tokens.filter((t) => t.detectionModes.some((d) => d.id === mode));
    return reachesThreshold(target, filtered, unnoticed ? VISIBILITY_VALUES.unnoticed : VISIBILITY_VALUES.undetected);
  }
  __name(isUndetected, "isUndetected");
  function isHidden(target) {
    let tokens = canvas.tokens.controlled;
    if (!game.user.isGM && !tokens.length) {
      tokens = target.scene.tokens.filter((t) => t.isOwner);
      if (tokens.length !== 1)
        return false;
    }
    return reachesThreshold(target, tokens, VISIBILITY_VALUES.hidden);
  }
  __name(isHidden, "isHidden");

  // src/combat.js
  function renderCombatTracker(tracker, html) {
    if (getSetting("target"))
      setupToggleTarget(html);
    hideUndetected(html);
  }
  __name(renderCombatTracker, "renderCombatTracker");
  function hideUndetected(html) {
    if (!canvas.ready)
      return;
    const combatants = game.combats.viewed?.combatants;
    if (!combatants?.size)
      return;
    html.find("#combat-tracker .combatant").each((i, li) => {
      const { combatantId } = li.dataset;
      const token = combatants.get(combatantId ?? "")?.token;
      if (!token)
        return;
      if (isUndetected(token, "basicSight", true))
        li.remove();
    });
  }
  __name(hideUndetected, "hideUndetected");
  function setupToggleTarget(html) {
    html.find("[data-control=toggleTarget]").each((_, el) => {
      el.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          const { combatantId } = event.currentTarget.closest(".combatant").dataset;
          const combatant = game.combats.viewed.combatants.get(combatantId ?? "");
          const token = combatant?.token;
          if (!token)
            return;
          const isTargeted = Array.from(game.user.targets).some((t) => t.document === token);
          token.object.setTarget(!isTargeted, { releaseOthers: !event.shiftKey });
        },
        true
      );
    });
  }
  __name(setupToggleTarget, "setupToggleTarget");
  function renderCombatTrackerConfig(config, html) {
    const checked = getSetting("encounter");
    html.find(".form-group").last().after(`<div class="form-group">
    <label>${localize("settings.encounter.name")}</label>
    <input type="checkbox" name="pf2e-perception.encounter" ${checked ? "checked" : ""}>
    <p class="notes">${localize("settings.encounter.short")}</p>
</div>`);
    html.find('input[name="pf2e-perception.encounter"]').on("change", (event) => {
      const checked2 = event.currentTarget.checked;
      setSetting("encounter", checked2);
    });
  }
  __name(renderCombatTrackerConfig, "renderCombatTrackerConfig");

  // src/apps/icon-path-menu.js
  var ICONS = ["cover", "concealed", "hidden", "undetected", "unnoticed"];
  var IconPathMenu = class extends FormApplication {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        template: templatePath("icon-path-menu"),
        title: localize("settings.icon-path.name"),
        width: 500
      });
    }
    getData() {
      const saved = getSetting("icon-path");
      const icons = ICONS.map((name) => ({
        name,
        placeholder: ICONS_PATHS[name],
        value: saved[name] ?? "",
        label: name === "cover" ? localize("icon-path.cover") : game.i18n.localize(CONFIG.PF2E.conditionTypes[name])
      }));
      return {
        icons,
        i18n: localize
      };
    }
    activateListeners(html) {
      super.activateListeners(html);
      html.find("button[name=cancel]").on("click", (event) => {
        event.prefentDefault();
        this.close();
      });
    }
    async _updateObject(event, formData) {
      setSetting("icon-path", formData);
    }
  };
  __name(IconPathMenu, "IconPathMenu");

  // src/settings.js
  function registerSettings() {
    register("icon-path", Object, {}, { config: false });
    game.settings.registerMenu(MODULE_ID, "icon-path-menu", {
      name: path("icon-path", "name"),
      label: path("icon-path", "label"),
      icon: "fa-solid fa-list",
      restricted: true,
      type: IconPathMenu
    });
    register("permission", String, CONST.USER_ROLES.GAMEMASTER, {
      choices: {
        1: path("permission", "choices.1"),
        2: path("permission", "choices.2"),
        3: path("permission", "choices.3"),
        4: path("permission", "choices.4")
      }
    });
    register("target", Boolean, true, {
      onChange: () => ui.combat?.render()
    });
    register("lesser", String, "ten", {
      choices: {
        none: path("lesser", "choices.none"),
        cross: path("lesser", "choices.cross"),
        zero: path("lesser", "choices.zero"),
        ten: path("lesser", "choices.ten"),
        twenty: path("lesser", "choices.twenty")
      }
    });
    register("standard", Boolean, true);
    register("standard-type", String, "center", {
      choices: {
        center: path("standard-type", "choices.center"),
        points: path("standard-type", "choices.points")
        // corners: path('standard-type', 'choices.corners'),
      }
    });
    register("skip-cover", Boolean, true);
    register("validation", String, "all", {
      choices: {
        all: path("validation", "choices.all"),
        selected: path("validation", "choices.selected"),
        changed: path("validation", "choices.changed")
      }
    });
    register("exposure", Boolean, true);
    register("flat-check", String, "cancel", {
      choices: {
        none: path("flat-check", "choices.none"),
        roll: path("flat-check", "choices.roll"),
        cancel: path("flat-check", "choices.cancel")
      }
    });
    register("encounter", Boolean, false);
  }
  __name(registerSettings, "registerSettings");
  function path(setting, key) {
    return `${MODULE_ID}.settings.${setting}.${key}`;
  }
  __name(path, "path");
  function register(name, type, defValue, extra = {}) {
    game.settings.register(MODULE_ID, name, {
      name: path(name, "name"),
      hint: path(name, "hint"),
      scope: "world",
      config: true,
      type,
      default: defValue,
      ...extra
    });
  }
  __name(register, "register");

  // src/main.js
  var CHECK_ROLL = "game.pf2e.Check.roll";
  var GET_ROLL_CONTEXT = "CONFIG.Actor.documentClass.prototype.getRollContext";
  var BASIC_SIGHT_CAN_DETECT = "CONFIG.Canvas.detectionModes.basicSight._canDetect";
  var HEARING_CAN_DETECT = "CONFIG.Canvas.detectionModes.hearing._canDetect";
  var FEEL_TREMOR_CAN_DETECT = "CONFIG.Canvas.detectionModes.feelTremor._canDetect";
  Hooks.once("init", () => {
    registerSettings();
    setupActions();
    libWrapper.register(MODULE_ID, CHECK_ROLL, checkRoll);
    libWrapper.register(MODULE_ID, GET_ROLL_CONTEXT, getRollContext, "OVERRIDE");
    libWrapper.register(MODULE_ID, BASIC_SIGHT_CAN_DETECT, basicSightCanDetect);
    libWrapper.register(MODULE_ID, HEARING_CAN_DETECT, hearingCanDetect);
    libWrapper.register(MODULE_ID, FEEL_TREMOR_CAN_DETECT, feelTremorCanDetect);
    const isGM = game.data.users.find((x) => x._id === game.data.userId).role >= CONST.USER_ROLES.GAMEMASTER;
    if (isGM) {
      Hooks.on("renderSceneConfig", renderSceneConfig);
      Hooks.on("renderCombatTrackerConfig", renderCombatTrackerConfig);
    } else {
      Hooks.on("renderCombatTracker", renderCombatTracker);
    }
  });
  Hooks.once("ready", () => {
    game.modules.get(MODULE_ID).api = {
      geometry: {
        clearDebug,
        lineIntersectWall,
        pointToTokenIntersectWall
      },
      token: {
        getCreatureCover,
        getVisibility,
        clearConditionals,
        showConditionals,
        showAllConditionals,
        hasStandardCover,
        getTokenData
      },
      lighting: {
        getLightExposure
      },
      actor: {
        getActorToken,
        isProne,
        getCoverEffect,
        getConditionalCover
      },
      scene: {
        getValidTokens,
        validateTokens,
        getSceneSetting
      },
      detection: {
        isUndetected
      }
    };
  });
  Hooks.on("hoverToken", hoverToken);
  Hooks.on("pasteToken", pasteToken);
  Hooks.on("updateToken", updateToken);
  Hooks.on("deleteToken", deleteToken);
  Hooks.on("controlToken", controlToken);
  Hooks.on("renderTokenHUD", renderTokenHUD);
  Hooks.on("canvasPan", () => clearConditionals());
  Hooks.on("renderChatMessage", renderChatMessage);
  Hooks.on("renderCheckModifiersDialog", renderCheckModifiersDialog);
})();
//# sourceMappingURL=main.js.map
