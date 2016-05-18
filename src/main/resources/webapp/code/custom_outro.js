
    // bridge functions
    this.onReady = (typeof(onReady) === 'function') ? function () {onReady();} : null;
    this.onEvent = (typeof(onEvent) === 'function') ? function (id, value) {return onEvent(id, value);} : null;
    this.onPage = (typeof(onPage) === 'function') ? function (name) {return onPage(id);} : null;

    // context functions
    function page(id) {
        Sfera.client.showPage(id);
    }

    function event(id, value, callback) {
        Sfera.client.sendEvent(id, value, callback);
    }

    function command(command, callback)  {
        Sfera.client.sendCommand(command, callback);
    }

    function logout() {
        Sfera.Login.logout();
    }

    function login(username, password) {
        Sfera.Login.login(username, password);
    }

    function setAttribute(id, name, value) {
        Sfera.client.setAttribute(id, name, value);
    }

    // exec custom code. optional: id of the component calling, value to be sent
    this.exec = function (f, id, value) {
        // eval button js
        try {
            var result = eval(f);
        } catch (e) {
            if (e instanceof SyntaxError) {
                alert(e.message);
            } else {
                throw (e);
            }
        }
        return (result === false ? false : true); // return false (block event?) only if eval results in false
    };

})();
