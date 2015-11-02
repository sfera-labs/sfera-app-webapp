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
Sfera.Components.create("Button", {
    behaviors: ["Visibility", "Position", "Size", "Label"],

    attributes: {
        // command
        command: {
            type: "string"
        },

        label: {
            update: function() {
                this.component.element.innerHTML = "<div class='inner'>" + this.value + "</div>";
            }
        },

        // override color
        color: {
            update: function() {
                this.component.element.className = "component button " + this.value;
            }
        },

        // event
        event: {
            type: "string",
            compile: function() {
                this.changed = false;
                var a = this.source.split("=");
                this.value = "eid=" + a[0] + "&eval=" + a[1];
            }
        },

        onClick: {
            type: "string"
        },

        // page
        page: {
            type: "string"
        }
    },

    init: function() {
        this.element.onclick = this.onClick.bind(this);
    },

    onClick: function() {
        // context functions
        function page(id) {
            Sfera.client.showPage(id);
        }

        function event(id, value) {
            Sfera.client.sendEvent(id, value, this);
        }

        function command(command)  {
            Sfera.client.sendCommand(command, this);
        }

        // eval button js
        try {
            var f = this.getAttribute("onClick");
            eval(f);
        } catch (e) {
            if (e instanceof SyntaxError) {
                alert(e.message);
            } else {
                throw (e);
            }
        }
    }

});
