/*! sfera-webapp - v0.0.2 */

(function(){

    var root = this;


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
 * Sfera.Compiler compiles components into DOM
 *
 * @class Sfera.Compiler
 * @constructor
 */
Sfera.Compiler = new(function() {

    function getComments(context) {
        var foundComments = [];
        var elementPath = [context];
        while (elementPath.length > 0) {
            var el = elementPath.pop();
            for (var i = 0; i < el.childNodes.length; i++) {
                var node = el.childNodes[i];
                if (node.nodeType === 8) {
                    foundComments.push(node);
                } else {
                    elementPath.push(node);
                }
            }
        }

        return foundComments;
    }

    // first time compiling an element.
    // if it finds <!-- sml, replace it with elements
    // add on each element main div data-controller="Link" (added automatically when compiling any component?)
    // set composed = true
    // SAVE new source and composed
    //
    // when assigning the controller, if composed, browse the html to assign controllers

    /**
     * Create component instance.
     * @param  {string} name        name of the
     * @param  {object} attributes  attributes of
     * @return {object}             thing
     */
    this.createComponent = function(name, attributes) {
        return Sfera.Components.createInstance(name, attributes);
    };

    this.compileXMLNode = function(xmlNode, options) {
        if (xmlNode.nodeType == 1) { // 1 = element
            options = options || {};
            options.index = options.index || true; // default is true

            var i, a;
            var attrs = {};
            for (i = 0; i < xmlNode.attributes.length; i++) {
                a = xmlNode.attributes[i];
                attrs[Sfera.Utils.dashToCamel(a.name)] = a.value;
            }

            // add prefix?
            if (options.idPrefix && attrs.id)
                attrs.id = options.idPrefix + "." + attrs.id;

            var component = this.createComponent(xmlNode.nodeName, attrs);

            // add to the index
            if (component) {
                if (options.index)
                    Sfera.client.indexComponent(component);

                var child;
                var c = xmlNode.childNodes;

                for (i = 0; i < c.length; i++) {
                    child = this.compileXMLNode(c[i]);
                    if (child)
                        component.addChild(child);
                }
            }

            return component;
        }
        return null;
    };

    /**
     *
     */
    this.compileXML = function(xmlDoc, options) {
        return this.compileXMLNode(xmlDoc.documentElement, options);
    };

    this.compileString = function(xmlStr) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, "text/xml");

        this.compileXML(xmlDoc);
    };

    /**
     * [function description]
     * @param  {string} xmlDoc [description]
     * @return {string}        [description]
     */
    this.compileDictionary = function(xmlDoc) {
        var xmlNode = xmlDoc.documentElement;
        if (xmlNode && xmlNode.nodeType == 1) { // 1 = element
            var c = xmlNode.childNodes,
                c2, c3, n, i, t, k;
            for (i = 0; i < c.length; i++) {
                if (c[i].nodeType == 1)
                switch (c[i].tagName) {
                case "skin":
                    break;
                case "components":
                    c2 = c[i].childNodes;
                    for (t = 0; t < c2.length; t++) {
                        if (c2[t].nodeType == 1) {
                            // component has source and lan
                            c3 = c2[t].childNodes;
                            for (k = 0; k < c3.length; k++) {
                                switch (c3[k].tagName) {
                                    case "src":
                                        Sfera.Components.setSource(c2[t].tagName, Sfera.Utils.getCDATA(c3[k]));
                                        break;
                                    case "_lan":
                                        Sfera.Components.setLanguage(c2[t].tagName, Sfera.Utils.getCDATA(c3[k]));
                                        break;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    };

    this.compileHTML = function(source) {
        source = source.replace(/\$interface\;/g, Sfera.client.name);

        // ...

        return source;
    };

    this.getMustacheData = function(source) {
        if (!Sfera.Utils.isString(source) ||
            source.indexOf("{") == -1)
            return null;

        var data = {
            vars: []
        };
        var MUSTACHE = /\{\{([^}]*)\}\}/g;
        var m;
        while (m = MUSTACHE.exec(source)) {
            data.vars.push(m[1]);
        }

        // done
        if (!data.vars.length)
            return null;

        return data;
    };

    /**
     *
     */
    this.compileAttributeValue = function(attr, source) {
        var str;
        var MUSTACHE = /\{\{([^}]*)\}\}/g;

        var value = source || attr.source;

        // mustache
        if (attr.mustache) {
            function rep(match, capture) {
                return Sfera.client.getNodeValue(capture);
            }
            value = value.replace(MUSTACHE, rep);
        }

        // type
        switch (attr.type) {
            case "integer":
                value = parseInt(value);
                break;
            case "float":
                value = parseFloat(value);
                break;
            case "color":
                value = value.toLowerCase();
                names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];
                /*
                /^(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb *\( *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *\)|rgba *\( *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *\)|black|green|silver|gray|olive|white|yellow|maroon|navy|red|blue|purple|teal|fuchsia|aqua)$/i
                if (names.indexOf(value) == -1) {
                    if (!(/^#[a-f0-9]{6}$/i).test(value)) {
                        if (/^[a-f0-9]{6}$/i).test(value) {
                            value = '#'.value;
                        } else {

                        }
                    }
                }
                */
                break;
            case "string":
            case "js":
                if (typeof(value) != "string" && value.toString) {
                    var v = value.toString();
                    if (v == "[object Object]")
                        value = JSON.stringify(value);
                    else
                        value = v;
                }
                break;
            case "boolean":
                value = !(value === "false" || value === false || value === undefined || value === null);
                break;
            case "regexp":
                try {
                    value = new RegExp(value); // add begin and end, it has to match the whole string
                } catch (err) {
                    value = null;
                }
                break;
            case "list":
                value = value.split(",");
                break;
        }

        // done
        return value;
    };

})();


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
 * This is the main object of the interface.
 *
 * @class Sfera.Client
 * @constructor
 * @param {object} [config=null] - A configuration object containing parameters
 * @param {boolean} [config.debug=false] - Debug mode
 */
Sfera.Client = function(config) {
    // main reference
    Sfera.client = this;

    if (!config)
        config = {};

    /**
     * @property {string} name - interface name
     * @readonly
     */
    this.name = "";

    /**
     * @property {boolean} isLogin - are we on the login page?
     * @type {String}
     */
    this.isLogin = false;

    this.state = {
        booted: false,
        started: false,
        indexUpdated: false,
        firstEventReceived: false
    }

    /**
     * @property {Sfera.ComponentManager} - Reference to the component manager.
     */
    this.components = null;

    /**
     * @property {Sfera.Input} input - Reference to the input manager
     */
    this.input = null;

    /**
     * @property {Sfera.Utils.Debug} debug - Debug utilities.
     */
    this.debug = null;

    // current interface
    this.cInterface = null;

    // currently visible page
    this.cPage = null;

    var manifestTimestamp = 0;
    var self = this;

    // requests waiting for a reply
    var commandReqs = {};
    var eventReqs = {};

    var idleIntervalId = null;

    // html elements
    var elements = {};

    // cache variables
    var cacheLoadedFiles = 0;
    var checkCacheInterval; // just to be sure, an interval to check if cache is ready
    var reloadCalled;

    /**
     * Initialize the client and start it.
     *
     * @method Sfera.Client#boot
     * @protected
     */
    this.boot = function(url) {
        if (this.state.booted)
            return;

        var location = Sfera.Browser.getLocation();

        this.name = location.interface;
        this.isLogin = location.login;

        if (config.timestamp)
            manifestTimestamp = config.timestamp;

        Sfera.client = this;

        this.state.booted = true;

        Sfera.Components.boot(); // init component classes

        this.components = new Sfera.ComponentManager(this);

        // get name
        this.name = config.interface;

        if (true || this.config.enableDebug) {
            this.debug = Sfera.Debug;
            this.debug.boot();
        }

        if (window.focus) {
            window.focus();
        }

        // get html elements
        var e = ["sfera", "loading", "cacheStatus", "cachePerc"];
        for (var i=0; i<e.length; i++) {
            elements[e[i]] = document.getElementById(e[i]);
        }

        Sfera.Debug.showHeader();

        // configure Sfera.Net
        Sfera.Net.boot();

        Sfera.Net.onReply.add(onReply);
        Sfera.Net.onEvent.add(onEvent);
        Sfera.Net.onUpdateDictionary.add(onUpdateDictionary);
        Sfera.Net.onUpdateIndex.add(onUpdateIndex);
        Sfera.Net.onConnection.add(onConnection);
        Sfera.Net.onClose.add(onClose);

        Sfera.Net.connect();

        // window events
        window.onresize = adjustLayout;
        window.onkeydown = onKeyDown;
        window.onkeyup = onKeyUp;
        window.onkeypress = onKeyPress;

        // loading events
        elements.loading.onmousedown =
        elements.loading.onmouseup =
        elements.loading.onmousemove = function (e) { Sfera.Browser.preventDefault(e) };

        delete config;
    };

    /**
     * Destroys the Client, he deserved it.
     *
     * @method Sfera.Client#destroy
     */
    this.destroy = function() {
        this.input.destroy();

        this.input = null;
        this.isBooted = false;

        Sfera.CLIENTS[this.id] = null;
    };

    /**
     * Open an index, compile it and add it to the DOM
     *
     * @method Sfera.Client#openIndex
     * @property {string} URL - The Index URL.
     */
    this.openIndex = function(url, onDone) {
        // ???
    };

    this.openDictionary = function(url, onDone) {
        // ???
    };

    // Net callbacks

    function onConnection() {
        self.state.firstEventReceived = false;
        if (self.isLogin) {
            Sfera.Login.gotoInterface();
        } else {
            Sfera.Net.nodeSubscribe("*");
        }
    }

    function onClose() {
        if (!self.isLogin)
            self.showLoading(true);
    }

    function onReply(json) {
        if (json.result && json.result.uiSet) {
            for (var u in json.result.uiSet) {
                var n = u.split(".");
                var a = n.pop();
                var c = self.components.getById(n.join("."));
                for (var i = 0; i < c.length; i++) {
                    c[i].setAttribute(a, json.result.uiSet[u]);
                }
            }
        }
        switch (json.action) {
            case "command":
                if (commandReqs[json.tag]) {
                    if (commandReqs[json.tag].callback)
                        commandReqs[json.tag].callback(commandReqs[json.tag].cmd,
                            json.result);
                    delete commandReqs[json.tag];
                }
                break;
            case "event":
                if (eventReqs[json.tag]) {
                    if (eventReqs[json.tag].callback)
                        eventReqs[json.tag].callback(eventReqs[json.tag].id,
                            eventReqs[json.tag].value,
                            json.result);
                    delete eventReqs[json.tag];
                }
                break;
        }
    }

    function onUpdateDictionary(xmlDoc) {
        var root = Sfera.Compiler.compileDictionary(xmlDoc);
    };

    function onUpdateIndex(xmlDoc) {
        var root = Sfera.Compiler.compileXML(xmlDoc);
        elements.sfera.appendChild(root.element);

        self.cInterface = self.components.getByType("Interface")[0];
        self.cInterface.setAttribute("visible","false");

        self.state.indexUpdated = true;
        // whichever runs last, starts the interface. login is not connected, so it never receives the first event
        if (!self.state.started && (self.state.firstEventReceived || self.isLogin)) {
            self.start();
        }
    };

    this.start = function() {
        Sfera.Browser.start();

        this.cInterface.setAttribute("visible","true");

        adjustLayout();
        resetIdleTimeout();

        this.state.started = true;
        this.showLoading(false);

        if (Sfera.Custom.onReady)
            Sfera.Custom.onReady();
    };

    this.stop = function () {

    };

    this.indexComponent = function(component) {
        this.components.index(component);
    };

    this.setAttribute = function(id, name, value, silent) {
        var c = this.components.getById(id);
        for (var i = 0; i < c.length; i++)
            c[i].setAttribute(name, value, silent);
    };

    this.getAttribute = function(id, name) {
        var c = this.components.getFirstById(id); // get first onerror
        return c.getAttribute(name);
    };

    this.showPage = function(id) {
        if (id.indexOf(":") == -1)
            id = "page:" + id;

        // custom?
        if (Sfera.Custom.onPage && Sfera.Custom.onPage(id) === false)
            return; // false, skip

        if (this.cPage)
            this.cPage.setAttribute("visible", false);

        var p = this.components.getFirstById(id);
        if (p) {
            p.setAttribute("visible", true);
            this.cPage = p;
            var i = this.cInterface.getAttribute("title");
            var t = p.getAttribute("title");
            Sfera.Browser.updateUrl(id, (i ? i : 'Sfera') + (t ? " - " + t : ''));
        } else {
            if (this.isLogin)
                this.showPage("page:home");
            console.log("page not found: " + id);
        }
    };

    this.sendCommand = function(command, callback) {
        var tag = (new Date()).getTime();
        var req = {
            command: command,
            tag: tag,
            callback: callback
        };
        commandReqs[tag] = req;
        Sfera.Net.sendCommand(req);

        return tag;
    };

    this.sendEvent = function(id, value, callback) {
        var tag = (new Date()).getTime(); // request id
        var req = {
            id: "webapp.ui." + id,
            value: value,
            tag: tag,
            callback: callback
        };
        eventReqs[req] = req;
        Sfera.Net.sendEvent(req);

        return tag;
    };

    var nodeValues = {};

    this.getNodeValue = function(node) {
        return nodeValues[node] ? nodeValues[node] : "";
    };

    function onEvent(json) {
        for (var e in json.nodes) {
            // custom?
            if (Sfera.Custom.onEvent && Sfera.Custom.onEvent(e, json.nodes[e]) === false)
                continue; // false, skip

            var n = e.split(".");
            switch (n[0]) {
                case "ui":
                    if (n[1] == "set") { // ui.set.<global | cid>
                        n = n.slice(3); // remove ui, set, global | cid
                        var a = n.pop();
                        var c = self.components.getById(n.join("."));
                        for (var i = 0; i < c.length; i++) {
                            c[i].setAttribute(a, json.nodes[e]);
                        }
                    }
                    break;
                case "webapp":
                    //webapp.interface.new.update":1446813798521
                    if (n[1] == "interface" &&
                        n[2] == self.name &&
                        n[3] == "update") {
                        manifestTimestamp = json.nodes[e];
                        if (manifestTimestamp != config.timestamp) {
                            self.reload();
                        }
                    }
                    break;
            }

            // update local node values
            nodeValues[e] = json.nodes[e];

            // attribute observer
            if (attrObservers[e])
                attrObservers[e].dispatch();
        }

        self.state.firstEventReceived = true;
        // whichever runs last, starts the interface
        if (!self.state.started && self.state.indexUpdated) {
            self.start();
        } else {
            self.showLoading(false);
        }
    }

    function adjustLayout() {
        // not initialized yet
        if (!self.cInterface) return;

        var width = parseInt(self.cInterface.getAttribute("width"));
        var height = parseInt(self.cInterface.getAttribute("height"));

        // center container within window size
        var viewportWidth;
        var viewportHeight;

        if (window.innerWidth) {
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            viewportWidth = document.documentElement.clientWidth;
            viewportHeight = document.documentElement.clientHeight;
        } else if (document.body.clientWidth) {
            viewportWidth = document.body.clientWidth;
            viewportHeight = document.body.clientHeight;
        } else {
            viewportWidth = 0;
            viewportHeight = 0;
        }

        if (viewportWidth > 0) {
            var left = (viewportWidth > width) ? (viewportWidth - width) / 2 : 0;
            var top = (viewportHeight > height) ? (viewportHeight - height) / 2 : 0;

            self.cInterface.element.style.display = "none";
            self.cInterface.element.style.left = left + "px";
            self.cInterface.element.style.top = top + "px";
            self.cInterface.element.style.display = "block";
        } // viewportWidth>0
    } // adjustLayout()

    var attrObservers = {};
    // attribute observers
    this.bindAttrObserver = function(node, attribute) {
        if (!attrObservers[node])
            attrObservers[node] = new Sfera.Signal();
        attrObservers[node].addOnce(attribute.compile, attribute);
    };
    this.removeAttrObserver = function(node, attribute) {
        attrObservers[node].remove(attribute.compile, attribute);
    };

    // events
    // on key down event
    function onKeyDown(event) {
        var evt = event || window.event;
        var code = evt.charCode || evt.keyCode;

        self.ctrlKey = evt.ctrlKey;
        self.shiftKey = evt.shiftKey;

        // keyboard listener?
        if (focusedCo && focusedCo.onKeyDown) {
            if (!focusedCo.onKeyDown(evt, code)) {
                // the event won't go through, prevent
                Sfera.Browser.preventDefault(evt);
                return false;
            }
        } else {
            if (code == 9) {
                if (self.cPage.children.length)
                    focusFirst(self.cPage, evt.shiftKey); // get first or last
                // the event won't go through, prevent
                Sfera.Browser.preventDefault(evt);
                return false;
            }
        }

        return true;
    } // onKeyDown()

    function onKeyPress(event) {
        var evt = event || window.event;
        var code = evt.charCode || evt.keyCode;

        self.ctrlKey = evt.ctrlKey;
        self.shiftKey = evt.shiftKey;

        // keyboard listener?
        if (focusedCo && focusedCo.onKeyPress) {
            if (!focusedCo.onKeyPress(evt, code)) {
                // the event won't go through, prevent
                Sfera.Browser.preventDefault(evt);
                return false;
            }
        }

        return true;
    }

    // on key up event
    function onKeyUp(event) {
        var evt = event || window.event;
        var code = evt.charCode || evt.keyCode;

        self.ctrlKey = evt.ctrlKey;
        self.shiftKey = evt.shiftKey;

        // keyboard listener?
        if (focusedCo && focusedCo.onKeyUp) {
            if (focusedCo.onKeyUp(evt, code)) return true; // the event will go through
        }

        // the event won't go through, prevent
        Sfera.Browser.preventDefault(evt);
        return false;
    } // onKeyUp()


    /////////////////////////// idle

    function stopIdleTimeout() {
        setIdleEvents(true);
        clearInterval(idleIntervalId);
    }

    function resetIdleTimeout() {
        stopIdleTimeout();
        if (config.idleTimeout && parseInt(config.idleTimeout) && !self.isLogin) {
            setIdleEvents();
            idleIntervalId = setInterval(onIdleInterval, 1000);
            localStorage.setItem("idleTimestamp",(new Date().getTime()));
        }
    }

    // check every second (shared between all tabs)
    function onIdleInterval() {
        // check last timestamp
        var ts = localStorage.getItem("idleTimestamp");
        var nts = new Date().getTime();

        if (nts-ts >= parseInt(config.idleTimeout)*1000) {
            onIdleTimeout();
        }
    }

    function onIdleTimeout() {
        stopIdleTimeout();
        Sfera.Login.logout();
    }

    function setIdleEvents(remove) {
		var f = (remove?"remove":"add")+"Event";
		var t = Sfera.Device.touch;
		window[f](t?"touchstart":"mousedown", document.body, onIdleActivity);
		window[f](t?"touchend":"mouseup", document.body, onIdleActivity);
        window[f]("onkeydown", document.body, onIdleActivity);
	}
	function onIdleActivity(e) {
		resetIdleTimeout();
	}

    ////////////////////////// focus
    var focusedCo;
    var blurTimeoutId;

    // set focused component, call onFocus
    this.setFocused = function(co) {
        if (focusedCo && focusedCo != co)
            focusedCo.blur();
        focusedCo = co;
        if (blurTimeoutId)
            clearTimeout(blurTimeoutId);
        if (!co.noBlurTimeout) // if noBlurTimeout = true, won't start the blur timeout
            blurTimeoutId = setTimeout(this.focus, 30000); // blur after a while
    };
    // clear focused component, call onBlur
    this.clearFocused = function(co) {
        if (focusedCo == co)
            focusedCo = null;
        if (blurTimeoutId)
            clearTimeout(blurTimeoutId);
    };

    // focus client
    this.focus = function() {
        if (focusedCo)
            focusedCo.blur();
    }; // focusProject()

    function canFocus(co) {
        return (co != this && co.focus && co.isVisible() && co.isEnabled());
    }

    // focus first component in container (start from the first or the last)
    function focusFirst(container, dir) {
        var l = container.children.length;
        var co = container.children[dir ? l - 1 : 0];
        if (co.isVisible()) {
            if (co.focus && co.isEnabled()) { // found
                co.focus();
                return co;
            } else if (co.children && co.children.length) { // container? look inside
                return focusFirst(co, dir);
            }
        }

        // couldn't focus, keep looking
        return focusNext(co);
    } // focusFirst()

    function focusNext(co, dir) {
        var cos = co.parent.children;
        var oi = -1;
        var i;
        var r; // result
        // search this co index
        for (i = 0; i < cos.length; i++) {
            if (cos[i] == co) {
                oi = i;
                break;
            }
        }

        if (oi == -1) return null; // is it even possible?
        i = oi; // start from next
        do {
            if (dir) {
                i--;
                if (i < 0) {
                    // in a container? check parent
                    if (co.parent.parent) {
                        r = focusNext(co.parent, dir);
                        if (r) return r; // no need to focus again
                    }
                    i = cos.length - 1; // restart from last
                }
            } else {
                i++;
                if (i >= cos.length) {
                    // in a container? check parent
                    if (co.parent.parent) {
                        r = focusNext(co.parent, dir);
                        if (r) return r; // no need to focus again
                    }
                    i = 0; // restart from 0
                }
            }
            // container? go inside
            if (cos[i].children && cos[i].children.length) {
                r = focusFirst(cos[i], dir); // get first or last
                if (r) return r; // no need to focus again
            }
            // has focus function? can focus?
            if (canFocus(cos[i])) {
                cos[i].focus();
                return cos[i];
            }
        } while (cos[i] != co); // go round once
        return null; // no next coect found (co wasn't focusable?)
    } // focusNext()

    this.focusNext = function(dir) {
        return focusNext(focusedCo, dir);
    };

    /////////////////////// connecting
    this.showLoading = function (show) {
        elements.loading.style.display = show?"inline":"none";
    };

    //--------------------------------------------------------------------------------------------------------------------------------
	// reload, cache -----------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------

    this.showCachePercentage = function (perc) {
        elements.cacheStatus.style.display = perc?"inline":"none";
        elements.cachePerc.innerHTML = perc?perc+"%":"";
    };

	// reload, cache
	this.reload = function (now) {
		if (reloadCalled) return;
		reloadCalled = true; // so we can call it just once

		if (!now && window.applicationCache && window.applicationCache.status != window.applicationCache.UNCACHED) {
			if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
				checkCache();
			} else {
				checkCacheInterval = setInterval(checkCache,500);
				window.addEvent("updateready", window.applicationCache, checkCache, false);
				window.addEvent("error", window.applicationCache, onCacheError, false);
				window.addEvent("progress", applicationCache, cacheProgressEvent, false);
				cacheLoadedFiles = 0
				window.applicationCache.update();
			}
		} else if (!this.cInterface.getAttribute("autoReload")) { // no autoreload, needs to be reloaded manually
			config.timestamp = manifestTimestamp;
			reloadCalled = false;
		} else { // reload now
			client.stop();
			//client.clearCookies();
			Sfera.Browser.reload();
		}
	}; // reload()

	// cache progress event
	function cacheProgressEvent(e) {
		if (e != null) try {
			// update the percent
			totalFiles = Number(e.total);
			cacheLoadedFiles = cacheLoadedFiles + 1;
			var progress = Math.round(cacheLoadedFiles / totalFiles * 100);

			self.showCachePercentage(progress);
		} catch (e) {}
	} // cacheProgressEvent()

	// check cache to see if we're ready to reload
	function checkCache() {
		// done
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY ||
			window.applicationCache.status == window.applicationCache.IDLE) {
			clearInterval(checkCacheInterval);
			//var weirdErr;
			try {
				window.applicationCache.swapCache();
			} catch (err) {
				console.log("Error on swapCache "+err.message);
				//weirdErr = (err.message == "Failed to execute 'swapCache' on 'ApplicationCache': there is no newer application cache to swap to.");
			}
			if (!self.cInterface.getAttribute("autoReload")) { // no autoreload, needs to be reloaded manually
				config.timestamp = manifestTimestamp;
				reloadCalled = false;
				statusIcon.set("cache",false);
			} else { // reload now
				client.stop();
				//client.clearCookies();
				Sfera.Browser.reload(true);
			}
		} else if (window.applicationCache.status == window.applicationCache.OBSOLETE) {
			// correct behaviour?
			onCacheError();
		}
	} // checkCache()

	// cache error
	function onCacheError() {
		clearInterval(checkCacheInterval);
		reloadCalled = false;
		self.reload();
	} // onCacheError()

};


/**
 * Debug obj
 *
 * @class Sfera.Debug
 * @constructor
 */
Sfera.Debug = new(function() {
    var self = this;

    this.verbose = false;

    this.boot = function() {
    };

    function log(type, txt, msg, data) {
        // head
        var h = Sfera.Utils.getDate("hisu")+" - ";

        if (Sfera.Device.chrome) {
            var a = [""]; // arguments

            a[0] += "%c"+h;
            a.push("color:#999");
            a[0] += "%c"+txt;
            switch (type) {
                case "msg": a.push("color:#000"); break;
                case "err": a.push("color:#e11"); break;
                case "not": a.push("color:#e8e"); break;
            }

            if (msg) {
                a[0] += " %c"+msg;
                a.push("color:#5a5");
            }
            if (this.verbose) {
                a[0] += " %c"+data;
                a.push("color:#55a");
            }

            console.log.apply(console, a);
        } else {
            console.log(h+txt,msg,data);
        }
    }

    this.log = function(txt, msg, data) {
        log("msg",txt,msg,data);
    };
    this.logError = function(txt, msg, data) {
        log("err",txt,msg,data);
    };
    this.logNotice = function(txt, msg, data) {
        if (this.verbose)
            log("not",txt,msg,data);
    };

    /**
     * Displays a Sfera version debug header in the console.
     *
     * @method Sfera.Client#showDebugHeader
     * @protected
     */
    this.showHeader = function() {
        var v = Sfera.VERSION;
        var u = "https://sferalabs.cc/sfera";

        if (Sfera.Device.chrome) {
            var a = [
                '%c %c %c Sfera v' + v + '  %c %c ' + '%c ' + u,
                'background: #afc4dc',
                'background: #6991bc',
                'color: #ffffff; background: #26609f;',
                'background: #6991bc',
                'background: #afc4dc',
                'background: #ffffff'
            ];
            console.log.apply(console, a);
        } else if (window.console) {
            console.log('Sfera v' + v + ' | ' + u);
        }
    };

})();


/**
 * Log obj
 *
 * @class Sfera.Log
 * @constructor
 */
Sfera.Log = new(function() {

    // logging levels
    // ALL < DEBUG < INFO < WARN < ERROR < FATAL < OFF
    this.ALL = 1;
    this.DEBUG = 2;
    this.INFO = 3;
    this.WARN = 4;
    this.ERROR = 5;
    this.FATAL = 6;
    this.OFF = 7;

    var _level = this.WARN;

    // set the level
    this.setLevel = function (level) {
        _level = level;
    };

})();


/**
 * Login obj
 *
 * @class Sfera.Login
 * @constructor
 */
Sfera.Login = new(function() {

    var checkTimeout = null;
    var checkMs = 500;
    var req;

    var action = "";

    var self = this;

    this.login = function (user, password) {
        if (!req)
            initReq();

        action = "login";

        resetCheck();

        user = user || Sfera.client.getAttribute("username","value");
        password = password || Sfera.client.getAttribute("password","value");

        req.open("/api/login?user=" + user + "&password=" + password + "&", 100);
    };

    this.logout = function () {
        if (!req)
            initReq();

        action = "logout";

        req.open("/api/logout", 100);
    };

    this.gotoLogin = function() {
        Sfera.Browser.setLocation("/"+Sfera.Browser.getLocation().interface+"/login");
    }

    this.gotoInterface = function() {
        Sfera.Browser.setLocation("/"+Sfera.Browser.getLocation().interface);
    }

    function initReq() {
        req = new Sfera.Net.Request();

        req.onLoaded = function(code) {
            clearTimeout(checkTimeout);

            if (code != 200) {
                Sfera.client.setAttribute("username","error","true");
                Sfera.client.setAttribute("password","error","true");
                return;
            }

            switch (action) {
            case "login":
            	self.gotoInterface();
            	break;
            case "logout":
                self.gotoLogin();
                break;
            }
        }
        req.onError = function(errCode) {
            Sfera.client.setAttribute("username","error","true");
            Sfera.client.setAttribute("password","error","true");
            resetCheck();
        }

    }

    function checkLogin() {
        // req.open("/api/login",100);
    }

    function resetCheck() {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkLogin, checkMs);
    }

    window.onload = function() {
        resetCheck(); // start now
    }

})();


/**
* A Signal is an event dispatch mechanism that supports broadcasting to multiple listeners.
*
* Event listeners are uniquely identified by the listener/callback function and the context.
*
* @class Sfera.Signal
* @constructor
*/
Sfera.Signal = function () {
};

Sfera.Signal.prototype = {

    /**
    * @property {?Array.<Sfera.SignalBinding>} _bindings - Internal variable.
    * @private
    */
    _bindings: null,

    /**
    * @property {any} _prevParams - Internal variable.
    * @private
    */
    _prevParams: null,

    /**
    * Memorize the previously dispatched event?
    *
    * If an event has been memorized it is automatically dispatched when a new listener is added with {@link #add} or {@link #addOnce}.
    * Use {@link #forget} to clear any currently memorized event.
    *
    * @property {boolean} memorize
    */
    memorize: false,

    /**
    * @property {boolean} _shouldPropagate
    * @private
    */
    _shouldPropagate: true,

    /**
    * Is the Signal active? Only active signals will broadcast dispatched events.
    *
    * Setting this property during a dispatch will only affect the next dispatch. To stop the propagation of a signal from a listener use {@link #halt}.
    *
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * @property {function} _boundDispatch - The bound dispatch function, if any.
    * @private
    */
    _boundDispatch: true,

    /**
    * @method Sfera.Signal#validateListener
    * @param {function} listener - Signal handler function.
    * @param {string} fnName - Function name.
    * @private
    */
    validateListener: function (listener, fnName) {

        if (typeof listener !== 'function')
        {
            throw new Error('Sfera.Signal: listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
        }

    },

    /**
    * @method Sfera.Signal#_registerListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {boolean} isOnce - Should the listener only be called once?
    * @param {object} [listenerContext] - The context under which the listener is invoked.
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0).
    * @return {Sfera.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    _registerListener: function (listener, isOnce, listenerContext, priority, args) {

        var prevIndex = this._indexOfListener(listener, listenerContext);
        var binding;

        if (prevIndex !== -1)
        {
            binding = this._bindings[prevIndex];

            if (binding.isOnce() !== isOnce)
            {
                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
            }
        }
        else
        {
            binding = new Sfera.SignalBinding(this, listener, isOnce, listenerContext, priority, args);
            this._addBinding(binding);
        }

        if (this.memorize && this._prevParams)
        {
            binding.execute(this._prevParams);
        }

        return binding;

    },

    /**
    * @method Sfera.Signal#_addBinding
    * @private
    * @param {Sfera.SignalBinding} binding - An Object representing the binding between the Signal and listener.
    */
    _addBinding: function (binding) {

        if (!this._bindings)
        {
            this._bindings = [];
        }

        //  Simplified insertion sort
        var n = this._bindings.length;

        do {
            n--;
        }
        while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);

        this._bindings.splice(n + 1, 0, binding);

    },

    /**
    * @method Sfera.Signal#_indexOfListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {object} [context=null] - Signal handler function.
    * @return {number} The index of the listener within the private bindings array.
    */
    _indexOfListener: function (listener, context) {

        if (!this._bindings)
        {
            return -1;
        }

        if (context === undefined) { context = null; }

        var n = this._bindings.length;
        var cur;

        while (n--)
        {
            cur = this._bindings[n];

            if (cur._listener === listener && cur.context === context)
            {
                return n;
            }
        }

        return -1;

    },

    /**
    * Check if a specific listener is attached.
    *
    * @method Sfera.Signal#has
    * @param {function} listener - Signal handler function.
    * @param {object} [context] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    * @return {boolean} If Signal has the specified listener.
    */
    has: function (listener, context) {

        return this._indexOfListener(listener, context) !== -1;

    },

    /**
    * Add an event listener for this signal.
    *
    * An event listener is a callback with a related context and priority.
    *
    * You can optionally provide extra arguments which will be passed to the callback after any internal parameters.
    *
    * For example: `Sfera.Key.onDown` when dispatched will send the Sfera.Key object that caused the signal as the first parameter.
    * Any arguments you've specified after `priority` will be sent as well:
    *
    * `fireButton.onDown.add(shoot, this, 0, 'lazer', 100);`
    *
    * When onDown dispatches it will call the `shoot` callback passing it: `Sfera.Key, 'lazer', 100`.
    *
    * Where the first parameter is the one that Key.onDown dispatches internally and 'lazer',
    * and the value 100 were the custom arguments given in the call to 'add'.
    *
    * @method Sfera.Signal#add
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Sfera.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    add: function (listener, listenerContext, priority) {

        this.validateListener(listener, 'add');

        var args = [];

        if (arguments.length > 3)
        {
            for (var i = 3; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
        }

        return this._registerListener(listener, false, listenerContext, priority, args);

    },

    /**
    * Add a one-time listener - the listener is automatically removed after the first execution.
    *
    * If there is as {@link Sfera.Signal#memorize memorized} event then it will be dispatched and
    * the listener will be removed immediately.
    *
    * @method Sfera.Signal#addOnce
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Sfera.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    addOnce: function (listener, listenerContext, priority) {

        this.validateListener(listener, 'addOnce');

        var args = [];

        if (arguments.length > 3)
        {
            for (var i = 3; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
        }

        return this._registerListener(listener, true, listenerContext, priority, args);

    },

    /**
    * Remove a single event listener.
    *
    * @method Sfera.Signal#remove
    * @param {function} listener - Handler function that should be removed.
    * @param {object} [context=null] - Execution context (since you can add the same handler multiple times if executing in a different context).
    * @return {function} Listener handler function.
    */
    remove: function (listener, context) {

        this.validateListener(listener, 'remove');

        var i = this._indexOfListener(listener, context);

        if (i !== -1)
        {
            this._bindings[i]._destroy(); //no reason to a Sfera.SignalBinding exist if it isn't attached to a signal
            this._bindings.splice(i, 1);
        }

        return listener;

    },

    /**
    * Remove all event listeners.
    *
    * @method Sfera.Signal#removeAll
    * @param {object} [context=null] - If specified only listeners for the given context will be removed.
    */
    removeAll: function (context) {

        if (context === undefined) { context = null; }

        if (!this._bindings)
        {
            return;
        }

        var n = this._bindings.length;

        while (n--)
        {
            if (context)
            {
                if (this._bindings[n].context === context)
                {
                    this._bindings[n]._destroy();
                    this._bindings.splice(n, 1);
                }
            }
            else
            {
                this._bindings[n]._destroy();
            }
        }

        if (!context)
        {
            this._bindings.length = 0;
        }

    },

    /**
    * Gets the total number of listeners attached to this Signal.
    *
    * @method Sfera.Signal#getNumListeners
    * @return {integer} Number of listeners attached to the Signal.
    */
    getNumListeners: function () {

        return this._bindings ? this._bindings.length : 0;

    },

    /**
    * Stop propagation of the event, blocking the dispatch to next listener on the queue.
    *
    * This should be called only during event dispatch as calling it before/after dispatch won't affect another broadcast.
    * See {@link #active} to enable/disable the signal entirely.
    *
    * @method Sfera.Signal#halt
    */
    halt: function () {

        this._shouldPropagate = false;

    },

    /**
    * Dispatch / broadcast the event to all listeners.
    *
    * To create an instance-bound dispatch for this Signal, use {@link #boundDispatch}.
    *
    * @method Sfera.Signal#dispatch
    * @param {any} [params] - Parameters that should be passed to each handler.
    */
    dispatch: function () {

        if (!this.active || !this._bindings)
        {
            return;
        }

        var paramsArr = Array.prototype.slice.call(arguments);
        var n = this._bindings.length;
        var bindings;

        if (this.memorize)
        {
            this._prevParams = paramsArr;
        }

        if (!n)
        {
            //  Should come after memorize
            return;
        }

        bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
        this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

        //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
        //reverse loop since listeners with higher priority will be added at the end of the list
        do {
            n--;
        }
        while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);

    },

    /**
    * Forget the currently {@link Sfera.Signal#memorize memorized} event, if any.
    *
    * @method Sfera.Signal#forget
    */
    forget: function() {

        if (this._prevParams)
        {
            this._prevParams = null;
        }

    },

    /**
    * Dispose the signal - no more events can be dispatched.
    *
    * This removes all event listeners and clears references to external objects.
    * Calling methods on a disposed objects results in undefined behavior.
    *
    * @method Sfera.Signal#dispose
    */
    dispose: function () {

        this.removeAll();

        this._bindings = null;
        if (this._prevParams)
        {
            this._prevParams = null;
        }

    },

    /**
    * A string representation of the object.
    *
    * @method Sfera.Signal#toString
    * @return {string} String representation of the object.
    */
    toString: function () {

        return '[Sfera.Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';

    }

};

/**
* Create a `dispatch` function that maintains a binding to the original Signal context.
*
* Use the resulting value if the dispatch function needs to be passed somewhere
* or called independently of the Signal object.
*
* @memberof Sfera.Signal
* @property {function} boundDispatch
*/
Object.defineProperty(Sfera.Signal.prototype, "boundDispatch", {

    get: function () {
        var _this = this;
        return this._boundDispatch || (this._boundDispatch = function () {
            return _this.dispatch.apply(_this, arguments);
        });
    }

});

Sfera.Signal.prototype.constructor = Sfera.Signal;


/**
* Object that represents a binding between a Signal and a listener function.
* This is an internal constructor and shouldn't be created directly.
* Inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
*
* @class Sfera.SignalBinding
* @constructor
* @param {Sfera.Signal} signal - Reference to Signal object that listener is currently bound to.
* @param {function} listener - Handler function bound to the signal.
* @param {boolean} isOnce - If binding should be executed just once.
* @param {object} [listenerContext=null] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
* @param {number} [priority] - The priority level of the event listener. (default = 0).
* @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
*/
Sfera.SignalBinding = function (signal, listener, isOnce, listenerContext, priority, args) {

    /**
    * @property {Sfera.Game} _listener - Handler function bound to the signal.
    * @private
    */
    this._listener = listener;

    if (isOnce)
    {
        this._isOnce = true;
    }

    if (listenerContext != null) /* not null/undefined */
    {
        this.context = listenerContext;
    }

    /**
    * @property {Sfera.Signal} _signal - Reference to Signal object that listener is currently bound to.
    * @private
    */
    this._signal = signal;

    if (priority)
    {
        this._priority = priority;
    }

    if (args && args.length)
    {
        this._args = args;
    }

};

Sfera.SignalBinding.prototype = {

    /**
    * @property {?object} context - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    */
    context: null,

    /**
    * @property {boolean} _isOnce - If binding should be executed just once.
    * @private
    */
    _isOnce: false,

    /**
    * @property {number} _priority - Listener priority.
    * @private
    */
    _priority: 0,

    /**
    * @property {array} _args - Listener arguments.
    * @private
    */
    _args: null,

    /**
    * @property {number} callCount - The number of times the handler function has been called.
    */
    callCount: 0,

    /**
    * If binding is active and should be executed.
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute` (curried parameters).
    * @property {array|null} params
    * @default
    */
    params: null,

    /**
    * Call listener passing arbitrary parameters.
    * If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.
    * @method Sfera.SignalBinding#execute
    * @param {any[]} [paramsArr] - Array of parameters that should be passed to the listener.
    * @return {any} Value returned by the listener.
    */
    execute: function(paramsArr) {

        var handlerReturn, params;

        if (this.active && !!this._listener)
        {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;

            if (this._args)
            {
                params = params.concat(this._args);
            }

            handlerReturn = this._listener.apply(this.context, params);

            this.callCount++;

            if (this._isOnce)
            {
                this.detach();
            }
        }

        return handlerReturn;

    },

    /**
    * Detach binding from signal.
    * alias to: @see mySignal.remove(myBinding.getListener());
    * @method Sfera.SignalBinding#detach
    * @return {function|null} Handler function bound to the signal or `null` if binding was previously detached.
    */
    detach: function () {
        return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
    },

    /**
    * @method Sfera.SignalBinding#isBound
    * @return {boolean} True if binding is still bound to the signal and has a listener.
    */
    isBound: function () {
        return (!!this._signal && !!this._listener);
    },

    /**
    * @method Sfera.SignalBinding#isOnce
    * @return {boolean} If SignalBinding will only be executed once.
    */
    isOnce: function () {
        return this._isOnce;
    },

    /**
    * @method Sfera.SignalBinding#getListener
    * @return {function} Handler function bound to the signal.
    */
    getListener: function () {
        return this._listener;
    },

    /**
    * @method Sfera.SignalBinding#getSignal
    * @return {Sfera.Signal} Signal that listener is currently bound to.
    */
    getSignal: function () {
        return this._signal;
    },

    /**
    * Delete instance properties
    * @method Sfera.SignalBinding#_destroy
    * @private
    */
    _destroy: function () {
        delete this._signal;
        delete this._listener;
        delete this.context;
    },

    /**
    * @method Sfera.SignalBinding#toString
    * @return {string} String representation of the object.
    */
    toString: function () {
        return '[Sfera.SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
    }

};

Sfera.SignalBinding.prototype.constructor = Sfera.SignalBinding;


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


/**
 * Sfera.Net handles browser URL related tasks such as checking host names, domain names and query string manipulation.
 *
 * @class Sfera.Net
 * @constructor
 */
Sfera.Net = new (function() {
    var req;

    var webSocket;
    var wsConnected = false;

    var httpConnected = false;

    var self = this;
    var httpBaseUrl = "/";
    var apiBaseUrl = "api/";

    var pingInterval;
    var responseTimeout;
    var connCheckTimeoutId;

    var cSync = ""; // currently synchronizing resource

    var self = this;

    var wsOptions = {
        // the number of milliseconds to delay before attempting to reconnect.
    	reconnectInterval: 50,
    	// the maximum number of milliseconds to delay a reconnection attempt.
    	maxReconnectInterval: 5000,
    	// the rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
    	reconnectDecay: 1.25,
    };
    var wsConnectTimeout;
    var wsTimeoutMs; // current timeout in ms

    var location = {};

    this.connectionId = null;
    this.stateTs = -1;
    this.subscribed = false; // change this

    // local timestamps, to check required updates
    this.localTs = {
        "dictionary": -1,
        "index": -1
    };

    this.remoteTs = {
        "dictionary": -1,
        "index": -1
    };

    // signals
    this.onOpen = new Sfera.Signal();
    this.onClose = new Sfera.Signal();
    this.onConnection = new Sfera.Signal();
    this.onMessage = new Sfera.Signal();
    this.onEvent = new Sfera.Signal();
    this.onReply = new Sfera.Signal();
    this.onConsole = new Sfera.Signal();
    this.onUpdateDictionary = new Sfera.Signal();
    this.onUpdateIndex = new Sfera.Signal();

    // getURL function
    this.getURL = function(name, options) {
        // options has priority
        if (!options)
            options = {};
        for (var i in location) {
            if (options[i] == null)
                options[i] = location[i];
        }
        options.connectionId = this.connectionId;
        options.stateTs = Sfera.client?Sfera.client.stateTs:null;

    	switch (name) {
    	case "dictionary":  return options.interface+(options.login?"/login":"")+"/dictionary.xml";
    	case "index" :      return options.interface+(options.login?"/login":"")+"/index.xml";

        case "connect" :    return apiBaseUrl+"connect";
    	case "subscribe" :  return apiBaseUrl+"subscribe?cid="+(options.connectionId?options.connectionId:"");
    	case "state" :      return apiBaseUrl+"state/"+options.connectionId+"?ts="+options.stateTs;
        case "command":     return apiBaseUrl+"command";
        case "event":       return apiBaseUrl+"event";

        case "websocket":   return (options.protocol == "https:" ? "wss:" : "ws:")+
                                    "//"+options.host+"/"+apiBaseUrl+"websocket";

        case "check":       return options.interface+"/login/index.xml";
        }
	};

    this.boot = function () {
        location = Sfera.Browser ? Sfera.Browser.getLocation() : {};
    };

    function onWsOpen(event) {
        // onopen gets called twice and the first time event.data is undefined. TODO:check
        //if (event.data === undefined)
        //    return;

        self.onOpen.dispatch(event.data);
        Sfera.Debug.log("ws open", event.data);
    }

    function onWsMessage(event) {
        if (event.data == "&") {
            Sfera.Debug.logNotice("ws ping");
            resetConnCheckTimeout();
            self.wsSend("&");
        } else {
            self.onMessage.dispatch(event.data);
            Sfera.Debug.log("ws msg", event.data);
            json = JSON.parse(event.data);

            // {"type":"event","events":{"remote.myvalue":"5","system.plugins":"reload","remote.":"undefined","system.state":"ready"}}
            switch (json.type) {
                case "reply":
                    self.onReply.dispatch(json);
                    break;
                case "connection":
                    if (!json.errors) {
                        // connection valid: reset timeout
                        clearTimeout(wsConnectTimeout);
                        wsTimeoutMs = null;

                        self.onConnection.dispatch(json);
                        self.connectionId = json.connectionId;
                        pingInterval = parseInt(json.pingInterval);
                        responseTimeout = parseInt(json.responseTimeout);
                        resetConnCheckTimeout();
                        wsConnected = true;
                    }
                    break;
                case "console":
                    self.onConsole.dispatch(json);
                    break;
                case "event":
                    self.onEvent.dispatch(json);
                    break;
            }
        }
    }

    function onWsError(event) {
        self.wsOpen (wsTimeoutMs); // reopen
    }

    function getWsCloseReason(code) {
        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
        switch (code) {
            case 1000:
                return  "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
            case 1001:
                return  "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            case 1002:
                return  "An endpoint is terminating the connection due to a protocol error";
            case 1003:
                return  "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
            case 1004:
                return  "Reserved. The specific meaning might be defined in the future.";
            case 1005:
                return  "No status code was actually present.";
            case 1006:
                return  "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            case 1007:
                return  "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
            case 1008:
                return  "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
            case 1009:
                return  "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
            case 1010:  // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                return  "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            case 1011:
                return  "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
            case 1015:
                return  "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
        }
        return  "Unknown reason";
    }

    function onWsClose(event) {
        wsConnected = false;

        if (event.code != 1000) // normal closure
            Sfera.Debug.logError("ws closed", event.reason, event.code);
        else
            Sfera.Debug.log("ws closed", event.reason, event.code);

        //var reason = event.code + " - " + getWsCloseReason(event.code);

        self.onClose.dispatch(event.code,event.reason);

        if (event.reason == "Unauthorized" && Sfera.Login && !location.login) { //code 1008
            cSync = "check"; // check if login is available
            self.request(httpBaseUrl + self.getURL(cSync));
        } else {
            self.wsOpen (wsTimeoutMs); // reopen
        }
    }

    // public methods
    this.wsOpen  = function(wait) {
        if (wait) {
            clearTimeout(wsConnectTimeout);
            wsConnectTimeout = setTimeout(this.wsOpen.bind(this), wait);
            return;
        }

        var url = self.getURL("websocket");

        Sfera.Debug.log("ws opening on " + url);
        // ensure only one connection is open at a time
        if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
            Sfera.Debug.logError("websocket: is already opened");
            return;
        }
        // create a new instance of the websocket
        if (this.connectionId != null)
            url += "?cid="+this.connectionId;
        webSocket = new WebSocket(url);

        // associate events
        webSocket.onopen = onWsOpen;
        webSocket.onmessage = onWsMessage;
        webSocket.onclose = onWsClose;
        webSocket.onerror = onWsError;

        // wsTimeout
        updateWSTimeout();
    }
    this.wsSend = function(txt) {
        if (txt == "&")
            Sfera.Debug.logNotice("ws pong");
        else
            Sfera.Debug.log("ws send", txt);
        webSocket.send(txt);
    }
    this.wsClose = function() {
        webSocket.close();
    }

    function updateWSTimeout() {
        if (!wsTimeoutMs) {
            wsTimeoutMs = wsOptions.reconnectInterval;
        } else {
            wsTimeoutMs *= wsOptions.reconnectDecay;
            if (wsTimeoutMs > wsOptions.maxReconnectInterval)
                wsTimeoutMs = wsOptions.maxReconnectInterval;
        }
    }

    function resetConnCheckTimeout() {
        clearTimeout(connCheckTimeoutId);
        setTimeout(this.wsClose, pingInterval + responseTimeout);
    }
    // get current timestamp
    function getTimestamp() {
        return (new Date()).getTime();
    }

    // request resource
    this.request = function(url) {
        if (!req) {
            req = new Sfera.Net.Request()
            req.onLoaded = onReqLoaded;
            req.onError = onReqError;
        }

        req.open(url, 20);
    };

    // connect
    this.connect = function(options) {
        this.sync();
    }; // connect()

    // sync, if necessary
    this.sync = function() {
        for (var s in this.localTs) {
            if (this.localTs[s] == -1) { // || this.localTs[s] < this.remoteTs[s]) {
                cSync = s;
                this.request(httpBaseUrl + self.getURL(s));
                return; // one resource per time
            }
        }

        // use websockets?
        if (true) {
            self.wsOpen ();
            return;
        }

        if (!this.connectionId) {
            cSync = "connect";
            this.request(httpBaseUrl + self.getURL("connect"));
            return;
        }

        if (!this.subscribed) {
            cSync = "subscribe";

            this.request(httpBaseUrl + self.getURL("subscribe")+"&nodes=*");
            return;
        }

        cSync = "state";
        this.request(httpBaseUrl + self.getURL("state"));
    };

    function onReqLoaded() {
        Sfera.Debug.log(cSync + " loaded", "", req.getResponseText());

        if (self.localTs[cSync] != null)
            self.localTs[cSync] = getTimestamp();

        var state;

        switch (cSync) {
            case "dictionary":
                self.onUpdateDictionary.dispatch(req.getResponseXML())
                break;
            case "index":
                self.onUpdateIndex.dispatch(req.getResponseXML());
                break;

            case "connect":
                self.connectionId = req.getResponseJSON().cid;
                break;

            case "subscribe":
                self.subscribed = true;

            case "state":
                state = JSON.parse(req.getResponseText());
                if (state.timestamp)
                    self.stateTs = state.timestamp;
                break;

            // check if interface is available (load login index)
            case "check":
                Sfera.Login.gotoLogin();
                break;
        }

        self.sync();
    }

    function onReqError(errCode) {
        Sfera.Debug.logError("request error");
        if (errCode == 404)
            req.repeat(100);
    }

    this.nodeSubscribe = function (nodes) {
        var tag = (new Date()).getTime(); // request id
        var r = {
            action: "subscribe",
            nodes: nodes,
            tag: tag
        };

        this.wsSend(JSON.stringify(r));
    };

    /**
     * Returns the hostname given by the browser.
     *
     * @method Sfera.Net#getHostName
     * @return {string}
     */
    this.getHostName = function() {

        if (window.location && window.location.hostname) {
            return window.location.hostname;
        }

        return null;
    };

    this.sendCommand = function(req) {
        var r = {
            action: "command",
            cmd: req.command,
            tag: req.tag || (new Date()).getTime()
        };
        this.wsSend(JSON.stringify(r));
    };

    this.sendEvent = function(req) {
        var r = {
            action: "event",
            id: req.id,
            value: req.value,
            tag: req.tag || (new Date()).getTime()
        };
        this.wsSend(JSON.stringify(r));

    };

    this.sendConsole = function(req) {
        var r = {
            action: "console",
            cmd: req.command,
            tag: req.tag || (new Date()).getTime()
        };
        this.wsSend(JSON.stringify(r));

    };


})();


Sfera.Net = Sfera.Net || {};
/**
 * Request class
 * @constructor
 */
Sfera.Net.Request = function (options) {
	options = options || {};

	/*
	// The number of milliseconds to delay before attempting to reconnect.
	reconnectInterval: 1000,
	// The maximum number of milliseconds to delay a reconnection attempt.
	maxReconnectInterval: 30000,
	// The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
	reconnectDecay: 1.5,

	// The maximum time in milliseconds to wait for a connection to succeed before closing and retrying.
	timeoutInterval: 2000,

	// The maximum number of reconnection attempts to make. Unlimited if null.
	maxReconnectAttempts: null
	*/

	var req = null; // request

	var status; // -1: aborted, 0: ready, 1:loading, 2:loaded

	var reqTimeout = null; // trigger timeout
	this.url = "";

	this.method = options.method || "GET";
	this.formData = null; // in case of POST

	// custom event handlers
	this.onLoaded = null; // needed
	this.onStop = null; // when request is stopped. called with true if loading, false if reqTimeout
	this.onRetry = null; // before retrying on error
	this.onError = null; // any error not captured by custom error handlers
	this.onRequest = null; // when sending request

	// custom error handlers
	this.onConnectionError = null; // connection error
	this.onUnauthorized = null; //

	this.maxWaitingTime = 0; // 0 nothing, msec to wait for an answer, else abort
	var waitTimeout = null; // abort after maxWaitingTime

	this.retryOnErrorDelay = 0; // retry delay msec (on any error), 0 does not retry
	this.maxRetries = 0; // max n of retries. after that, stops and fires onError event(s). if maxRetries is 0, custom onError event is never fired
	this.retries = 0; // current retry attempt

	var self = this; // variable scope

	// errors
	this.ERROR_GENERAL = 0;
	this.ERROR_CONNECTION = 1;
	this.ERROR_MAXWAITTIME = 2;
	this.ERROR_UNAUTHORIZED = 401;
	this.ERROR_FORBIDDEN = 403;
	this.ERROR_NOT_FOUND = 404;

	this.init = function () {
		status = 0; // ready
		// init req
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
			req.onreadystatechange = onReadyStateChange;

			// progress
			if (req.upload) {
				req.upload.addEventListener('progress', onProgress);
			}
		}
		// branch for IE/Windows ActiveX version
		else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
			if (req) {
				req.onreadystatechange = onReadyStateChange;
			}
		}
	}

	this.addData = function(name, value) {
		if (!this.formData)
			this.formData = new FormData();

		this.formData.append(name, value);
	}

	// open url. url optional (no url:repeat). ms optional (ms:delay request)
	this.open = function (url, ms) {
		if (status == 1) // loading?
			self.stop();
		status = 0; // ready
		if (url) { // no url? repeat last one stored
			self.url = url;
			self.retries = 0; // reset retries
		}
		if (reqTimeout) {
			clearTimeout(reqTimeout);
			reqTimeout = null;
		}
		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}
		if (ms) {
			reqTimeout = setTimeout(self.open, ms);
			return;
		}
		if (!req) self.init();

		status = 1; // loading
		if (self.onRequest)
			self.onRequest();
		try {
			req.open(self.method, self.url, true);
		} catch (err) {
			// If document is not fully active, throw an "InvalidStateError" exception and terminate the overall set of steps.
			// URL relative to base. If the algorithm returns an error, throw a "SyntaxError" exception and terminate these steps.
			onError(self.ERROR_GENERAL);
			return;
		}

		if (self.method == "GET") {
			//req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.send();
		} else {
			var boundary=Math.random().toString().substr(2);
			//req.setRequestHeader("content-type", "multipart/form-data; charset=utf-8;");
			req.send(self.formData);
		}

		// wait timeout
		if (self.maxWaitingTime) {
			waitTimeout = setTimeout(onWaitTimeout, self.maxWaitingTime);
		}
	}

	this.stop = function () {
		// on stop handler if loading, or about to load
		if (status == 1 || reqTimeout) {
			if (this.onStop)
				this.onStop(status == 1);
		}
		if (status == 1) { // loading
			status = -1; // stopped
			req.abort(); // will fire onReadyStateChange, status != 1, returns
			this.init(); // reinitialize req every time we abort
		}
		if (reqTimeout) {
			clearTimeout(reqTimeout);
			reqTimeout = null;
		}
		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}
		status = 0; // ready
	}

	// repeat. ms delay before repeating
	this.repeat = function (ms) {
		this.open(null, ms);
	}

	function onWaitTimeout() {
		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}
		status = -1; // aborted
		req.abort(); // will fire onReadyStateChange, status != 1, returns
		onError(self.ERROR_MAXWAITTIME);
		self.init(); // reinitialize req every time we abort
	}

	function onReadyStateChange() {
		// check readyState
		if (req.readyState == null) return; // does it ever happen?
		switch (req.readyState) {
		case 0: // unsent
		case 1: // open called, send not called
			//self.open(); // retry?
			return;
		case 2: // headers received, still receiving
		case 3: // loading
			return; // not ready
		case 4: // done, completed or error
			// continue
		}

		if (waitTimeout) {
			clearTimeout(waitTimeout);
			waitTimeout = null;
		}

		// loading? (if aborted it's -1)
		if (status != 1) return;
		status = 2;

		// not "OK"
		if (req.status != 200) {
			onError(req.status);
			return;
		}

		// clear form data
		self.formData = null;

		// get response text
		var res = "";
		try {
			res = req.responseText;
		} catch (err) {
			// If responseType is not the empty string or "text", throw an "InvalidStateError" exception.
			onError(self.ERROR_GENERAL);
			return;
		}

		if (self.onLoaded)
			self.onLoaded.call(self, req.status);
	}

	// called when uploading
	function onProgress(e) {
		if (self.onProgress)
			self.onProgress(e);
	}

	// on error. called for every error (but not on stop > abort)
	function onError(errCode) {
		// specific errors, if there's a custom handler it won't repeat automatically
		switch (errCode) {
		case self.ERROR_UNAUTHORIZED:
			if (self.onUnauthorized) {
				self.onUnauthorized();
				return;
			}
			break;
		}
		if (errCode >= 400 && self.onConnectionError) {
			self.onConnectionError();
			return;
		}
		// repeat?
		if (self.retryOnErrorDelay) {
			if (!self.maxRetries || self.retries < self.maxRetries) {
				self.retries++;
				if (self.onRetry) // before repeating, so we can change the retryOnErrorDelay
					self.onRetry();
				if (self.retryOnErrorDelay) {// could be changed by onRetry
					self.repeat(self.retryOnErrorDelay);
					return;
				}
			}
		}

		// clear form data
		self.formData = null;

		// no custom handlers, no (more) retries. generic error callback
		if (self.onError)
			self.onError(errCode);
	}

	// json getter
	this.getResponseJSON = function () {
		var res = this.getResponseText();
		if (res)
			return JSON.parse(res);
		else
			return null;
	}

	// text getter
	this.getResponseText = function () {
		var res = "";
		try {
			res = req.responseText;
			return res;
		} catch (err) { // If responseType is not the empty string or "text", throw an "InvalidStateError" exception.
			return null;
		}
	}

	// xml getter
	this.getResponseXML = function () {
		var res = "";
		try {
			res = req.responseXML;
			return res;
		} catch (err) { // If responseType is not the empty string or "document", throw an "InvalidStateError" exception.
			return null;
		}
	}

	// is loading?
	this.isReady = function () {
		return status != 1;
	}
};


/**
* Sfera.Skins contains and handles skins
*
* @class Sfera.Skins
* @constructor
* @param {Sfera.Client} client - A reference to the current client.
*/
Sfera.Skins = function (client) {

    this.client = client;

};


/**
 * Browser singleton
 */
Sfera.Browser = new (function() {
    var location;

    this.reload = function() {
        window.location.reload();
    };

    this.setLocation = function(url) {
        window.location.replace(url);
    };

    // prevent default event
	this.preventDefault = function (evt) {
        if (evt.stopPropagation)
            evt.stopPropagation();
		if (evt.returnValue)
			evt.returnValue = false;
		if (evt.preventDefault)
			evt.preventDefault();
	}

    /**
     * Change the browser tab URL without reloading (if supported)
     * @param  {string} title - Title of the page
     * @param  {string} url   - URL of the page
     * @return {boolean}      - true if successful, false otherwise
     */
    this.changeUrl = function(title, url) {
        if (typeof(history.pushState) != "undefined") {
            var obj = {
                Title: title,
                Url: url
            };
            history.pushState(obj, obj.Title, obj.Url);
            return true;
        }
        return false;
    };

    this.updateUrl = function(pageId, pageTitle) {
        var location = this.getLocation();
        hash = pageId == "page:home"?"":pageId;
        document.title = pageTitle;
        if (location.hash != hash) {
            lastHash = hash; // so the interval won't detect the change
            var url = location.pathname + "#" + pageId;
            if (pageId && location.search)
                url += "?" + location.search
            this.changeUrl(pageTitle, url);
        }
    };

    this.getLocation = function() {
        var url = window.location.href; // "http://localhost:8080/new/index.html#page1?a=2"

        if (!location || location.url != url) {
            var hash = window.location.hash, // #page1
                search = window.location.search, // ?a=2
                a;

            if (hash) {
                if (hash[0] == '#')
                    hash = hash.substr(1); // remove #
                if (hash.indexOf("?") != -1) {
                    a = hash.split("?");
                    hash = a[0];
                    search = a[1];
                }
            }
            if (search) {
                if (search[0] == '?')
                    search = search.substr(1); // remove ?
                if (search.indexOf("#") != -1) {
                    a = search.split("#");
                    search = a[0];
                    hash = a[1];
                }
            }

            var sp = window.location.pathname.split("/");

            location = {
                url: url,
                host: window.location.host, // "localhost:8080"
                protocol: window.location.protocol, // http:
                pathname: window.location.pathname, // /new/index.html
                hash: hash, // #page1
                search: search, // ?a=2
                interface: sp[1], // new
                login: sp[2] == "login" // login page?
            };
        }

        return location;
    }

    var lastHash = null;
    var self = this;

    this.start = function() {
        setInterval(function() {
            var location = Sfera.Browser.getLocation();
            var locHash = location.hash == "page:home"?"":location.hash
            if (locHash !== lastHash) {
                lastHash = locHash;
                Sfera.client.showPage(location.hash ? location.hash : "home");
                //alert("User went back or forward to application state represented by " + hash);
            }
        }, 100);
    };
})();


/**
* @classdesc
* Detects device support capabilities and is responsible for device intialization - see {@link Sfera.Device.whenReady whenReady}.
*
* This class represents a singleton object that can be accessed directly as `client.device`
* (or, as a fallback, `Sfera.Device` when a client instance is not available) without the need to instantiate it.
*
* Unless otherwise noted the device capabilities are only guaranteed after initialization. Initialization
* occurs automatically and is guaranteed complete before {@link Sfera.client} begins its "boot" phase.
* Feature detection can be modified in the {@link Sfera.Device.onInitialized onInitialized} signal.
*
* When checking features using the exposed properties only the *truth-iness* of the value should be relied upon
* unless the documentation states otherwise: properties may return `false`, `''`, `null`, or even `undefined`
* when indicating the lack of a feature.
*
* Uses elements from System.js by MrDoob and Modernizr
*
* @description
* It is not possible to instantiate the Device class manually.
*
* @class
* @protected
*/
Sfera.Device = function () {

    /**
    * The time the device became ready.
    * @property {integer} deviceReadyAt
    * @protected
    */
    this.deviceReadyAt = 0;

    /**
    * The time as which initialization has completed.
    * @property {boolean} initialized
    * @protected
    */
    this.initialized = false;

    //  Browser / Host / Operating System

    /**
    * @property {boolean} desktop - Is running on a desktop?
    * @default
    */
    this.desktop = false;

    /**
    * @property {boolean} iOS - Is running on iOS?
    * @default
    */
    this.iOS = false;

    /**
    * @property {boolean} cocoonJS - Is the client running under CocoonJS?
    * @default
    */
    this.cocoonJS = false;

    /**
    * @property {boolean} cocoonJSApp - Is this client running with CocoonJS.App?
    * @default
    */
    this.cocoonJSApp = false;

    /**
    * @property {boolean} cordova - Is the client running under Apache Cordova?
    * @default
    */
    this.cordova = false;

    /**
    * @property {boolean} node - Is the client running under Node.js?
    * @default
    */
    this.node = false;

    /**
    * @property {boolean} nodeWebkit - Is the client running under Node-Webkit?
    * @default
    */
    this.nodeWebkit = false;

    /**
    * @property {boolean} electron - Is the client running under GitHub Electron?
    * @default
    */
    this.electron = false;

    /**
    * @property {boolean} ejecta - Is the client running under Ejecta?
    * @default
    */
    this.ejecta = false;

    /**
    * @property {boolean} crosswalk - Is the client running under the Intel Crosswalk XDK?
    * @default
    */
    this.crosswalk = false;

    /**
    * @property {boolean} android - Is running on android?
    * @default
    */
    this.android = false;

    /**
    * @property {boolean} chromeOS - Is running on chromeOS?
    * @default
    */
    this.chromeOS = false;

    /**
    * @property {boolean} linux - Is running on linux?
    * @default
    */
    this.linux = false;

    /**
    * @property {boolean} macOS - Is running on macOS?
    * @default
    */
    this.macOS = false;

    /**
    * @property {boolean} windows - Is running on windows?
    * @default
    */
    this.windows = false;

    /**
    * @property {boolean} windowsPhone - Is running on a Windows Phone?
    * @default
    */
    this.windowsPhone = false;

    //  Features

    /**
    * @property {boolean} canvas - Is canvas available?
    * @default
    */
    this.canvas = false;

    /**
    * @property {?boolean} canvasBitBltShift - True if canvas supports a 'copy' bitblt onto itself when the source and destination regions overlap.
    * @default
    */
    this.canvasBitBltShift = null;

    /**
    * @property {boolean} webGL - Is webGL available?
    * @default
    */
    this.webGL = false;

    /**
    * @property {boolean} file - Is file available?
    * @default
    */
    this.file = false;

    /**
    * @property {boolean} fileSystem - Is fileSystem available?
    * @default
    */
    this.fileSystem = false;

    /**
    * @property {boolean} localStorage - Is localStorage available?
    * @default
    */
    this.localStorage = false;

    /**
    * @property {boolean} worker - Is worker available?
    * @default
    */
    this.worker = false;

    /**
    * @property {boolean} css3D - Is css3D available?
    * @default
    */
    this.css3D = false;

    /**
    * @property {boolean} pointerLock - Is Pointer Lock available?
    * @default
    */
    this.pointerLock = false;

    /**
    * @property {boolean} typedArray - Does the browser support TypedArrays?
    * @default
    */
    this.typedArray = false;

    /**
    * @property {boolean} vibration - Does the device support the Vibration API?
    * @default
    */
    this.vibration = false;

    /**
    * @property {boolean} getUserMedia - Does the device support the getUserMedia API?
    * @default
    */
    this.getUserMedia = true;

    /**
    * @property {boolean} quirksMode - Is the browser running in strict mode (false) or quirks mode? (true)
    * @default
    */
    this.quirksMode = false;

    //  Input

    /**
    * @property {boolean} touch - Is touch available?
    * @default
    */
    this.touch = false;

    /**
    * @property {boolean} mspointer - Is mspointer available?
    * @default
    */
    this.mspointer = false;

    /**
    * @property {?string} wheelType - The newest type of Wheel/Scroll event supported: 'wheel', 'mousewheel', 'DOMMouseScroll'
    * @default
    * @protected
    */
    this.wheelEvent = null;

    //  Browser

    /**
    * @property {boolean} arora - Set to true if running in Arora.
    * @default
    */
    this.arora = false;

    /**
    * @property {boolean} chrome - Set to true if running in Chrome.
    * @default
    */
    this.chrome = false;

    /**
    * @property {number} chromeVersion - If running in Chrome this will contain the major version number.
    * @default
    */
    this.chromeVersion = 0;

    /**
    * @property {boolean} epiphany - Set to true if running in Epiphany.
    * @default
    */
    this.epiphany = false;

    /**
    * @property {boolean} firefox - Set to true if running in Firefox.
    * @default
    */
    this.firefox = false;

    /**
    * @property {number} firefoxVersion - If running in Firefox this will contain the major version number.
    * @default
    */
    this.firefoxVersion = 0;

    /**
    * @property {boolean} ie - Set to true if running in Internet Explorer.
    * @default
    */
    this.ie = false;

    /**
    * @property {number} ieVersion - If running in Internet Explorer this will contain the major version number. Beyond IE10 you should use Device.trident and Device.tridentVersion.
    * @default
    */
    this.ieVersion = 0;

    /**
    * @property {boolean} trident - Set to true if running a Trident version of Internet Explorer (IE11+)
    * @default
    */
    this.trident = false;

    /**
    * @property {number} tridentVersion - If running in Internet Explorer 11 this will contain the major version number. See {@link http://msdn.microsoft.com/en-us/library/ie/ms537503(v=vs.85).aspx}
    * @default
    */
    this.tridentVersion = 0;

    /**
    * @property {boolean} mobileSafari - Set to true if running in Mobile Safari.
    * @default
    */
    this.mobileSafari = false;

    /**
    * @property {boolean} midori - Set to true if running in Midori.
    * @default
    */
    this.midori = false;

    /**
    * @property {boolean} opera - Set to true if running in Opera.
    * @default
    */
    this.opera = false;

    /**
    * @property {boolean} safari - Set to true if running in Safari.
    * @default
    */
    this.safari = false;

    /**
    * @property {boolean} webApp - Set to true if running as a WebApp, i.e. within a WebView
    * @default
    */
    this.webApp = false;

    /**
    * @property {boolean} silk - Set to true if running in the Silk browser (as used on the Amazon Kindle)
    * @default
    */
    this.silk = false;

    //  Audio

    /**
    * @property {boolean} audioData - Are Audio tags available?
    * @default
    */
    this.audioData = false;

    /**
    * @property {boolean} webAudio - Is the WebAudio API available?
    * @default
    */
    this.webAudio = false;

    /**
    * @property {boolean} ogg - Can this device play ogg files?
    * @default
    */
    this.ogg = false;

    /**
    * @property {boolean} opus - Can this device play opus files?
    * @default
    */
    this.opus = false;

    /**
    * @property {boolean} mp3 - Can this device play mp3 files?
    * @default
    */
    this.mp3 = false;

    /**
    * @property {boolean} wav - Can this device play wav files?
    * @default
    */
    this.wav = false;

    /**
    * Can this device play m4a files?
    * @property {boolean} m4a - True if this device can play m4a files.
    * @default
    */
    this.m4a = false;

    /**
    * @property {boolean} webm - Can this device play webm files?
    * @default
    */
    this.webm = false;

    //  Video

    /**
    * @property {boolean} oggVideo - Can this device play ogg video files?
    * @default
    */
    this.oggVideo = false;

    /**
    * @property {boolean} h264Video - Can this device play h264 mp4 video files?
    * @default
    */
    this.h264Video = false;

    /**
    * @property {boolean} mp4Video - Can this device play h264 mp4 video files?
    * @default
    */
    this.mp4Video = false;

    /**
    * @property {boolean} webmVideo - Can this device play webm video files?
    * @default
    */
    this.webmVideo = false;

    /**
    * @property {boolean} vp9Video - Can this device play vp9 video files?
    * @default
    */
    this.vp9Video = false;

    /**
    * @property {boolean} hlsVideo - Can this device play hls video files?
    * @default
    */
    this.hlsVideo = false;

    //  Device

    /**
    * @property {boolean} iPhone - Is running on iPhone?
    * @default
    */
    this.iPhone = false;

    /**
    * @property {boolean} iPhone4 - Is running on iPhone4?
    * @default
    */
    this.iPhone4 = false;

    /**
    * @property {boolean} iPad - Is running on iPad?
    * @default
    */
    this.iPad = false;

    // Device features

    /**
    * @property {number} pixelRatio - PixelRatio of the host device?
    * @default
    */
    this.pixelRatio = 0;

    /**
    * @property {boolean} littleEndian - Is the device big or little endian? (only detected if the browser supports TypedArrays)
    * @default
    */
    this.littleEndian = false;

    /**
    * @property {boolean} LITTLE_ENDIAN - Same value as `littleEndian`.
    * @default
    */
    this.LITTLE_ENDIAN = false;

    /**
    * @property {boolean} support32bit - Does the device context support 32bit pixel manipulation using array buffer views?
    * @default
    */
    this.support32bit = false;

    /**
    * @property {boolean} fullscreen - Does the browser support the Full Screen API?
    * @default
    */
    this.fullscreen = false;

    /**
    * @property {string} requestFullscreen - If the browser supports the Full Screen API this holds the call you need to use to activate it.
    * @default
    */
    this.requestFullscreen = '';

    /**
    * @property {string} cancelFullscreen - If the browser supports the Full Screen API this holds the call you need to use to cancel it.
    * @default
    */
    this.cancelFullscreen = '';

    /**
    * @property {boolean} fullscreenKeyboard - Does the browser support access to the Keyboard during Full Screen mode?
    * @default
    */
    this.fullscreenKeyboard = false;

};

// Device is a singleton/static entity; instantiate it
// and add new methods directly sans-prototype.
Sfera.Device = new Sfera.Device();

/**
* This signal is dispatched after device initialization occurs but before any of the ready
* callbacks (see {@link Sfera.Device.whenReady whenReady}) have been invoked.
*
* Local "patching" for a particular device can/should be done in this event.
*
* _Note_: This signal is removed after the device has been readied; if a handler has not been
* added _before_ `new Sfera.client(..)` it is probably too late.
*
* @type {?Sfera.Signal}
* @static
*/
Sfera.Device.onInitialized = new Sfera.Signal();

/**
* Add a device-ready handler and ensure the device ready sequence is started.
*
* Sfera.Device will _not_ activate or initialize until at least one `whenReady` handler is added,
* which is normally done automatically be calling `new Sfera.client(..)`.
*
* The handler is invoked when the device is considered "ready", which may be immediately
* if the device is already "ready". See {@link Sfera.Device#deviceReadyAt deviceReadyAt}.
*
* @method
* @param {function} handler - Callback to invoke when the device is ready. It is invoked with the given context the Sfera.Device object is supplied as the first argument.
* @param {object} [context] - Context in which to invoke the handler
* @param {boolean} [nonPrimer=false] - If true the device ready check will not be started.
*/
Sfera.Device.whenReady = function (callback, context, nonPrimer) {

    var readyCheck = this._readyCheck;

    if (this.deviceReadyAt || !readyCheck)
    {
        callback.call(context, this);
    }
    else if (readyCheck._monitor || nonPrimer)
    {
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);
    }
    else
    {
        readyCheck._monitor = readyCheck.bind(this);
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);

        var cordova = typeof window.cordova !== 'undefined';
        var cocoonJS = navigator['isCocoonJS'];

        if (document.readyState === 'complete' || document.readyState === 'interactive')
        {
            // Why is there an additional timeout here?
            window.setTimeout(readyCheck._monitor, 0);
        }
        else if (cordova && !cocoonJS)
        {
            // Ref. http://docs.phonegap.com/en/3.5.0/cordova_events_events.md.html#deviceready
            //  Cordova, but NOT Cocoon?
            document.addEventListener('deviceready', readyCheck._monitor, false);
        }
        else
        {
            document.addEventListener('DOMContentLoaded', readyCheck._monitor, false);
            window.addEventListener('load', readyCheck._monitor, false);
        }
    }

};

/**
* Internal method used for checking when the device is ready.
* This function is removed from Sfera.Device when the device becomes ready.
*
* @method
* @private
*/
Sfera.Device._readyCheck = function () {

    var readyCheck = this._readyCheck;

    if (!document.body)
    {
        window.setTimeout(readyCheck._monitor, 20);
    }
    else if (!this.deviceReadyAt)
    {
        this.deviceReadyAt = Date.now();

        document.removeEventListener('deviceready', readyCheck._monitor);
        document.removeEventListener('DOMContentLoaded', readyCheck._monitor);
        window.removeEventListener('load', readyCheck._monitor);

        this._initialize();
        this.initialized = true;

        this.onInitialized.dispatch(this);

        var item;
        while ((item = readyCheck._queue.shift()))
        {
            var callback = item[0];
            var context = item[1];
            callback.call(context, this);
        }

        // Remove no longer useful methods and properties.
        this._readyCheck = null;
        this._initialize = null;
        this.onInitialized = null;
    }

};

/**
* Internal method to initialize the capability checks.
* This function is removed from Sfera.Device once the device is initialized.
*
* @method
* @private
*/
Sfera.Device._initialize = function () {

    var device = this;

    /**
    * Check which OS is client running on.
    */
    function _checkOS () {

        var ua = navigator.userAgent;

        if (/Playstation Vita/.test(ua))
        {
            device.vita = true;
        }
        else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua))
        {
            device.kindle = true;
            // This will NOT detect early generations of Kindle Fire, I think there is no reliable way...
            // E.g. "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-80) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true"
        }
        else if (/Android/.test(ua))
        {
            device.android = true;
        }
        else if (/CrOS/.test(ua))
        {
            device.chromeOS = true;
        }
        else if (/iP[ao]d|iPhone/i.test(ua))
        {
            device.iOS = true;
        }
        else if (/Linux/.test(ua))
        {
            device.linux = true;
        }
        else if (/Mac OS/.test(ua))
        {
            device.macOS = true;
        }
        else if (/Windows/.test(ua))
        {
            device.windows = true;
        }

        if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua))
        {
            device.android = false;
            device.iOS = false;
            device.macOS = false;
            device.windows = true;
            device.windowsPhone = true;
        }

        var silk = /Silk/.test(ua); // detected in browsers

        if (device.windows || device.macOS || (device.linux && !silk) || device.chromeOS)
        {
            device.desktop = true;
        }

        //  Windows Phone / Table reset
        if (device.windowsPhone || ((/Windows NT/i.test(ua)) && (/Touch/i.test(ua))))
        {
            device.desktop = false;
        }

    }

    /**
    * Check HTML5 features of the host environment.
    */
    function _checkFeatures () {

        device.canvas = !!window['CanvasRenderingContext2D'] || device.cocoonJS;

        try {
            device.localStorage = !!localStorage.getItem;
        } catch (error) {
            device.localStorage = false;
        }

        device.file = !!window['File'] && !!window['FileReader'] && !!window['FileList'] && !!window['Blob'];
        device.fileSystem = !!window['requestFileSystem'];

        device.webGL = ( function () { try { var canvas = document.createElement( 'canvas' ); /*Force screencanvas to false*/ canvas.screencanvas = false; return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
        device.webGL = !!device.webGL;

        device.worker = !!window['Worker'];

        device.pointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        device.quirksMode = (document.compatMode === 'CSS1Compat') ? false : true;

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        device.getUserMedia = device.getUserMedia && !!navigator.getUserMedia && !!window.URL;

        // Older versions of firefox (< 21) apparently claim support but user media does not actually work
        if (device.firefox && device.firefoxVersion < 21)
        {
            device.getUserMedia = false;
        }

    }

    /**
    * Checks/configures various input.
    */
    function _checkInput () {

        if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1))
        {
            device.touch = true;
        }

        if (window.navigator.msPointerEnabled || window.navigator.pointerEnabled)
        {
            device.mspointer = true;
        }

        if (!device.cocoonJS)
        {
            // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
            if ('onwheel' in window || (device.ie && 'WheelEvent' in window))
            {
                // DOM3 Wheel Event: FF 17+, IE 9+, Chrome 31+, Safari 7+
                device.wheelEvent = 'wheel';
            }
            else if ('onmousewheel' in window)
            {
                // Non-FF legacy: IE 6-9, Chrome 1-31, Safari 5-7.
                device.wheelEvent = 'mousewheel';
            }
            else if (device.firefox && 'MouseScrollEvent' in window)
            {
                // FF prior to 17. This should probably be scrubbed.
                device.wheelEvent = 'DOMMouseScroll';
            }
        }

    }

    /**
    * Checks for support of the Full Screen API.
    */
    function _checkFullScreenSupport () {

        var fs = [
            'requestFullscreen',
            'requestFullScreen',
            'webkitRequestFullscreen',
            'webkitRequestFullScreen',
            'msRequestFullscreen',
            'msRequestFullScreen',
            'mozRequestFullScreen',
            'mozRequestFullscreen'
        ];

        var element = document.createElement('div');

        for (var i = 0; i < fs.length; i++)
        {
            if (element[fs[i]])
            {
                device.fullscreen = true;
                device.requestFullscreen = fs[i];
                break;
            }
        }

        var cfs = [
            'cancelFullScreen',
            'exitFullscreen',
            'webkitCancelFullScreen',
            'webkitExitFullscreen',
            'msCancelFullScreen',
            'msExitFullscreen',
            'mozCancelFullScreen',
            'mozExitFullscreen'
        ];

        if (device.fullscreen)
        {
            for (var i = 0; i < cfs.length; i++)
            {
                if (document[cfs[i]])
                {
                    device.cancelFullscreen = cfs[i];
                    break;
                }
            }
        }

        //  Keyboard Input?
        if (window['Element'] && Element['ALLOW_KEYBOARD_INPUT'])
        {
            device.fullscreenKeyboard = true;
        }

    }

    /**
    * Check what browser is client running in.
    */
    function _checkBrowser () {

        var ua = navigator.userAgent;

        if (/Arora/.test(ua))
        {
            device.arora = true;
        }
        else if (/Chrome\/(\d+)/.test(ua) && !device.windowsPhone)
        {
            device.chrome = true;
            device.chromeVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Epiphany/.test(ua))
        {
            device.epiphany = true;
        }
        else if (/Firefox\D+(\d+)/.test(ua))
        {
            device.firefox = true;
            device.firefoxVersion = parseInt(RegExp.$1, 10);
        }
        else if (/AppleWebKit/.test(ua) && device.iOS)
        {
            device.mobileSafari = true;
        }
        else if (/MSIE (\d+\.\d+);/.test(ua))
        {
            device.ie = true;
            device.ieVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Midori/.test(ua))
        {
            device.midori = true;
        }
        else if (/Opera/.test(ua))
        {
            device.opera = true;
        }
        else if (/Safari/.test(ua) && !device.windowsPhone)
        {
            device.safari = true;
        }
        else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua))
        {
            device.ie = true;
            device.trident = true;
            device.tridentVersion = parseInt(RegExp.$1, 10);
            device.ieVersion = parseInt(RegExp.$3, 10);
        }

        //  Silk gets its own if clause because its ua also contains 'Safari'
        if (/Silk/.test(ua))
        {
            device.silk = true;
        }

        //  WebApp mode in iOS
        if (navigator['standalone'])
        {
            device.webApp = true;
        }

        if (typeof window.cordova !== "undefined")
        {
            device.cordova = true;
        }

        if (typeof process !== "undefined" && typeof require !== "undefined")
        {
            device.node = true;
        }

        if (device.node && typeof process.versions === 'object')
        {
            device.nodeWebkit = !!process.versions['node-webkit'];

            device.electron = !!process.versions.electron;
        }

        if (navigator['isCocoonJS'])
        {
            device.cocoonJS = true;
        }

        if (device.cocoonJS)
        {
            try {
                device.cocoonJSApp = (typeof CocoonJS !== "undefined");
            }
            catch(error)
            {
                device.cocoonJSApp = false;
            }
        }

        if (typeof window.ejecta !== "undefined")
        {
            device.ejecta = true;
        }

        if (/Crosswalk/.test(ua))
        {
            device.crosswalk = true;
        }

    }

    /**
    * Check video support.
    */
    function _checkVideo () {

        var videoElement = document.createElement("video");
        var result = false;

        try {
            if (result = !!videoElement.canPlayType)
            {
                if (videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ''))
                {
                    device.oggVideo = true;
                }

                if (videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ''))
                {
                    // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                    device.h264Video = true;
                    device.mp4Video = true;
                }

                if (videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ''))
                {
                    device.webmVideo = true;
                }

                if (videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, ''))
                {
                    device.vp9Video = true;
                }

                if (videoElement.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, ''))
                {
                    device.hlsVideo = true;
                }
            }
        } catch (e) {}
    }

    /**
    * Check audio support.
    */
    function _checkAudio () {

        device.audioData = !!(window['Audio']);
        device.webAudio = !!(window['AudioContext'] || window['webkitAudioContext']);
        var audioElement = document.createElement('audio');
        var result = false;

        try {
            if (result = !!audioElement.canPlayType)
            {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''))
                {
                    device.ogg = true;
                }

                if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, ''))
                {
                    device.opus = true;
                }

                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, ''))
                {
                    device.mp3 = true;
                }

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''))
                {
                    device.wav = true;
                }

                if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, ''))
                {
                    device.m4a = true;
                }

                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''))
                {
                    device.webm = true;
                }
            }
        } catch (e) {
        }

    }

    /**
    * Check PixelRatio, iOS device, Vibration API
    */
    function _checkDevice () {

        device.pixelRatio = window['devicePixelRatio'] || 1;
        device.iPhone = navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
        device.iPhone4 = (device.pixelRatio == 2 && device.iPhone);
        device.iPad = navigator.userAgent.toLowerCase().indexOf('ipad') != -1;


        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        if (navigator.vibrate)
        {
            device.vibration = true;
        }

    }

    //  Run the checks
    _checkOS();
    _checkAudio();
    _checkVideo();
    _checkBrowser();
    _checkDevice();
    _checkFeatures();
    _checkFullScreenSupport();
    _checkInput();

};

/**
* Check whether the host environment can play audio.
*
* @method canPlayAudio
* @memberof Sfera.Device.prototype
* @param {string} type - One of 'mp3, 'ogg', 'm4a', 'wav', 'webm' or 'opus'.
* @return {boolean} True if the given file type is supported by the browser, otherwise false.
*/
Sfera.Device.canPlayAudio = function (type) {

    if (type === 'mp3' && this.mp3)
    {
        return true;
    }
    else if (type === 'ogg' && (this.ogg || this.opus))
    {
        return true;
    }
    else if (type === 'm4a' && this.m4a)
    {
        return true;
    }
    else if (type === 'opus' && this.opus)
    {
        return true;
    }
    else if (type === 'wav' && this.wav)
    {
        return true;
    }
    else if (type === 'webm' && this.webm)
    {
        return true;
    }

    return false;

};

/**
* Check whether the host environment can play video files.
*
* @method canPlayVideo
* @memberof Sfera.Device.prototype
* @param {string} type - One of 'mp4, 'ogg', 'webm' or 'mpeg'.
* @return {boolean} True if the given file type is supported by the browser, otherwise false.
*/
Sfera.Device.canPlayVideo = function (type) {

    if (type === 'webm' && (this.webmVideo || this.vp9Video))
    {
        return true;
    }
    else if (type === 'mp4' && (this.mp4Video || this.h264Video))
    {
        return true;
    }
    else if ((type === 'ogg' || type === 'ogv') && this.oggVideo)
    {
        return true;
    }
    else if (type === 'mpeg' && this.hlsVideo)
    {
        return true;
    }

    return false;

};



window.man = function(what) {
    // component
    var c = Sfera.Utils.capitalize(what);
    var cc = Sfera.Components.getClass(c);
    if (cc) {
        var co = new cc({doc:true});

        var hstr = "* Component " + co.type + " *****************";

        console.log(hstr);

        console.log(co.doc);
        console.log("***********************************");

        var sstr = "";
        for (var sub in co.subComponents) {
            var str = " - " + sub + " ";
            while (str.length < 20) str += " ";
            str += co.subComponents[sub].type;
            sstr += str + "\n";
        }
        if (str) {
            console.log("* SubComponents:");
            console.log(sstr);
        }

        console.log("* Attributes:");
        for (var attr in co.attributes) {
            var a = co.attributes[attr];
            var str = " - " + attr;
            while (str.length < 20) str += " ";
            str += a.type;

            var av = co.attributes[attr].values;
            if (av) {
                if (Sfera.Utils.isFunction(av)) {
                    try {
                        av = av();
                    } catch (e) {

                    }
                }
                if (Sfera.Utils.isArray(av)) {
                    while (str.length < 35) str += " ";
                    str += "<" + av.join("|") + ">";
                }
            }

            if (a.doc) {
                while (str.length < 45) str += " ";
                str += a.doc;
            }

            console.log(str);
        }

        console.log(hstr);
    }
};


window.help = function () {
    var hstr = "* Help *************************\n";
    hstr += "* man(\"<component name>\")\n";
    hstr += "* client.setAttribute(\"<component id>\",\"<attribute name>\",\"<value>\")\n";
    //hstr += "* client.event(\"\")";
    hstr += "* Help *************************\n";

    console.log(hstr);
}


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


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Sfera;
        }
        exports.Sfera = Sfera;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('Sfera', (function() { return root.Sfera = Sfera; }) ());
    } else {
        root.Sfera = Sfera;
    }
}).call(this);

/*
* ""
*/

//# sourceMappingURL=sfera-client.js.map