/*! sfera-webapp - v0.0.2 */

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
        var d = (this.getAttribute("enabled") ? "" : " disabled");
        this.button.setClassName("container" + (sty?" style_"+sty:"") + (col?" color_"+col:"") + d);
        this.button.enable(d?false:true);
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
        this.btObj.focus(this.focused);
        this.btObj.enable(this.getAttribute("enabled"));
    },

    //
    // events
    //

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

            this.onChange();

            return true; // allow
        }
    },

    onKeyPress: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        this.onChange();
        return true; // allow
    },

    onKeyUp: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c != "tab") {
            this.onChange();
            return false; // nothing to see here: prevent
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
        this.onChange();
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


/**
 * Interface component.
 *
 * @class Sfera.Components.Container
 * @constructor
 */
Sfera.Components.create("Container", {
    presets: ["Visibility", "Position", "Size"],

    attributes: {
        width: {
            post: function() {
                this.component.element.style.overflow = (this.value == "auto") ? "" : "scroll";
            }
        },
        height: {
            post: function() {
                this.component.element.style.overflow = (this.value == "auto") ? "" : "scroll";
            }
        }
    },

});


/**
 * Image component.
 *
 * @class Sfera.Components.Image
 * @mixes Sfera.Behaviors.Visibility
 * @mixes Sfera.Behaviors.Position
 * @property {string} source - source url of the image
 */
Sfera.Components.create("Image", {
    presets: ["Visibility", "Position", "Size"],

    attributes: {
        source: {
            type: "string",
            update: function() {
                var c = this.component;
                var e = c.element;
                // no source, hide it
                if (!this.value) {
                    e.innerHTML = "";
                }
                // svg
                else if (this.value.indexOf(".svg") == this.value.length - 4) {
                    var req = new Sfera.Net.Request();
                    req.init();
                    req.onLoaded = function() {
                        var xml = req.getResponseXML();
                        c.svg = xml.getElementsByTagName("svg")[0];
                        e.innerHTML = "";
                        if (c.svg) {
                            e.appendChild(c.svg);
                            c.svg.style.width = c.getAttribute("width");
                            c.svg.style.height = c.getAttribute("height");
                        }
                        // done
                        req = null;
                    };
                    req.open(this.value);
                }
                // normal img
                else {
                    e.innerHTML = "<img src='" + this.value + "' width='100%' height='100%'>";
                }
            }
        }
    },

    init: function() {
        this.svg = null;
    },

    onShow: function () {
        if (this.svg) {
            this.svg.style.width = this.getAttribute("width") + "px";
            this.svg.style.height = this.getAttribute("height") + "px";
        }
	},

});


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

        var f = this.getAttribute("onFocus");
        if (f) {
            var value = this.getAttribute("value");
            return Sfera.Custom.exec(f,this.id,value);
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

        var f = this.getAttribute("onBlur");
        if (f) {
            var value = this.getAttribute("value");
            return Sfera.Custom.exec(f,this.id,value);
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


/**
 * Interface component.
 *
 * @class Sfera.Components.Interface
 * @constructor
 */
 Sfera.Components.create("Interface",{
     presets:["Visibility","Size"],

     attributes: {
         title: {
             type: "string",
             // @ifdef DOC
             doc:"Title visible in the browser's title bar"
             // @endif
         },

         skin: {
            default: "default",
            update: function () {
                Sfera.client.skin = new Sfera.Skins[Sfera.Utils.capitalize(this.value)]();
            }
         },

         zoom: {
             type: "float",
             update: function () {
         		if (this.value != 1) {
         			var bodyE = document.getElementsByTagName("BODY")[0];
         			var v = "scale("+this.value+","+this.value+")";
         			if (Sfera.Device.browser == "IE") {
         				bodyE.style.msTransform = v;
         				bodyE.style.msTransformOrigin = "0% 0%";
         			} else {
         				bodyE.style.zoom = (this.value*100)+"%";
         				bodyE.style.OTransform = v;
         				bodyE.style.MozTransform = v;
         				bodyE.style.WebkitTransformOrigin = "0 0";
         				bodyE.style.transformOrigin = "0% 0%";
         			}
         			// prevent artifacts
         			bodyE.style.width = "0px";
         			bodyE.style.height = "0px";
         		}
             }
         },

         fit: {
            type: "boolean", 
         },

         autoReload: {
             type: "boolean",
             default: "true"
         },

         bodyBackgroundColor: {
             type: "color",
             update: function () {
                 var bodyE = document.getElementsByTagName("body")[0];
                 bodyE.style.backgroundColor = this.value;
             }
         },

         frameBackgroundColor: {
             type: "color",
             update: function () {
                 this.component.element.style.backgroundColor = this.value;
             }
         }

     }
 });


/**
 * Label component.
 *
 * @class Sfera.Components.Label
 * @constructor
 */
Sfera.Components.create("Label", {
    presets: ["Visibility", "Position", "Size", "Label"],

    attributes: {
        // change label to text
        label: null,

        text: {
            type: "string",
            update: function() {
                this.component.element.innerHTML = this.value;
            }
        }
    }
});


/**
 * List component.
 *
 * @class Sfera.Components.List
 * @constructor
 */
Sfera.Components.create("List", {
    presets: ["Visibility", "Position", "Size", "Style", "Color", "Enable"],

    attributes: {
        labels: {
            type: "list",
            update: function() {
                var co = this.component;
                co.redraw();
            },
        },

        values: {
            type: "list",
            update: function() {
                var co = this.component;
                co.redraw();
            },
        },

        template: {
            update: function() {
                var co = this.component;
                var str = this.value;
                var template;
        		if (!str) {
        			template = null;
        			return;
        		}
        		template = {a:[], b:[]};
        		var a = str.split("%"),
        			k,p;
        		for (var i=0; i<a.length; i++) {
        			p = a[i];
        			if (i) {
        				// remove number from beginning of p
        				k = 0;
        				while (k<p.length && isNumeric(p[k])) k++;
        				if (k) {
        					template.a.push(p.substr(k));
        					template.b.push(p.substr(0,k));
        				} else {
        					template.a[template.a.length-1] += "%"+p;
        				}
        			} else {
        				template.a.push(p);
        			}
        		}

                co.template = template;

                co.redraw();
            },
        },

        onItemClick: {
            type: "js",
            default: "event(id,value)"
        }

    },

    init: function() {
        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);
        this.buttons = [];

        this.setAttribute("template",
        '<div class="component comp_button" style="position:static">\
            <div name="bt" class="container style_default color_default">\
                <div class="cLabel" name="label">\
                %1\
                </div>\
            </div>\
        </div>');

        this.updateClass();
    },

    updateClass: function() {
        //var sty = this.getAttribute("style") || "default";
        var d = (this.getAttribute("enabled") ? "" : " disabled")
        for (var i=0; i<this.buttons.length; i++) {
            this.buttons[i].setClassName("container" + d);
            this.buttons[i].enable(d?false:true);
        }
    },

    removeButtons: function () {
        for (var i=0; i<this.buttons.length; i++)
			this.buttons[i].destroy(); // up buttons
        this.buttons = [];
    },

    // [value, label]
	getItem: function (i) {
        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");
		var v = (values && values[i]!=null)?values[i]:i+""; // no value? use index
		var l = (labels && labels[i]!=null)?labels[i]:v; // no label? same as value
		return [v,l];
	},

    // total items to show
	getTotalItems: function () {
        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");
		return (values && values.length && (!labels || values.length<=labels.length))?values.length:(labels && labels.length)?labels.length:0; // min value
	},

    // index, items array (different from _items when still composing)
    getItemHTML: function(i, items) {
		var c = items[i], // content [v,l]
			html = '<div class="item',
			s = false;

		// check selection
		/*
		if (isSelected(c[0])) {
			if (!multi) {
				if (selectedIndex == i ||  // already selected
					selectedIndex == -1 || // nothing selected
					!items[selectedIndex] || // item previously selected doesn't exist anymore
					!isSelected(items[selectedIndex][0])) { // or the item previously selected is not selected anymore
					s = true;
					selectedIndex = i;
				}
			} else {
				s = true;
				_value += (_value?",":"") + c[0];
			}
		}
		if (s) html += ' selected';
        */

		html += '" data-name="'+name+'" data-param="'+c[0]+'"'; // params for user object

        var style ="";
		html += ' style="'+style+'">'; // item style

		html += this.applyTemplate(c[1])+"</div>";
		return html;
	},

    initItemEvents: function (i) {
        var d = this.elements.content.childNodes[i];
        var ad = d.getElementsByTagName("DIV");
        var e;
        for (var k=0; k<ad.length; k++) {
            if (ad[k].getAttribute("name") == "bt") {
                e = ad[k]
                break;
            }
        }
        if (!e) e = d;
        this.buttons[i] = new Sfera.UI.Button(e,{onclick:this.onItemClick.bind(this,i)});
        if (!this.getAttribute("enabled"))
            this.buttons[i].enable(false);
    },

    onItemClick: function (i) {
        var c = this.getItem(i);
        var f = this.getAttribute("onItemClick");
        Sfera.Custom.exec(f, this.id, c[0]);
    },

    updateItemContents: function (i) {
        var c = this._items[i], e;
        e.innerHTML = this.applyTemplate(c[1]);
    },

    applyTemplate: function (c) {
        var l = c;
        if (!l) {
            l = "&nbsp;";
        } else if (this.template) {
            var a = l.split("|"),
                k;
            l = "";
            for (var i=0; i<this.template.a.length; i++) {
                l += this.template.a[i];
                if (this.template.b.length > i) {
                    k = this.template.b[i]-1;
                    l += a[k]!==undefined?a[k]:"";
                }
            }
        }
        return l;
    },

    redraw: function () {
		// lift all buttons
		for (var i=0; i<this.buttons.length; i++)
			this.buttons[i].lift(); // up buttons

        var values = this.getAttribute("values");
        var labels = this.getAttribute("labels");

		if (!values && !labels) {
			this.removeButtons();
			return; // nothing to draw
		}

		// how many?
		var n = this.getTotalItems();

		var i,k;

		var items = [];
		for (i=0; i<n; i++)
			items.push(this.getItem(i));

		var mn = 0, // modified
			an = 0  // added
			rn = 0; // removed counter

		// full redraw
		if (true || !_items.length || (!n && _items.length) || items.length>_items.length*2) { // not so sure about this...
			// draw
			var html = "";

			_items = []; // reset
			this.removeButtons(); // remove from container, reset userO
			var c,s; // current item [value, label], selected
			for (i=0; i<n; i++) {
				_items[i] = items[i];
				html += this.getItemHTML(i,items);
				an++;
			}
			this.elements.content.innerHTML = html;
			// assign events
			var l = this.elements.content.childNodes.length;
			for (var i = 0; i<l; i++)
				this.initItemEvents(i);
		}
        /*
		// no redraw, add/remove items
		else {
			// add items
			if (n != _items.length) {
				// add/remove head
				if (!_items[0].same(items[0]) && _items.last().same(items.last())) {
					if (n < _items.length) { // new is shorter
						// remove from head
						while (n < _items.length) {
							this.elements.content.removeChild(this.elements.content.firstChild);
							_items.shift();

							if (!isUserList) {
								btsE.shift();
							} else {
								userO.shift().free();
							}
							rn++;
						}
						// fix btsE data-id
						if (!isUserList) {
							for (i=0;i<btsE.length;i++)
								btsE[i].setAttribute("data-id",i);
						}
					} else { // new is longer
						// add to head
						k = n-_items.length;
						var para = document.createElement("P");                       // Create a <p> element
						for (i=k-1;i>=0;i--) {
							_items.unshift(items[i]);
							para.innerHTML = getItemHTML(i,items);
							this.elements.content.insertBefore(para.childNodes[0], this.elements.content.firstChild);
							if (!isUserList)
								btsE.unshift(null);
							else
								userO.unshift(null);
						}
						// assign events
						for (i=0;i<k;i++) {
							initItemEvents(i);
						}
						an+=k;
						// fix btsE data-id
						if (!isUserList) {
							for (i=k;i<btsE.length;i++)
								btsE[i].setAttribute("data-id",i);
						}
					}
					// can't have a value that isn't in the list. check this!
					if (!multi && _value && selectedIndex == -1)
						_value = getDefault(); // no more value
				}
				// add/remove tail
				else {
					if (n < _items.length) { // new is shorter
						// remove from tail
						while (n < _items.length) {
							this.elements.content.removeChild(this.elements.content.lastChild);
							_items.pop();

							if (!isUserList) {
								btsE.pop();
							} else {
								userO.pop().free();
							}
							rn++;
						}
					} else {  // new is longer
						// add to tail
						var t = _items.length;
						var k = n - t;
						var h = "";

						var para = document.createElement("P"); // Create a <p> element

						for (i=0; i<k; i++) {
							_items[t+i] = items[t+i];
							para.innerHTML = getItemHTML(t+i,items);
							this.elements.content.appendChild(para.childNodes[0]);
							an++;
						}
						// assign events
						for (i=t; i<n; i++)
							initItemEvents(i);

						// can't have a value that isn't in the list
						if (!multi && _value && selectedIndex == -1)
							_value = getDefault(); // no more value
					}
				}

			}
			// update
			for (i=0; i<n; i++) {
				if (!_items[i].same(items[i])) {
					_items[i] = items[i];
					updateItemContents(i);
					mn++;
				}
			}

		}
        */
	}, // redraw()


});


/**
 * Page component.
 *
 * @class Sfera.Components.Page
 * @constructor
 */
 Sfera.Components.create("Page",{
     presets:["Visibility"],

     attributes: {
         title: {
             type:"string",
             // @ifdef DOC
             doc:"Title visible in the browser's title bar"
             // @endif
         },

         visible: {
             default:"false"
         }
     },

     init: function(){
     },

	onShow: function () {
	},

	// triggered only for currently visible page and children
	onAdjust: function () {

	}

 });


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
        var f = this.getAttribute("onChange");
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

            this.super("Checkbox", "onChange");
        }
    }

});


// TODO: checkbox.js should be included by the server
// right now, to make it work, it's duplicated
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
        this.btObj.focus(this.focused);
        this.btObj.enable(this.getAttribute("enabled"));
    },

    //
    // events
    //

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

            this.onChange();

            return true; // allow
        }
    },

    onKeyPress: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        this.onChange();
        return true; // allow
    },

    onKeyUp: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c != "tab") {
            this.onChange();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        this.clearChangeTimeout();

        var changeDelay = this.getAttribute("changeDelay");
        var self = this;
        if (changeDelay) { // if 0, run immediately
            this.changeTimeout = setTimeout(function() {
                self.onChangedTimeout()
            }, changeDelay);
        } else {
            self.onChangedTimeout();
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
        this.onChange();
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
            default: "0" // msec to wait before noticing a change
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

        this.redraw();
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
        this.elements.field.onchange = this.onChange.bind(this);

        this.elements.field.controller = this;
    },

    updateOptions: function() {
        this.redraw();
    },


    updateClass: function() {
        var d = this.getAttribute("enabled") ? "" : " disabled";
        this.element.className = "component comp_select" + (this.focused ? " focused" : "") + d;
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (sty?" style_"+sty:"");
        if (this.elements.field) {
            this.elements.field[(d?"set":"remove") + "Attribute"]("disabled", true);
        }
    },

    //
    // events
    //

    // on erase button
    onErase: function() {
        this.setAttribute("value", "");
        this.onChangedTimeout();
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
            this.onChange();

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

        this.onChange();
        return true; // allow
    },

    onKeyUp: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c !== "tab") {
            this.onChange();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        var v = this.elements.field.value;

        if (v != this.attributes.value.source) {
            this.attributes.value.source =
                this.attributes.value.value = v;

            this.clearChangeTimeout();
            //if (foo.autoSend || foo.onUserChange) { // otherwise there's nothing to do

            var changeDelay = this.getAttribute("changeDelay");
            var self = this;
            if (changeDelay) { // if 0, run immediately
                this.changeTimeout = setTimeout(function() {
                    self.onChangedTimeout()
                }, changeDelay);
            } else {
                self.onChangedTimeout();
            }
        }
    },

    onEnterKey: function() {
        var f = this.getAttribute("onEnterKey");
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
        co.onChange();
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


/**
 * SferaBg component.
 *
 * @class Sfera.Components.SferaBg
 */
Sfera.Components.create("SferaBg", {
    doc: {
        hidden:true
    },

    init: function() {
        var tid = 0;
        var p; // bg points
        var k = 0; // num of points
        // get element by id shortcut
        function Z(n) {
            return document.getElementById(n);
        }

        // random
        function r(n) {
            return Math.floor(Math.random() * n)
        }

        function f(p) {
            var ts = new Date().getTime();
            var x = p.x,
                y = p.y;

            if (!p.ls) p.ls = ts;
            var t = ts - p.ls;

            var d = t * p.s / 100 - p.p;
            x += Math.sin(d) * p.a;
            y += Math.sin(d) * p.b;

            return {
                x: x,
                y: y
            };
        }

        // distance between two points
        function d(x, y, j, l) {
            var xs = j - x;
            var ys = l - y;
            return Math.sqrt(ys * ys + xs * xs);
        }

        // draw background
        function dr() {
            var w = window.innerWidth,
                h = window.innerHeight,
                q = 200, // 1 point every nxn square
                x, y, j, l, t, i,
                o, g, c;

            try {
                g = Z('c');
                c = g.getContext('2d');
                o = (typeof g.style.opacity !== 'undefined');
                if (o) g.style.opacity = .3;
            } catch (e) {
                return
            }

            c.canvas.width = w;
            c.canvas.height = h;

            if (!p) {
                p = [];
                for (x = -1; x <= w / q; x++) {
                    for (y = -1; y <= h / q; y++) {
                        i = {
                            x: q * x + r(q),
                            y: q * y + r(q),
                            r: r(10) + 4,
                            a: r(13),
                            b: r(13),
                            p: r(100),
                            w: r(10000),
                            s: r(10) / 100,
                            l: []
                        };
                        p.push(i);
                        k++;
                    }
                }
                for (i = 0; i < k; i++) {
                    x = p[i].x;
                    y = p[i].y;
                    for (t = i + 1; t < k; t++) {
                        j = p[t].x;
                        l = p[t].y;
                        if (d(x, y, j, l) < q * 2)
                            p[i].l.push(p[t]); // line to..
                    }
                }
            }
            c.strokeStyle =
                c.fillStyle = o ? '#fff' : '#7194b8'; //'#7998af';
            for (i = 0; i < k; i++) {
                x = f(p[i]).x;
                y = f(p[i]).y;
                for (t = 0; t < p[i].l.length; t++) {
                    j = f(p[i].l[t]).x;
                    l = f(p[i].l[t]).y;
                    c.moveTo(x, y);
                    c.lineTo(j, l);
                }
                c.stroke();
                c.beginPath();
                c.arc(x, y, p[i].r, 0, 2 * Math.PI, false);
                c.fill();
            }
        }

        // call draw on resize, after 100ms
        window.addEventListener("resize", function() {
            clearTimeout(tid);
            tid = setTimeout(dr, 100);
        });
        //window.addEventListener("load", function() {
            Z("bg").innerHTML = "<canvas id='c'></canvas>";
            setInterval(dr, 50);
        //});
    }

});


/**
 * Input component.
 *
 * @class Sfera.Components.Slider
 */
Sfera.Components.create("Slider", {
    presets: ["Visibility", "Position", "Size", "Style", "Color", "Enable"],

    attributes: {
        width: {
            post: function() {
                this.component.updateDirection();
            }
        },

        height: {
            post: function() {
                this.component.updateDirection();
            }
        },

        cursorSize: {
            type: "integer",
            default: "30",
            update: function() {
                this.component.updateDirection();
            }

        },

        barColor: {
            type: "color",
            default: "transparent",
            update: function() {
                this.component.elements.fill.style.backgroundColor = this.value;
            }
        },

        min: {
            type: "float",
            default: "0",
            update: function() {
                this.component.updateDecimals();
                this.component.updateValue();
            }
        },

        max: {
            type: "float",
            default: "100",
            update: function() {
                this.component.updateDecimals();
                this.component.updateValue();
            }
        },

        focus: {
            type: "boolean",
            update: function() {
                if (this.value)
                    this.component.focus();
            }
        },

        color: {
            values: function() {
                var c = Sfera.client.skin.colors.Slider;
                return c ? c : ["default"];
            },
            post: function() {
                this.component.subComponents.cursor.setAttribute("color", this.value);
            }
        },

        value: {
            type: "float",
            update: function(options) {
                this.component.updateValue();
                this.post(options);
            },
            post: function(options) {
                if (!options || !options.silent)
                    this.component.onChange();
            }
        },

        changeDelay: {
            type: "integer",
            default: "0" // msec to wait before noticing a change
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
        this.decimals = 0;

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        var e = {};
        e.ondown = this.onDown.bind(this);
        //e.onup = this.onUp.bind(this);
        if (!Sfera.Device.touch) {
            e.onover = this.onOver.bind(this);
            e.onout = this.onOut.bind(this);
        }

//this.elements.over.style.background = "rgba(255,0,0,0.5)";
        this.button = new Sfera.UI.Button(this.elements.over, e);

        // rig cursor component's button object
        var c = this.subComponents.cursor;
        c.button.link(this.button);
    },


    /*

    // mousewheel?
    browser.initMouseWheelEvent(e,onWheel);


    // on mouse wheel
    function onWheel(event) {
        foo.focus();
        var evt = event || window.event;
        var d = evt.detail?evt.detail:evt.wheelDelta/120; // wheelDelta is 120,240,-120,-240 > -2 .. 2
        (d>0)?up():down();
        if (d>1 || d<-1)
            (d>0)?up():down();
    } // onWheel()

    // get on wheel event to use it externally (mouse wheel over a list, calls slider's mousewheel
    this.getOnWheel = function () {
        return onWheel;
    }

    // up delta
    function up() {
        var k = bs>20?20:bs; // at least 1 px movement
        var d = (max-min)/k;
        var v = _value + d;
        if (v<min) v = min;
        if (v>max) v = max;
        if (v != _value) updateValue(v);
    }
    // down delta
    function down() {
        var k = bs>20?20:bs; // at least 1 px movement
        var d = (max-min)/k;
        var v = _value - d;
        if (v<min) v = min;
        if (v>max) v = max;
        if (v != _value) updateValue(v);
    }

    //*/

    onOver: function() {

    },
    onOut: function() {

    },
    onDown: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        this.isDown = true;
        this._onUp = this.onUp.bind(this);
        this._onMove = this.onMove.bind(this);

        // add up, move events
        if (Sfera.Device.touch) {
            window.addEvent("touchend", document.body, this._onUp);
            window.addEvent("touchmove", document.body, this._onMove);
        } else {
            window.addEvent("mouseup", document.body, this._onUp);
            window.addEvent("mousemove", document.body, this._onMove);
        }

//Sfera.client.sendEvent("TEST_LOG", "onDown touch? "+Sfera.Device.touch);

        // find absolute bar coords, so we don't have to get them again on mouse move
        this._bp = Sfera.Utils.getElementAbsolutePosition(this.elements.bar_in);

        this.onMove(event);
    },
    onUp: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        this.isDown = false;

//Sfera.client.sendEvent("TEST_LOG", "onUp touch? "+Sfera.Device.touch);

        // add up, move events
        if (Sfera.Device.touch) {
            window.removeEvent("touchend", document.body, this._onUp);
            window.removeEvent("touchmove", document.body, this._onMove);
        } else {
            window.removeEvent("mouseup", document.body, this._onUp);
            window.removeEvent("mousemove", document.body, this._onMove);
        }
    },

    onMove: function(event) {
        if (!this.getAttribute("enabled"))
            return;

//Sfera.client.sendEvent("TEST_LOG", "onMove: is down? "+this.isDown);

        var mp = Sfera.Utils.getMouseAbsolutePosition(event, this.elements.bar_in);
        if (this.isDown) {
//Sfera.client.sendEvent("TEST_LOG", "onMove: pos "+mp.x+", "+mp.y+" ("+this._bp.x+","+this._bp.y+")");

            var w = this.getAttribute("width");
            var h = this.getAttribute("height");
            var v = h > w;
            var s = this.getAttribute("cursorSize");

            var x = mp.x - this._bp.x;
            var y = mp.y - this._bp.y;

            var r = this.getAttribute("rotation");
            if (r) {
                r = Sfera.Utils.rotatePoint(w/2, h/2, x, y, r);
                x = r[0];
                y = r[1];
            }

            var p = v ? ((y - s / 2) / (h - s)) : ((x - s / 2) / (w - s)); //
            if (v)
                p = 1 - p;

            var min = this.getAttribute("min");
            var max = this.getAttribute("max");
            p = p * (max - min) + min; // min-max
            p = (p < min ? min : (p > max ? max : p));

            // decimals
            p = p.toFixed(this.decimals);

            this.setAttribute("value", p);
        }
    },

    focus: function() {
        this.onFocus();
    },

    blur: function() {
        this.onBlur();
    },

    countDecimals: function(v) {
        var s = v.split(".");
        return s.length<2?0:parseInt(s[1].length);
    },

    updateDecimals: function() {
        var min = this.attributes.min.source;
        var max = this.attributes.max.source;
        min = (min != null)?this.countDecimals(min):0;
        max = (max != null)?this.countDecimals(max):0;
        this.decimals = Math.max(min,max);
    },

    updateValue: function() {
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var v = h > w;
        var value = this.getAttribute("value");
        var s = this.getAttribute("cursorSize");
        var min = this.getAttribute("min");
        var max = this.getAttribute("max");

        // clamp
        value = value < min ? min : value > max ? max: value;

        var p = (value - min) / (max - min); // 0-1
        var ip = 1 - p;

        // bar
        if (v) {
            this.elements.fill.style.height = (p * h) + "px";
            this.elements.fill.style.width = "";
            this.elements.fill.style.marginTop = (ip * h) + "px";
            this.elements.fill.style.marginLeft = "";
        } else {
            this.elements.fill.style.width = (p * w) + "px";
            this.elements.fill.style.height = "";
            //this.elements.bar.style.marginLeft = (h*ip) + "px";
            this.elements.fill.style.marginTop = "";
        }

        // cursor
        this.subComponents.cursor.setAttribute(v ? "y" : "x", (v ? ip : p) * (v ? h - s : w - s));
        //this.subComponents.cursor.setAttribute(v ? "x" : "y", "0");
    },

    updateDirection: function() {
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var s = this.getAttribute("cursorSize");

        if (!w || !h || !s) return; // we need width, height and cursor size

        var v = h > w;

        this.vertical = v;

        this.updateClass();
        this.updateStyle();
        this.updateValue();
    },

    updateClass: function() {
        var f = (this.focused ? " focused" : "");
        var d = (this.getAttribute("enabled") ? "" : " disabled");
        this.element.className = "component comp_slider " + d + f;
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (this.vertical ? "vertical" : "horizontal") + (sty ? " style_" + sty : "");
    },

    updateStyle: function () {
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var s = this.getAttribute("cursorSize");

        if (!w || !h || !s) return; // we need width, height and cursor size

        var v = h > w;

        this.subComponents.cursor.setAttribute("width", v ? w : s);
        this.subComponents.cursor.setAttribute("height", v ? s : h);
    },

    //
    // events
    //

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

    onKeyDown: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);
        var type = this.getAttribute("type");

        // trigger on enter event
        if (c == "enter" && !this.onEnter()) {
            c = ""; // onEnter prevented, don't focus next
        }

        if (c == "enter" || c == "tab") {
            this.onChangedTimeout(); // send now

            Sfera.client.focusNext(event.shiftKey);
            if (c == "enter")
                this.blur(); // still focused? (no next object)

            return false; // done, prevent
        } else {
            this.onChange();

            return true; // allow
        }
    },

    onKeyPress: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        var value = this.getAttribute("value");

        // up down

        this.onChange();
        return true; // allow
    },

    onKeyUp: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        if (c != "enter" && c !== "tab") {
            this.onChange();
            return false; // nothing to see here: prevent
        }

        return true;
    },

    onChange: function() {
        var v = this.getAttribute("value");

        if (v != this.sentValue) {
            this.sentValue = v;

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
        }
    },

    onEnterKey: function() {
        if (!this.getAttribute("enabled"))
            return;

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
        this.onChange();
        Sfera.client.clearFocused(this);
        this.focused = false;
        this.updateClass();
    },

    onShow: function() {
		this.onAdjust();
        if (this.getAttribute("focus"))
            this.focus();
    },

    onHide: function() {

    },

	// triggered only for currently visible page and children
	onAdjust: function () {
		this.updateDirection();
	}

});

//# sourceMappingURL=sfera-components.js.map