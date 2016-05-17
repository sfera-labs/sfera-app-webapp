/*! sfera-webapp - v0.0.2 -  */

/**
 * Button component.
 *
 * @class Sfera.Components.Button
 * @constructor
 */
Sfera.Components.create("Button", {
    presets: ["Visibility", "Position", "Size", "Style", "Color"],

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
    }
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
                        var svg = xml.getElementsByTagName("svg")[0];
                        e.innerHTML = "";
                        if (svg) {
                            e.appendChild(svg);
                            svg.style.width = c.getAttribute("width");
                            svg.style.height = c.getAttribute("height");
                        }
                        // done
                        delete req;
                    }
                    req.open(this.value);
                }
                // normal img
                else {
                    e.innerHTML = "<img src='" + this.value + "' width='100%' height='100%'>";
                }
            }
        }
    },

    init: function() {}

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

    updateClass: function () {
        var cl = this.getAttribute("cssClass");
        this.element.className = "component comp_input" + (cl?" "+cl:"") + (this.focused?" focused":"");
        var sty = this.getAttribute("style");
        this.elements.container.className = "container" + (sty?" style_"+sty:"");
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
        /*
        var f = this.getAttribute("onClick");
        Sfera.Custom.exec(f);
        */
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
             type:"string",
             // @ifdef DOC
             doc:"Title visible in the browser's title bar"
             // @endif
         },

         skin: {
            default:"default",
            update: function () {
                Sfera.client.skin = new Sfera.Skins[Sfera.Utils.capitalize(this.value)]();
            }
         },

         zoom: {
             type:"float",
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
        var f = this.getAttribute("onClick");
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

            this.onChanged();
        }
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
            if (changeDelay) { // if 0, run immediately
                this.changeTimeout = setTimeout(function() {
                    self.onChangedTimeout()
                }, changeDelay);
            } else {
                self.onChangedTimeout();
            }
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
    presets: ["Visibility", "Position", "Size", "Style", "Color"],

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
            type: "integer",
            default: "0",
            update: function() {
                this.component.updateValue();
            }
        },

        max: {
            type: "integer",
            default: "100",
            update: function() {
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
                var c = Sfera.client.skin.colors.Button;
                return c ? c : ["default"];
            },
            post: function() {
                this.component.subComponents.cursor.setAttribute("color", this.value);
            }
        },

        value: {
            update: function() {
                this.component.updateValue();
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

        // fill elements with all nodes that have a name
        this.elements = Sfera.Utils.getComponentElements(this.element, true, this.elements);

        var e = {};
        e.ondown = this.onDown.bind(this);
        //e.onup = this.onUp.bind(this);
        if (!Sfera.Device.touch) {
            e.onover = this.onOver.bind(this);
            e.onout = this.onOut.bind(this);
        }
        //e.onmove = this.onCursorMove.bind(this);

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

        // find absolute bar coords, so we don't have to get them again on mouse move
        this._bp = Sfera.Utils.getElementAbsolutePosition(this.elements.bar_in);

        this.onMove(event);
    },
    onUp: function(event) {
        this.isDown = false;

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
        var mp = Sfera.Utils.getMouseAbsolutePosition(event, this.elements.bar_in);
        if (this.isDown) {
            var w = this.getAttribute("width");
            var h = this.getAttribute("height");
            var v = h > w;
            var s = this.getAttribute("cursorSize");

            var p = v ? ((mp.y - this._bp.y - s / 2) / (h - s)) : ((mp.x - this._bp.x - s / 2) / (w - s)); //
            if (v)
                p = 1 - p;

            var min = this.getAttribute("min");
            var max = this.getAttribute("max");
            var p = p * (max - min) + min; // min-max
            p = (p < min ? min : (p > max ? max : p));

            this.setAttribute("value", p);
            this.onChange();
        }
    },

    focus: function() {
        this.onFocus();
    },

    blur: function() {
        this.onBlur();
    },

    updateValue: function() {
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var v = h > w;
        var value = this.getAttribute("value");
        var s = this.getAttribute("cursorSize");
        var min = this.getAttribute("min");
        var max = this.getAttribute("max");
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
        this.subComponents.cursor.setAttribute(v ? "x" : "y", "0");
    },

    updateDirection: function() {
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var s = this.getAttribute("cursorSize");

        if (!w || !h || !s) return; // we need width, height and cursor size

        var v = h > w;

        this.vertical = v;
        this.updateClass();

        this.subComponents.cursor.setAttribute("width", v ? w : s);
        this.subComponents.cursor.setAttribute("height", v ? s : h);

        this.updateValue();
    },

    updateClass: function() {
        this.element.className = "component comp_slider " + (this.focused ? " focused" : "");
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (this.vertical ? "vertical" : "horizontal") + (sty ? " style_" + sty : "");
    },

    //
    // events
    //

    onChanged: function() {
        var v = this.getAttribute("value");

        if (v != this.sentValue) {
            this.sentValue = v;

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

    onKeyDown: function(event) {
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
            this.onChanged();

            return true; // allow
        }
    },

    onKeyPress: function(event) {
        var code = event.keyCode;
        var c = Sfera.Utils.getKeyFromCode(code);

        var value = this.getAttribute("value");

        // up down

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
        this.onChanged();
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

//# sourceMappingURL=sfera-components.js.map