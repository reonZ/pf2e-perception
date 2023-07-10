(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // src/constants.js
  var COVER_UUID = "Compendium.pf2e.other-effects.Item.I9lfZUiCwMiGogVi";
  var VISIBILITY_VALUES = {
    [void 0]: 0,
    concealed: 1,
    hidden: 2,
    undetected: 3,
    unnoticed: 4
  };
  var COVER_VALUES = {
    [void 0]: 0,
    lesser: 1,
    standard: 2,
    greater: 3,
    "greater-prone": 4
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
    const valid = getValidTokens(token).map((t) => t.id);
    return tokens.filter((t) => {
      const id = t instanceof Token || t instanceof TokenDocument ? t.id : t;
      return valid.includes(id);
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
    return prototype.constructor;
  }
  __name(getPrototype, "getPrototype");
  function sortByName(a, b) {
    return a.name.localeCompare(b.name);
  }
  __name(sortByName, "sortByName");

  // src/apps/perception-menu.js
  var VISIBILITIES = ["observed", "concealed", "hidden", "undetected", "unnoticed"];
  var COVERS = ["none", "lesser", "standard", "greater", "greater-prone"];
  var PerceptionMenu = class extends Application {
    #token;
    #selected;
    #currentData;
    #hoverTokenListener;
    constructor({ token, selected, cover }, options = {}) {
      options.title = localize("menu.title", { name: token.name });
      super(options);
      this.#token = token instanceof TokenDocument ? token.object : token;
      this.#hoverTokenListener = (token2, hover) => {
        const tokenId = token2.id;
        const tokens = this.element.find("[data-token-id]");
        tokens.removeClass("hover");
        if (hover)
          tokens.filter(`[data-token-id=${tokenId}]`).addClass("hover");
      };
      this.#currentData = this.#getTokenData(true);
      if (selected === true)
        selected = getValidTokens(token).map((t) => t.id);
      else if (Array.isArray(selected))
        selected = validateTokens(token, selected);
      this.#selected = selected ?? [];
      if (selected && COVERS.includes(cover)) {
        for (const tokenId of selected) {
          setProperty(this.#currentData, `${tokenId}.cover`, cover);
        }
      }
      Hooks.on("hoverToken", this.#hoverTokenListener);
    }
    close(options = {}) {
      Hooks.off("hoverToken", this.#hoverTokenListener);
      super.close(options);
    }
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        minimizable: false,
        template: templatePath("perception-menu")
      });
    }
    static openMenu(token, options = {}) {
      const actor = token?.actor;
      if (!actor)
        return;
      const id = `${MODULE_ID}-${actor.uuid}`;
      const win = Object.values(ui.windows).find((x) => x.id === id);
      if (win)
        win.bringToTop();
      else
        new PerceptionMenu({ ...options, token }, { id }).render(true);
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
    getData() {
      const originalData = this.#getTokenData();
      const alliance = this.actor.alliance;
      const opposition = alliance === "party" ? "opposition" : alliance === "opposition" ? "party" : null;
      const covers = COVERS.map((value) => ({ value, label: localize(`cover.${value}`) }));
      const tokens = getValidTokens(this.token).map(({ id, name, actor }) => {
        const current = this.#currentData[id] ?? {};
        const original = originalData[id] ?? {};
        return {
          id,
          name,
          alliance: actor.alliance,
          cover: current.cover ?? "none",
          visibility: current.visibility ?? "observed",
          originalCover: original.cover ?? "none",
          originalVisibility: original.visibility ?? "observed",
          selected: this.#selected.includes(id)
        };
      });
      const filterTokens = /* @__PURE__ */ __name((a) => tokens.filter((t) => t.alliance === a).sort(sortByName), "filterTokens");
      return {
        i18n: (key) => localize(`menu.${key}`),
        allies: opposition && filterTokens(alliance),
        enemies: opposition && filterTokens(opposition),
        neutral: opposition ? filterTokens(null) : tokens.sort(sortByName),
        visibilities: VISIBILITIES.map((value) => ({ value, label: localize(`menu.visibility.${value}`) })),
        covers: isProne(this.actor) ? covers : covers.slice(0, -1),
        default: {
          visibility: "observed",
          cover: "none"
        }
      };
    }
    #getTokenData(clone) {
      const data = getTokenData(this.document) ?? {};
      return clone ? deepClone(data) : data;
    }
    #setSelected() {
      this.#selected = this.element.find("[data-token-id].ui-selected").toArray().map((el) => el.dataset.tokenId);
    }
    activateListeners(html) {
      html.filter(".tokens").selectable({
        autoRefresh: false,
        filter: ".token",
        cancel: "header,select",
        stop: () => this.#setSelected()
      });
      html.find("[data-token-id]").on("mouseenter", (event) => {
        const { tokenId } = event.currentTarget.dataset;
        const token = this.scene.tokens.get(tokenId)?.object;
        if (!token || token.controlled)
          return;
        token._onHoverIn(event, { hoverOutOthers: true });
      });
      html.find("[data-action=select-all]").on("click", (event) => {
        const section = $(event.currentTarget).closest("section");
        const tokens = (section.length ? section : html).find("[data-token-id]");
        const allSelected = tokens.filter(":not(.ui-selected)").length === 0;
        tokens.toggleClass("ui-selected", !allSelected);
        this.#setSelected();
      });
      html.find("[data-action=use-selection]").on("click", (event) => {
        this.#selected = canvas.tokens.controlled.map((t) => t.id);
        this.render();
      });
      html.find("select[name=visibility], select[name=cover]").on("change", (event) => {
        const target = event.currentTarget;
        const property = target.name;
        const defaultValue = property === "visibility" ? "observed" : "none";
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
      html.find("[data-action=reset]").on("click", (event) => {
        this.#currentData = this.#getTokenData(true);
        this.#selected = [];
        this.render();
      });
      html.find("[data-action=accept]").on("click", async (event) => {
        await setTokenData(this.document, this.#currentData);
        this.close();
      });
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
    html.find("[data-action=pf2e-perception]").on("click", (event) => PerceptionMenu.openMenu(hud.object));
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
    for (const tokenId in data) {
      if (!valid.includes(tokenId)) {
        delete data[tokenId];
        continue;
      }
      const token2 = data[tokenId];
      if (token2.visibility === "observed")
        delete token2.visibility;
      if (token2.cover === "none")
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
      const token = getActorToken2(this);
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
    const target = getActorToken2(this, true);
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
  function getActorToken2(actor, target = false) {
    if (!actor)
      return void 0;
    const tokens = target ? game.user.targets : canvas.tokens.controlled;
    return tokens.find((token) => token.actor === actor) ?? actor.getActiveTokens().shift() ?? null;
  }
  __name(getActorToken2, "getActorToken");
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

  // src/roll.js
  async function checkRoll(wrapped, ...args) {
    const context = args[1];
    if (!context)
      return wrapped(...args);
    const { actor, rollMode = "roll", createMessage = "true", type, token, target, isReroll, skipPerceptionChecks } = context;
    const originToken = token ?? getActorToken(actor);
    const targetToken = target?.token;
    if (isReroll || skipPerceptionChecks || rollMode !== "roll" || !createMessage || !originToken || !targetToken || !["attack-roll", "spell-attack-roll"].includes(type))
      return wrapped(...args);
    const visibility = getVisibility(targetToken, originToken);
    if (!visibility)
      return wrapped(...args);
    const dc = visibility === "concealed" ? 5 : 11;
    const roll = await new Roll("1d20").evaluate({ async: true });
    const total = roll.total;
    const isSuccess = total >= dc;
    const isSecret = VISIBILITY_VALUES[visibility] >= VISIBILITY_VALUES.undetected;
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
    if (isSecret) {
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
    const flags = isSecret ? createMessageFlag(args, visibility) : {};
    await roll.toMessage({ flavor, speaker, flags }, { rollMode: isSecret ? "blindroll" : "roll" });
    if (isSuccess && !isSecret)
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
      actor: game.actors.get(context.target.actor),
      token: scene.tokens.get(context.target.token)
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
  function createMessageFlag([check, context], visibility) {
    return {
      [MODULE_ID]: {
        visibility,
        context: {
          ...context,
          skipPerceptionChecks: true,
          item: context.item?.id,
          actor: context.actor.id,
          token: context.token.id,
          scene: context.token.scene.id,
          target: { actor: context.target.actor.id, token: context.target.token.id },
          dc: context.dc ? omit(context.dc, ["statistic"]) : null,
          options: Array.from(context.options)
        },
        check: {
          slug: check.slug,
          modifiers: check.modifiers.map((modifier) => modifier.toObject())
        }
      }
    };
  }
  __name(createMessageFlag, "createMessageFlag");

  // src/chat.js
  function renderChatMessage(message, html) {
    const token = message.token;
    if (!token)
      return;
    const { rollCheck, context, check, visibility, cover, selected, skipWait } = getFlags(message);
    if (game.user.isGM) {
      if (context && check && !rollCheck) {
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
      } else if (cover && selected) {
        const button = createChatButton({
          action: "validate-covers",
          icon: "fa-solid fa-list",
          label: localize("message.cover.validate")
        });
        html.find(".message-content").append(button);
        html.find("[data-action=validate-covers]").on("click", () => {
          PerceptionMenu.openMenu(token, { selected, cover });
        });
      }
    } else {
      if (visibility) {
        html.find(".message-header .message-sender").text(token.name);
        html.find(".message-header .flavor-text").html(
          localize("message.flat-check.blind", { visibility: game.i18n.localize(`PF2E.condition.${visibility}.name`) })
        );
      } else if (cover && !skipWait) {
        const wait = `<i style="display: block; font-size: .9em; text-align: end;">${localize("message.cover.wait")}</i>`;
        html.find(".message-content").append(wait);
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
  function createChatButton({ action, icon, label }) {
    let button = `<button type="button" style="margin-bottom: 5px;" data-action="${action}">`;
    if (icon)
      button += `<i class="${icon}"></i> ${label}</button>`;
    else
      button += label;
    return button;
  }
  __name(createChatButton, "createChatButton");
  function createTokenMessage({ content, token, flags, secret }) {
    const data = { content, speaker: ChatMessage.getSpeaker({ token: token instanceof Token ? token.document : token }) };
    if (flags)
      setProperty(data, `flags.${MODULE_ID}`, flags);
    if (secret) {
      data.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
      data.whisper = ChatMessage.getWhisperRecipients("gm");
    }
    ChatMessage.create(data);
  }
  __name(createTokenMessage, "createTokenMessage");

  // src/action.js
  function setupActions() {
    const takeCover2 = game.pf2e.actions.get("take-cover");
    const BaseAction = getPrototype(takeCover2, 2);
    const BaseActionVariant = getPrototype(takeCover2.toActionVariant(), 2);
    setupCover(BaseAction, BaseActionVariant);
  }
  __name(setupActions, "setupActions");
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
    game.pf2e.actions.set("take-cover", new TakeCover(BaseAction, BaseActionVariant));
  }
  __name(setupCover, "setupCover");
  async function takeCover(token) {
    const actor = token.actor;
    const cover = getCoverEffect(actor);
    if (cover)
      return cover.delete();
    const targets = validateTokens(token, game.user.targets.ids);
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
          const process = /* @__PURE__ */ __name(async (selected, cover2) => {
            const flavor = cover2 === "none" ? selected === true ? "remove-all" : "remove" : "take";
            createTokenMessage({
              content: localize(`message.cover.${flavor}`, { cover: localize(`cover.${cover2}`) }),
              flags: { selected, cover: cover2, skipWait: skip },
              token,
              secret: !token.document.hasPlayerOwner
            });
            if (skip) {
              if (cover2 === "none" && selected === true)
                return clearTokenData(token);
              const data2 = deepClone(getTokenData(token)) ?? {};
              for (const tokenId of targets) {
                setProperty(data2, `${tokenId}.cover`, cover2);
              }
              return setTokenData(token, data2);
            } else if (game.user.isGM)
              PerceptionMenu.openMenu(token, { selected, cover: cover2 });
          }, "process");
          if (level === "remove-all")
            process(true, "none");
          else if (level === "remove")
            process(targets, "none");
          else if (targets.length)
            process(targets, level);
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
      tokens = [getActorToken2(actors[0])].filter(Boolean);
    if (!tokens.length)
      tokens = canvas.tokens.controlled;
    if (!tokens.length)
      tokens = [getActorToken2(game.user.character)].filter(Boolean);
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
    return !isValidTarget(target) || !isUndetected(target, "basicSight", VISIBILITY_VALUES.hidden);
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
  function isUndetected(target, mode, threshold = VISIBILITY_VALUES.undetected) {
    const tokens = game.user.isGM ? canvas.tokens.controlled : target.scene.tokens.filter((t) => t.isOwner);
    const filtered = tokens.filter((t) => t.detectionModes.some((d) => d.id === mode));
    for (const origin of filtered) {
      const visibility = getTokenData(target, origin.id, "visibility");
      if (VISIBILITY_VALUES[visibility] >= threshold)
        return true;
    }
    return false;
  }
  __name(isUndetected, "isUndetected");

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
