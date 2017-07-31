/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
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
            default: "0" // msec to wait before noticing a change
        },

        fontSize: {
            type: "integer",

            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.style.fontSize = this.value + "px";
            }
        },

        fontColor: {
            update: function() {
                if (this.component.elements.field)
                    this.component.elements.field.style.color = this.value;
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
    	if (this.elements.field) {
            this.elements.field.onfocus = null;
            this.elements.field.onblur = null;
            this.elements.field.onselectstart = null;
            this.elements.field = null;
        }
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
        this.elements.field.value = this.attributes.value.value;
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
        
        if (c == "tab") {
        	if (this.changeTimeout) {
        		this.onChangedTimeout(); // send now
        	}
            Sfera.client.focusNext(event.shiftKey);
            return false; // done, prevent
        }
    },

    onChange: function() {
        var v = this.elements.field.value;

        if (v != this.attributes.value.source) {
            this.attributes.value.source =
                this.attributes.value.value = v;

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
