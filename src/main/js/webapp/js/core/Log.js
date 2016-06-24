/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

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
