/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Login obj
 *
 * @class Sfera.Login
 * @constructor
 */
Sfera.Login = new(function() {

    var checkTimeout = null;
    var checkMs = 500;
    var req;

    var action = "";

    var self = this;

    this.login = function (user, password) {
        if (!req)
            initReq();

        action = "login";

        resetCheck();

        user = user || Sfera.client.getAttribute("username","value");
        password = password || Sfera.client.getAttribute("password","value");

        req.open("/api/login?user=" + user + "&password=" + password, 100);
    };

    this.logout = function () {
        if (!req)
            initReq();

        action = "logout";

        req.open("/api/logout", 100);
    };

    this.gotoLogin = function() {
        Sfera.Browser.setLocation("/"+Sfera.Browser.getLocation().interface+"/login");
    }

    this.gotoInterface = function() {
        Sfera.Browser.setLocation("/"+Sfera.Browser.getLocation().interface);
    }

    function initReq() {
        req = new Sfera.Net.Request();

        req.onLoaded = function(code) {
            clearTimeout(checkTimeout);

            if (code != 200) {
                Sfera.client.setAttribute("username","error","true");
                Sfera.client.setAttribute("password","error","true");
                return;
            }

            switch (action) {
            case "login":
            	self.gotoInterface();
            	break;
            case "logout":
                self.gotoLogin();
                break;
            }
        }
        req.onError = function(errCode) {
            Sfera.client.setAttribute("username","error","true");
            Sfera.client.setAttribute("password","error","true");
            resetCheck();
        }

    }

    function checkLogin() {
        // req.open("/api/login",100);
    }

    function resetCheck() {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkLogin, checkMs);
    }

    window.onload = function() {
        resetCheck(); // start now
    }

})();
