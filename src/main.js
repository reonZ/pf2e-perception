import { setupActions } from './action.js'
import { API } from './api.js'
import { renderChatMessage } from './chat.js'
import { checkRoll, renderCheckModifiersDialog } from './check.js'
import { renderCombatTracker, renderCombatTrackerConfig } from './combat.js'
import { basicSightCanDetect, detectionModeTestVisibility, feelTremorCanDetect, hearingCanDetect } from './detection.js'
import { MODULE_ID } from './module.js'
import { setupRuleElement } from './rule-element.js'
import { renderSceneConfig } from './scene.js'
import { registerSettings } from './settings.js'
import { highlightTemplateGrid, onMeasuredTemplate, preCreateMeasuredTemplate } from './template.js'
import {
    clearConditionals,
    controlToken,
    deleteToken,
    hoverToken,
    pasteToken,
    preCreateToken,
    renderTokenHUD,
    rulesBasedVision,
    updateToken,
} from './token.js'

const CHECK_ROLL = 'game.pf2e.Check.roll'

const RULES_BASED_VISION = 'CONFIG.Token.documentClass.prototype.rulesBasedVision'

const HIGHLIGHT_TEMPLATE_GRID = 'CONFIG.MeasuredTemplate.objectClass.prototype.highlightGrid'

const GET_ROLL_CONTEXT = 'CONFIG.Actor.documentClass.prototype.getRollContext'

const DETECTION_MODE_TEST_VISIBILITY = 'DetectionMode.prototype.testVisibility'
const BASIC_SIGHT_CAN_DETECT = 'CONFIG.Canvas.detectionModes.basicSight._canDetect'
const HEARING_CAN_DETECT = 'CONFIG.Canvas.detectionModes.hearing._canDetect'
const FEEL_TREMOR_CAN_DETECT = 'CONFIG.Canvas.detectionModes.feelTremor._canDetect'

Hooks.once('init', () => {
    registerSettings()
    setupActions()
    setupRuleElement()

    libWrapper.register(MODULE_ID, CHECK_ROLL, checkRoll)

    libWrapper.register(MODULE_ID, HIGHLIGHT_TEMPLATE_GRID, highlightTemplateGrid, 'OVERRIDE')

    libWrapper.register(MODULE_ID, RULES_BASED_VISION, rulesBasedVision, 'OVERRIDE')

    // libWrapper.register(MODULE_ID, GET_ROLL_CONTEXT, getRollContext, 'OVERRIDE')

    libWrapper.register(MODULE_ID, DETECTION_MODE_TEST_VISIBILITY, detectionModeTestVisibility, 'OVERRIDE')
    libWrapper.register(MODULE_ID, BASIC_SIGHT_CAN_DETECT, basicSightCanDetect, 'OVERRIDE')
    libWrapper.register(MODULE_ID, HEARING_CAN_DETECT, hearingCanDetect, 'OVERRIDE')
    libWrapper.register(MODULE_ID, FEEL_TREMOR_CAN_DETECT, feelTremorCanDetect, 'OVERRIDE')

    const isGM = game.data.users.find(x => x._id === game.data.userId).role >= CONST.USER_ROLES.GAMEMASTER
    if (isGM) {
        Hooks.on('renderSceneConfig', renderSceneConfig)
        Hooks.on('renderCombatTrackerConfig', renderCombatTrackerConfig)
    } else {
        Hooks.on('renderCombatTracker', renderCombatTracker)
    }

    game.modules.get(MODULE_ID).custom = {
        getWallCover: undefined,
        getCreatureCover: undefined,
    }
})

Hooks.once('ready', () => {
    game.modules.get(MODULE_ID).api = API

    Hooks.on('renderChatMessage', renderChatMessage)

    for (const el of document.querySelectorAll('#chat-log .chat-message')) {
        const message = game.messages.get(el.dataset.messageId)
        if (!message) continue
        renderChatMessage(message, $(el))
    }

    const isGM = game.user.isGM

    if (isGM && game.modules.get('pf2e-rules-based-npc-vision')?.active) {
        ui.notifications.error(`${MODULE_ID}.warning.npc-vision`, { permanent: true, localize: true })
    }

    if (isGM && isNewerVersion(game.system.version, '5.13.6')) {
        ChatMessage.create({
            content: `<p><strong>WARNING!</strong></p>
            <p>The module <strong>PF2e Perception</strong> cannot fully function with this version of the system.</p>
            <p>It can no longer automatically apply the <em>cover</em> and <em>off-guard</em> effects when rolling an attack roll.</p>`,
            whisper: [game.user],
        })
    }
})

Hooks.on('hoverToken', hoverToken)
Hooks.on('pasteToken', pasteToken)
Hooks.on('updateToken', updateToken)
Hooks.on('deleteToken', deleteToken)
Hooks.on('controlToken', controlToken)
Hooks.on('renderTokenHUD', renderTokenHUD)
Hooks.on('preCreateToken', preCreateToken)

Hooks.on('canvasPan', () => clearConditionals())

Hooks.on('renderCheckModifiersDialog', renderCheckModifiersDialog)

Hooks.on('preCreateMeasuredTemplate', preCreateMeasuredTemplate)
Hooks.on('createMeasuredTemplate', onMeasuredTemplate)
Hooks.on('updateMeasuredTemplate', onMeasuredTemplate)
Hooks.on('deleteMeasuredTemplate', onMeasuredTemplate)
