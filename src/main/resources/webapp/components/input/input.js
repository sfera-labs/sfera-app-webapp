/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Button.js
 */

/**
 * Input component.
 *
 * @class Sfera.Components.Image
 * @extends Sfera.Components._Field
 * @property {string} type - source url of the image
 */
Sfera.Components.create("Input", {
    extends: "_Field",

    attributes: {
        type: {
            type: "string",
            default: "input",
            update: function() {
                this.component.redraw();
            }
        },

        autoSend: {
            type: "boolean"
        },

        height: {
            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.style.height = this.value + "px";
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

        safeValue: {

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

        style: {
            default: "default",

            update: function() {
                this.component.elements.container.className = "container " + this.value;
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

        this.btObj = new Sfera.UI.Button(this.elements.erase, {
            onclick: this.onErase.bind(this)
        });

        switch (this.getAttribute("type")) {
            case "date":
                this.btObj = new Sfera.UI.Button(this.element, {
                    onclick: this.onClick.bind(this)
                });
        }
    },

    // on erase button
    onErase: function() {
        this.setAttribute("value", "");
    },

    // get key function from keycode
    getKey: function(code) {
        var c = "";
        if (code == 13) { // enter
            return "ok";
        } else if (code == 9) { // tab: next field
            return "t";
        } else if (code == 8) { // back
            return "b";
        } else return; // nothing to see here
    },

    focus: function() {
        this.elements.field.focus(); // will fire onFocus
    },

    blur: function() {
        this.elements.field.blur(); // will fire onBlur
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
                this.changeTimeout = setTimeout(function() { self.onChangedTimeout() }, changeDelay);
        }
    },

    clearChangeTimeout: function () {
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

        if (type == "textarea")
            this.elements.fieldC.innerHTML = '<textarea class="field" ' + style + phText + ' /></textarea>';
        else
            this.elements.fieldC.innerHTML = '<input class="field" type="' + type + '"' + style + phText + ' />';

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

    //
    // events
    //
    onSelectStart: function(event) {

    },

    onKeyDown: function(event) {
        //this.controller.setAttribute("error", "false"); // make sure we're not showing an error
        var code = event.keyCode;
        var c = this.getKey(code);

        console.log("key down " + this.id + " " + c);

        var type = this.getAttribute("type");
        var autoSend = this.getAttribute("autoSend");

        if ((c == "ok" && type != "textarea") || c == "t") {
            this.onChangedTimeout(); // send now
            Sfera.client.focusNext(event.shiftKey);
            if (c == "ok" && type != "textarea")
                this.blur(); // still focused? (no next object)
            return false; // done, prevent
        }

        this.onChanged();
        return true; // allow
    },

    onKeyPress: function(event) {
        var code = event.keyCode;
        var c = this.getKey(code);
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
        var c = this.getKey(code);
        console.log("key up " + this.id);

        if (!c || c == "b") {
            this.onChanged();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        this.onChanged();
        /*
        var f = this.getAttribute("onClick");
        Sfera.Custom.exec(f);
        */
    },

    onFocus: function() {
        Sfera.client.setFocused(this.controller);
    },

    onBlur: function() {
        Sfera.client.clearFocused(this.controller);
    }

});
