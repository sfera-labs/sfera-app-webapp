/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link https://github.com/sfera-labs/sfera-webapp/license.txt|MIT License}
 */

/**
 *
 * @class Sfera.Skins.Material
 * @constructor
 */
Sfera.Skins.Material = function() {

    this.VERSION = "1.0";

    this.styles = {
        Input: ["default", "clear"],
        Select: ["default", "clear"],
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

            "gray",
            "green",
            "blue",
            "yellow",
            "red"
        ],
        Slider: [
            "default",
            "light",
            "stable",
            "positive",
            "calm",
            "balanced",
            "energized",
            "assertive",

            "gray",
            "green",
            "blue",
            "yellow",
            "red"
        ]
    }

    Sfera.Components.Classes.Slider.prototype.attrDefs.cursorSize.default = 20;
    Sfera.Components.Classes.Slider.prototype.updateStyle = function () {
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var s = this.getAttribute("cursorSize");

        if (!w || !h || !s) return; // we need width, height and cursor size

        var v = h > w;

        this.subComponents.cursor.setAttribute("width", s);
        this.subComponents.cursor.setAttribute("height", s);

        this.subComponents.cursor.setAttribute("x", v ? Math.floor((w-s)/2) : 0);
        this.subComponents.cursor.setAttribute("y", !v ? Math.floor((h-s)/2) : 0);
    };

};
