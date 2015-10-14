/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Button.js
 */

/**
 * Button component.
 *
 * @class Sfera.Components.Button
 * @constructor
 */
Sfera.Components.new("Button", {
    properties: {
        /**
         * @property {string} text - The  configuration object.
         */
        // text
        Button: {
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

        // command
        command: {
            type: "string",
            value: ""
        }

    },

    constructor: function(properties) {
        this.ancestor.constructor.call(this, properties);

        this.element.onclick = function () {
            Sfera.client.sendCommand(this.properties.command.value);
        };
    },

    prototype: {
        setProperty: function(name, value) {
            if (!this.ancestor.setProperty.call(this, name, value))
                return false;

            // refresh
            value = this.properties[name].value;

            switch (name) {
                case "Button":
                    this.element.innerHTML = value;
                    break;
            }
        }
    }
});
