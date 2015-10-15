/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Image.js
 */

/**
 * Image component.
 *
 * @class Sfera.Components.Image
 * @constructor
 */
Sfera.Components.Image = function(properties) {
    this.type = "Image";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
         * @property {string} text - The  configuration object.
         */
        // text
        source: {
            type: "string",
            value: ""
        },

        // visible
        visible: {
            type: "boolean",
            value: true
        },

        x: {
            type: "integer",
            value: 0
        },

        y: {
            type: "integer",
            value: 0
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

Sfera.Utils.extend(Sfera.Components.Image, Sfera.Components.Component);

Sfera.Components.Image.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "source":
            this.element.innerHTML = "<img src='"+value+"' width='100%' height='100%'>";
            break;
    }
}

Sfera.Components.Image.prototype.init = function() {
    Sfera.Components.Component.prototype.init.call(this);
};
