import { getActorToken, getCoverEffect, hasGreaterDarkvision, isProne } from './actor.js'
import { clearDebug, getRectEdges, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { getLightExposure } from './lighting.js'
import { getPerception, perceptionRules, updateFromPerceptionRules } from './rule-element.js'
import { getSceneSetting, getValidTokens, validateTokens } from './scene.js'
import {
    createDarknessTemplate,
    createMistTemplate,
    createSeekTemplate,
    createTemplate,
    deleteSeekTemplate,
    getDarknessTemplates,
    getMistTemplates,
    getSeekTemplateTokens,
    getTemplateTokens,
} from './template.js'
import {
    clearConditionals,
    getCover,
    getCreatureCover,
    getTokenData,
    getVisibility,
    getWallCover,
    openHUD,
    showAllConditionals,
    showConditionals,
} from './token.js'

export const API = {
    geometry: {
        clearDebug,
        getRectEdges,
        lineIntersectWall,
        pointToTokenIntersectWall,
    },
    token: {
        getCreatureCover,
        getWallCover,
        getVisibility,
        clearConditionals,
        showConditionals,
        showAllConditionals,
        getTokenData,
        getCover,
        openHUD,
    },
    lighting: {
        getLightExposure,
    },
    actor: {
        getActorToken,
        isProne,
        getCoverEffect,
        hasGreaterDarkvision,
    },
    scene: {
        getValidTokens,
        validateTokens,
        getSceneSetting,
    },
    template: {
        createSeekTemplate,
        createDarknessTemplate,
        createMistTemplate,
        getDarknessTemplates,
        getMistTemplates,
        getSeekTemplateTokens,
        deleteSeekTemplate,
        createTemplate,
        getTemplateTokens,
    },
    ruleElement: {
        perceptionRules,
        getPerception,
        updateFromPerceptionRules,
    },
}
