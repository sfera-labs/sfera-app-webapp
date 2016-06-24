/**
 * Visibility behavior.
 *
 * @mixin Sfera.ComponentPresets.Visibility
 */
Sfera.ComponentPresets.Visibility = function() {
    // extend attributes
    this.attrDefs.visible = {
        type: "boolean",
        compile: function() {
            var value = !(!this.source || this.source == "false");
            if (value !== this.value) {
                this.changed = false;
                this.value = value;
                this.update();
            }
        },
        update: function() {
            // trigger event. component, show/hide, is it a child? (also check if its visibility is changing before triggering)
            function trigger(co, show, child) {
                if (!child || co.getAttribute("visible")) { // trigger?
                    if (show && co.onShow) {
                        co.onShow();
                    } else if (!show && co.onHide) {
                        co.onHide();
                    }

                    if (co.children) {
                        for (var c = 0; c < co.children.length; c++)
                            trigger(co.children[c], show);
                    }
                }
            }

            // trigger on hide before hiding
            if (!this.value) {
                trigger(this.component, false);
            }

            // change visibility
            this.component.element.style.display = this.value ? "inline" : "none";

            // trigger on show after
            if (this.value) {
                trigger(this.component, true);
            }

            // post update
            this.post();
        },
    };
};
