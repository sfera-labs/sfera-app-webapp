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
    extends: "_Field",

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
            default: "",
            update: function() {
                var co = this.component;
                var icon = co.subComponents.icon;
                icon.setAttribute("source",this.value);
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
                co.elements.erase.style.display = this.value?"":"none";
            }
        },

        value: {
            update: function() {
                this.component.elements.field.value = this.value;
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

        fontSize: {
            type: "integer",

            update: function () {
                this.component.elements.field.style.fontSize = this.value + "px";
                //this.component.subComponents.erase.setAttribute("width")
            }
        },

        fontColor: {
            update: function () {
                this.component.elements.field.style.color = this.value;
            }
        },

        style: {
            default: "default",

            update: function () {
                this.component.elements.container.className = "container "+this.value;
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
        }
    },

    // safe value
    value:"",

    init: function() {
        var self = this;

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        this.elements.field.controller = this;
        this.elements.field.onchange = this.onChange;
        this.elements.field.onkeydown = this.onKeyDown;
        this.elements.field.onkeypress = this.onKeyPress;
        this.elements.field.onkeyup = this.onKeyUp;
        this.elements.field.onblur = this.onBlur;
        this.elements.field.onfocus = this.onFocus;

        this.btObj = new Sfera.UI.Button(this.elements.erase, {onclick: this.onErase.bind(this)});

        switch (this.getAttribute("inputType")) {
            case "date":
                this.btObj = new Sfera.UI.Button(this.element, {onclick: this.onClick.bind(this)});
        }
    },

    // on erase button
    onErase: function () {
        this.setAttribute("value","");
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
        this.elements.field.focus(); // will fire onFocus
    },

    blur: function () {
        this.elements.field.blur(); // will fire onBlur
    },

    onChanged: function () {
        this.attributes.value.source =
        this.attributes.value.value = this.elements.field.value;
    },

    //
    // events
    //

    onKeyDown: function(evt) {
        //this.controller.setAttribute("error", "false"); // make sure we're not showing an error
        var code = evt.keyCode;
        var co = this.controller;
		var c = co.getKey(code);

        console.log("key down "+co.id);

        var inputType = co.getAttribute("inputType");
        var autoSend = co.getAttribute("autoSend");

		if ((c == "ok" && inputType != "multiline") || c == "t") {
			//if (autoSend)
			//	co.send(); // send now
			co.focusNext(evt.shiftKey);
			if (c == "ok" && inputType != "multiline")
				co.blur(); // still focused? (no next object)
			return false; // done, prevent
		}

        co.onChanged();
		return true; // allow
    },


    onKeyUp: function(evt) {
        var code = evt.keyCode;
        var co = this.controller;

        co.onChanged();
        console.log("key up "+co.id);

        return true;
    },

    onChange: function() {
        var co = this.controller;

        co.onChanged();
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
