/**
 * Color behavior.
 *
 * @mixin Sfera.ComponentPresets.Color
 */
Sfera.ComponentPresets.Color = function() {
    // extend attributes
    this.attrDefs.color = {
        type: "string",
        default: "default",

        values: function() {
            var c;
            if (Sfera.client && Sfera.client.skin)
                c = Sfera.client.skin.colors[this.component.type];
            return c ? c : ["default"];
        },

        update: function() {
            if (this.component.updateClass)
                this.component.updateClass();
            // post update
            this.post();
        }
    }
};
