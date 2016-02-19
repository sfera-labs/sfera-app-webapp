/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Radio.js
 */

/**
 * Radio component.
 *
 * @class Sfera.Components.Radio
 * @extends Sfera.Components.Checkbox
 * @property {string} type - type of the field
 * @property {string} icon - url of an icon
 */
Sfera.Components.create("Radio", {
    extends: "Checkbox",

    attributes: {
        group: {
            type:"string",
            update: function() {
                var co = this.component;
                if (co.group) {
                    Sfera.client.components.removeByGroup(co,co.group);
                }
                co.group = this.value;
                if (co.group) {
                    Sfera.client.components.addByGroup(co,co.group);
                }
            }
        }
    },

    init: function() {
        this.super("Checkbox","init");
    },

    onChange: function() {
        var f = this.getAttribute("onClick");
        var r = true;
        if (f) {
            var value = this.getAttribute("value");
            r = Sfera.Custom.exec(f, this.id, value);
        }

        if (r !== false) {
            var g = this.getAttribute("group");
            // exclusive?
            if (g && this.getAttribute("value")) {
                var cos = Sfera.client.components.getByGroup(g);
                for (var i=0; i<cos.length; i++) {
                    if (cos[i] != this)
                        cos[i].setAttribute("value", false);
                }
            }

            this.onChanged();
        }
    }

});
