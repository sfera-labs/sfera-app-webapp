/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Debug obj
 *
 * @class Sfera.Debug
 * @constructor
 */
Sfera.Debug = new(function() {
    var self = this;

    this.verbose = false;

    this.boot = function() {
    };

    function log(type, txt, msg, data) {
        // head
        var h = Sfera.Utils.getDate("hisu")+" - ";

        if (Sfera.Device.chrome) {
            var a = [""]; // arguments

            a[0] += "%c"+h;
            a.push("color:#999");
            a[0] += "%c"+txt;
            switch (type) {
                case "msg": a.push("color:#000"); break;
                case "err": a.push("color:#e11"); break;
                case "not": a.push("color:#e8e"); break;
            }

            if (msg) {
                a[0] += " %c"+msg;
                a.push("color:#5a5");
            }
            if (this.verbose) {
                a[0] += " %c"+data;
                a.push("color:#55a");
            }

            console.log.apply(console, a);
        } else {
            console.log(h+txt,msg,data);
        }
    }

    this.log = function(txt, msg, data) {
        log("msg",txt,msg,data);
    };
    this.logError = function(txt, msg, data) {
        log("err",txt,msg,data);
    };
    this.logNotice = function(txt, msg, data) {
        if (this.verbose)
            log("not",txt,msg,data);
    };

    /**
     * Displays a Sfera version debug header in the console.
     *
     * @method Sfera.Client#showDebugHeader
     * @protected
     */
    this.showHeader = function() {

        var v = Sfera.VERSION;

        var a = "hello";

        if (Sfera.Device.chrome) {
            var a = [
                '%c %c %c Sfera v' + v + ' | ' + a + '  %c %c ' + '%c http://sfera.cc', // %c\u2665%c\u2665%c\u2665',
                'background: #9854d8',
                'background: #6c2ca7',
                'color: #ffffff; background: #450f78;',
                'background: #6c2ca7',
                'background: #9854d8',
                'background: #ffffff'
            ];

            /*
            var c = 2;
            for (var i = 0; i < 3; i++) {
                if (i < c) {
                    a.push('color: #ff2424; background: #fff');
                } else {
                    a.push('color: #959595; background: #fff');
                }
            }
            */

            console.log.apply(console, a);
        } else if (window.console) {
            console.log('Sfera v' + v + ' | ' + a + ' | http://sferalabs.cc');
        }

    };



})();
