/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Container.js
 */

/**
 * Interface component.
 *
 * @class Sfera.Components.Container
 * @constructor
 */
Sfera.Components.create("Container", {
    presets: ["Visibility", "Position", "Size"],

    attributes: {
        width: {
            update: function() {
                var a = this.value == "auto";
                this.component.element.style.width = a ? "auto" : this.value + "px";
                this.component.element.style.overflow = !a ? "scroll" : "";
            }
        },
        height: {
            update: function() {
                var a = this.value == "auto";
                this.component.element.style.height = a ? "auto" : this.value + "px";
                this.component.element.style.overflow = !a ? "scroll" : "";
            }
        }
    }
});
