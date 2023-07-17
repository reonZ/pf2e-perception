import { setupActions } from './action.js'
import { getActorToken, getConditionalCover, getContextualClone, getCoverEffect, getSelfRollOptions, isProne } from './actor.js'
import { renderChatMessage } from './chat.js'
import { renderCombatTracker } from './combat.js'
import { basicSightCanDetect, feelTremorCanDetect, hearingCanDetect, isUndetected } from './detection.js'
import { clearDebug, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { inBrightLight, isConcealed } from './lighting.js'
import { MODULE_ID, getSetting } from './module.js'
import { checkRoll } from './roll.js'
import { getSceneSetting, getValidTokens, renderSceneConfig, validateTokens } from './scene.js'
import { registerSettings } from './settings.js'
import {
    clearConditionals,
    controlToken,
    deleteToken,
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

const GET_CONTEXTUAL_CLONE = 'CONFIG.Actor.documentClass.prototype.getContextualClone'
const GET_SELF_ROLL_OPTIONS = 'CONFIG.Actor.documentClass.prototype.getSelfRollOptions'

const BASIC_SIGHT_CAN_DETECT = 'CONFIG.Canvas.detectionModes.basicSight._canDetect'
const HEARING_CAN_DETECT = 'CONFIG.Canvas.detectionModes.hearing._canDetect'
const FEEL_TREMOR_CAN_DETECT = 'CONFIG.Canvas.detectionModes.feelTremor._canDetect'

Hooks.once('init', () => {
    registerSettings()
    setupActions()

    libWrapper.register(MODULE_ID, CHECK_ROLL, checkRoll)

    libWrapper.register(MODULE_ID, GET_CONTEXTUAL_CLONE, getContextualClone)
    libWrapper.register(MODULE_ID, GET_SELF_ROLL_OPTIONS, getSelfRollOptions)

    libWrapper.register(MODULE_ID, BASIC_SIGHT_CAN_DETECT, basicSightCanDetect)
    libWrapper.register(MODULE_ID, HEARING_CAN_DETECT, hearingCanDetect)
    libWrapper.register(MODULE_ID, FEEL_TREMOR_CAN_DETECT, feelTremorCanDetect)

    const isGM = game.data.users.find(x => x._id === game.data.userId).role >= CONST.USER_ROLES.GAMEMASTER
    if (isGM) {
        Hooks.on('renderSceneConfig', renderSceneConfig)
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
            isConcealed,
            inBrightLight,
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
})

Hooks.on('hoverToken', hoverToken)
Hooks.on('pasteToken', pasteToken)
Hooks.on('updateToken', updateToken)
Hooks.on('deleteToken', deleteToken)
Hooks.on('controlToken', controlToken)
Hooks.on('renderTokenHUD', renderTokenHUD)

Hooks.on('canvasPan', () => clearConditionals())

Hooks.on('renderChatMessage', renderChatMessage)
