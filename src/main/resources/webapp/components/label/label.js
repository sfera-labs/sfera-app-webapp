/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * label.js
 */

/**
 * Label component.
 *
 * @class Sfera.Components.Label
 * @constructor
 */
Sfera.Components.Label = function(properties) {
    this.type = "Label";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
         * @property {string} text - The  configuration object.
         */
        // text
        text: {
            type: "string",
            value: ""
        },

        // style
        style: {
            type: "string",
            value: ""
        },

        // visible
        visible: {
            type: "boolean",
            value: true
        }

    };

    Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Label, Sfera.Components.Component);

Sfera.Components.Label.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "text":
            this.element.innerHTML = value;
            break;
    }
};
