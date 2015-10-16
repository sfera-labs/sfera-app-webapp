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
        },


        'font-size': {
            type: "string",
            value: ""
        },

        'text-align': {
            type: "string",
            value: ""
        }
    }

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
        case "style":
            this.element.style = value;
            break;
        case "font-size":
            this.element.style.fontSize = value + "px";
            break;
        case "text-align":
            this.element.style.textAlign = value;
            break;
    }
}

Sfera.Components.Label.prototype.init = function() {
    Sfera.Components.Component.prototype.init.call(this);
};
