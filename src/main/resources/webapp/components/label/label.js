/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Label.js
 */

/**
 * Label component.
 *
 * @class Sfera.Components.Label
 * @constructor
 */
Sfera.Components.create("Label", {
    behaviors: ["Visibility", "Position", "Size", "Label"],

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
