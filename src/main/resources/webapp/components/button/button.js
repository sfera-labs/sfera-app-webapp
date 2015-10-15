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
Sfera.Components.Button = function(properties) {
    this.type = "Interface";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
            /**
             * @property {string} text - The  configuration object.
             */
            // text
            label: {
                type: "string",
                value: ""
            },

            color: {
                type: "string",
                value: ""
            },

            // style
            style: {
                type: "string",
                value: ""
            },

            // style
            'font-size': {
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
            },

            // page
            page: {
                type: "string",
                value: ""
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

        },

        Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Button, Sfera.Components.Component);

Sfera.Components.Button.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "label":
            this.element.innerHTML = "<div class='inner'>" + value + "</div>";
            break;
        case "event":
            var a = value.split("=");
            this.properties.event.value = "eid=" + a[0] + "&eval=" + a[1];
            break;
        case "color":
            this.element.className = "component button " + value;
            break;
        case "font-size":
            this.element.style.fontSize = value + "px";
            break;
    }
}

Sfera.Components.Button.prototype.init = function() {
    Sfera.Components.Component.prototype.init.call(this);

    var comm = this.properties.command.value;
    var even = this.properties.event.value;
    var page = this.properties.page.value;
    this.element.onclick = function() {
        if (even)
            Sfera.client.sendEvent(even);
        if (comm)
            Sfera.client.sendCommand(comm);
        if (page)
            Sfera.client.showPage(page);
    };
};
