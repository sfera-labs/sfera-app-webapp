/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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
