/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Input component.
 *
 * @class Sfera.Components.Input
 * @extends Sfera.Components._Field
 * @property {string} type - type of the field
 * @property {string} icon - url of an icon
 */
Sfera.Components.create("Input", {
    extends: "_Field",

    attributes: {
        type: {
            type: "string",
            default: "input",
            values: ["input","textarea","color","date","datetime","email","number","password","tel","time","url"],
            update: function() {
                this.component.redraw();
            }
        },

        height: {
            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.style.height = this.value + "px";
            }
        },

        focus: {
            type: "boolean",
            update: function() {
                if (this.value)
                    this.component.focus();
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

        eraseButton: {
            type: "boolean",
            default: "false",
            update: function() {
                var co = this.component;
                co.elements.erase.style.display = this.value ? "" : "none";
            }
        },

        value: {
            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.value = this.value;
            }
        },

        error: {
            type:"boolean",
            default:"false",
            restoreTimeout:3000,
            update: function() {
                var co = this.component;
                co.updateClass();
            }
        },

        changeDelay: {
            type: "integer",
            default: "1000" // msec to wait before noticing a change
        },

        // regular expression used to validate keydown
        keyRegex: {
            type: "regexp"
        },

        // regular expression used to validate value before submitting
        valueRegex: {
            type: "regexp",

            compile: function() {
                this.value = Sfera.Compiler.compileAttributeValue(this, "^(" + this.source + ")$"); // add begin and end, it has to match the whole string
                // do nothing else, since there's no update needed
            }
        },

        fontSize: {
            type: "integer",

            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.style.fontSize = this.value + "px";
                //this.component.subComponents.erase.setAttribute("width")
            }
        },

        fontColor: {
            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.style.color = this.value;
            }
        },

        maxLength: {
            type: "integer"
        },

        onChange: {
            type: "js",
            default: "event(id,value)"
        },
        onKeyDown: {
            type: "js"
        },
        onKeyUp: {
            type: "js"
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

        this.eraseButton = new Sfera.UI.Button(this.elements.erase, {
            onclick: this.onErase.bind(this)
        });

        /*
        switch (this.getAttribute("type")) {
            case "date":
                this.btObj = new Sfera.UI.Button(this.element, {
                    onclick: this.onClick.bind(this)
                });
        }
        */
    },

    focus: function() {
        this.elements.field.focus(); // will fire onFocus
    },

    blur: function() {
        this.elements.field.blur(); // will fire onBlur
    },

    // redraw
    redraw: function() {
        var value = "";

        if (this.elements.field) {
            this.elements.field.onfocus = null;
            this.elements.field.onblur = null;
            this.elements.field.onselectstart = null;
            value = this.elements.field.value;
            this.elements.field = null;
        }
        var type = this.getAttribute("type");
        var phText = this.getAttribute("placeHolder");
        phText = phText ? ' placeholder="' + phText + '"' : '';
        var style = ""; // TODO: styling the field
        style = style ? ' style="' + style + '"' : '';

        var d = this.getAttribute("enabled")?"":" disabled";
        if (type == "textarea")
            this.elements.fieldC.innerHTML = '<textarea class="field" ' + style + phText + d + ' /></textarea>';
        else
            this.elements.fieldC.innerHTML = '<input class="field" type="' + type + '"' + style + phText + d + ' autocorrect="off" autocapitalize="off" />';

        this.elements.field = this.elements.fieldC.childNodes[0];
        this.elements.field.value = value;
        this.attributes.height.update();

        if (Sfera.Device.android == "Android") { // android: gets last click on a different page if in same position
            this.elements.field.onfocus = function() {
                return false;
            };
            this.elements.field.oninput = this.onUserChange;
        } else {
            this.elements.field.onfocus = this.onFocus; // skip this.elements.field.focus to avoid loop
        }
        this.elements.field.onblur = this.onBlur;
        this.elements.field.onselectstart = this.onSelectStart;

        this.elements.field.controller = this;
    },

    updateClass: function () {
        var cl = this.getAttribute("cssClass");
        var f = (this.focused?" focused":"");
        var d = this.getAttribute("enabled") ? "" : " disabled";
        var e = this.getAttribute("error") ? " error" : "";
        this.element.className = "component comp_input" + (cl?" "+cl:"") + f + d;
        var sty = this.getAttribute("style");
        this.elements.container.className = "container" + (sty?" style_"+sty:"") + e;

        if (this.elements.field) {
            this.elements.field[(d?"set":"remove") + "Attribute"]("disabled", true);
        }
    },

    //
    // events
    //

    // on erase button
    onErase: function() {
        if (!this.getAttribute("enabled"))
            return;

        this.setAttribute("value", "");
        this.onChangedTimeout();
    },

    onChanged: function() {
        var v = this.elements.field.value;

        if (v != this.attributes.value.source) {
            this.attributes.value.source =
                this.attributes.value.value = v;

            this.clearChangeTimeout();
            //if (foo.autoSend || foo.onUserChange) { // otherwise there's nothing to do

            var changeDelay = this.getAttribute("changeDelay");
            var self = this;
            if (changeDelay) // if 0, disabled
                this.changeTimeout = setTimeout(function() {
                self.onChangedTimeout();
            }, changeDelay);
        }
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
        if (f) {
            var value = this.getAttribute("value");
            Sfera.Custom.exec(f, this.id, value);
        }
    },

    onSelectStart: function(event) {

    },

    onKeyDown: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        this.setAttribute("error", "false"); // make sure we're not showing an error
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);
        var type = this.getAttribute("type");

        // trigger on enter event
        if (c == "enter" && !this.onEnterKey()) {
            c = ""; // onEnterKey prevented, don't focus next
        }

        if ((c == "enter" && type != "textarea") || c == "tab") {
            this.onChangedTimeout(); // send now

            Sfera.client.focusNext(event.shiftKey);
            if (c == "enter" && type != "textarea")
                this.blur(); // still focused? (no next object)

            return false; // done, prevent
        } else {
            this.onChanged();

            return true; // allow
        }
    },

    onKeyPress: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);
        var fieldE = this.elements.field;
        var value = this.getAttribute("value");
        var keyRegex = this.getAttribute("keyRegex");
        var maxLength = this.getAttribute("maxLength");

        function getSelectedText() {
            var text = "";
            if (fieldE.selectionStart != fieldE.selectionEnd) {
                text = value.substr(fieldE.selectionStart, fieldE.selectionEnd);
            } else if (typeof window.getSelection != "undefined") {
                text = window.getSelection().toString();
            } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
                text = document.selection.createRange().text;
            }
            return text;
        }

        // only if no special key
        if (c.length == 1) {
            // check max length
            if (value && maxLength && value.length >= maxLength && !getSelectedText()) {
                return false; // prevent
            }

            // validate? only if ctrl or meta are not pressed
            if (keyRegex && !event.ctrlKey && !event.metaKey && !keyRegex.test(String.fromCharCode(code))) {
                return false; // key validation failed: prevent
            }
        }

        this.onChanged();
        return true; // allow
    },

    onKeyUp: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c !== "tab") {
            this.onChanged();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        this.onChanged();
    },

    onEnterKey: function () {
        if (!this.getAttribute("enabled"))
            return;

        var f = this.getAttribute("onEnterKey");
        if (f) {
            var value = this.getAttribute("value");
            return Sfera.Custom.exec(f,this.id,value);
        } else {
            return true; // don't block it
        }
    },

    onFocus: function() {
        var co = this.controller;
        Sfera.client.setFocused(co);
        co.focused = true;
        co.updateClass();

        var f = co.getAttribute("onFocus");
        if (f) {
            var value = co.getAttribute("value");
            return Sfera.Custom.exec(f,co.id,value);
        } else {
            return true; // don't block it
        }
    },

    onBlur: function() {
        var co = this.controller;
        co.onChanged();
        Sfera.client.clearFocused(co);
        co.focused = false;
        co.updateClass();

        var f = co.getAttribute("onBlur");
        if (f) {
            var value = co.getAttribute("value");
            return Sfera.Custom.exec(f,co.id,value);
        } else {
            return true; // don't block it
        }
    },

    onShow: function() {
        if (this.getAttribute("focus"))
            this.focus();
    },

    onHide: function() {

    }

});
