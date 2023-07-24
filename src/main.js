import { setupActions } from './action.js'
import { getActorToken, getCoverEffect, getRollContext, isProne } from './actor.js'
import { renderChatMessage } from './chat.js'
import { checkRoll, renderCheckModifiersDialog } from './check.js'
import { renderCombatTracker, renderCombatTrackerConfig } from './combat.js'
import { basicSightCanDetect, feelTremorCanDetect, hearingCanDetect, isUndetected } from './detection.js'
import { clearDebug, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { getLightExposure } from './lighting.js'
import { MODULE_ID } from './module.js'
import { getSceneSetting, getValidTokens, renderSceneConfig, validateTokens } from './scene.js'
import { registerSettings } from './settings.js'
import {
    clearConditionals,
    controlToken,
    deleteToken,
    getConditionalCover,
    getCreatureCover,
    getTokenData,
    getVisibility,
    hasStandardCover,
    hoverToken,
    pasteToken,
    renderTokenHUD,
    showAllConditionals,
    showConditionals,
    updateToken,
} from './token.js'

const CHECK_ROLL = 'game.pf2e.Check.roll'

const GET_ROLL_CONTEXT = 'CONFIG.Actor.documentClass.prototype.getRollContext'

const BASIC_SIGHT_CAN_DETECT = 'CONFIG.Canvas.detectionModes.basicSight._canDetect'
const HEARING_CAN_DETECT = 'CONFIG.Canvas.detectionModes.hearing._canDetect'
const FEEL_TREMOR_CAN_DETECT = 'CONFIG.Canvas.detectionModes.feelTremor._canDetect'

Hooks.once('init', () => {
    registerSettings()
    setupActions()

    libWrapper.register(MODULE_ID, CHECK_ROLL, checkRoll)

    libWrapper.register(MODULE_ID, GET_ROLL_CONTEXT, getRollContext, 'OVERRIDE')

    libWrapper.register(MODULE_ID, BASIC_SIGHT_CAN_DETECT, basicSightCanDetect)
    libWrapper.register(MODULE_ID, HEARING_CAN_DETECT, hearingCanDetect)
    libWrapper.register(MODULE_ID, FEEL_TREMOR_CAN_DETECT, feelTremorCanDetect)

    const isGM = game.data.users.find(x => x._id === game.data.userId).role >= CONST.USER_ROLES.GAMEMASTER
    if (isGM) {
        Hooks.on('renderSceneConfig', renderSceneConfig)
        Hooks.on('renderCombatTrackerConfig', renderCombatTrackerConfig)
    } else {
        Hooks.on('renderCombatTracker', renderCombatTracker)
    }
})

Hooks.once('ready', () => {
    game.modules.get(MODULE_ID).api = {
        geometry: {
            clearDebug,
            lineIntersectWall,
            pointToTokenIntersectWall,
        },
        token: {
            getCreatureCover,
            getVisibility,
            clearConditionals,
            showConditionals,
            showAllConditionals,
            hasStandardCover,
            getTokenData,
        },
        lighting: {
            getLightExposure,
        },
        actor: {
            getActorToken,
            isProne,
            getCoverEffect,
            getConditionalCover,
        },
        scene: {
            getValidTokens,
            validateTokens,
            getSceneSetting,
        },
        detection: {
            isUndetected,
        },
    }

    Hooks.on('renderChatMessage', renderChatMessage)

    for (const el of document.querySelectorAll('#chat-log .chat-message')) {
        const message = game.messages.get(el.dataset.messageId)
        if (!message) continue
        renderChatMessage(message, $(el))
    }
})

Hooks.on('hoverToken', hoverToken)
Hooks.on('pasteToken', pasteToken)
Hooks.on('updateToken', updateToken)
Hooks.on('deleteToken', deleteToken)
Hooks.on('controlToken', controlToken)
Hooks.on('renderTokenHUD', renderTokenHUD)

Hooks.on('canvasPan', () => clearConditionals())

Hooks.on('renderCheckModifiersDialog', renderCheckModifiersDialog)
