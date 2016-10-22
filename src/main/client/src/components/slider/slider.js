/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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

Sfera.client.sendEvent("TEST_LOG", "onDown touch? "+Sfera.Device.touch);

        // find absolute bar coords, so we don't have to get them again on mouse move
        this._bp = Sfera.Utils.getElementAbsolutePosition(this.elements.bar_in);

        this.onMove(event);
    },
    onUp: function(event) {
        if (!this.getAttribute("enabled"))
            return;

        this.isDown = false;

Sfera.client.sendEvent("TEST_LOG", "onUp touch? "+Sfera.Device.touch);

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

Sfera.client.sendEvent("TEST_LOG", "onMove: is down? "+this.isDown);

        var mp = Sfera.Utils.getMouseAbsolutePosition(event, this.elements.bar_in);
        if (this.isDown) {
Sfera.client.sendEvent("TEST_LOG", "onMove: pos "+mp.x+", "+mp.y+" ("+this._bp.x+","+this._bp.y+")");

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
            var p = p * (max - min) + min; // min-max
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
        var d = (this.getAttribute("enabled") ? "" : " disabled")
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
                    self.onChangedTimeout()
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
        if (this.getAttribute("focus"))
            this.focus();
    },

    onHide: function() {

    }

});
