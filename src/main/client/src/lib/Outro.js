    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Sfera;
        }
        exports.Sfera = Sfera;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('Sfera', (function() { return root.Sfera = Sfera; }) ());
    } else {
        root.Sfera = Sfera;
    }
}).call(this);

/*
* ""
*/
