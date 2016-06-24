/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

Sfera.UI = new (function(){
    var pressedBt;
    var lastButton;

    this.skipButtonEvents = false; // won't fire any button events (ex. while we're dragging)
    this.overEnabled = true; // mouse over effect enabled?
    this.buttonFeedbackEnabled = true;

    this.setPressedButton = function(bt) {
        pressedBt = bt;
    };

	// get pressedBt button
	this.getPressedButton = function () {
		return pressedBt;
	}; // getTouchedButton()

	// update last button
	this.updateLastButton = function () {
		lastButton = pressedBt;
	}; // getTouchedButton()

    // get last clicked button
	this.getLastButton = function () {
		return lastButton;
	}; // getLastButton()

    // lift pressed button. bt or currently pressed button if any
	this.liftButton = function (bt) {
		if (pressedBt && (!bt || bt == pressedBt)) {
            pressedBt.lift();
            pressedBt = null;
			return true;
		}
		return false;
	}; // liftButton()

	// reset button: lifts and clear state (over)
	this.resetButton = function (bt) {
		// bt is currently pressedBt? otherwise reset the class
		if (!this.liftButton(bt)) {
			bt.data.state = "";
			bt.updateClass();
		}
	};

    // destroy an array of buttons
    this.destroyButtons = function (arr) {
        for (var i=0; i<arr.length; i++) {
            arr[i].destroy();
        }
        arr.length = 0;
        return arr;
    }

})();

Sfera.UI.Button = function (element, events) {
    this.element = element;
    this.element.btObj = this;

    this.initData();
    if (events)
        this.initEvents(events);
};
Sfera.UI.Button.prototype = {
    // possible button style attributes
    _attributes: {
        "disabled":0,
        "selected":1,
        "pressed":2,
        "checked":3,
        "focused":4,
        "error":5
    },

    // linked buttons
    _linked: null,

    initData: function () {
        var colors = [
            "light",
            "stable",
            "positive",
            "calm",
            "balanced",
            "energized",
            "assertive",
            "royal",
            "dark"
        ];

        var cs = this.element.className;
        var ss = "(.*\\s)?([mc][^\\s]*Button)(\\s("+colors.join("|")+"))?(\\s.*)?(\\sover|\\sdown)?"; // search string (button color regexp in includthis.element.js)
        var rx = new RegExp(ss);
        var matches = rx.exec(cs);

        // build obj. pre, button class, attributes (binary string based on
        if (!matches || !matches[2]) // should this happen?
            var obj = {pre:cs, bc:"", color:"", attrs:[], state:""};
        else
            var obj = {pre:matches[1]?matches[1]:"",
                        bc:matches[2],
                        color:matches[4]?matches[4]:"", // r,g,b..
                        attrs:[],
                        state:matches[6]?matches[6].substr(1):""}; // ,over,down
        // attributes
        for (var a in this._attributes)
            obj.attrs[this._attributes[a]] = (matches && matches[5])?matches[5].indexOf(" "+a)!=-1:false;

        this.data = obj;
        this.onLift = null;
        this.dontLiftOnMove = false;
    },

    // button class:
	//  [...] [cm][...]Button [color]? [any button attribute] [state] [...]

	// init button events. f is an object containing all events, options?
	initEvents: function (f) {
		if (f.onclick) // default action is on up
			f.onup = f.onclick;

		if (Sfera.Device.touch) {
            this.element.ontouchstart = this.onEvent.bind(this,'touchstart',f.ondown,null);
            this.element.ontouchmove = this.onEvent.bind(this,'touchmove',f.onmove,f.onout);
            this.element.ontouchend = this.onEvent.bind(this,'touchend',f.onup,null);
		} else {
            this.element.onmouseover = this.onEvent.bind(this,'mouseover',f.onover,null);
			this.element.onmouseout = this.onEvent.bind(this,'mouseout',f.onout,null);
			if (f.onmove)
				this.element.onmousemove = this.onEvent.bind(this,'mousemove',f.onmove,null);
			this.element.onmousedown = this.onEvent.bind(this,'mousedown',f.ondown,null);
			this.element.onmouseup = this.onEvent.bind(this,'mouseup',f.onup,null);
		}

		// on lift? when button is lifted with liftButton() (ex. when scrolling)
		if (f.onlift)
			this.onLift = f.onlift;
		// temporary (???) solution for divs that require drag for more than n pixels
		if (f.dontLiftOnMove)
			this.dontLiftOnMove = true;
		var d;
		//for (var i = 0; (d = this.element.getElementsByTagName("img")[i]); i++) initImg(d);
	}, // initButtonEvents()

	// clear button events
	clearEvents: function () {
		if (Sfera.Device.touch) {
			delete this.element.ontouchstart;
			delete this.element.ontouchmove;
			delete this.element.ontouchend;
		} else {
			delete this.element.onmouseover;
			delete this.element.onmouseout;
			delete this.element.onmousedown;
			delete this.element.onmouseup;
		}
	}, // clearButtonEvents()

    destroy: function () {
        var pressedBt = Sfera.UI.getPressedButton();
        if (pressedBt && pressedBt == this.element) {
            Sfera.UI.setPressedButton(null);
            Sfera.UI.updateLastButton();
        }
        this.clearEvents();
    },

    // link other buttons, so events are shared. call only on one button
    link: function (button) {
        if (!this._linked)
            this._linked = [];
        if (!button._linked)
            button._linked = [];

        this._linked.push(button);
        button._linked.push(this);
    },

	// set button color
	setColor: function (c) {
		this.data.color = c;
		this.updateClass(); // update class based on this.data
	}, // setButtonColor()

	// enabled/disabled button
	enable: function (enable) {
		this.setAttribute("disabled", !enable);
	}, // enableButton()

	// select/deselect button
	select: function (select) {
		this.setAttribute("selected", select);
	}, // selectButton()

	// focus/blur button
	focus: function (focused) {
		this.setAttribute("focused", focused);
	}, // selectButton()

	// set mini mode
	mini: function (mini) {
		this.setAttribute("mini", mini);
	}, // miniButton()

    // lift the button
    lift: function () {
        if (this.data.state) {
            this.data.state = "";
            this.updateClass();
        }
        // on lift event?
        if (this.onLift)
            this.onLift();
    },

	// get button style attribute
	getAttribute: function (attrName) {
		if (!this.data)
            this.initData(); // can happen when events are assigned manually
		return this.data.attrs[this._attributes[attrName]];
	}, // getButtonAttribute()

	// set button style attributthis.element. name and value (true or false)
    setAttribute: function (attrName,attrValue) {
		if (this.getAttribute(attrName) != attrValue) {
			this.data.attrs[this._attributes[attrName]] = attrValue;
			this.updateClass(); // update class based on this.data
		}
	}, // setButtonAttribute()

	// update button class from its btObj
	updateClass: function () {
		var d = this.data;
		var c = d.pre+d.bc
		if (d.color)
			c += " "+d.color;
		for (var a in this._attributes)
			if (d.attrs[this._attributes[a]])
				c += " "+a;
		if (Sfera.UI.buttonFeedbackEnabled && d.state)
			c += " "+d.state;
		this.element.className = c;
	},

    // set class name, used when base class name changes
    setClassName: function (name) {
        this.data.pre = name;
        this.updateClass();
    },

	disableAndroidLongPress: function (evt,e) {
		if (Sfera.Device.android) {
			var d = e;
			while (d) {
				if (d.getAttribute && d.getAttribute("data-scrollmode")) return; // scrollable, don't disable the long press
				d = d.parentNode;
			}
			evt.preventDefault && evt.preventDefault();
			evt.stopPropagation && evt.stopPropagation();
			evt.cancelBubble = true;
			evt.returnValue = false;
		}
	},

    // prevent default event
    preventDefault: function (evt) {
        if (evt.returnValue)
            evt.returnValue = false;
        if (evt.preventDefault)
            evt.preventDefault();
    },

	// generic button event. graphic feedback and function associated to the event. f can be a string or a function(event,e). of is an additional optional function (user on touchmove for onout). clt: cancel long touch on android devices when clicking on an image
	onEvent: function (w,f,of,event) {
        if (Sfera.UI.skipButtonEvents) return;
        if (this.getAttribute("disabled")) return;

		// event
		var evt = window.event || event;

		// touchevents or not?
		if (w == "touchstart" || w == "touchend" || w == "touchmove") {
			if (!Sfera.Device.touch) return false;
		} else {
			if (evt)
				this.preventDefault(evt);
			if (Sfera.Device.touch) return false;
		}

        // can happen when events are assigned manually
		if (!this.data)
            this.initData();

		var swi = this.data.attrs[this._attributes["switch"]]; // behave like a switch?
		var swip = swi?this.data.attrs[this._attributes["pressed"]]:false; // switch pressed
		var nswip = swip; // new switch pressed value, to notice if it changes

		var s = ""; // class to add, down/over (only if not disabled)
		if (!this.data.attrs[this._attributes["disabled"]]) switch (w) {
		case "touchstart":
			Sfera.UI.setPressedButton(this);
			lastButton = null;
			touchStartX = evt.touches[0].clientX;
			touchStartY = evt.touches[0].clientY;
			s = "down";
			if (swi) nswip = !swip;
			this.disableAndroidLongPress(evt,this.element);
			break;
		case "touchmove":
			if (Sfera.UI.getPressedButton() == this) {
				s = "down";
				if (!this.dontLiftOnMove && // temporary (?) solution for divs that require drag for more than 40px
					(Math.abs(evt.touches[0].clientX - touchStartX) > 30 ||
					 Math.abs(evt.touches[0].clientY - touchStartY) > 30)) {
					  Sfera.UI.setPressedButton(null);
					  f = of; // execute optional function if any
				}
			}
			this.disableAndroidLongPress(evt,this.element);
			break;
		case "touchend":
			if (Sfera.UI.getPressedButton() != this) {
				f = null; // won't execute the function
			} else {
				Sfera.UI.updateLastButton(); // store it
				this.preventDefault(evt);
			}
			Sfera.UI.setPressedButton(null);
			this.disableAndroidLongPress(evt,this.element);
			break;
		case "mouseover":
            var pressedBt = Sfera.UI.getPressedButton();
			if (pressedBt) {
				if (pressedBt == this.element)
					s = "down";
			} else if (Sfera.UI.overEnabled) s = "over"; // over only on manager
			break;
		case "mousemove":
            if (Sfera.UI.overEnabled) s = "over";
			break;
		case "mouseout":
			// if we're still on the same div, do nothing
			var reltg;
			if (evt) // no evt if we're calling onEvent from code (like Login, on keydown)
				reltg = (evt.relatedTarget) ? evt.relatedTarget : evt.toElement;
			if (reltg) {
				while (reltg && reltg != this.element && reltg.nodeName != 'BODY')
					reltg = reltg.parentNode;
				if (reltg == this.element) return;
			}
			Sfera.UI.setPressedButton(null);
			break;
		case "mousedown":
			Sfera.UI.setPressedButton(this);
			lastButton = null;
			s = "down";
			if (swi) nswip = !swip;
			break;
		case "mouseup":
			if (Sfera.UI.getPressedButton() != this) {
				f = null; // won't execute the function
			} else {
                Sfera.UI.updateLastButton()
			}
            Sfera.UI.setPressedButton(null);
			if (Sfera.UI.overEnabled)
				s = "over"; // over only on manager
			break;
		}

		// update class based on this.data
		if (s != this.data.state || nswip != swip) {
			this.data.state = s;
			if (swi)
				this.data.attrs[this._attributes["pressed"]] = nswip;
			this.updateClass();

            if (this._linked) {
                for (var i=0; i<this._linked.length; i++) {
                    if (s != this._linked[i].data.state) {
                        this._linked[i].data.state = s;
                        this._linked[i].updateClass();
                    }
                }
            }
		}

		// function
		if (f && f!="null" && !this.data.attrs[this._attributes["disabled"]]) {
			// if f is a string, create a new function, otherwise just call it with (event,this.element)
			var func = (typeof(f) == "string")?new Function("event","element",f):f;
			func(event,this.element);
		}

		// don't prevent default to allow scrolling
		return false;
	} // onEvent()
};
