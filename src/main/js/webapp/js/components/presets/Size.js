/**
 * Size behavior.
 *
 * @mixin Sfera.ComponentPresets.Size
 */
Sfera.ComponentPresets.Size = function() {
    // extend attributes
    this.attrDefs.width = {
        type: "integer",
        update: function() {
            this.component.element.style.width = this.value == "auto" ? "auto" : this.value + "px";
            // post update
            this.post();
        },
    };
    this.attrDefs.height = {
        type: "integer",
        update: function() {
            this.component.element.style.height = this.value == "auto" ? "auto" : this.value + "px";
            // post update
            this.post();
        },
    };
};
