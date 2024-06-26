export const MODULE_ID = "pf2e-perception";

export function templatePath(template) {
    return `modules/${MODULE_ID}/templates/${template}.hbs`;
}

export function localize(...args) {
    const data = args.at(-1);
    const useFormat = typeof data === "object";

    const keys = useFormat ? args.slice(0, -1) : args;
    keys.unshift(MODULE_ID);

    return game.i18n[useFormat ? "format" : "localize"](keys.join("."), data);
}

export function getFlag(doc, flag) {
    return doc.getFlag(MODULE_ID, flag);
}

export function setFlag(doc, flag, value) {
    return doc.setFlag(MODULE_ID, flag, value);
}

export function unsetFlag(doc, flag) {
    return doc.unsetFlag(MODULE_ID, flag, true);
}

export function getFlags(doc) {
    return foundry.utils.getProperty(doc, `flags.${MODULE_ID}`) ?? {};
}

export function getSetting(setting) {
    return game.settings.get(MODULE_ID, setting);
}

export function setSetting(setting, value) {
    return game.settings.set(MODULE_ID, setting, value);
}

export function hasPermission() {
    return game.user.role >= getSetting("permission");
}

export function getActionName(action) {
    return game.i18n.localize(`PF2E.Actions.${action}.Title`);
}
