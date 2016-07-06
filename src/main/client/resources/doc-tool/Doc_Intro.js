module.exports = function (grunt, options) {
    var window = {};
    var templates = {};

    var genMD = new function() {
        var res = "";

        function $(txt) {
            res += txt;
        }

        function _br(n) {
            if (!n) n = 1;
            var b = "";
            for (var i=0; i<n; i++)
                b += "\n";
            return b;
        }

        function _s() {
            return ' ';//'&nbsp;';
        }

        function _b(txt) {
            return '**' + txt + '**';
        }

        function _a(txt, link, target) {
            //target = target?' target="'+target+'"':'';
            return '['+txt+']('+link+')';
        }

        function _h(l, name) {
            var h = "\n";
            for (var i=0; i<l; i++) h+= "#";
            return h + " " + name + "\n\n";
        }

        function _ta(e, c) {
            return ''; //(e ? "</" : "<") + "table" + (e || !c ? ">" : " class='" + c + "'");
        }

        function _r(e) {
            var r = (e ? "|\n" : "");
            if (e && nch) {
                for (var i=0; i<nch; i++)
                    r += '|---';
                r += "|\n";
                nch = 0;
            }
            return r;
        }

        function _c(text) {
            return "|" +text;
        }

        var nch = 0;
        function _ch(text) {
            nch++;
            return "|" +text;
        }

        //
        function _hb(txt) {
            return '<b>' + txt + '</b>';
        }

        function _hta(e, c, s) {
            c = c ? " class='" + c + "'" : "";
            s = s ? " style='" + s + "'" : "";
            return (e ? "</" : "<") + "table" + (!e && c ? c : "") + (!e && s ? s : "") + ">";
        }

        function _hr(e) {
            return (e ? "</" : "<") + "tr>"
        }

        function _hc(text) {
            return "<td>" + text + "</td>";
        }

        function _hch(text) {
            return "<th>" + text + "</th>";
        }

        //


        this.toc = function(ac) {
            res = "";

            for (var i = 0; i < ac.length; i++) {
                $(templates.index_item.replace("%item", ac[i]).replace("%url",'components/' + ac[i] + '.html'));
                //$(_a(ac[i], 'components/' + ac[i] + '.html', 'contentFrame'));
            }

            return res;
        }

        this.component = function(cc) {
            res = "";

            var co = new cc({
                doc: true
            });

            if (co.doc && co.doc.hidden)
                return "";

            // title
            $(_h(1, co.type)); //_a(co.type, "#" + co.type)));

            if (co.doc && co.doc.descr)
                $(co.doc.descr);

            if (templates["components/"+co.type])
                $(_br(2)+templates["components/"+co.type]);

            for (sub in co.subComponents) {
                $(_h(2, "Sub components"));
                break;
            }
            for (var sub in co.subComponents) {
                var t = co.subComponents[sub].type;
                $(_sub + _s());
                $(_a("[" + t + "]", "#" + t));
                $(_br());
            }

            $(_h(2, "Attributes"));
            $(_ta(0, "docTable"));

            $(_r());
            $(_ch("Name"));
            $(_ch("Type"));
            $(_ch("Description"));
            $(_r(1));

            for (var attr in co.attributes) {
                var a = co.attributes[attr];
                if (a.doc && a.doc.hidden)
                    continue;

                $(_r());

                $(_c(_b("["+attr+"](#"+attr+")")));

                $(_c(a.type));

                $(_c(a.doc && a.doc.descr ? a.doc.descr : ""));

                $(_r(1));
            }
            $(_ta(1));

            for (var attr in co.attributes) {
                var a = co.attributes[attr];
                if (a.doc && a.doc.hidden)
                    continue;

                // title
                $(_br(2)+"---"+_br(1));
                $(_h(3,attr));

                // descr
                if (a.doc && a.doc.descr) {
                    $(a.doc.descr);
                    if (a.doc.descr[a.doc.descr.length-1]!=".")
                        $(".");
                }
                $(_br());

                // table
                $(_hta(0, "attrTable table", "width:auto"));

                $(_hr());
                $(_hc(_hb("Type:")));
                $(_hc(a.type));
                $(_hr(1));

                var str = co.attributes[attr].default;
                if (str) {
                    $(_hr());
                    $(_hc(_hb("Default value:")));
                    $(_hc(str));
                    $(_hr(1));
                }

                str = "";
                var av = co.attributes[attr].values;
                if (av && av!="null") {
                    if (Sfera.Utils.isFunction(av)) {
                        try {
                            av = av();
                        } catch (e) {
                            av = [];
                        }
                    }
                    if (Sfera.Utils.isArray(av)) {
                        str += av.join(", ");
                    }
                }
                if (str) {
                    $(_hr());
                    $(_hc(_hb("Values:")));
                    $(_hc(str));
                    $(_hr(1));
                }

                $(_hta(1));

                $(_br(2));

                // example
                var v;
                if (a.doc && a.doc.example && a.doc.example.values) {
                    $(">**Example:**"+_br());
                    $(">\n");
                    v = a.doc.example.descr;
                    if (v[v.length-1] != ".")
                        v += ".";
                    $(">"+v+_br());
                    $(">\n\n");
                    $(">In index.xml:"+_br(2));
                    $(">``` xml"+_br());
                    $("<"+Sfera.Utils.camelToDash(co.type)+' id="my'+co.type+'"');
                    for (var aa in a.doc.example.values) {
                        v = a.doc.example.values[aa] + "";
                        v = v.replace(/"/g,'&quot;'); // use single quote, less frequent in values
                        $(" "+Sfera.Utils.camelToDash(aa)+'="'+v+'"');
                    }
                    $(" />"+_br());
                    $("```"+_br(2));

                    $(">Via scripting:"+_br(2));
                    $(">``` js"+_br());
                    v = a.doc.example.values[attr] + "";
                    v = v.replace(/"/g,'\\"');
                    $(""+'setAttribute("my'+co.type+'","'+attr+'","'+v+'")'+_br());
                    $("```"+_br(2));
                }

            }

            return res;
        }
    };
