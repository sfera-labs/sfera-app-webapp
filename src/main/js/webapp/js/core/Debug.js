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
        var u = "https://sferalabs.cc/sfera";

        if (Sfera.Device.chrome) {
            var a = [
                '%c %c %c Sfera v' + v + '  %c %c ' + '%c ' + u,
                'background: #afc4dc',
                'background: #6991bc',
                'color: #ffffff; background: #26609f;',
                'background: #6991bc',
                'background: #afc4dc',
                'background: #ffffff'
            ];
            console.log.apply(console, a);
        } else if (window.console) {
            console.log('Sfera v' + v + ' | ' + u);
        }
    };

})();
