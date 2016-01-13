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
Sfera.Components.create("Input", {
    behaviors: ["Visibility", "Position", "Size"],

    attributes: {
        inputType: {
            type: "string",
            value: "",
            update: function() {
                switch (this.value) {
                case "input":
                    break;
                case "multiline":
                    break;
                }
            }
        },

        autoSend: {
            type: "boolean"
        },

        icon: {
            type: "string",
            update: function() {

            }
        },

        value: {
            update: function() {
                this.component.inputElement.value = this.value;
            }
        },

        safeValue: {

        },

        // regular expression used to validate keydown
        keyRegex: {
            type: "regexp"
        },

        // regular expression used to validate value before submitting
    	valueRegex: {
            type: "regexp",

            compile: function () {
                this.value = Sfera.Compiler.compileAttributeValue(this, "^("+this.source+")$"); // add begin and end, it has to match the whole string
                // do nothing else, since there's no update needed
            }
        },

        maxLength: {
            type: "integer"
        },

        onKeyUp: {
            type: "string"
        },
        onChange: {
            type: "string"
        },
        onEnter: {
            type: "string"
        },
        onFocus: {
            type: "string"
        },
        onBlur: {
            type: "string"
        },

        // page
        page: {
            type: "string"
        }
    },

    // safe value
    value:"",

    init: function() {
        var self = this;
        this.elements.input = this.element.getElementsByTagName("INPUT")[0];
        this.elements.input.controller = this;
        this.elements.input.onchange = this.onChange;
        this.elements.input.onkeydown = this.onKeyDown;
        this.elements.input.onkeypress = this.onKeyPress;
        this.elements.input.onkeyup = this.onKeyUp;
        this.elements.input.onblur = this.onBlur;
        this.elements.input.onfocus = this.onFocus;

        switch (this.getAttribute("inputType")) {
            case "date":
                this.btObj = new Sfera.UI.Button(this.element, {onclick: this.onClick.bind(this)});
        }
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

    focus: function () {
        this.elements.input.focus(); // will fire onFocus
    },

    blur: function () {
        this.elements.input.blur(); // will fire onBlur
    },

    onChanged: function () {
        this.attributes.value.value = this.elements.input.value;
    },

    //
    // events
    //

    onKeyDown: function(evt, code) {
        //this.controller.setAttribute("error", "false"); // make sure we're not showing an error
        var contr = this.controller;
		var c = contr.getKey(code);

        console.log("key down "+contr.id);

        var inputType = contr.getAttribute("inputType");
        var autoSend = contr.getAttribute("autoSend");

		if ((c == "ok" && inputType != "multiline") || c == "t") {
			//if (autoSend)
			//	contr.send(); // send now
			//client.focusNextObj(foo,evt.shiftKey);
			if (c == "ok" && inputType != "multiline")
				contr.blur(); // still focused? (no next object)
			return false; // done, prevent
		}

        contr.onChanged();
		return true; // allow
    },

    onKeyPress: function(evt,code) {
        var contr = this.controller;
        var c = contr.getKey(code);
        var inputE = contr.elements.input;
        var value = contr.getAttribute("value");
        var keyRegex = contr.getAttribute("keyRegex");
        var maxLength = contr.getAttribute("maxLength");

        console.log("key press "+contr.id);

        function getSelectedText() {
		    var text = "";
		    if (inputE.selectionStart != inputE.selectionEnd) {
		    	text = value.substr(inputE.selectionStart,inputE.selectionEnd);
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
		if (!c && keyRegex && !evt.ctrlKey && !evt.metaKey && !keyRegex.test(String.fromCharCode(code)))
			return false; // key validation failed: prevent

        contr.onChanged();
		return true; // allow
    },

    onKeyUp: function(evt,code) {
        var contr = this.controller;

        contr.onChanged();
        console.log("key up "+contr.id);
    },

    onChange: function() {
        var contr = this.controller;

        contr.onChanged();
        /*
        var f = this.getAttribute("onClick");
        Sfera.Custom.exec(f);
        */
    },

    onFocus: function () {

    },

    onBlur: function () {

    }

});
