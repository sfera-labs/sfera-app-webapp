/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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
