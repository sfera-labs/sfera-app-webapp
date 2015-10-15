/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Interface.js
 */

/**
 * Interface component.
 *
 * @class Sfera.Components.Interface
 * @constructor
 */
Sfera.Components.Interface = function(properties) {
    this.type = "Interface";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
        /**
         * @property {string} text - The  configuration object.
         */
        // text
        text: {
            type: String,
            value: ""
        },

        // style
        style: {
            type: String,
            value: ""
        },

        width: {
            type: "integer",
            value: 0
        },

        height: {
            type: "integer",
            value: 0
        }

    }

    Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Interface, Sfera.Components.Component);

Sfera.Components.Interface.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "text":
            this.element.innerHTML = value;
            break;
    }
}
