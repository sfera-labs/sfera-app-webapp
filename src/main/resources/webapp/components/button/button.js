/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Button component.
 *
 * @class Sfera.Components.Button
 * @constructor
 */
Sfera.Components.create("Button", {
    presets: ["Visibility", "Position", "Size", "Style", "Color", "Enable"],

    attributes: {
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
            },
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
            },
        },

        fontSize: {
            update: function() {
                var co = this.component;
                var label = co.subComponents.label;
                label.setAttribute("fontSize", this.value);
            },
        },

        onClick: {
            type: "js",
            default: "event(id,true)"
        },

        onDown: {
            type: "js",
        },

        onMove: {
            type:"js",
        }

    },

    init: function() {

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        this.button = new Sfera.UI.Button(this.elements.container, {
            ondown: this.onDown.bind(this),
            onup: this.onUp.bind(this),
            onmove: this.onMove.bind(this)
        });

        this.updateClass();

        //this.element.onclick = this.onClick.bind(this);
    },

    updateClass: function() {
        var col = this.getAttribute("color") || "default";
        var sty = this.getAttribute("style") || "default";
        this.button.setClassName("container" + (sty?" style_"+sty:"") + (col?" color_"+col:""));
        this.button.enable(this.getAttribute("enabled"));
    },

    onDown: function() {
        var f = this.getAttribute("onDown");
        Sfera.Custom.exec(f, this.id);
    },

    onMove: function() {
        var f = this.getAttribute("onMove");
        Sfera.Custom.exec(f, this.id);
    },

    onUp: function() {
        var f = this.getAttribute("onClick");
        Sfera.Custom.exec(f, this.id);
    },

    onShow: function() {
        var icon = this.subComponents.icon;
        icon.onShow();
    }


});
