/**
 * Label behavior.
 *
 * @mixin Sfera.ComponentPresets.Label
 */
Sfera.ComponentPresets.Label = function() {
    // extend attributes
    this.attrDefs.label = {
        type: "string",
        update: function() {
            this.component.element.innerHTML = this.value;
            // post update
            this.post();
        }
    };
    this.attrDefs.color = {
        type: "string",
        update: function() {
            this.component.element.style.color = this.value;
            // post update
            this.post();
        }
    };
    this.attrDefs.fontSize = {
        type: "integer",
        update: function() {
            this.component.element.style.fontSize = this.value + "px";
            // post update
            this.post();
        }
    };
    this.attrDefs.textAlign = {
        type: "string",
        update: function() {
            this.component.element.style.textAlign = this.value;
            // post update
            this.post();
        }
    };

};
