/**
 * Style behavior.
 *
 * @mixin Sfera.ComponentPresets.Style
 */
Sfera.ComponentPresets.Style = function() {
    // extend attributes
    this.attrDefs.style = {
        type: "string",
        default: "default",

        values: function() {
            var s;
            if (Sfera.client && Sfera.client.skin)
                s = Sfera.client.skin.styles[this.component.type];
            return s ? s : ["default"];
        },
        
        update: function() {
            if (this.component.updateClass)
                this.component.updateClass();
            // post update
            this.post();
        }
    };
};
