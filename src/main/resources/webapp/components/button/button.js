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
        label: {
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
        },

        // event
        event: {
            type: "string",
            value: ""
        }

    },

    constructor: function(properties) {
        this.ancestor.constructor.call(this, properties);
    },

    prototype: {
        init: function() {
            this.ancestor.init.call(this);

            var comm = this.properties.command.value;
            var even = this.properties.event.value;
            this.element.onclick = function () {
                if (even)
                    Sfera.client.sendEvent(even);
                if (comm)
                    Sfera.client.sendCommand(comm);
            };
        },

        setProperty: function(name, value) {
            if (!this.ancestor.setProperty.call(this, name, value))
                return false;

            // refresh
            value = this.properties[name].value;

            switch (name) {
                case "label":
                    this.element.innerHTML = value;
                    break;
                case "event":
                    var a = value.split("=");
                    this.properties.event.value = "eid="+a[0]+"&eval="+a[1];
                    break;
            }
        }
    }
});
