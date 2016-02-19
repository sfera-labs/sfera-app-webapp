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
    presets: ["Visibility", "Position", "Size", "Style", "Color"],

    attributes: {
        // command
        command: {
            type: "string"
        },

        label: {
            update: function() {
                var co = this.component;
                var label = co.subComponents.label;
                label.setAttribute("label", this.value);
                if (this.value) {
                    co.elements.label.style.display = "";
                    //label.setAttribute("visible",true);
                } else {
                    co.elements.label.style.display = "none";
                    //label.setAttribute("visible",false);
                }
                //this.component.element.innerHTML = "<div class='inner'>" + this.value + "</div>";
            }
        },

        icon: {
            type: "string",
            default: "",
            update: function() {
                var co = this.component;
                var icon = co.subComponents.icon;
                icon.setAttribute("source", this.value);
                if (this.value) {
                    co.elements.icon.style.display = "";
                    //icon.setAttribute("visible",true);
                } else {
                    co.elements.icon.style.display = "none";
                    //icon.setAttribute("visible",false);
                }
            }
        },

        fontSize: {
            update: function() {
                var co = this.component;
                var label = co.subComponents.label;
                label.setAttribute("fontSize", this.value);
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

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        this.btObj = new Sfera.UI.Button(this.elements.container, {
            onclick: this.onClick.bind(this)
        });
        //this.element.onclick = this.onClick.bind(this);
    },

    updateClass: function() {
        var col = this.getAttribute("color");
        var sty = this.getAttribute("style");
        this.btObj.setClassName("container" + (sty?" style_"+sty:"") + (col?" color_"+col:""));
    },


    onClick: function() {
        var f = this.getAttribute("onClick");
        Sfera.Custom.exec(f, this.id);
    }

});
