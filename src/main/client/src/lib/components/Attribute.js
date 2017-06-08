/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
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
		var i;
        // remove old observers
        if (this.mustache && !eq) {
            for (i=0; i<this.mustache.vars.length; i++)
                Sfera.client.removeAttrObserver(this.mustache.vars[i], this);
        }
        this.mustache = mustache;
        // add new observers
        if (this.mustache && !eq) {
            for (i=0; i<this.mustache.vars.length; i++)
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
