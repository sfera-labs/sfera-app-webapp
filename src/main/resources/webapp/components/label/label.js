/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Label component.
 *
 * @class Sfera.Components.Label
 * @constructor
 */
Sfera.Components.create("Label", {
    presets: ["Visibility", "Position", "Size", "Label"],

    attributes: {
        // change label to text
        label: null,

        text: {
            type: "string",
            update: function() {
                this.component.element.innerHTML = this.value;
            }
        }
    }
});
