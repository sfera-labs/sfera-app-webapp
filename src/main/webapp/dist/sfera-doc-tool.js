module.exports = function (grunt, options) {
    var window = {};
    var templates = {};

    var genMD = new function() {
        var res = "";

        function $(txt) {
            res += txt;
        }

        function _br(n) {
            if (!n) n = 1;
            var b = "";
            for (var i=0; i<n; i++)
                b += "\n";
            return b;
        }

        function _s() {
            return ' ';//'&nbsp;';
        }

        function _b(txt) {
            return '**' + txt + '**';
        }

        function _a(txt, link, target) {
            //target = target?' target="'+target+'"':'';
            return '['+txt+']('+link+')';
        }

        function _h(l, name) {
            var h = "\n";
            for (var i=0; i<l; i++) h+= "#";
            return h + " " + name + "\n\n";
        }

        function _ta(e, c) {
            return ''; //(e ? "</" : "<") + "table" + (e || !c ? ">" : " class='" + c + "'");
        }

        function _r(e) {
            var r = (e ? "|\n" : "");
            if (e && nch) {
                for (var i=0; i<nch; i++)
                    r += '|---';
                r += "|\n";
                nch = 0;
            }
            return r;
        }

        function _c(text) {
            return "|" +text;
        }

        var nch = 0;
        function _ch(text) {
            nch++;
            return "|" +text;
        }

        //
        function _hb(txt) {
            return '<b>' + txt + '</b>';
        }

        function _hta(e, c, s) {
            c = c ? " class='" + c + "'" : "";
            s = s ? " style='" + s + "'" : "";
            return (e ? "</" : "<") + "table" + (!e && c ? c : "") + (!e && s ? s : "") + ">";
        }

        function _hr(e) {
            return (e ? "</" : "<") + "tr>"
        }

        function _hc(text) {
            return "<td>" + text + "</td>";
        }

        function _hch(text) {
            return "<th>" + text + "</th>";
        }

        //


        this.toc = function(ac) {
            res = "";

            for (var i = 0; i < ac.length; i++) {
                $(templates.index_item.replace("%item", ac[i]).replace("%url",'components/' + ac[i] + '.html'));
                //$(_a(ac[i], 'components/' + ac[i] + '.html', 'contentFrame'));
            }

            return res;
        }

        this.component = function(cc) {
            res = "";

            var co = new cc({
                doc: true
            });

            if (co.doc && co.doc.hidden)
                return "";

            // title
            $(_h(1, co.type)); //_a(co.type, "#" + co.type)));

            if (co.doc && co.doc.descr)
                $(co.doc.descr);

            if (templates["components/"+co.type])
                $(_br(2)+templates["components/"+co.type]);

            for (sub in co.subComponents) {
                $(_h(2, "Sub components"));
                break;
            }
            for (var sub in co.subComponents) {
                var t = co.subComponents[sub].type;
                $(_sub + _s());
                $(_a("[" + t + "]", "#" + t));
                $(_br());
            }

            $(_h(2, "Attributes"));
            $(_ta(0, "docTable"));

            $(_r());
            $(_ch("Name"));
            $(_ch("Type"));
            $(_ch("Description"));
            $(_r(1));

            for (var attr in co.attributes) {
                var a = co.attributes[attr];
                if (a.doc && a.doc.hidden)
                    continue;

                $(_r());

                $(_c(_b("["+attr+"](#"+attr+")")));

                $(_c(a.type));

                $(_c(a.doc && a.doc.descr ? a.doc.descr : ""));

                $(_r(1));
            }
            $(_ta(1));

            for (var attr in co.attributes) {
                var a = co.attributes[attr];
                if (a.doc && a.doc.hidden)
                    continue;

                // title
                $(_br(2)+"---"+_br(1));
                $(_h(3,attr));

                // descr
                if (a.doc && a.doc.descr) {
                    $(a.doc.descr);
                    if (a.doc.descr[a.doc.descr.length-1]!=".")
                        $(".");
                }
                $(_br());

                // table
                $(_hta(0, "attrTable table", "width:auto"));

                $(_hr());
                $(_hc(_hb("Type:")));
                $(_hc(a.type));
                $(_hr(1));

                var str = co.attributes[attr].default;
                if (str) {
                    $(_hr());
                    $(_hc(_hb("Default value:")));
                    $(_hc(str));
                    $(_hr(1));
                }

                str = "";
                var av = co.attributes[attr].values;
                if (av && av!="null") {
                    if (Sfera.Utils.isFunction(av)) {
                        try {
                            av = av();
                        } catch (e) {
                            av = [];
                        }
                    }
                    if (Sfera.Utils.isArray(av)) {
                        str += av.join(", ");
                    }
                }
                if (str) {
                    $(_hr());
                    $(_hc(_hb("Values:")));
                    $(_hc(str));
                    $(_hr(1));
                }

                $(_hta(1));

                $(_br(2));

                // example
                var v;
                if (a.doc && a.doc.example && a.doc.example.values) {
                    $(">**Example:**"+_br());
                    $(">\n");
                    v = a.doc.example.descr;
                    if (v[v.length-1] != ".")
                        v += ".";
                    $(">"+v+_br());
                    $(">\n\n");
                    $(">In index.xml:"+_br(2));
                    $(">``` xml"+_br());
                    $("<"+Sfera.Utils.camelToDash(co.type)+' id="my'+co.type+'"');
                    for (var aa in a.doc.example.values) {
                        v = a.doc.example.values[aa] + "";
                        v = v.replace(/"/g,'&quot;'); // use single quote, less frequent in values
                        $(" "+Sfera.Utils.camelToDash(aa)+'="'+v+'"');
                    }
                    $(" />"+_br());
                    $("```"+_br(2));

                    $(">Via scripting:"+_br(2));
                    $(">``` js"+_br());
                    v = a.doc.example.values[attr] + "";
                    v = v.replace(/"/g,'\\"');
                    $(""+'setAttribute("my'+co.type+'","'+attr+'","'+v+'")'+_br());
                    $("```"+_br(2));
                }

            }

            return res;
        }
    };


/**
* @namespace Sfera
*/
var Sfera = Sfera || {

    /**
    * The Sfera version number.
    * @constant
    * @type {string}
    */
    VERSION: '0.1.0',

    /**
    * Sfera client instance.
    * @constant
    * @type {array}
    */
    client: null

};


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

    // get mouse relative position
	this.getMouseRelativePosition = function (evt,target) {
		var ep = this.getElementAbsolutePosition(target);
		var p = this.getMouseAbsolutePosition(evt,target);
		return {x:p.x-ep.x,y:p.y-ep.y};
	} // getMouseRelativePosition()

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


/**
 * Sfera.Attribute Component attribute
 *
 * @namespace Sfera.Attribute
 */
Sfera.Attribute = function(component, config) {
    // type
    this.type = "string";
    // needs to be compiled?
    this.changed = false;
    // default source value. if != null, it's applied after .init()
    this.default = null;
    // value source
    this.source = null;
    // compiled value
    this.value = null;
    // required
    this.required = false;
    // array of possible values
    this.values = null;
    // owner component
    this.component = component;

    // restore default value after msec (0: disabled)
    this.restoreTimeout = 0;
    this._restoreTimeoutId = null;

    for (var c in config) {
        switch (c) {
        case "type":
        case "source":
        case "value":
        case "default":
        case "doc":
        case "restoreTimeout":
            this[c] = config[c];
            break;
        case "set":
        case "get":
        case "compile":
        case "update":
        case "post":
            this[c] = config[c].bind(this);
            break;
        case "values":
            if (Sfera.Utils.isFunction(config[c]))
                this[c] = config[c].bind(this);
            else
                this[c] = config[c];
            break;
        }
    }
};
Sfera.Attribute.prototype = {
    // options:
    //  manualUpdate: don't call update
    //  silent: don't raise events
    set: function(value, options) {
        if (this.source === value) return; // no changes
        this.changed = true; // if true, we need to call compile
        this.source = value;
        var mustache = Sfera.Compiler.getMustacheData(value);
        var eq = (this.mustache && mustache && this.mustache.vars.equals(mustache.vars)); // old and new mustache data variables are equal
        // remove old observers
        if (this.mustache && !eq) {
            for (var i=0; i<this.mustache.vars.length; i++)
                Sfera.client.removeAttrObserver(this.mustache.vars[i], this);
        }
        this.mustache = mustache;
        // add new observers
        if (this.mustache && !eq) {
            for (var i=0; i<this.mustache.vars.length; i++)
                Sfera.client.bindAttrObserver(this.mustache.vars[i], this);
        }
        if (!options || !options.manualUpdate)
            this.compile(options);
    },

    get: function() {
        return this.value;
    },

    compile: function (options) {
        var value = Sfera.Compiler.compileAttributeValue(this);

        // check if value list
        if (this.values) {
            if (Sfera.Utils.isFunction(this.values))
                arr = this.values();
            else
                arr = this.values;

            if (Sfera.Utils.isArray(arr)) {
                if (arr.indexOf(value) == -1)
                    return; // can't update it
            }
        }

        this.updateRestore();

        // update only if changed. TODO: same source could compile to different values???????????????????
        if (value !== this.value) {
            this.changed = false;
            this.value = value;
            this.update(options);
        }
    },

    update: function (options) {
        // do something with the value
        // ...
        // call post update
        this.post(options);
    },

    post: function (options) {
    },

    updateRestore: function () {
        clearTimeout(this._restoreTimeoutId);
        if (this.restoreTimeout) {
            function reset() {
                this.set(this.default);
            }
            this._restoreTimeoutId = setTimeout(reset.bind(this), this.restoreTimeout);
        }
    }


};


/**
* Sfera.ComponentManager holds current client's components
*
* @class Sfera.ComponentManager
* @constructor
*/
Sfera.ComponentManager = function (client) {

    this.client = client;

	var all = [];

	// sets of component pointers {id:[ ... ], ...}
	var byId = {};
	var byGroup = {};
	var byType = {};

	// generic add by function. component, which set (byId, byAddress..), value (component.id, component.group..)
	function addBy(co,set,value) {
		if (!set[value]) // ex. byId["dummy.1"]
			set[value] = [];
		set[value].push(co);
	}
    function removeBy(co,set,value) {
        for (var i=0; i<set[value].length; i++) {
            if (set[value] == co) {
                set[value] = null;
                delete set[value];
                return;
            }
        }
    }

	// generic get by function
	function getBy(arr,value) {
		return (arr[value]?arr[value]:[]); // if no array return an empty one
	}

	// index component
	this.index = function (co) {
		all.push(co);
		addBy(co,byType,co.type);
		if (co.id)		addBy(co,byId,co.id);
		if (co.group)	addBy(co,byGroup,co.group);
	};

    // live group indexing
    // add to byGroup set
    this.addByGroup = function (co, group) {
        addBy(co,byGroup,group);
    }
    // remove component from byGroup set
    this.removeByGroup = function (co, group) {
        removeBy(co,byGroup,group);
    }

	// get single object (first) by id
	this.getFirstById = function (id) {
		return this.getById(id)[0];
	};

	// get components by id
	this.getById = function (id) {
		return getBy(byId,id);
	};

	// get components by type
	this.getByType = function (type) {
		return getBy(byType,type);
	};

    // get by group
    this.getByGroup = function (group) {
        return getBy(byGroup,group)
    };

	// get value from single component (first) by id
	this.getValue = function (id) {
		var co = this.getFirstById(id);
		return co ? co.getAttribute("value") : null;
	};

};


Sfera.ComponentPresets = {

};


/**
 * Sfera.Components singleton that handles components
 *
 * @namespace Sfera.Components
 * @class Sfera.Components
 */
Sfera.Components = new(function() {

    // component definitions
    this._componentDefs = {};
    // components need to be created in order depending on what component they're extending
    this._createLater = {};

    // all the classes
    this.Classes = {};

    /**
     * Set a component source code
     *
     * @method Sfera.Components#setSource
     * @property {string} componentName - The name of the component.
     * @property {string} source - The component source code.
     */
    this.setSource = function(componentName, source) {
        var cc = this.getClass(componentName);
        cc.prototype.source = source;
    };

    /**
     * Bakes the source of a component into a DOM structure, so the component is ready to be instantiated
     *
     * @method Sfera.Components#bakeSource
     * @property {string} componentName - The name of the component.
     */
    this.bakeSource = function(componentName) {
        var cc = this.getClass(componentName);

        // bake DOM
        var d = document.createElement("div");
        d.innerHTML = Sfera.Compiler.compileHTML(cc.prototype.source);

        var dom = Sfera.Utils.getFirstChildNodeOfType(d, 1);
        dom.setAttribute("data-controller", componentName);

        // set dom, ready for cloning
        cc.prototype.dom = dom;
        cc.prototype.source = null; // clear source
    };

    /**
     * Get the class name of a component starting from its name (capitalizes it)
     *
     * @method Sfera.Components#getClassName
     * @property {string} componentName - The name of the component.
     */
    this.getClassName = function(componentName) {
        return Sfera.Utils.capitalize(Sfera.Utils.dashToCamel(componentName));
    };

    /**
     * Get the class of a component from its name
     *
     * @method Sfera.Components#getClass
     */
    this.getClass = function(componentName) {
        return Sfera.Components.Classes[this.getClassName(componentName)];
    };

    /**
     * Creates an instance of a component
     *
     * @method Sfera.Components#createInstance
     * @property {string} componentName - The name of the component.
     * @property {object} attributes - The attribute values.
     */
    this.createInstance = function(componentName, attributes) {
        // component class
        var cc = this.getClass(componentName);

        // no component with that name
        if (cc == null)
            return null;

        var component = new cc({
            attributes: attributes
        });

        return component;
    };

    /**
     * Creates a component class from its name and definition
     *
     * @method Sfera.Components#create
     * @property {string} name - The name of the component.
     * @property {string} def - The component's definition.
     */
    this.create = function(name, def) {
        this._componentDefs[name] = def; // create all on boot
    };

    this.boot = function() {
        // create all
        for (var c in this._componentDefs)
            this.createClass(c, this._componentDefs[c]);
        this._componentDefs = {};
    };

    // create a component class now
    this.createClass = function(name, def) {
        // extends an existing component?
        if (def.extends && !Sfera.Components.Classes[def.extends]) {
            if (!this._createLater[def.extends])
                this._createLater[def.extends] = [];
            this._createLater[def.extends].push({name:name, def:def});
            return;
        }

        // constructor
        Sfera.Components.Classes[name] = function Component(def) {
            // children, if container
            this.children = [];

            // html element
            if (def.element) {
                this.element = element;
            } else {
                // DOM
                if (this.source)
                    Sfera.Components.bakeSource(name);

                if (this.dom) {
                    this.element = this.dom.cloneNode(true);
                    this.element.controller = this;

                    // subcomponents, if composed component
                    this.subComponents = {};

                    // replace sml comment nodes with compiled xml
                    var nodes = Sfera.Utils.getAllCommentChildNodes(this.element);
                    var xml;
                    // we need the id now, will set it again later. TODO: find better way?
                    this.id = def.attributes ? def.attributes.id : null;
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i].nodeValue.substr(0, 3) == "sml") {
                            xml = Sfera.Utils.parseXML(nodes[i].nodeValue.substr(3));

                            var root = Sfera.Compiler.compileXML(xml, {
                                index: this.id ? true : false,
                                idPrefix: this.id
                            });

                            // replace existing node
                            if (root && root.element) {
                                nodes[i].parentNode.replaceChild(root.element, nodes[i]);
                                this.addSubComponent(root);
                            }
                        }
                    }
                }
            }

            // attributes
            this.attributes = {};
            for (var attr in this.attrDefs) {
                this.attributes[attr] = new Sfera.Attribute(this, this.attrDefs[attr]);
            }

            // init
            this.super("_Base", "init");
            if (!def.doc) {
                this.init();

                // attribute values
                for (var attr in this.attributes) {
                    if (def.attributes && def.attributes[attr] != null)
                        this.setAttribute(attr, def.attributes[attr]);
                    else if (this.attributes[attr].default != null)
                        this.setAttribute(attr, this.attributes[attr].default);
                }
            }
        };
        var comp = Sfera.Components.Classes[name];

        // non standard, allows developer tools to display object class names correctly
        comp.displayName = "Sfera.Component.Classes." + name;

        // extends
        if (!def.extends && name != "_Base")
            def.extends = "_Base";

        var sup;
        if (def.extends) {
            sup = Sfera.Components.Classes[def.extends].prototype;

            comp.prototype = Object.create(sup);
            comp.prototype.constructor = comp;
            comp.prototype.type = name;
        } else {
            sup = { attrDefs:{} };
        }

        // doc?
        var cDoc;
        if (Sfera.Doc) {
            cDoc = Sfera.Doc.get.component(name);
            if (cDoc && cDoc.doc)
                comp.prototype.doc = cDoc.doc;
            if (!cDoc || !cDoc.doc)
                cDoc = {doc:{}};
            comp.prototype.doc = cDoc.doc;
        }

        // copy attributes
        comp.prototype.attrDefs = {};
        var sDoc;
        if (Sfera.Doc)
            sDoc = Sfera.Doc.get.component(def.extends);
        for (var a in sup.attrDefs) {
            comp.prototype.attrDefs[a] = sup.attrDefs[a];
            // attribute doc
            if (sDoc && sDoc.attr && sDoc.attr[a] && !sup.attrDefs[a].doc) {
                comp.prototype.attrDefs[a].doc = sDoc.attr[a];
            }
        }

        // presets
        if (def.presets) {
            var be;
            for (var i = 0; i < def.presets.length; i++) {
                be = Sfera.ComponentPresets[def.presets[i]];
                be.call(comp.prototype); // extend prototype

                if (Sfera.Doc) {
                    var pDoc = Sfera.Doc.get.preset(def.presets[i]);
                    if (pDoc) {
                        for (var a in pDoc) {
                            if (!comp.prototype.attrDefs[a])
                                comp.prototype.attrDefs[a] = {};
                            comp.prototype.attrDefs[a].doc = pDoc[a];
                        }
                    }
                }
            }
        }

        // attributes
        if (def.attributes) {
            for (var attr in def.attributes) {
                if (!comp.prototype.attrDefs[attr]) {
                    comp.prototype.attrDefs[attr] = def.attributes[attr];
                } else {
                    // clone from super class
                    if (comp.prototype.attrDefs[attr] == sup.attrDefs[attr]) {
                        comp.prototype.attrDefs[attr] = {};
                        for (var i in sup.attrDefs[attr])
                            comp.prototype.attrDefs[attr][i] = sup.attrDefs[attr][i];
                    }
                    // extend rather than replace (in case it was already defined by extend or preset)
                    for (var i in def.attributes[attr]) {
                        comp.prototype.attrDefs[attr][i] = def.attributes[attr][i];
                    }
                }
            }
        }

        // attribute doc
        if (cDoc && cDoc.attr) {
            for (var a in cDoc.attr) {
                /*
                if (!comp.prototype.attrDefs[a])
                    comp.prototype.attrDefs[a] = {};
                */
                if (comp.prototype.attrDefs[a])
                    comp.prototype.attrDefs[a].doc = cDoc.attr[a];
            }
        }

        // the rest
        for (var f in def) {
            // skip, already done
            if (f == "presets" || f == "attributes")
                continue;

            comp.prototype[f] = def[f];
            if (typeof comp.prototype[f] === "function")
                comp.prototype[f].displayName = "Sfera.Components.Classes." + name + "." + f;
        }

        // components that extend this one, previously defined
        if (this._createLater[name]) {
            for (var i=0; i<this._createLater[name].length; i++) {
                var c = this._createLater[name][i];
                this.createClass(c.name, c.def);
            }
            delete this._createLater[name];
        }
    };

})();


/**
 * Sfera._Base component base class
 *
 * @class Sfera._Base
 * @constructor
 */
Sfera.Components.create("_Base", {
    id: null,

    // require update: null, true/ {}
    requireUpdate: null,

    doc: {
        hidden:true
    },

    attributes: {
        id: {
            type: "string",
            set: function(value) {
                this.value = value;
                this.component.id = value;
                this.component.element.setAttribute("data-id", value);
            },
            get: function() {
                return this.attributeValues.id;
            },
        },

        cssClass: {
            type: "string",
            update: function() {
                var c = this.component;
                var cl = this.value;
                if (c.dom && c.dom.className)
                    cl = c.dom.className + " " + cl;
                c.element.className = cl;
            }
        }
    },

    init: function() {
        this.elements = {};
    },

    // shared methods
    getAttribute: function(name) {
        if (this.attributes[name]) {
            return this.attributes[name].get();
        }
    },

    // shared methods
    setAttribute: function(name, value, options) {
        if (this.attributes[name]) {
            this.attributes[name].set(value, options);
        }
    },

    // update
    update: function() {},

    // super
    super: function(superClassName, methodName) {
        Sfera.Components.Classes[superClassName].prototype[methodName].call(this);
    },

    /**
     * Set component's html source. Reset processed variable
     * @param {string} src - html source
     */
    setSource: function(src) {
        this.processed = false;
    },

    addChild: function(child) {
        this.children.push(child);
        child.parent = this;
        if (this.element && child.element) {
            this.element.appendChild(child.element);
        }
    },

    addSubComponent: function(co) {
        if (co.id === false) co.id = this.id+".icon";
        var id = co.id;
        // remove this.id. TODO: find a better way
        if (this.id)
            id = id.substr(this.id.length+1);
        this.subComponents[id] = co;
        co.parent = this;
    },

    //
    isVisible: function() {
        return true;
    },

    //
    isEnabled: function() {
        return true;
    }

});


/**
 * Field virtual component
 *
 * @class Sfera.Components._Field
 * @constructor
 */
Sfera.Components.create("_Field", {
    presets: ["Visibility", "Position", "Size", "Style", "Enable"],

    doc: {
        hidden:true
    },

    attributes: {
        value: {}
    },

    init: function() {
        this.focused = false;
    },

    focus: function() {},

    blur: function() {},

    onFocus: function() {},

    onBlur: function() {}

});


Sfera.ComponentPresets.Color = function() {
    // extend attributes
    this.attrDefs.color = {
        type: "string",
        default: "default",

        values: function() {
            var c;
            if (Sfera.client && Sfera.client.skin)
                c = Sfera.client.skin.colors[this.component.type];
            return c ? c : ["default"];
        },

        update: function() {
            if (this.component.updateClass)
                this.component.updateClass();
            // post update
            this.post();
        }
    }
};


Sfera.ComponentPresets.Enable = function() {
    // extend attributes
    this.attrDefs.enabled = {
        type: "boolean",
        default: "true",
        update: function() {
            if (this.component.updateClass)
                this.component.updateClass();
            // post update
            this.post();
        }
    };
};


Sfera.ComponentPresets.Label = function() {
    // extend attributes
    this.attrDefs.label = {
        type: "string",
        update: function() {
            this.component.element.innerHTML = this.value;
            // post update
            this.post();
        }
    };
    this.attrDefs.color = {
        type: "string",
        update: function() {
            this.component.element.style.color = this.value;
            // post update
            this.post();
        }
    };
    this.attrDefs.fontSize = {
        type: "integer",
        update: function() {
            this.component.element.style.fontSize = this.value + "px";
            // post update
            this.post();
        }
    };
    this.attrDefs.textAlign = {
        type: "string",
        update: function() {
            this.component.element.style.textAlign = this.value;
            // post update
            this.post();
        }
    };

};


Sfera.ComponentPresets.Position = function() {
    // extend attributes
    this.attrDefs.position = {
        type: "string",
        update: function() {
            this.component.element.style.position = this.value == "static" ? "static" : "absolute";
            // post update
            this.post();
        },
    };
    this.attrDefs.x = {
        type: "integer",
        update: function() {
            this.component.element.style.left = this.value + "px";
            // post update
            this.post();
        },
    };
    this.attrDefs.y = {
        type: "integer",
        update: function() {
            this.component.element.style.top = this.value + "px";
            // post update
            this.post();
        },
    };

    this.attrDefs.rotation = {
        type: "integer",
        update: function() {
            var s = this.component.element.style;
            var r = "rotate(" + this.value + "deg)"
            s.msTransform = /* IE 9 */
                s.webkitTransform = /* Safari */
                s.transform = r;

            // post update
            this.post();
        },
    }
};


Sfera.ComponentPresets.Size = function() {
    // extend attributes
    this.attrDefs.width = {
        type: "integer",
        update: function() {
            this.component.element.style.width = this.value == "auto" ? "auto" : this.value + "px";
            // post update
            this.post();
        },
    };
    this.attrDefs.height = {
        type: "integer",
        update: function() {
            this.component.element.style.height = this.value == "auto" ? "auto" : this.value + "px";
            // post update
            this.post();
        },
    };
};


Sfera.ComponentPresets.Style = function() {
    // extend attributes
    this.attrDefs.style = {
        type: "string",
        default: "default",

        values: function() {
            var s;
            if (Sfera.client && Sfera.client.skin)
                s = Sfera.client.skin.styles[this.component.type];
            return s ? s : ["default"];
        },
        
        update: function() {
            if (this.component.updateClass)
                this.component.updateClass();
            // post update
            this.post();
        }
    };
};


Sfera.ComponentPresets.Visibility = function() {
    // extend attributes
    this.attrDefs.visible = {
        type: "boolean",
        compile: function() {
            var value = !(!this.source || this.source == "false");
            if (value !== this.value) {
                this.changed = false;
                this.value = value;
                this.update();
            }
        },
        update: function() {
            // trigger event. component, show/hide, is it a child? (also check if its visibility is changing before triggering)
            function trigger(co, show, child) {
                if (!child || co.getAttribute("visible")) { // trigger?
                    if (show && co.onShow) {
                        co.onShow();
                    } else if (!show && co.onHide) {
                        co.onHide();
                    }

                    if (co.children) {
                        for (var c = 0; c < co.children.length; c++)
                            trigger(co.children[c], show);
                    }
                }
            }

            // trigger on hide before hiding
            if (!this.value) {
                trigger(this.component, false);
            }

            // change visibility
            this.component.element.style.display = this.value ? "inline" : "none";

            // trigger on show after
            if (this.value) {
                trigger(this.component, true);
            }

            // post update
            this.post();
        },
    };
};


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
        var d = (this.getAttribute("enabled") ? "" : " disabled")
        this.button.setClassName("container" + (sty?" style_"+sty:"") + (col?" color_"+col:"")) + d;
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
         },

         autoReload: {
             type: "boolean",
             default: "true"
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
                var c = Sfera.client.skin.colors.Button;
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

        // find absolute bar coords, so we don't have to get them again on mouse move
        this._bp = Sfera.Utils.getElementAbsolutePosition(this.elements.bar_in);

        this.onMove(event);
    },
    onUp: function(event) {
        if (!this.getAttribute("enabled"))
            return;

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
        if (!this.getAttribute("enabled"))
            return;

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
        var f = (this.focused ? " focused" : "");
        var d = (this.getAttribute("enabled") ? "" : " disabled")
        this.element.className = "component comp_slider " + d + f;
        var sty = this.getAttribute("style");
        this.elements.container.className = "container " + (this.vertical ? "vertical" : "horizontal") + (sty ? " style_" + sty : "");
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


/**
 * Sfera.Doc
 * @class Sfera.Doc
 */
Sfera.Doc = new function() {
    var components = {};
    var presets = {};

    this.add = {
        component: function (name, def) {
            components[name] = def;
        },
        preset: function (name, def) {
            presets[name] = def;
        }
    };

    this.get = {
        component: function (name) {
            return components[name];
        },
        preset: function (name) {
            return presets[name];
        }
    };
};


Sfera.Doc.add.component("_Base", {
    attr:{
        id: {
            descr: "Component identifier. Allows the component to be reached through an identifier."
        },
        cssClass: {
            descr: "Defines a custom css class that is applied to the component's html element. The css class can then be defined in a css file inside the interface's directory."
        }
    }
});




Sfera.Doc.add.preset("Color", {
    color: {
        descr: "Specifies the color"
    }
});


Sfera.Doc.add.preset("Enable", {
    enabled: {
        descr: "Specifies whether the component is enabled or not"
    }
});


Sfera.Doc.add.preset("Label", {
    label: {
        descr: "Specifies the label"
    },
    color: {
        descr: "Specifies the color"
    },
    fontSize: {
        descr: "Specifies the font size in pixels"
    },
    textAlign: {
        descr: "Specifies the text alignment"
    }
});


Sfera.Doc.add.preset("Position", {
    position:{
        descr: "Specifies the type of positioning method used (static, relative, absolute or fixed)",
        hidden: true
    },
    x: {
        descr: "Specifies the left position of the component in pixels, relative to its parent container (a page or a container component)",
        example: {
            descr:"Set the left edge of the component to 30 pixels to the right of the left edge of the page",
            values:{
                x:30,
                y:10
            },
        }
    },
    y: {
        descr: "Specifies the top position of the component in pixels, relative to its parent container (a page or a container component)",
        example: {
            descr:"Set the top edge of the component to 10 pixels to the bottom of the top edge of the page",
            values:{
                x:30,
                y:10
            },
        }
    },
    rotation: {
        descr: "Specifies the element's clockwise rotation in degrees",
        example: {
            descr:"Set the rotation of the component to 90&deg;",
            values:{
                x:30,
                y:10,
                rotation:90
            },
        }
    }
});


Sfera.Doc.add.preset("Size", {
    width: {
        descr: "Specifies the component's width in pixels",
        example:{
            descr:"Sets the component's width to 100 pixels wide",
            values:{
                width:100,
                height:50
            }
        }
    },
    height: {
        descr: "Specifies the component's height in pixels",
        example:{
            descr:"Sets the component's height to 50 pixels tall",
            values:{
                width:100,
                height:50
            }
        }
    }
});


Sfera.Doc.add.preset("Style", {
    style: {
        descr: "Specifies the style",
    }
});


Sfera.Doc.add.preset("Visibility", {
    visible: {
        descr: "Specifies whether or not the component is visible",
        example: {
            descr:"Set the component's visibility to false",
            values:{
                visible:false
            }
        }
    }
});


Sfera.Doc.add.component("Button", {
    doc: {
        descr:"A button componentz used to execute customized JavaScript code.\nIts appearance is defined by a style attribute. The [onClick](#onClick) attribute is used to associate an action to execute when the button is pressed."
    },
    attr:{
        label: {
            descr: "Specifies the label's text"
        },

        icon: {
            descr: "Specifies the url of the icon, if any"
        },

        fontSize: {
            descr: "Specifies the label's font size"
        },

        onClick: {
            descr: "Script to be run on click/touch end event. The variable _id_ contains the button's id.",
            example:{
                descr:"Clicking the button will open an alert popup.",
                values: {
                    x:10,
                    y:10,
                    onClick:"alert('hello')"
                }
            }
        },

        onDown: {
            descr: "Script to be run on down/touch start event"
        },

        onMove: {
            descr: "Script to be run on mouse/touch move event"
        }
    }

});


Sfera.Doc.add.component("Checkbox", {
    doc: {
        descr:"Checkbox component, used to represent a boolean value.\nIts appearance is defined by a [style](#style) attribute."
    },
    attr:{
        focus: {
            descr: "Focus the element"
        },

        label: {
            descr: "Specifies the label's text"
        },

        value: {
            descr: "Specifies the checkbox's value"
        },

        fontSize: {
            descr: "Specifies the font size in pixels"
        },

        fontColor: {
            descr: "Specifies the font color"
        },

        changeDelay: {
            descr: "Specifies the milliseconds before a change of value is noticed"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },
        onChange: {
            descr: "Script to be run when a change in value is detected. Variables id and value can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
        },
        onEnter: {
            descr: "Script to be run when the enter key is pressed"
        },
        onFocus: {
            descr: "Script to be run when the field gains focus"
        },
        onBlur: {
            descr: "Script to be run when the field loses focus"
        }
    }
});


Sfera.Doc.add.component("Container", {
    doc: {
        descr:"This component is used to group other components together.\nAll the contained components' positions are relative to the container's top left corner. Containers can be nested."
    },
    attr:{

    }
});


Sfera.Doc.add.component("Image", {
    doc: {
        descr:"Image component, used to display a single image of any type supported by the target browser."
    },
    attr:{
        source: {
            descr: "Specifies the image source file"
        },
    }
});


Sfera.Doc.add.component("Input", {
    doc: {
        descr:"Input component, to allow the user to input a value of various types (defined by the type attribute).\nIts appearance is defined by a [style](#style) attribute."
    },
    attr:{
        type: {
            descr: "Specifies the input type that defines its behavior"
        },

        value: {
            descr: "Specifies the field's value"
        },

        focus: {
            descr: "If true, gives the component focus"
        },

        icon: {
            descr: "Sepcifies an optional icon's url"
        },

        eraseButton: {
            descr: "If true, shows the erase button"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
        },

        keyRegex: {
            descr: "Specifies a regex to validate a key press. If the regex doesn't match, the input is canceled"
        },

        valueRegex: {
            descr: "Specifies a regex to validate the value. If the regex doesn't match, the value is not sent to the server"
        },

        fontSize: {
            descr: "Specifies the font size in pixels"
        },

        fontColor: {
            descr: "Specifies the font color"
        },

        maxLength: {
            descr: "Specifies the value's maximum length"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },

        onChange: {
            descr: "Script to be run when a change in value is detected. Variables `id` and `value` can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed. Variables `id` and `value` can be used."
        },

        onFocus: {
            descr: "Script to be run when the component receives focus. Variables `id` and `value` can be used."
        },

        onBlur: {
            descr: "Script to be run when the component loses focus. Variables `id` and `value` can be used."
        }
    }

});


Sfera.Doc.add.component("Interface", {
    doc: {
        descr:"Interface component, the root component that contains all the others."
    },
    attr:{
        title: {
            descr: "Specifies the interface's title"
        },

        skin: {
            descr: "Specifies the interface's skin. Can be set only on the interface's index.xml"
        },

        zoom: {
            descr: "Specifies the interfaces zoom"
        }
    }
});


Sfera.Doc.add.component("Label", {
    doc: {
        descr:"Label component, used to display a string."
    },
    attr:{
        text: {
            descr: "Specifies the label's text"
        }
    }
});


Sfera.Doc.add.component("List", {
    doc: {
        descr:"List component, to display a list of items. Each item can have an html template to vary its appearance and an (onItemClick)[#onItemClick] event"
    },
    attr:{
        values: {
            descr: "Specifies the values of the items"
        },

        labels: {
            descr: "Specifies the labels of the items"
        },

        template: {
            descr: "Specifies the template for the items"
        },

        onItemClick: {
            descr: "Script to be run when an item is clicked. Variables `id` and `value` can be used.",
            example: {
                descr: "When an item is clicked an alert will display its value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert('list '+id+' changed. Current value: '+value)"
                }
            }
        }
    }

});


Sfera.Doc.add.component("Page", {
    doc: {
        descr:"Page component, used to group components in different views.\nPage ids are usually prefixed with \"page:\" to differentiate them from other components."
    },
    attr:{
        title: {
            descr: "Specifies the page's title, visible in the browser's tab title"
        }
    }

});


Sfera.Doc.add.component("Radio", {
    doc: {
        descr:"Radio component, used in a group of multiple radio components to represent an exclusive value.\nIts appearance is defined by a [style](#style) attribute.\nThe [group](#group) attribute defines which radio components work together."
    },
    attr:{
        group: {
            descr: "Specifies the radio's group. Only one radio component of the same group can be checked at the same time"
        }
    }

});


Sfera.Doc.add.component("Select", {
    doc: {
        descr:"Select component, allows the user to select a single value among a list of [values](#values)."
    },
    attr:{
        value: {
            descr: "Specifies the current value"
        },

        focus: {
            descr: "If true the component gains focus"
        },

        icon: {
            descr: "Specifies the url of the icon, if any"
        },

        values: {
            descr: "Specifies the values of the items"
        },

        labels: {
            descr: "Specifies the labels of the items"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
        },

        fontSize: {
            descr: "Specifies the font size in pixels"
        },

        fontColor: {
            descr: "Specifies the font color"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },

        onChange: {
            descr: "Script to be run when a change in value is detected. Variables id and value can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed"
        },

        onFocus: {
            descr: "Script to be run when the component receives focus"
        },

        onBlur: {
            descr: "Script to be run when the component loses focus"
        }
    }

});


Sfera.Doc.add.component("Slider", {
    doc: {
        descr:"Slider component, allows the user to input a numeric [value](#value) between a [minimum](#min) and [maximum](#max) value.\nThe decimal digits in the value are based on the maximum amount of decimal digits in the min and max attributes."
    },
    attr:{
        cursorSize: {
            descr: "Specifies the label's text"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
        },

        barColor: {
            descr: "Specifies the color of the bar"
        },

        min: {
            descr: "Specifies the minumum value"
        },

        max: {
            descr: "Specifies the maximum value"
        },

        value: {
            descr: "Specifies the value of the slider"
        },

        focus: {
            descr: "If true, gives the component focus"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },

        onChange: {
            descr: "Script to be run when a change in value is detected. Variables id and value can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed"
        },

        onFocus: {
            descr: "Script to be run when the component receives focus"
        },

        onBlur: {
            descr: "Script to be run when the component loses focus"
        }
    }
});


    Sfera.Components.boot();

    grunt.log.writeln("Loading templates from: "+ options.templ);

    var f = grunt.file.expand(options.templ + "/**/*.md");
    for (var i = 0; i<f.length; i++) {
        grunt.log.writeln("Loading "+f[i]);
        templates[f[i]] = grunt.file.read(f[i]);
    }

    grunt.log.writeln("Creating markdown");

    for (var c in Sfera.Components.Classes) {
        var html = genMD.component(Sfera.Components.Classes[c]);
        if (html) {
            grunt.file.write(options.dest+"/"+c+".md", html);
            grunt.log.writeln("Markdown for "+c+" component created.");
        }
    }
};
