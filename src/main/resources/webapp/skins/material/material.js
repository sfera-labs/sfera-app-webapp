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
        Input: ["default", "classic"],
        Select: ["default", "classic"],
        Button: ["default", "clear", "icon"],
        Checkbox: ["default", "switch"],
        Radio: ["default"],
    };

    this.colors = {
        Button: [
            "default",
            "stable",
            "positive",
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
            "stable",
            "positive",
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

};
