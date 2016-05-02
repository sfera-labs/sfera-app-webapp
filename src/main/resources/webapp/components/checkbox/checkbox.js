/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
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
            update: function () {
                if (this.component.elements.button)
                    this.component.elements.button.style.width = this.value + "px";
            }
        },

        height: {
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
            default: "200" // msec to wait before noticing a change
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

        onKeyUp: {
            type: "js"
        },
        onChange: {
            type: "js",
            default: "event(id,value)"
        },
        onEnterKey: {
            type: "js"
        },
        onFocus: {
            type: "js"
        },
        onBlur: {
            type: "js"
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

    // redraw
    redraw: function() {
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (sty?" style_"+sty:"") +
                                            " " + (this.getAttribute("value")?"on":"off");
    },

    updateClass: function () {
        this.btObj.setAttribute("focused",this.focused);
    },

    //
    // events
    //

    onChanged: function() {
        this.clearChangeTimeout();
        //if (foo.autoSend || foo.onUserChange) { // otherwise there's nothing to do

        var changeDelay = this.getAttribute("changeDelay");
        var self = this;
        if (changeDelay) // if 0, disabled
            this.changeTimeout = setTimeout(function() {
            self.onChangedTimeout()
        }, changeDelay);
    },

    clearChangeTimeout: function() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null; // make sure?
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
        var f = this.getAttribute("onClick");
        var r = true;
        if (f) {
            var value = this.getAttribute("value");
            r = Sfera.Custom.exec(f, this.id, value);
        }
        if (r !== false) {
            this.focus();
            this.flip();
        }
    },

    onKeyDown: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        // trigger on enter event
        if (c == "enter" && !this.onEnter()) {
            c = ""; // onEnter prevented, don't focus next
        }

        if (c == "tab") {
            this.onChangedTimeout(); // send now

            Sfera.client.focusNext(event.shiftKey);
            if (c == "enter")
                this.blur(); // still focused? (no next object)

            return false; // done, prevent
        } else {
            // space, flip
            if (c == "space" || c == "enter") {
                this.flip();
            }

            this.onChanged();

            return true; // allow
        }
    },

    onKeyPress: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        this.onChanged();
        return true; // allow
    },

    onKeyUp: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c != "tab") {
            this.onChanged();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        var f = this.getAttribute("onClick");
        var r = true;
        if (f) {
            var value = this.getAttribute("value");
            r = Sfera.Custom.exec(f, this.id, value);
        }
    },

    onEnterKey: function () {
        var f = this.getAttribute("onEnterKey");
        if (f) {
            return Sfera.Custom.exec(f);
        } else {
            return true; // don't block it
        }
    },

    onFocus: function() {
        Sfera.client.setFocused(this);
        this.focused = true;
        this.updateClass();
    },

    onBlur: function() {
        this.onChanged();
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
