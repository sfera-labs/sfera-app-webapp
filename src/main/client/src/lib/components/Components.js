/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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
