import { setupActions } from "./action.js";
import { API } from "./api.js";
import { renderChatMessage } from "./chat.js";
import { checkRoll, renderCheckModifiersDialog } from "./check.js";
import { renderCombatTracker, renderCombatTrackerConfig } from "./combat.js";
import { VISIBILITY_VALUES } from "./constants.js";
import { canDetect, detectionModeTestVisibility } from "./detection.js";
import { MODULE_ID } from "./module.js";
import { setupRuleElement } from "./rule-element.js";
import { renderSceneConfig } from "./scene.js";
import { registerSettings } from "./settings.js";
import {
    highlightTemplateGrid,
    onMeasuredTemplate,
    preCreateMeasuredTemplate,
} from "./template.js";
import {
    clearConditionals,
    controlToken,
    deleteToken,
    hoverToken,
    pasteToken,
    preCreateToken,
    renderTokenHUD,
    updateToken,
} from "./token.js";

const CHECK_ROLL = "game.pf2e.Check.roll";

const HIGHLIGHT_TEMPLATE_GRID = "CONFIG.MeasuredTemplate.objectClass.prototype.highlightGrid";

const DETECTION_MODE_TEST_VISIBILITY = "DetectionMode.prototype.testVisibility";
const LIGHT_CAN_DETECT = "CONFIG.Canvas.detectionModes.lightPerception._canDetect";
const VISION_CAN_DETECT = "CONFIG.Canvas.detectionModes.basicSight._canDetect";
const HEARING_CAN_DETECT = "CONFIG.Canvas.detectionModes.hearing._canDetect";
const TREMOR_CAN_DETECT = "CONFIG.Canvas.detectionModes.feelTremor._canDetect";

Hooks.once("init", () => {
    registerSettings();
    setupActions();
    setupRuleElement();

    libWrapper.register(MODULE_ID, CHECK_ROLL, checkRoll);

    libWrapper.register(MODULE_ID, HIGHLIGHT_TEMPLATE_GRID, highlightTemplateGrid, "OVERRIDE");

    libWrapper.register(
        MODULE_ID,
        DETECTION_MODE_TEST_VISIBILITY,
        detectionModeTestVisibility,
        "OVERRIDE"
    );
    libWrapper.register(
        MODULE_ID,
        LIGHT_CAN_DETECT,
        canDetect(VISIBILITY_VALUES.hidden),
        "WRAPPER"
    );
    libWrapper.register(
        MODULE_ID,
        VISION_CAN_DETECT,
        canDetect(VISIBILITY_VALUES.hidden),
        "WRAPPER"
    );
    libWrapper.register(
        MODULE_ID,
        HEARING_CAN_DETECT,
        canDetect(VISIBILITY_VALUES.undetected),
        "WRAPPER"
    );
    libWrapper.register(
        MODULE_ID,
        TREMOR_CAN_DETECT,
        canDetect(VISIBILITY_VALUES.undetected),
        "WRAPPER"
    );

    const isGM =
        game.data.users.find((x) => x._id === game.data.userId).role >= CONST.USER_ROLES.GAMEMASTER;
    if (isGM) {
        Hooks.on("renderSceneConfig", renderSceneConfig);
        Hooks.on("renderCombatTrackerConfig", renderCombatTrackerConfig);
    } else {
        Hooks.on("renderCombatTracker", renderCombatTracker);
    }

    game.modules.get(MODULE_ID).custom = {
        getWallCover: undefined,
        getCreatureCover: undefined,
    };
});

Hooks.once("ready", () => {
    game.modules.get(MODULE_ID).api = API;

    Hooks.on("renderChatMessage", renderChatMessage);

    for (const el of document.querySelectorAll("#chat-log .chat-message")) {
        const message = game.messages.get(el.dataset.messageId);
        if (!message) continue;
        renderChatMessage(message, $(el));
    }

    const isGM = game.user.isGM;

    if (isGM && game.modules.get("pf2e-rules-based-npc-vision")?.active) {
        ui.notifications.error(`${MODULE_ID}.warning.npc-vision`, {
            permanent: true,
            localize: true,
        });
    }
});

Hooks.on("hoverToken", hoverToken);
Hooks.on("pasteToken", pasteToken);
Hooks.on("updateToken", updateToken);
Hooks.on("deleteToken", deleteToken);
Hooks.on("controlToken", controlToken);
Hooks.on("renderTokenHUD", renderTokenHUD);
Hooks.on("preCreateToken", preCreateToken);

Hooks.on("canvasPan", () => clearConditionals());

Hooks.on("renderCheckModifiersDialog", renderCheckModifiersDialog);

Hooks.on("preCreateMeasuredTemplate", preCreateMeasuredTemplate);
Hooks.on("createMeasuredTemplate", onMeasuredTemplate);
Hooks.on("updateMeasuredTemplate", onMeasuredTemplate);
Hooks.on("deleteMeasuredTemplate", onMeasuredTemplate);
