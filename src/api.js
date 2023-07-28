import { getActorToken, getCoverEffect, hasGreaterDarkvision, isProne } from './actor.js'
import { isHidden, isUndetected } from './detection.js'
import { clearDebug, getRectEdges, lineIntersectWall, pointToTokenIntersectWall } from './geometry.js'
import { getLightExposure } from './lighting.js'
import { getSceneSetting, getValidTokens, validateTokens } from './scene.js'
import {
    createDarknessTemplate,
    createSeekTemplate,
    createTemplate,
    deleteSeekTemplate,
    getDarknessTemplates,
    getSeekTemplateTokens,
    getTemplateTokens,
} from './template.js'
import {
    clearConditionals,
    getConditionalCover,
    getCreatureCover,
    getTokenData,
    getVisibility,
    hasStandardCover,
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
        getVisibility,
        clearConditionals,
        showConditionals,
        showAllConditionals,
        hasStandardCover,
        getTokenData,
        getConditionalCover,
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
    detection: {
        isUndetected,
        isHidden,
    },
    template: {
        createSeekTemplate,
        createDarknessTemplate,
        getDarknessTemplates,
        getSeekTemplateTokens,
        deleteSeekTemplate,
        createTemplate,
        getTemplateTokens,
    },
}
