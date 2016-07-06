
window.man = function(what) {
    // component
    var c = Sfera.Utils.capitalize(what);
    var cc = Sfera.Components.getClass(c);
    if (cc) {
        var co = new cc({doc:true});

        var hstr = "* Component " + co.type + " *****************";

        console.log(hstr);

        console.log(co.doc);
        console.log("***********************************");

        var sstr = "";
        for (var sub in co.subComponents) {
            var str = " - " + sub + " ";
            while (str.length < 20) str += " ";
            str += co.subComponents[sub].type;
            sstr += str + "\n";
        }
        if (str) {
            console.log("* SubComponents:");
            console.log(sstr);
        }

        console.log("* Attributes:");
        for (var attr in co.attributes) {
            var a = co.attributes[attr];
            var str = " - " + attr;
            while (str.length < 20) str += " ";
            str += a.type;

            var av = co.attributes[attr].values;
            if (av) {
                if (Sfera.Utils.isFunction(av)) {
                    try {
                        av = av();
                    } catch (e) {

                    }
                }
                if (Sfera.Utils.isArray(av)) {
                    while (str.length < 35) str += " ";
                    str += "<" + av.join("|") + ">";
                }
            }

            if (a.doc) {
                while (str.length < 45) str += " ";
                str += a.doc;
            }

            console.log(str);
        }

        console.log(hstr);
    }
};


window.help = function () {
    var hstr = "* Help *************************\n";
    hstr += "* man(\"<component name>\")\n";
    hstr += "* client.setAttribute(\"<component id>\",\"<attribute name>\",\"<value>\")\n";
    //hstr += "* client.event(\"\")";
    hstr += "* Help *************************\n";

    console.log(hstr);
}
