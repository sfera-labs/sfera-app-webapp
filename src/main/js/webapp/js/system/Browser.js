/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * Browser singleton
 */
Sfera.Browser = new (function() {
    var location;

    this.reload = function() {
        window.location.reload();
    };

    this.setLocation = function(url) {
        window.location.replace(url);
    };

    // prevent default event
	this.preventDefault = function (evt) {
        if (evt.stopPropagation)
            evt.stopPropagation();
		if (evt.returnValue)
			evt.returnValue = false;
		if (evt.preventDefault)
			evt.preventDefault();
	}

    /**
     * Change the browser tab URL without reloading (if supported)
     * @param  {string} title - Title of the page
     * @param  {string} url   - URL of the page
     * @return {boolean}      - true if successful, false otherwise
     */
    this.changeUrl = function(title, url) {
        if (typeof(history.pushState) != "undefined") {
            var obj = {
                Title: title,
                Url: url
            };
            history.pushState(obj, obj.Title, obj.Url);
            return true;
        }
        return false;
    };

    this.updateUrl = function(pageId, pageTitle) {
        var location = this.getLocation();
        hash = pageId == "page:home"?"":pageId;
        document.title = pageTitle;
        if (location.hash != hash) {
            lastHash = hash; // so the interval won't detect the change
            var url = location.pathname + "#" + pageId;
            if (pageId && location.search)
                url += "?" + location.search
            this.changeUrl(pageTitle, url);
        }
    };

    this.getLocation = function() {
        var url = window.location.href; // "http://localhost:8080/new/index.html#page1?a=2"

        if (!location || location.url != url) {
            var hash = window.location.hash, // #page1
                search = window.location.search, // ?a=2
                a;

            if (hash) {
                if (hash[0] == '#')
                    hash = hash.substr(1); // remove #
                if (hash.indexOf("?") != -1) {
                    a = hash.split("?");
                    hash = a[0];
                    search = a[1];
                }
            }
            if (search) {
                if (search[0] == '?')
                    search = search.substr(1); // remove ?
                if (search.indexOf("#") != -1) {
                    a = search.split("#");
                    search = a[0];
                    hash = a[1];
                }
            }

            var sp = window.location.pathname.split("/");

            location = {
                url: url,
                host: window.location.host, // "localhost:8080"
                protocol: window.location.protocol, // http:
                pathname: window.location.pathname, // /new/index.html
                hash: hash, // #page1
                search: search, // ?a=2
                interface: sp[1], // new
                login: sp[2] == "login" // login page?
            };
        }

        return location;
    }

    var lastHash = null;
    var self = this;

    this.start = function() {
        setInterval(function() {
            var location = Sfera.Browser.getLocation();
            var locHash = location.hash == "page:home"?"":location.hash
            if (locHash !== lastHash) {
                lastHash = locHash;
                Sfera.client.showPage(location.hash ? location.hash : "home");
                //alert("User went back or forward to application state represented by " + hash);
            }
        }, 100);
    };
})();
