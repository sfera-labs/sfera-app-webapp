/**
 * Position behavior.
 *
 * @mixin Sfera.ComponentPresets.Position
 * @property {string} position - sets the position
 * @property {string} x - sets the x coordinate
 * @property {string} y - sets the y coordinate
 */
Sfera.ComponentPresets.Position = function() {
    // extend attributes
    this.attrDefs.position = {
        type: "string",
        update: function() {
            this.component.element.style.position = this.value == "static" ? "static" : "absolute";
            // post update
            this.post();
        },
    };
    /*
	this.attrDefs.float = {
        type: "string",
        update: function() {
			this.component.element.style.position = "static";
			this.component.element.style.float = this.value;
            // post update
            this.post();
        },
    };
    */
    this.attrDefs.x = {
        type: "integer",
        update: function() {
            this.component.element.style.left = this.value + "px";
            // post update
            this.post();
        },
    };
    this.attrDefs.y = {
        type: "integer",
        update: function() {
            this.component.element.style.top = this.value + "px";
            // post update
            this.post();
        },
    };

    this.attrDefs.rotation = {
        type: "integer",
        update: function() {
            var s = this.component.element.style;
            var r = "rotate(" + this.value + "deg)";
            s.msTransform = /* IE 9 */
                s.webkitTransform = /* Safari */
                s.transform = r;

            // post update
            this.post();
        },
    };

    this.attrDefs.opacity = {
        type: "float",
        update: function() {
            this.component.element.style.opacity = this.value;
            // post update
            this.post();
        }
    };
};
