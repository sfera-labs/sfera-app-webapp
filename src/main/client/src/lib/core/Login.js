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

    var idleIntervalId = null;

    var self = this;

    this.login = function (user, password) {
        if (!req)
            initReq();

        action = "login";

        resetCheck();

        user = user || Sfera.client.getAttribute("username","value");
        password = password || Sfera.client.getAttribute("password","value");

        req.open("/api/login?user=" + user + "&password=" + password + "&", 100);
    };

    this.logout = function () {
        if (!req)
            initReq();

        action = "logout";

        req.open("/api/logout", 100);
    };

    this.gotoLogin = function() {
        Sfera.Browser.setLocation("/"+Sfera.Browser.getLocation().interface+"/login");
    };

    this.gotoInterface = function() {
        Sfera.Browser.setLocation("/"+Sfera.Browser.getLocation().interface);
    };

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
    };

    function stopIdleTimeout() {
        setIdleEvents(true);
        clearInterval(idleIntervalId);
    }

    this.resetIdleTimeout = function () {
        stopIdleTimeout();
        if (config.idleTimeout && parseInt(config.idleTimeout) && !self.isLogin) {
            setIdleEvents();
            idleIntervalId = setInterval(onIdleInterval, 1000);
            localStorage.setItem("idleTimestamp",(new Date().getTime()));
        }
    };

    // check every second (shared between all tabs)
    function onIdleInterval() {
        // check last timestamp
        var ts = localStorage.getItem("idleTimestamp");
        var nts = new Date().getTime();

        if (nts-ts >= parseInt(config.idleTimeout)*1000) {
            onIdleTimeout();
        }
    }

    function onIdleTimeout() {
        stopIdleTimeout();
        Sfera.Login.logout();
    }

    function setIdleEvents(remove) {
		var f = (remove?"remove":"add")+"Event";
		var t = Sfera.Device.touch;
		window[f](t?"touchstart":"mousedown", window, onIdleActivity);
		window[f](t?"touchend":"mouseup", window, onIdleActivity);
        window[f]("keydown", window, onIdleActivity);
	}
	function onIdleActivity(e) {
		self.resetIdleTimeout();
	}


})();
