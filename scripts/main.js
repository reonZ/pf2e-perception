(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

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
  function getStandardSetting(scene) {
    return getFlag(scene, "standard") ?? getSetting("standard");
  }
  __name(getStandardSetting, "getStandardSetting");

  // src/effect.js
  function createFlatFootedSource(visibility) {
    const name = game.i18n.localize(`PF2E.condition.${visibility}.name`);
    const condition = game.pf2e.ConditionManager.getCondition("flat-footed", { name });
    return condition.toObject();
  }
  __name(createFlatFootedSource, "createFlatFootedSource");
  function createCoverSource(cover) {
    const bonus = COVER_VALUES[cover];
    return {
      _id: "I9lfZUiCwMiGogVi",
      img: "systems/pf2e/icons/conditions-2/status_acup.webp",
      name: localize("cover", cover),
      system: {
        description: {
          gm: "",
          value: "<p>When you're behind an obstacle that could block weapons, guard you against explosions, and make you harder to detect, you're behind cover. Standard cover gives you a +2 circumstance bonus to AC, to Reflex saves against area effects, and to Stealth checks to Hide, Sneak, or otherwise avoid detection. You can increase this to greater cover using the Take Cover basic action, increasing the circumstance bonus to +4. If cover is especially light, typically when it's provided by a creature, you have lesser cover, which grants a +1 circumstance bonus to AC. A creature with standard cover or greater cover can attempt to use Stealth to Hide, but lesser cover isn't sufficient.</p>"
        },
        rules: [
          { domain: "all", key: "RollOption", option: `self:cover-bonus:${bonus}` },
          { domain: "all", key: "RollOption", option: `self:cover-level:${cover}` },
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
      flags: { core: { sourceId: COVER_UUID } }
    };
  }
  __name(createCoverSource, "createCoverSource");
  function findChoiceSetRule(item, flag = void 0) {
    if (!item)
      return void 0;
    return item.system.rules.find((rule) => rule.key === "ChoiceSet" && (!flag || rule.flag === flag));
  }
  __name(findChoiceSetRule, "findChoiceSetRule");

  // src/scene.js
  function renderSceneConfig(config, html) {
    const tab = html.find('.tab[data-tab="basic"]');
    const checked = getStandardSetting(config.object);
    tab.find("hr").first().after(`<div class="form-group">
    <label>${localize("settings.standard.name")}</label>
    <input type="checkbox" name="flags.pf2e-perception.standard" ${checked ? "checked" : ""}>
    <p class="notes">${localize("settings.standard.short")}</p>
</div><hr>`);
    config.setPosition();
  }
  __name(renderSceneConfig, "renderSceneConfig");
  function getValidTokens(token) {
    token = token instanceof Token ? token.document : token;
    if (!(token instanceof TokenDocument))
      return [];
    return token.scene.tokens.filter((t) => t !== token && t.actor?.isOfType("creature"));
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

  // src/utils.js
  function omit(object, names) {
    const set = new Set(names);
    return Object.entries(object).reduce((acc, [name, value]) => {
      if (!set.has(name))
        acc[name] = value;
      return acc;
    }, {});
  }
  __name(omit, "omit");
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
        i18n: (...args) => localize(...args),
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
  var EDGES = ["topEdge", "rightEdge", "bottomEdge", "leftEdge"];
  var POINTS = [
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
  function lineIntersectRect(origin, target, rect) {
    for (const edgeName of EDGES) {
      const edge = rect[edgeName];
      if (lineSegmentIntersects(origin, target, edge.A, edge.B))
        return true;
    }
    return false;
  }
  __name(lineIntersectRect, "lineIntersectRect");
  function lineIntersectWall(origin, target) {
    return CONFIG.Canvas.polygonBackends.move.testCollision(origin, target, { type: "move", mode: "any" });
  }
  __name(lineIntersectWall, "lineIntersectWall");
  function pointToTokenPointsIntersectWall(origin, token, nb) {
    const rect = token.bounds;
    let intersected = 0;
    for (const point of POINTS) {
      const coords = getRectPoint(point, rect);
      if (lineIntersectWall(origin, coords))
        intersected++;
      if (intersected === nb)
        return true;
    }
    return false;
  }
  __name(pointToTokenPointsIntersectWall, "pointToTokenPointsIntersectWall");
  function getRectPoint(point, rect) {
    return { x: rect.x + rect.width * point.x, y: rect.y + rect.height * point.y };
  }
  __name(getRectPoint, "getRectPoint");

  // src/token.js
  function renderTokenHUD(hud, html) {
    if (!hud.object.actor?.isOfType("creature"))
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
    const data = getFlag(token, path2.join("."));
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
    for (const tokenId in data) {
      if (!valid.includes(tokenId)) {
        delete data[tokenId];
        continue;
      }
      const token2 = data[tokenId];
      if (token2.visibility === defaultValues.visibility)
        delete token2.visibility;
      if (token2.cover === defaultValues.cover)
        delete token2.cover;
      if (!token2.visibility && !token2.cover)
        delete data[tokenId];
    }
    token = token instanceof Token ? token.document : token;
    if (isEmpty(data))
      return clearTokenData(token);
    else
      return token.update({ [`flags.${MODULE_ID}.data`]: data }, { diff: false, recursive: false });
  }
  __name(setTokenData, "setTokenData");
  function hasStandardCover(origin, target) {
    const scene = origin.scene;
    if (!getStandardSetting(scene))
      return false;
    const standard = getSetting("standard-type");
    if (standard === "center")
      return lineIntersectWall(origin.center, target.center);
    else if (standard === "points")
      return pointToTokenPointsIntersectWall(origin.center, target, 2);
  }
  __name(hasStandardCover, "hasStandardCover");
  function hasLesserCover(originToken, targetToken) {
    if (!getSetting("lesser"))
      return false;
    const origin = originToken.center;
    const target = targetToken.center;
    for (const tokenDocument of originToken.scene.tokens) {
      const token = tokenDocument.object;
      if (token === originToken || token === targetToken)
        continue;
      if (lineIntersectRect(origin, target, token.bounds))
        return true;
    }
    return false;
  }
  __name(hasLesserCover, "hasLesserCover");
  function getVisibility(origin, target) {
    const systemVisibility = (() => {
      const originActor = origin.actor;
      for (const visibility2 of ["unnoticed", "undetected", "hidden", "concealed"]) {
        if (originActor.hasCondition(visibility2))
          return visibility2;
      }
    })();
    const visibility = getTokenData(origin, target.id, "visibility");
    return VISIBILITY_VALUES[systemVisibility] > VISIBILITY_VALUES[visibility] ? systemVisibility : visibility;
  }
  __name(getVisibility, "getVisibility");
  function updateToken(token, data) {
    const flags = data.flags?.["pf2e-perception"];
    if (!flags)
      return;
    if (flags.data || flags["-=data"] !== void 0)
      token.object.renderFlags.set({ refreshVisibility: true });
  }
  __name(updateToken, "updateToken");

  // src/actor.js
  function getSelfRollOptions(wrapped, prefix) {
    const result = wrapped(prefix);
    if (prefix === "origin") {
      const token = getActorToken(this);
      if (token)
        result.push(`origin:tokenid:${token.id}`);
    }
    return result;
  }
  __name(getSelfRollOptions, "getSelfRollOptions");
  function getContextualClone(wrapped, rollOptions, ephemeralEffects) {
    const originId = rollOptions.find((option) => option.startsWith("origin:tokenid:"))?.slice(15);
    if (!originId)
      return wrapped(rollOptions, ephemeralEffects);
    const target = getActorToken(this, true);
    const origin = target?.scene.tokens.get(originId).object;
    if (!origin || !target)
      return wrapped(rollOptions, ephemeralEffects);
    const conditionalCover = getConditionalCover(origin, target, rollOptions);
    if (conditionalCover)
      ephemeralEffects.push(createCoverSource(conditionalCover));
    const visibility = getVisibility(origin, target);
    if (VISIBILITY_VALUES[visibility] > VISIBILITY_VALUES.concealed)
      ephemeralEffects.push(createFlatFootedSource(visibility));
    return wrapped(rollOptions, ephemeralEffects);
  }
  __name(getContextualClone, "getContextualClone");
  function getActorToken(actor, target = false) {
    if (!actor)
      return void 0;
    const tokens = target ? game.user.targets : canvas.tokens.controlled;
    return tokens.find((token) => token.actor === actor) ?? actor.getActiveTokens().shift() ?? null;
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
  function getConditionalCover(origin, target, options) {
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
    if (COVER_VALUES[cover] < COVER_VALUES.standard && COVER_VALUES[systemCover] < COVER_VALUES.standard && hasStandardCover(origin, target)) {
      cover = "standard";
    } else if (!cover && !systemCover && hasLesserCover(origin, target))
      cover = "lesser";
    if (prone && COVER_VALUES[cover] > COVER_VALUES.lesser)
      return "greater-prone";
    return COVER_VALUES[cover] > COVER_VALUES[systemCover] ? cover : void 0;
  }
  __name(getConditionalCover, "getConditionalCover");

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

  // src/roll.js
  async function checkRoll(wrapped, ...args) {
    const context = args[1];
    if (!context)
      return wrapped(...args);
    const { actor, createMessage = "true", type, token, target, isReroll, skipPerceptionChecks } = context;
    const originToken = token ?? getActorToken(actor);
    const targetToken = target?.token;
    const isAttackRoll = attackCheckRoll.includes(type);
    if (isReroll || skipPerceptionChecks || !createMessage || !originToken || !validCheckRoll.includes(type) || isAttackRoll && !targetToken)
      return wrapped(...args);
    if (isAttackRoll) {
      const visibility = getVisibility(targetToken, originToken);
      if (!visibility)
        return wrapped(...args);
      const dc = visibility === "concealed" ? 5 : 11;
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
      if (isUndetected2) {
        const addButton = /* @__PURE__ */ __name((type2) => {
          flavor += createChatButton({
            action: `${type2}-message`,
            icon: "fa-solid fa-message",
            label: localize("message.flat-check.button", type2)
          });
        }, "addButton");
        if (isSuccess)
          addButton("success");
        addButton("failure");
      }
      const speaker = ChatMessage.getSpeaker({ token: originToken });
      const flags = isUndetected2 ? createMessageFlag({ check: args[0], context: args[1], visibility, skipPerceptionChecks: true }) : {};
      await roll.toMessage({ flavor, speaker, flags }, { rollMode: isUndetected2 ? "blindroll" : "roll" });
      if (!isSuccess || isUndetected2)
        return;
    } else if (context.options.has("action:hide")) {
      args[1].selected = game.user.targets.ids;
    } else if (context.options.has("action:seek")) {
      const alliance = originToken.actor.alliance;
      const highlighted = getTokenTemplateTokens(originToken);
      if (!highlighted)
        return wrapped(...args);
      args[1].selected = validateTokens(originToken, highlighted).filter((t) => {
        const otherAlliance = t.actor.alliance;
        return !t.document.hidden && (!otherAlliance || otherAlliance !== alliance);
      }).map((t) => t.id);
    }
    return wrapped(...args);
  }
  __name(checkRoll, "checkRoll");
  function rollAltedCheck(event, context, check) {
    context = recreateContext(context);
    if (!context)
      return;
    check = new game.pf2e.CheckModifier(check.slug, { modifiers: check.modifiers });
    game.pf2e.Check.roll(check, context, event);
  }
  __name(rollAltedCheck, "rollAltedCheck");
  function recreateContext(context) {
    const scene = game.scenes.get(context.scene);
    if (!scene)
      return;
    const actor = game.actors.get(context.actor);
    const token = scene.tokens.get(context.token);
    const target = {
      actor: game.actors.get(context.target?.actor),
      token: scene.tokens.get(context.target?.token)
    };
    if (!actor || !token || !target.actor || !target.token)
      return null;
    return {
      ...context,
      item: context.item ? actor.items.get(context.item) : void 0,
      actor,
      token,
      target,
      options: new Set(context.options)
    };
  }
  __name(recreateContext, "recreateContext");
  function createMessageFlag({ check, context, visibility, skipPerceptionChecks }) {
    return {
      [MODULE_ID]: {
        visibility,
        context: {
          ...context,
          skipPerceptionChecks,
          item: context.item?.id,
          actor: context.actor.id,
          token: context.token.id,
          scene: context.token.scene.id,
          target: context.target ? { actor: context.target.actor.id, token: context.target.token.id } : null,
          dc: context.dc ? omit(context.dc, ["statistic"]) : null,
          options: Array.from(context.options)
        },
        check: check ? {
          slug: check.slug,
          modifiers: check.modifiers.map((modifier) => modifier.toObject())
        } : void 0
      }
    };
  }
  __name(createMessageFlag, "createMessageFlag");

  // src/chat.js
  function renderChatMessage(message, html) {
    const token = message.token;
    if (!token)
      return;
    const { rollCheck, context, check, visibility, cover, selected, skipWait, validated } = getFlags(message);
    const pf2eContext = message.getFlag("pf2e", "context");
    if (game.user.isGM) {
      if (attackCheckRoll.includes(context?.type) && check && !rollCheck) {
        html.find("[data-action=success-message]").on("click", () => {
          let content = localize("message.flat-check.success");
          content += createChatButton({
            action: "roll-check",
            icon: "fa-solid fa-dice-d20",
            label: localize("message.flat-check.button", context.type)
          });
          createTokenMessage({ content, token, flags: { context, check, rollCheck: true } });
        });
        html.find("[data-action=failure-message]").on("click", () => {
          createTokenMessage({ content: localize("message.flat-check.failure"), token });
        });
      } else if (cover) {
        const button = createValidateButton({ property: "cover", skipWait, validated });
        html.find(".message-content").append(button);
        html.find("[data-action=validate-cover]").on("click", () => {
          CoverValidationMenu.openMenu({ token, selected, value: cover, message });
        });
      } else if (pf2eContext?.type === "skill-check") {
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
      } else if (pf2eContext?.type === "perception-check") {
        if (pf2eContext.options.includes("action:seek") && pf2eContext.selected) {
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
      }
    } else {
      if (visibility) {
        html.find(".message-header .message-sender").text(token.name);
        html.find(".message-header .flavor-text").html(
          localize("message.flat-check.blind", { visibility: game.i18n.localize(`PF2E.condition.${visibility}.name`) })
        );
      } else if (cover && !skipWait) {
        const hint = waitHint("cover", validated);
        html.find(".message-content").append(hint);
      } else if (pf2eContext?.type === "skill-check" && token.hasPlayerOwner) {
        if (pf2eContext.options.includes("action:hide")) {
          addBlindSkillCheckFlavor({ token, message, html, validated });
        }
      } else if (pf2eContext?.type === "perception-check" && token.hasPlayerOwner) {
        if (pf2eContext.options.includes("action:seek") && pf2eContext.selected) {
          addBlindSkillCheckFlavor({ token, message, html, validated });
        }
      }
    }
    if (rollCheck) {
      if (token.isOwner) {
        html.find("[data-action=roll-check]").on("click", (event) => rollAltedCheck(event, context, check));
      } else {
        html.find("[data-action=roll-check]").remove();
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
    html.find(".message-header .message-sender").text(token.name);
    let flavor = message.getFlag("pf2e", "modifierName");
    flavor += waitHint("visibility", validated);
    html.find(".message-header .flavor-text").html(flavor);
  }
  __name(addBlindSkillCheckFlavor, "addBlindSkillCheckFlavor");
  function waitHint(property, validated) {
    let hint = localize(`message.${property}.player.${validated ? "validated" : "wait"}`);
    if (validated)
      hint = '<i class="fa-solid fa-check" style="color: green;"></i> ' + hint;
    return `<i style="display: block; font-size: .9em; text-align: end;">${hint}</i>`;
  }
  __name(waitHint, "waitHint");
  function addVisibilityValidationButton({ skipWait, validated, html, message, ValidationMenu: ValidationMenu2, token, selected }) {
    const button = createValidateButton({ property: "visibility", skipWait, validated });
    html.find(".message-header .flavor-text").append(button);
    html.find("[data-action=validate-visibility]").on("click", async () => {
      const roll = message.rolls[0].total;
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
    let button = `<button type="button" style="margin: 0 0 5px; padding: 0;" data-action="${action}">`;
    if (icon)
      button += `<i class="${icon}"></i> ${label}</button>`;
    else
      button += label;
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
    get selected() {
      const selected = super.selected;
      if (selected.length)
        return selected;
      const token = this.token;
      const alliance = token.actor.alliance;
      return getValidTokens(token).filter((t) => t.actor.alliance !== alliance).map((t) => t.id);
    }
    processValue({ token, value }) {
      const roll = this.roll;
      const dc = token.actor.perception.dc.value;
      const visibility = VISIBILITY_VALUES[value];
      if (roll >= dc && visibility < VISIBILITY_VALUES.hidden)
        return "hidden";
      else if (roll < dc && visibility >= VISIBILITY_VALUES.hidden)
        return "observed";
      else
        return value;
    }
  };
  __name(HideValidationMenu, "HideValidationMenu");
  var ReverseVisibilityValidationMenu = class extends VisibilityValidationMenu {
    processValue({ token, value }) {
      const roll = this.roll;
      const dc = token.actor.skills.stealth.dc.value;
      const visibility = VISIBILITY_VALUES[value];
      if (roll >= dc + 10 && visibility >= VISIBILITY_VALUES.hidden)
        return "observed";
      else if (roll >= dc && visibility === VISIBILITY_VALUES.hidden)
        return "observed";
      else if (roll >= dc && visibility >= VISIBILITY_VALUES.undetected)
        return "hidden";
      else
        return value;
    }
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
        const token = scene.tokens.get(tokenId);
        if (!token)
          continue;
        if (data.visibility === "observed")
          delete data.visibility;
        const original = getTokenData(token, thisId);
        if (original?.visibility === data.visibility)
          continue;
        let update = { _id: tokenId };
        if (!original.cover && !data.visibility) {
          update[`flags.${MODULE_ID}.data.-=${thisId}`] = true;
        } else if (!data.visibility) {
          update[`flags.${MODULE_ID}.data.${thisId}.-=visibility`] = true;
        } else {
          update[`flags.${MODULE_ID}.data.${thisId}.visibility`] = data.visibility;
        }
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
  }
  __name(setupActions, "setupActions");
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
        const action = localize("actions.take-cover");
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
      i18n: (key) => localize(key),
      hasTargets: !!targets.length,
      hasCovers: !isEmpty(covers),
      hasTargetCover: targets.some((id) => id in covers),
      isProne: isProne(actor)
    });
    const dialog = new Dialog({
      title: `${token.name} - ${localize("actions.take-cover")}`,
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
    let tokens = options.tokens ?? [];
    if (!Array.isArray(tokens))
      tokens = [tokens];
    let actors = options.actors ?? [];
    if (!Array.isArray(actors))
      actors = [actors];
    if (!tokens.length && actors.length === 1)
      tokens = [getActorToken(actors[0])].filter(Boolean);
    if (!tokens.length)
      tokens = canvas.tokens.controlled;
    if (!tokens.length)
      tokens = [getActorToken(game.user.character)].filter(Boolean);
    if (tokens.length > 1) {
      ui.notifications.warn(localize("actions.only-one", { action }));
      return;
    } else if (!tokens.length) {
      ui.notifications.warn(localize("actions.must-one", { action }));
      return;
    }
    const token = tokens[0];
    if (!token?.actor.isOfType("creature")) {
      ui.notifications.warn(localize("actions.must-creature", { action }));
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
    const roll = result[0].roll.total;
    const message = result[0].message;
    const selected = message.getFlag("pf2e", "context.selected");
    ValidationMenu2.openMenu({ token, roll, selected, message });
  }
  __name(openVisibilityValidationMenu, "openVisibilityValidationMenu");

  // src/combat.js
  function allowCombatTarget(allow) {
    Hooks[allow ? "on" : "off"]("renderCombatTracker", renderCombatTracker);
    ui.combat?.render();
  }
  __name(allowCombatTarget, "allowCombatTarget");
  function renderCombatTracker(tracker, html) {
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
  __name(renderCombatTracker, "renderCombatTracker");

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
  function isUndetected(target, mode) {
    const tokens = game.user.isGM ? canvas.tokens.controlled : target.scene.tokens.filter((t) => t.isOwner);
    const filtered = tokens.filter((t) => t.detectionModes.some((d) => d.id === mode));
    return reachesThreshold(target, filtered, VISIBILITY_VALUES.undetected);
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

  // src/settings.js
  function registerSettings() {
    register("target", Boolean, true, {
      onChange: allowCombatTarget
    });
    register("lesser", Boolean, true);
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
  var GET_CONTEXTUAL_CLONE = "CONFIG.Actor.documentClass.prototype.getContextualClone";
  var GET_SELF_ROLL_OPTIONS = "CONFIG.Actor.documentClass.prototype.getSelfRollOptions";
  var BASIC_SIGHT_CAN_DETECT = "CONFIG.Canvas.detectionModes.basicSight._canDetect";
  var HEARING_CAN_DETECT = "CONFIG.Canvas.detectionModes.hearing._canDetect";
  var FEEL_TREMOR_CAN_DETECT = "CONFIG.Canvas.detectionModes.feelTremor._canDetect";
  Hooks.once("setup", () => {
    registerSettings();
    setupActions();
    if (game.user.isGM) {
      Hooks.on("renderTokenHUD", renderTokenHUD);
    }
    libWrapper.register(MODULE_ID, CHECK_ROLL, checkRoll);
    libWrapper.register(MODULE_ID, GET_CONTEXTUAL_CLONE, getContextualClone);
    libWrapper.register(MODULE_ID, GET_SELF_ROLL_OPTIONS, getSelfRollOptions);
    libWrapper.register(MODULE_ID, BASIC_SIGHT_CAN_DETECT, basicSightCanDetect);
    libWrapper.register(MODULE_ID, HEARING_CAN_DETECT, hearingCanDetect);
    libWrapper.register(MODULE_ID, FEEL_TREMOR_CAN_DETECT, feelTremorCanDetect);
    if (!game.user.isGM && getSetting("target"))
      allowCombatTarget(true);
  });
  Hooks.on("pasteToken", pasteToken);
  Hooks.on("updateToken", updateToken);
  Hooks.on("renderChatMessage", renderChatMessage);
  Hooks.on("renderSceneConfig", renderSceneConfig);
})();
//# sourceMappingURL=main.js.map
