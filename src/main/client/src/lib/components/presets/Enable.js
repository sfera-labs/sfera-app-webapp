/**
 * Size behavior.
 *
 * @mixin Sfera.ComponentPresets.Size
 */
Sfera.ComponentPresets.Enable = function() {
    // extend attributes
    this.attrDefs.enabled = {
        type: "boolean",
        default: "true",
        update: function() {
            if (this.component.updateClass)
                this.component.updateClass();
            // post update
            this.post();
        }
    };
};
