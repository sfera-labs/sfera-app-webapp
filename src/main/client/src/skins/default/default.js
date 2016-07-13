/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Sfera.Skins.Default contains and handles skins
 *
 * @class Sfera.Skins.Default
 * @constructor
 */
Sfera.Skins.Default = function() {

    this.VERSION = "1.0";

    this.styles = {
        Input: ["default", "clear"],
        Button: ["default", "clear", "icon"],
        Checkbox: ["default", "radio", "switch", "clear"],
        Radio: ["default"],
    };

    this.colors = {
        Button: [
            "default",
            "light",
            "stable",
            "positive",
            "calm",
            "balanced",
            "energized",
            "assertive",
            "royal",
            "dark"
        ]
    }

};
