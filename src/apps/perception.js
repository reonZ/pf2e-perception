import { localize, templatePath } from "../module.js";
import { getValidTokens } from "../scene.js";
import { BaseMenu } from "./base-menu.js";

export class PerceptionMenu extends BaseMenu {
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
                selected: selected.includes(id),
            };
        });

        return {
            ...super.getData(options),
            ...this._spliIntoAlliances(tokens),
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.filter(".tokens").selectable({
            autoRefresh: false,
            filter: ".token",
            cancel: "header,select",
            stop: () => this._setSelected(),
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
}
