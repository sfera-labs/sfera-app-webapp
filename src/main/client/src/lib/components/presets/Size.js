/**
 * Size behavior.
 *
 * @mixin Sfera.ComponentPresets.Size
 */
Sfera.ComponentPresets.Size = function() {
    // extend attributes
    this.attrDefs.width = {
        type: "size",
        update: function() {
            this.component.element.style.width = this.value + (typeof(this.value) != "string" ? "px" : "");
            // post update
            this.post();
        },
		get: function () {
			if (typeof(this.value) == "string")
				return this.component.element.offsetWidth;
			return this.value;
		}
    };
    this.attrDefs.height = {
        type: "size",
        update: function() {
            this.component.element.style.height = this.value + (typeof(this.value) != "string" ? "px" : "");
            // post update
            this.post();
        },
		get: function () {
			if (typeof(this.value) == "string")
				return this.component.element.offsetHeight;
			return this.value;
		}
    };
};
