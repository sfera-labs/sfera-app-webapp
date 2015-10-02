/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2015 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 * Page.js
 */

/**
 * Page component.
 *
 * @class Sfera.Components.Page
 * @constructor
 */
Sfera.Components.Page = function(properties) {
    this.type = "Page";

    /**
     * @property {object} properties - The component's properties.
     */
    this.properties = {
        /**
         * @property {string} text - The  configuration object.
         */
        // title
        title: {
            type: String,
            value: ""
        },

        // style
        style: {
            type: String,
            value: ""
        },

        // visible
        visible: {
            type: "boolean",
            value: true
        }

    };

    Sfera.Components.Component.call(this, properties)

};

Sfera.Utils.extend(Sfera.Components.Page, Sfera.Components.Component);

Sfera.Components.Page.prototype.setProperty = function(name, value) {
    if (!this.ancestor.setProperty.call(this, name, value))
        return false;

    // refresh
    value = this.properties[name].value;

    switch (name) {
        case "text":
            this.element.innerHTML = value;
            return true;

        case "visible":
            this.element.style.display = value?"":"none";
            return true;
    }

    return false;
};

Sfera.Components.Page.prototype.init = function() {
    Sfera.Components.Component.prototype.init.call(this);

    this.element.style.display = "none";
};
