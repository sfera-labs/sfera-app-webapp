/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Sfera.Utils singleton
 *
 * @class Sfera.Utils
 * @constructor
 */
Sfera.Utils = function() {
    this.mixin = function(a, b) {

    };

    this.extend = function(c, e) {
        c.prototype = Object.create(e.prototype);
        c.prototype.constructor = c;
        c.prototype.ancestor = e.prototype;

    };


    this.initClass = function(c) {
        c.prototype.constructor = c;
    };

    function filterNone() {
        return NodeFilter.FILTER_ACCEPT;
    }

    this.getAllCommentChildNodes = function(rootNode) {
        var comments = [];
        // Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
        var iterator = document.createNodeIterator(rootNode, NodeFilter.SHOW_COMMENT, filterNone, false);
        var curNode;
        while (curNode = iterator.nextNode()) {
            comments.push(curNode);
        }
        return comments;
    };

    this.getFirstChildNodeOfType = function(rootNode, type, recursive) {
        for (var i = 0; i < rootNode.childNodes.length; i++) {
            if (rootNode.childNodes[i].nodeType == type) {
                return rootNode.childNodes[i];
            }
            if (recursive && rootNode.childNodes[i].childNodes) {
                var r = this.getFirstChildNodeOfType(rootNode.childNodes[i], type, recursive);
                if (r != null)
                    return r;
            }
        }
        return null;
    };

    this.getFirstChildNodeWithName = function(rootNode, name, recursive) {
        var i, r;
        for (i = 0; i < rootNode.childNodes.length; i++) {
            if (rootNode.childNodes[i].getAttribute && rootNode.childNodes[i].getAttribute("name") == name) {
                return rootNode.childNodes[i];
            }
            if (recursive && rootNode.childNodes[i].childNodes) {
                r = this.getFirstChildNodeWithName(rootNode.childNodes[i], name, recursive);
                if (r != null)
                    return r;
            }
        }
        return null;
    };

    this.getComponentElements = function(rootNode, recursive, obj) {
        // object containing all nodes by name
        var obj = obj || {},
            name, i, r;
        for (var i = 0; i < rootNode.childNodes.length; i++) {
            if (rootNode.childNodes[i].getAttribute) {
                name = rootNode.childNodes[i].getAttribute("name");
                if (name)
                    obj[name] = rootNode.childNodes[i];
            }
            if (recursive && rootNode.childNodes[i].childNodes && rootNode.childNodes[i].childNodes.length &&
                !rootNode.childNodes[i].getAttribute("data-controller")) { // skip subComponents
                obj = this.getComponentElements(rootNode.childNodes[i], recursive, obj);
            }
        }
        return obj;
    };

    this.getCDATA = function(rootNode) {
        var node = this.getFirstChildNodeOfType(rootNode, 4);
        return node ? node.nodeValue : "";
    };


    this.isString = function(v) {
        return (typeof v === 'string' || v instanceof String);
    };

    this.isFunction = function(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    };

    this.isArray = function(obj) {
        return obj && Object.prototype.toString.call(obj) === '[object Array]';
    };

    this.capitalize = function(str) {
        return str[0].toUpperCase() + str.substr(1);
    };

    this.camelToDash = function(str) {
        return str.replace(/\W+/g, '-')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .toLowerCase();
    };

    this.dashToCamel = function(str) {
        return str.toLowerCase().replace(/\W+(.)/g, function(x, chr) {
            return chr.toUpperCase();
        })
    };

    // get key function from keycode
    this.getKeyFromCode = function(code) {
        switch (code) {
            case 8:
                return "del";
            case 9:
                return "tab";
            case 13:
                return "enter";
            case 32:
                return "space";

            case 37:
                return "left";
            case 38:
                return "up";
            case 39:
                return "right";
            case 40:
                return "down";

            default:
                var c = String.fromCharCode(code);
                return c ? c.toLowerCase() : null;
        }
    };

    this.getDate = function(format) {
        function pan(str, len) {
            str = str + "";
            if (!len) len = 2;
            while (str.length < len)
                str = "0" + str;
            return str;
        }

        var date = new Date();
        if (!format) {
            format = "dmyhisu";
        }
        var f = {};
        for (var i = 0; i < format.length; i++)
            f[format[i]] = true;
        var str = "";
        if (f.d) {
            str += pan(date.getDate());
        }
        if (f.m) {
            str += (str ? "/" : "") + pan(date.getMonth() + 1);
        }
        if (f.y) {
            str += (str ? "/" : "") + date.getFullYear();
        }
        if (f.h) {
            str += (str ? " " : "") + pan(date.getHours());
        }
        if (f.i) {
            str += (str ? ":" : "") + pan(date.getMinutes());
        }
        if (f.s) {
            str += (str ? ":" : "") + pan(date.getSeconds());
        }
        if (f.u) {
            str += (str ? ":" : "") + pan(date.getMilliseconds(), 3);
        }
        return str;
    };

    // rotate point (x,y) around center (cx,cy) by angle in degrees
    this.rotatePoint = function (cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    };

    // get mouse relative position
	this.getMouseRelativePosition = function (evt,target) {
		var ep = this.getElementAbsolutePosition(target);
		var p = this.getMouseAbsolutePosition(evt,target);
		return {x:p.x-ep.x,y:p.y-ep.y};
	}; // getMouseRelativePosition()

	// get absolute mouse position, if touch, first touch. target if != evt.target
	this.getMouseAbsolutePosition = function (evt,target) {
		var x,y;
		if (Sfera.Device.touch && evt.touches && evt.touches[0]) {
			x = evt.touches[0].pageX;
			y = evt.touches[0].pageY;
		} else if (evt.pageX != null && evt.pageY != null) {
			x = evt.pageX;
			y = evt.pageY;
		} else {
			x = (evt.layerX != null)?evt.layerX:evt.offsetX;
			y = (evt.layerY != null)?evt.layerY:evt.offsetY;
			var c = target || evt.target || evt.srcElement;
			var p = this.getElementAbsolutePosition(c);
			x += p.x;
			y += p.y;
		}

		// scale?
		if (this.scaleDelta && this.scaleDelta != 1) {
			x *= this.scaleDelta;
			y *= this.scaleDelta;
		}

		return {x:x, y:y};
	} // getMouseAbsolutePosition()

	// get element absolute position
	this.getElementAbsolutePosition = function (c) {
		var x = 0;
		var y = 0;
		while (c && c.offsetLeft != null && c.offsetTop != null) {
			x += c.offsetLeft;
			y += c.offsetTop;
			c = c.offsetParent || c.parentNode;
		}

		return {x:x, y:y};
	} // getElementAbsolutePosition()

    // mouse wheel event
	this.initMouseWheelEvent = function (e,f) {
		if (!Sfera.Device.touch)
			window.addEvent(browser.browser == "Firefox"?"DOMMouseScroll":"mousewheel", e, f);
	}

    // XML parser
    if (typeof window.DOMParser != "undefined") {
        this.parseXML = function(xmlStr) {
            return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject != "undefined" &&
        new window.ActiveXObject("Microsoft.XMLDOM")) {
        this.parseXML = function(xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        //throw new Error("No XML parser found");
    }

};

Sfera.Utils = new Sfera.Utils();

Array.prototype.equals = function(array, strict) {
    if (!array)
        return false;

    if (arguments.length == 1)
        strict = true;

    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i], strict))
                return false;
        } else if (strict && this[i] != array[i]) {
            return false;
        } else if (!strict) {
            return this.sort().equals(array.sort(), true);
        }
    }
    return true;
}

window.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

String.prototype.trim = function () {
    //return this.replace(/^\s*/, "").replace(/\s*$/, "");
	var	str = this.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}
if (typeof String.prototype.startsWith != "function") {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}
if (typeof String.prototype.endsWith != "function") {
	String.prototype.endsWith = function (str){
		return this.slice(-str.length) == str;
	};
}
Number.prototype.mod = function (n) { // useful for ciclying 0-->n
	return ((this%n)+n)%n;
}
Number.prototype.next = function (b) { // n: base
	return (this+1).mod(b);
}
Number.prototype.previous = function (b) {
	return (this-1).mod(b);
}
// array is array is array.
if (!Array.prototype.isArray) {
	Array.prototype.isArray = function (vArg) {
	    return Object.prototype.toString.call(vArg) === "[object Array]";
	}
}
// return an array with unique elements
Array.prototype.unique = function () {
	var a = [];
	var l = this.length;
	for (var i=0; i<l; i++) {
	  for (var j=i+1; j<l; j++) {
	    if (this[i] === this[j])
	      j = ++i; //skip
	  }
	  a.push(this[i]);
	}
	return a;
};
// get last element
Array.prototype.last = function () {
	if (!this.length) return null;
	return this[this.length-1];
}
// clone array
Array.prototype.clone = function () {
	return this.slice(0);
}
// intersection of two arrays
Array.prototype.intersect = function (arr) {
	var a = [];
	var l = this.length;
	for (var i=0; i<l; i++) {
		if (arr.indexOf(this[i]) != -1) {
			a.push(this[i]);
		}
	}
	return a;
}
// same
Array.prototype.same = function (arr) {
	if (this.length != arr.length) return false;
	for (var i=0; i<this.length; i++) {
		if (this[i] != null && arr[i] != null && // not null
			typeof this[i] === "object" && typeof arr[i] === "object" && // both objs
			this[i].isArray && arr[i].isArray) { // arrays
			if (!this[i].same(arr[i]))
				return false;
		} else if (this[i] != arr[i]) {
			return false;
		}
	}
	return true;
}
// search
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    "use strict";
    if (this == null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  }
}

// remove empty elements
Array.prototype.clean = function (deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
}

// add event cross browser
window.addEvent = function (event, target, method) {
	if (target.addEventListener) {
		target.addEventListener(event, method, false);
	} else if (target.attachEvent) {
		target.attachEvent("on" + event, method);
	} else {
		target["on" + event] = method;
	}
}
window.removeEvent = function (event, target, method) {
	if (target.removeEventListener) {
		target.removeEventListener(event, method, false);
	} else if (target.attachEvent) {
		target.detachEvent("on" + event, method);
	} else {
		target["on" + event] = null;
	}
}

/*
// JSON
var JSON = JSON || {};
JSON.parse = JSON.parse || function (str) {
	if (str === "") str = '""';
	eval("var p=" + str + ";");
	return p;
};
*/
