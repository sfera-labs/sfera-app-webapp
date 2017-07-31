/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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
	
	getChildren: function (recursive) {
 		if (!recursive || !this.children.length)
 			return this.children;
 		var a = this.children.clone();
 		for (var i=0; i<this.children.length; i++) {
 			if (this.children[i].getChildren)
 				a.concat(this.children[i].getChildren(true));
 		}
 		return a;
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
