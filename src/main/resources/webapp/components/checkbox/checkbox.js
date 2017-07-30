/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Checkbox component.
 *
 * @class Sfera.Components.Checkbox
 * @extends Sfera.Components._Field
 */
Sfera.Components.create("Checkbox", {
    extends: "_Field",

    attributes: {
        width: {
            default: 20,
            update: function () {
                if (this.component.elements.button)
                    this.component.elements.button.style.width = this.value + "px";
            }
        },

        height: {
            default: 20,
            update: function() {
                if (this.component.elements.button)
                    this.component.elements.button.style.height = this.value + "px";
            }
        },

        focus: {
            type: "boolean",
            update: function() {
                if (this.value)
                    this.component.focus();
            }
        },

        label: {
            type: "string",
            default: "",
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
            }
        },

        value: {
            type: "boolean",
            update: function() {
                this.component.redraw();
            }
        },

        changeDelay: {
            type: "integer",
            default: "0" // msec to wait before noticing a change
        },

        fontSize: {
            type: "integer",

            update: function() {
                this.component.subComponents.label.setAttribute("fontSize", this.value);
            }
        },

        fontColor: {
            update: function() {
                this.component.subComponents.label.setAttribute("fontColor", this.value);
            }
        },

        style: {
            update: function() {
                var co = this.component;
                co.redraw();
            }
        },

        onChange: {
            type: "js",
            default: "event(id,value)"
        }
    },

    init: function() {
        var self = this;

        this.value = ""; // TODO: used?
        this.changeTimeout = null;

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        this.btObj = new Sfera.UI.Button(this.element, {
            onclick: this.onClick.bind(this)
        });
    },

    focus: function() {
        this.onFocus();
    },

    blur: function() {
        this.onBlur();
    },
    
    redraw: function() {
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (sty?" style_"+sty:"") +
                                            " " + (this.getAttribute("value")?"on":"off");
    },

    updateClass: function () {
        this.btObj.focus(this.focused);
        this.btObj.enable(this.getAttribute("enabled"));
    },

    //
    // events
    //

    clearChangeTimeout: function() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
    },

    // on changed after timeout
    onChangedTimeout: function() {
        this.clearChangeTimeout();

        // custom change event
        var f = this.getAttribute("onChange");
        var value = this.getAttribute("value");
        Sfera.Custom.exec(f, this.id, value);
    },

    flip: function () {
        this.setAttribute("value", !this.getAttribute("value"));
        this.onChange();
    },

    onClick: function() {
    	this.focus();
        this.flip();
    },

    onKeyDown: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c == "tab") {
        	if (this.changeTimeout) {
        		this.onChangedTimeout(); // send now
        	}
            Sfera.client.focusNext(event.shiftKey);
            return false; // done, prevent
        }
    },

    onKeyUp: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);
        
        if (c == "space" || c == "enter") {
            this.flip();
        }
        
        return true;
    },

    onChange: function() {
        this.clearChangeTimeout();

        var changeDelay = this.getAttribute("changeDelay");
        var self = this;
        if (changeDelay) { // if 0, run immediately
            this.changeTimeout = setTimeout(function() {
                self.onChangedTimeout();
            }, changeDelay);
        } else {
            self.onChangedTimeout();
        }
    },

    onFocus: function() {
        Sfera.client.setFocused(this);
        this.focused = true;
        this.updateClass();
    },

    onBlur: function() {
        Sfera.client.clearFocused(this);
        this.focused = false;
        this.updateClass();
    },

    onShow: function() {
        if (this.getAttribute("focus"))
            this.focus();
    },

    onHide: function() {
    }

});
