/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 */

/**
 * Select component.
 *
 * @class Sfera.Components.Select
 * @extends Sfera.Components._Field
 */
Sfera.Components.create("Select", {
    extends: "_Field",

    attributes: {
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

        value: {
            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.value = this.value;
            }
        },

        values: {
            type: "list",
            update: function() {
                if (this.component.elements.field)
                    this.component.redraw();
            }
        },

        labels: {
            type: "list",
            update: function() {
                if (this.component.elements.field)
                    this.component.redraw();
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

        onKeyUp: {
            type: "string"
        },
        onChange: {
            type: "string",
            default: "event(id,value)"
        },
        onEnter: {
            type: "string"
        },
        onFocus: {
            type: "string"
        },
        onBlur: {
            type: "string"
        }
    },

    init: function() {
        var self = this;

        this.value = ""; // TODO: used?
        this.changeTimeout = null;

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        this.redraw();

        /*
                this.eraseButton = new Sfera.UI.Button(this.elements.erase, {
                    onclick: this.onErase.bind(this)
                });
        */
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

        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");

        var html = '<select class="field" ' + style + phText + ' />';

        if (values)
            for (var i = 0; i < values.length; i++) {
                v = values[i];
                l = (labels && labels[i]) || v;
                html += '<option value="' + v + '">' + l + '</option>';
            }

        html += '</select>';

        this.elements.fieldC.innerHTML = html;

        this.elements.field = this.elements.fieldC.childNodes[0];
        this.elements.field.value = value;
        this.attributes.height.update();

        //this.elements.field.multiple = true;

        if (Sfera.Device.android == "Android") { // android: gets last click on a different page if in same position
            this.elements.field.onfocus = function() {
                return false;
            };
            this.elements.field.oninput = this.onUserChange;
        } else {
            this.elements.field.onfocus = this.onFocus; // skip this.elements.field.focus to avoid loop
        }
        this.elements.field.onblur = this.onBlur;
        this.elements.field.onchange = this.onChange;

        this.elements.field.controller = this;
    },

    updateOptions: function() {
        this.redraw();
    },


    updateClass: function() {
        this.element.className = "component comp_select" + (this.focused ? " focused" : "");
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (sty?" style_"+sty:"");
    },

    //
    // events
    //

    // on erase button
    onErase: function() {
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
                self.onChangedTimeout()
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
        var value = this.getAttribute("value");
        Sfera.Custom.exec(f, this.id, value);
    },

    onSelectStart: function(event) {

    },

    onKeyDown: function(event) {
        //this.controller.setAttribute("error", "false"); // make sure we're not showing an error
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);
        var type = this.getAttribute("type");

        // trigger on enter event
        if (c == "enter" && !this.onEnter()) {
            c = ""; // onEnter prevented, don't focus next
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

        // check max length
        if (!c && value && maxLength && value.length >= maxLength && !getSelectedText()) {
            return false; // prevent
        }

        // validate? (only if ctrl or meta are not pressed)
        if (!c && keyRegex && !event.ctrlKey && !event.metaKey && !keyRegex.test(String.fromCharCode(code)))
            return false; // key validation failed: prevent

        this.onChanged();
        return true; // allow
    },

    onKeyUp: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c !== "tab") {
            this.onChanged();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        this.controller.onChanged();
        /*
        var f = this.getAttribute("onClick");
        Sfera.Custom.exec(f);
        */
    },

    onEnter: function() {
        var f = this.getAttribute("onEnter");
        if (f) {
            return Sfera.Custom.exec(f);
        } else {
            return true; // don't block it
        }
    },

    onFocus: function() {
        var co = this.controller;
        Sfera.client.setFocused(co);
        co.focused = true;
        co.updateClass();
    },

    onBlur: function() {
        var co = this.controller;
        co.onChanged();
        Sfera.client.clearFocused(co);
        co.focused = false;
        co.updateClass();
    },

    onShow: function() {
        if (this.getAttribute("focus"))
            this.focus();
    },

    onHide: function() {

    }

});
