/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
 * SferaBg component.
 *
 * @class Sfera.Components.SferaBg
 */
Sfera.Components.create("SferaBg", {
    doc: {
        hidden:true
    },

    init: function() {
        var tid = 0;
        var p; // bg points
        var k = 0; // num of points
        // get element by id shortcut
        function Z(n) {
            return document.getElementById(n);
        }

        // random
        function r(n) {
            return Math.floor(Math.random() * n)
        }

        function f(p) {
            var ts = new Date().getTime();
            var x = p.x,
                y = p.y;

            if (!p.ls) p.ls = ts;
            var t = ts - p.ls;

            var d = t * p.s / 100 - p.p;
            x += Math.sin(d) * p.a;
            y += Math.sin(d) * p.b;

            return {
                x: x,
                y: y
            };
        }

        // distance between two points
        function d(x, y, j, l) {
            var xs = j - x;
            var ys = l - y;
            return Math.sqrt(ys * ys + xs * xs);
        }

        // draw background
        function dr() {
            var w = window.innerWidth,
                h = window.innerHeight,
                q = 200, // 1 point every nxn square
                x, y, j, l, t, i,
                o, g, c;

            try {
                g = Z('c');
                c = g.getContext('2d');
                o = (typeof g.style.opacity !== 'undefined');
                if (o) g.style.opacity = .3;
            } catch (e) {
                return
            }

            c.canvas.width = w;
            c.canvas.height = h;

            if (!p) {
                p = [];
                for (x = -1; x <= w / q; x++) {
                    for (y = -1; y <= h / q; y++) {
                        i = {
                            x: q * x + r(q),
                            y: q * y + r(q),
                            r: r(10) + 4,
                            a: r(13),
                            b: r(13),
                            p: r(100),
                            w: r(10000),
                            s: r(10) / 100,
                            l: []
                        };
                        p.push(i);
                        k++;
                    }
                }
                for (i = 0; i < k; i++) {
                    x = p[i].x;
                    y = p[i].y;
                    for (t = i + 1; t < k; t++) {
                        j = p[t].x;
                        l = p[t].y;
                        if (d(x, y, j, l) < q * 2)
                            p[i].l.push(p[t]); // line to..
                    }
                }
            }
            c.strokeStyle =
                c.fillStyle = o ? '#fff' : '#7194b8'; //'#7998af';
            for (i = 0; i < k; i++) {
                x = f(p[i]).x;
                y = f(p[i]).y;
                for (t = 0; t < p[i].l.length; t++) {
                    j = f(p[i].l[t]).x;
                    l = f(p[i].l[t]).y;
                    c.moveTo(x, y);
                    c.lineTo(j, l);
                }
                c.stroke();
                c.beginPath();
                c.arc(x, y, p[i].r, 0, 2 * Math.PI, false);
                c.fill();
            }
        }

        // call draw on resize, after 100ms
        window.addEventListener("resize", function() {
            clearTimeout(tid);
            tid = setTimeout(dr, 100);
        });
        //window.addEventListener("load", function() {
            Z("bg").innerHTML = "<canvas id='c'></canvas>";
            setInterval(dr, 50);
        //});
    }

});
