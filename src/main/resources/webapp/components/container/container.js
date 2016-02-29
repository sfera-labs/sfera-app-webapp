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
            post: function() {
                this.component.element.style.overflow = (this.value == "auto") ? "" : "scroll";
            }
        },
        height: {
            post: function() {
                this.component.element.style.overflow = (this.value == "auto") ? "" : "scroll";
            }
        }
    }
});
