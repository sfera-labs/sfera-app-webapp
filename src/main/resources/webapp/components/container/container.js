/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
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
