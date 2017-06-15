/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */
var files;
var fileManager;
var textEditor;
var systemConsole;

var focusedElement; // currently focused element

Sfera.Wide = function(config) {

    var NOTICE_WAIT = 5000;

    this.viewportWidth = 0;
    this.viewportHeight = 0;

    var popupAreaContentsE = document.getElementById("popupAreaContents");
    var popupFrameE = document.getElementById("popupFrame");
    var popupBgE = document.getElementById("popupBg");

    this.cPopup = null; // current popup
    this.popupStack = []; // popup stack

    // toolbar popups
    var cToolbarPopup = ""; // current popup open
    var toolbarPopupFMEditE = document.getElementById("fm_editPopup");
    var toolbarPopupTEWarningsE = document.getElementById("te_warningsPopup");
    var toolbarArrowE = document.getElementById("toolbarArrow");

    // app popup buttons
    var appContentE;
    var appBtsE = [];
    var appBackBtE;

    // temp area, we render stuff here to get the size (getDivSize)
    this.tempAreaE = document.getElementById("tempArea");

    var idleIntervalId = null;

    var noticeTimeout = 0;
    var noticeStatus = 0;

    this.cApp = ""; // current application
    this.apps = {};

    this.reloading = false; // manually reloading (so we don't fire the onBeforeUnload)

    var self = this;

    // quick apps panel
    var quickAppsPanel = {
        e:document.getElementById("quickAppsPanel"),
        buttonsE:[], // buttons elements
        buttonsIds:[], // app ids,
        fixedAppsIds:["pe","fm","lv"], // fixed apps, will always be visible
        cId:-1, // current highlighted app index (-1 also means the panel is not visible)
    }

    function addApp(app) {
        self.apps[app.id] = app;
        return app;
    }

    this.boot = function () {
        // apps panel
		initAppsPopup();

		// quick apps
		initQuickAppsPanel();


        this.initEvents(document.getElementById("wide"));

        // animations
		animations = new Animations();

        // files
        files = new Sfera.Wide.Files();
        // file manager
        fileManager = addApp(new Sfera.Wide.Apps.FileManager());
        // text editor
        textEditor = addApp(new Sfera.Wide.Apps.TextEditor());
        // system console
        systemConsole = addApp(new Sfera.Wide.Apps.SystemConsole());

        window.onresize = this.onResize.bind(this);
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        window.addEvent("keydown", window, this.onKeyDown.bind(this));
		window.addEvent("keyup", window, this.onKeyUp.bind(this));

        /*
        window.onload = onLoadInit;
        window.onorientationchange = onOrientationChange;
        */

       this.onResize();

       this.showAppsPopup();

       Sfera.Net.boot();
       Sfera.Net.wsOpen();
       Sfera.Net.onMessage.add(onWSMessage);
       Sfera.Net.onConnection.add(onConnection);
       Sfera.Net.onClose.add(onWSClose);
    }

    function onConnection(json) {
        config.idleTimeout = parseInt(json.idleTimeout);
        Sfera.Login.resetIdleTimeout();
        resetIdleTimeout();
    }

    function onWSMessage(jsonStr) {
        if (self.cPopup && self.cPopup.id == "connecting")
            self.closePopup();

        json = JSON.parse(jsonStr);
        switch (json.type) {
            case "console":
                systemConsole.output(json.output);
                break;
            case "event":
                if (json.files)
                    fileManager.onWSMessage(json);
                break;
        }
    }

    function onWSClose() {
        self.openPopup("connecting", false);
    }

    // focus, restore key events
	this.focus = function () {
		if (window.focus) window.focus();
		this.deselect();
	} // focus()

	// deselect all
	this.deselect = function () {
		try {
			if (document.selection)
				document.selection.empty();
			else if (window.getSelection)
				window.getSelection().removeAllRanges();
			if (document.blur)
				document.blur();
		} catch (err) {}
	} // deselect()

    this.onResize = function () {
    	// get viewport size
    	var viewportWidth;
    	var viewportHeight;

    	if (window.innerWidth) {
    		viewportWidth = window.innerWidth;
    		viewportHeight = window.innerHeight;
    	} else if (document.documentElement && document.documentElement.clientWidth) {
    		viewportWidth = document.documentElement.clientWidth;
    		viewportHeight = document.documentElement.clientHeight;
    	} else if (document.body.clientWidth) {
    		viewportWidth = document.body.clientWidth;
    		viewportHeight = document.body.clientHeight;
    	} else {
    		viewportWidth = 0;
    		viewportHeight = 0;
    	}

    	this.adjustLayout(viewportWidth,viewportHeight);
    } // onResize()

    // adjust wide layout. viewport size
	this.adjustLayout = function (vw,vh) {
		if (vw && vh) {
			this.viewportWidth = vw;
			this.viewportHeight = vh;
		}

		// app specific adjust layout
		if (this.cApp)
            this.apps[this.cApp].adjustLayout();

		this.adjustPopup();
		this.adjustToolbar();
		this.adjustPanels();
	} // adjustLayout()

	// adjust the orientation
	this.adjustOrientation = function (o) {
		this.closeToolbarPopup();
	} // adjustOrientation()

	// adjust toolbar
	this.adjustToolbar = function () {
        return;//TODO
		var	vw = this.viewportWidth;
		var	vh = this.viewportHeight;

		// tool bar size
		var tbW = (this.cApp=="pe")?201:0; // left one
		var tbH = 36; // top one

		// editable area size
		var eW = vw - tbW;
		var eH = vh - tbH;

		// fix toolbar header max width. do it here because we call it from adjustLayout and updateToolbarTitle
		var t = document.getElementById("pe_toolbarHeader");
		t.style.maxWidth = (this.cApp == "pe")?((vw-460)+"px"):"";
		var tbts = ["Warnings","Tools","Save"];
		for (var i=0; i<tbts.length; i++) { // remove labels from buttons?
			browser.miniButton(document.getElementById("pe_toolbar"+tbts[i]+"Bt"), (vw-t.offsetWidth<620));
		}

		// fm
		var t = document.getElementById("fm_toolbarHeader");
		var tbts = ["Tools","Save"];
		for (var i=0; i<tbts.length; i++) { // remove labels from buttons?
			browser.miniButton(document.getElementById("fm_toolbar"+tbts[i]+"Bt"), (vw-t.offsetWidth<390));
		}
	} // adjustToolbar()

	// adjust popup if visible
	this.adjustPopup = function () {
		if (!this.viewportWidth || !this.viewportHeight) return;

		vw = this.viewportWidth;
		vh = this.viewportHeight;

		// popup
		popupBgE.style.width = vw+"px";
		popupBgE.style.height = vh+"px";

		if (!this.cPopup) return;

		var pw = this.cPopup.contentE.offsetWidth;
		var ph = this.cPopup.contentE.offsetHeight;

		var so = 7; // shadow offset;

		popupFrameE.style.width = pw+"px";
		popupFrameE.style.height = ph+"px";

		this.cPopup.contentE.style.left =
		popupFrameE.style.left = Math.round(vw/2-pw/2)+"px";

		var t = Math.round(vh/2-ph/2);
		if (t>300) t = 300; // max 300 from top

		this.cPopup.contentE.style.top =
		popupFrameE.style.top = t+"px";
	} // adjustPopup()

	// adjust panels
	this.adjustPanels = function () {
		if (!this.viewportWidth || !this.viewportHeight) return;

		vw = this.viewportWidth;
		vh = this.viewportHeight;

		// quick apps panel
		var pw = quickAppsPanel.e.offsetWidth;
		var ph = quickAppsPanel.e.offsetHeight;

		quickAppsPanel.e.style.left = Math.round(vw/2-pw/2)+"px";

		var t = Math.round(vh/2-ph/2);
		if (t>300) t = 300; // max 300 from top
		t += 5; // +5 so it's slightly below the popups

		quickAppsPanel.e.style.top = t+"px";
	} // adjustPanels()

    // format file size. maximum 5 characters (including dot)
	this.formatFS = function (e) {
		if (e == undefined) return "";
		var cl = 5; // max char length
		var v = e;
		var s = v+"";
		var sa = s.split(".");
		// get rid of decimals?
		if (sa[0].length>=cl && sa[1]) { // integer part length >= cl
			v = Math.round(v);
			s = v+"";
		}
		// add k/M/G/T?
		var m = "";
		// always add K
		v = v/1000;
		m = "K";
		s = v+"";
		if (s.length>cl && v>1000) {
			v = v/1000;
			m = "M";
			s = v+"";
			if (s.length>cl && v>1000) {
				v = v/1000;
				m = "G";
				s = v+"";
				if (s.length>cl && v>1000) {
					v = v/1000;
					m = "T";
					s = v+"";
				}
			}
			}
		// still to long?
		var p = s.indexOf(".");
		if (p >-1) {
			sa = s.split(".");
			// get rid of decimals?
			if (sa[0].length>=cl && sa[1]) { // integer part length >= cl
				v = Math.round(v);
			} else {
				var d = 3-sa[0].length; // allowed decimals: 0,1,2. sa[0].lenght: 1,2,3
				var u = (d==0)?1:(d==1)?10:100;
				v = Math.round(v*u)/u;
			}
			s = v+"";
		}
		return s+" "+m+"B";
	} // formatFS()

    this.formatDate = function (date) {
        return date.replace(/-/g,"/").replace("T"," ").replace("Z","");
    }


    // init img, buttons, inputs, given a parent div
	this.initEvents = function (e) {
		var n = 0;
		var f;
		var x = /[mc].*?Button/;

        // we do it in two function. find a better way?
    	function initImg(e) {
    		if (Sfera.Device.touch) {
    			if (!e.ontouchdown) e.ontouchdown = new Function("return false;");
    		} else {
    			if (!e.onmousedown) e.onmousedown = new Function("return false;");
    		}
    	}

		function initDiv(e) {
			if (e.className && x.test(e.className)) {
				// it's a button
				var foc = e.getAttribute("data-onclick"); // on click function
				var fod = e.getAttribute("data-ondown");
				var selfv =  e.getAttribute("data-onover");
				var selfu =  e.getAttribute("data-onout");
				// no events? don't init
				if (foc == null && fod == null && selfv == null && selfu == null) return;
				// init
				new Sfera.UI.Button(e, {onclick:foc, ondown:fod, onover:selfv, onout:selfu});
				n++;
			}
		}

		var d,i;
		// add onmousedown on images
		for (i = 0; (d = e.getElementsByTagName("img")[i]); i++) initImg(d);
		if (e.nodeName == "IMG") initImg(e);

		for (i = 0; (d = e.getElementsByTagName("div")[i]); i++) initDiv(d);
		if (e.nodeName == "DIV") initDiv(e);

		for (i = 0; (d = e.getElementsByTagName("span")[i]); i++) initDiv(d);
		if (e.nodeName == "SPAN") initDiv(e);

	} // initEvents()

	// render a div and get size
	this.getDivSize = function (d) {
		var cd = d.cloneNode(true);
		this.tempAreaE.style.position = "absolute";
		this.tempAreaE.style.display = "inline";
		this.tempAreaE.appendChild(cd);
		// get size
		var w = cd.offsetWidth;
		var h = cd.offsetHeight;
		this.tempAreaE.innerHTML = "";
		this.tempAreaE.style.display = "none";
		return {w:w, h:h};
	} // getDivSize()

	// switch app
	this.switchApp = function (app, options) {
        // TODO: for now the text editor is not a stand alone app
        if (app == "fm" && textEditor.open && !textEditor.closing)
            app = "te";

		if (app == this.cApp) {
			this.closePopup();
			return;
		}

		this.closeToolbarPopup();
		this.closePopups();

		this.cApp = app;

		if (app) {
            this.apps[app].start(options); // app is only needed for clientApplication
        } else {
            this.hideOtherApps();
        }

		// update quick apps panel, add current? not currently visible and not a fixed one
		if (quickAppsPanel.buttonsIds.indexOf(this.cApp)==-1 && quickAppsPanel.fixedAppsIds.indexOf(this.cApp)==-1) {
			// can have 2 additional apps
			if (quickAppsPanel.buttonsIds.length<5) {
				quickAppsPanel.buttonsIds.push(this.cApp);
			} else {
				// replace older one
				for (var i=quickAppsPanel.buttonsIds.length-1; i>=0; i--) {
					// not a fixed one?
					if (quickAppsPanel.fixedAppsIds.indexOf(quickAppsPanel.buttonsIds[i]) == -1) {
						// replace it
						quickAppsPanel.buttonsIds[i] = this.cApp;
						break;
					}
				}
			}
		}
		// next based on current app
		for (var i=0; i<quickAppsPanel.buttonsIds.length; i++) {
			if (quickAppsPanel.buttonsIds[i] == this.cApp) {
				quickAppsPanel.buttonsIds.splice(0,0,quickAppsPanel.buttonsIds.splice(i,1)[0]); // move the element to the first position
				break;
			}
		}
	} // switchApp()

	// hide the other apps, (this app)
	this.hideOtherApps = function (app) {
        var a;
        for (var id in this.apps) {
            a = this.apps[id];
            if (a.open && a != app)
                a.hide();
        }
	}

	// restart server
	this.restartServer = function (confirm) {
		if (!confirm) {
			this.openPopup("restart", true);
		} else {
			this.closePopup();
			this.openPopup("waitrestart", false);
			files.load("restart");
		}
	} // restartServer()

    // --------------------------------------------------------------------------------------------------------------------------
	// Popup Functions ----------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// id of content (div: "popup-"+id), close button visible?, onClose function, clear (shadow background not visible)
	this.openPopup = function (contentId, closeBt, f, clear) {
		// is there an open popup?
		if (this.cPopup) {
			// same?
			if (this.cPopup.id == contentId)
				return;
			// hide
			this.cPopup.contentE.style.display = "none";
			this.popupStack.push(this.cPopup);
		}

		loseFocus();

		// popup stack
		this.cPopup = {id:contentId, closeBt:closeBt, onClose:f};
		this.cPopup.contentE = document.getElementById("popup-"+contentId);
		this.cPopup.data = getPopupData(this.cPopup.contentE);

		if (!clear)
			popupAreaContentsE.style.display = "block";
		showPopup(); // show current popup
	} // openPopup()

	// show current popup. used only by open and close popup
	function showPopup() {
		self.cPopup.contentE.style.display = "block";
		popupFrameE.style.display = "inline";
		self.adjustPopup();
		for (var id in self.cPopup.data.input) {
			focusElement(self.cPopup.data.input[id]);
			break;
		}
		self.cPopup.data.div["closeBt"].style.display = self.cPopup.closeBt?"inline":"none";
	} // showPopup()

	// show black, lock screen (when leaving page)
	this.showBlack = function () {
		this.closePopups();
		popupAreaContentsE.style.display = "block";
		popupFrameE.style.display = "none";
	} // showBlack()

	// close popup. keep data?
	this.closePopup = function (keep) {
		if (!this.cPopup) return; // nothing to close
		loseFocus();

		var c = this.cPopup; // save it, so we null cPopup
		this.cPopup = null;

		if (!keep) {
			for (var n in c.data.input) c.data.input[n].value = "";
			for (var n in c.data.select) c.data.select[n].selectedIndex = 0;
		}
		// hide
		c.contentE.style.display = "none";

		// onclose
		if (c.onClose)
			c.onClose();

		// other popups?
		if (this.popupStack.length) {
			this.cPopup = this.popupStack.pop();
			showPopup();
		} else {
			popupAreaContentsE.style.display = "none";
		}
	} // closePopup()

	// close all popups
	this.closePopups = function () {
		while (this.cPopup)
			this.closePopup();
	} // close all

	function getPopupData(e) {
		var res = {};

		// divs for quick access by name
		res.div = {};
		res.input = {};
		res.select = {};

		// get divs
		var divs,i;
		divs = e.getElementsByTagName("div");
		for (i=0; i<divs.length; i++)
			res.div[divs[i].getAttribute("name")] = divs[i];
		divs = e.getElementsByTagName("input");
		for (i=0; i<divs.length; i++) {
			var n = divs[i].getAttribute("name");
			var k = "";
			while (res.input[n+k]) k += "x"; // for radio buttons m,mx,mxx,mxxx..
			res.input[n+k] = divs[i];
		}
		divs = e.getElementsByTagName("select");
		for (i=0; i<divs.length; i++) res.select[divs[i].getAttribute("name")] = divs[i];

		return res;
	} // getPopupData()

	// init apps popup
	function initAppsPopup() {
		var e = document.getElementById("popup-appswitch");

		var d,n;
		for (var i = 0; (d = e.getElementsByTagName("div")[i]); i++) {
			n = d.getAttribute("name");
			if (!n) continue;
			switch (n) {
				case "content": appContentE = d; break;
				case "seAppBt": appBtsE["se"] = d; break;
				case "adAppBt": appBtsE["ad"] = d; break;
				case "weAppBt": appBtsE["we"] = d; break;
				case "peAppBt": appBtsE["pe"] = d; break;
				case "fmAppBt": appBtsE["fm"] = d; break;
				case "sbAppBt": appBtsE["sb"] = d; break;
				case "lvAppBt": appBtsE["lv"] = d; break;
				case "smAppBt": appBtsE["sm"] = d; break;
				case "kuAppBt": appBtsE["ku"] = d; break;
				case "buAppBt": appBtsE["bu"] = d; break;
				case "huAppBt": appBtsE["hu"] = d; break;
				case "sep1": 	appBtsE["-1"] = d; break;
				case "sep2": 	appBtsE["-2"] = d; break;
				case "sep3": 	appBtsE["-3"] = d; break;
			}
		}

		// updateAppsPopup(); called by onTopoUpdate
	} // initAppsPopup()

	// update apps popup
	function updateAppsPopup() {
		var e = document.getElementById("popup-appswitch");

		// detect ioservers
		var k = false, // knx?
			b = false, // bacnet?
			h = false; // heos
		if (JSONConfig && JSONConfig.hsycoconfig && JSONConfig.hsycoconfig.ioservers)
		for (var n in JSONConfig.hsycoconfig.ioservers) {
			switch (JSONConfig.hsycoconfig.ioservers[n].type) {
			case "knx":		k = true; break;
			case "bacnet":	b = true; break;
			case "heos":	h = true; break;
			}
		}

		var width;
		var ids;

		if (k || b || h) { // 4 cols
			e.style.width = "490px";
			ids = ["se","ad","sm","fm","-1",
			       "pe","","lv","sb","-2",
			       "we",k?"ku":"",b?"bu":"",h?"hu":"","-3"];
		} else { // 3 cols
			e.style.width = "370px";
			ids = ["se","ad","we","-1",
			       "pe","fm","sb","-2",
			       "lv","sm","-3"];
		}

		// update divs
		while (appContentE.childNodes.length)
			appContentE.removeChild(appContentE.childNodes[0]); // empty it, we saved the divs

		for (var i=0; i<ids.length; i++)
			if (ids[i])
				appContentE.appendChild(appBtsE[ids[i]]);
	}

	// show app switch popup
	this.showAppsPopup = function (closeBt) {
		this.closePopups(); // close all popups
		this.openPopup('appswitch',closeBt);
		this.adjustPopup(); // adjust because we've changed the size
	} // showAppsPopup()

	// show error popup
	this.showErrorPopup = function (e) {
		this.openPopup('error',false);
		this.cPopup.data.div["e"].innerHTML = e;
		this.adjustPopup(); // adjust because we've changed the size
	} // showErrorPopup()

	// show loading popup
	this.showLoadingPopup = function () {
		this.openPopup('loading',false);
		this.adjustPopup(); // adjust because we've changed the size
	} // showLoadingPopup()

	// show saving popup
	this.showSavingPopup = function () {
		this.openPopup('saving',false);
		this.adjustPopup(); // adjust because we've changed the size
	} // showSavingPopup()

	// show login popup
	this.showLoginPopup = function () {
		if (!self.cPopup || self.cPopup.id != "login") {
			self.closePopups(); // close all popups and notice
			self.clearNotice();
			self.switchApp("");
			self.openPopup("login", false);
			login.start();
		}
	} // showLoginPopup()

	// --------------------------------------------------------------------------------------------------------------------------
	// Panel Functions ----------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// init quick app panel
	function initQuickAppsPanel() {
		quickAppsPanel.e = document.getElementById("quickAppsPanel");
		var d = quickAppsPanel.e.getElementsByTagName("div");
		var n = "";
		for (var i=0; i<d.length; i++) {
			if (d[i].className == "quickAppsButton") {
				n = d[i].getAttribute("name");
				quickAppsPanel.buttonsE[n] = d[i];
			}
		}
		quickAppsPanel.buttonsIds = quickAppsPanel.fixedAppsIds.clone(); // initially visible apps
		updateQuickAppsPanel(); // empty it, we saved the divs
	} // initQuickAppsPanel()

	// show quick app switch panel
	this.showQuickAppsPanel = function () {
		// check if can open (no blocking popups). appswitch is closed even if blocking (when opening the wide)
		if (this.cPopup) {
			if (!this.cPopup.closeBt || this.cPopup.id == "appswitch") return;
		}

		if (quickAppsPanel.cId != -1) { // already visible?
			// next
			quickAppsPanel.cId = quickAppsPanel.cId.next(quickAppsPanel.buttonsIds.length);
		} else {
			quickAppsPanel.cId = this.cApp?1:0; // first
			quickAppsPanel.e.style.display = "inline";
		}
		// update
		updateQuickAppsPanel();
	} // showQuickAppsPanel

	// update quick apps panel
	function updateQuickAppsPanel() {
		while (quickAppsPanel.e.childNodes.length)
			quickAppsPanel.e.removeChild(quickAppsPanel.e.childNodes[0]); // empty it, we saved the divs
		if (quickAppsPanel.cId != -1) {
			var e;
			for (var i=0; i<quickAppsPanel.buttonsIds.length; i++) {
				e = quickAppsPanel.buttonsE[quickAppsPanel.buttonsIds[i]];
				quickAppsPanel.e.appendChild(e);
				e.style.opacity = (i == quickAppsPanel.cId)?"1":"0.5";
			}
			self.adjustPanels(); // adjust position
		}
	} // updateQuickAppsPanel()

	// hide quick app switch panel. if cancel, don't switch. returns true or false
	this.hideQuickAppsPanel = function (cancel) {
		if (quickAppsPanel.cId == -1) return false; // already hidden

		if (!cancel)
			this.switchApp(quickAppsPanel.buttonsIds[quickAppsPanel.cId]);

		quickAppsPanel.cId = -1; // reset
		quickAppsPanel.e.style.display = "none";
		// update
		updateQuickAppsPanel();
		return true;
	} // hideQuickAppsPanel

	// --------------------------------------------------------------------------------------------------------------------------
	// Toolbar popups Functions -------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// show toolbar popup. panel id, show (true, false, null:toggle). if panel id is "", all are hidden
	this.showToolbarPopup = function (p,show) {
		if (p == "")
			show = true;
		else if (show == null)
			show = (cToolbarPopup != p);

        document.getElementById("fm_toolbarToolsBt").btObj.setAttribute("selected",show == true && p == "fm_edit");

		if (!show && cToolbarPopup != p) // hide: already hidden?
			return;
		else if (!show && cToolbarPopup == p) // p becomes the only panel to show, or ""
			p = "";


		// optimization: nothing to change?
		if (cToolbarPopup == p) return;

		toolbarPopupFMEditE.style.display = (p == "fm_edit")?"inline":"none";
		toolbarPopupTEWarningsE.style.display = (p == "te_warnings")?"inline":"none";


		cToolbarPopup = p;

		//toolbarArrowE.style.display = (p)?"inline":"none";
		this.adjustToolbar();
	} // showToolbarPopup()

	// close current toolbar popup (if any)
	this.closeToolbarPopup = function () {
		this.showToolbarPopup("");
	} // closeToolbarPopup()

	// --------------------------------------------------------------------------------------------------------------------------
	// Notice Functions ----------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// show notice panel
	this.showNotice = function (txt, ms) {
		clearTimeout(noticeTimeout);
		document.getElementById("notice").innerHTML = txt;
		document.getElementById("noticePanel").style.display = "inline";
		if (noticeStatus == 0)
			animations.fadeAnimation(document.getElementById("noticePanel"), {fadeInTime:300});
		noticeStatus = 1; // showing
		if (ms == null)
			ms = NOTICE_WAIT;
		if (ms)
			noticeTimeout = setTimeout(function() {wide.clearNotice()}, ms); // specifying directly the function gave closeNow values
	} // showNotice()

	// clear notice panel
	this.clearNotice = function (closeNow) {
		clearTimeout(noticeTimeout);
		noticeStatus = 0; // not showing
		if (closeNow == true) {
			document.getElementById("notice").innerHTML = "";
			document.getElementById("noticePanel").style.display = "none";
		} else {
			animations.fadeAnimation(document.getElementById("noticePanel"), {fadeOutTime:1500});
		}
	} // clearNotice()

    // --------------------------------------------------------------------------------------------------------------------------
	// Events -------------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

    // key down
	this.onKeyDown = function (e) {
		if (!e) var e = window.event;
		// code
		var code;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		// target
		var t;
		if (e.target) t = e.target;
		else if (e.srcElement) t = e.srcElement;
		if (t.nodeType == 3) // defeat Safari bug
			t = t.parentNode;

		// backspace. prevent only when focused element is not password, text or file
		if ((code == 8) && !(t && t.tagName && (t.type && /(password)|(text)|(file)/.test(t.type.toLowerCase())) || t.tagName.toLowerCase() == 'textarea')) {
			Sfera.Browser.preventDefault(e);
			//return false;
		}

		// ctrl shift, show quick apps panel
		if (code == 16 && e.ctrlKey) {
			self.showQuickAppsPanel();
            return false;
        }

        // esc
		if (wide.cPopup && wide.cPopup.closeBt && code == 27) {
			wide.closePopup();
			Sfera.Browser.preventDefault(e);
			return;
		}

        if (this.cApp && this.apps[this.cApp].onKeyDown)
            this.apps[this.cApp].onKeyDown(e, code, t);

		//this.showNotice("keydown "+code+" "+e.ctrlKey,10000);
	}; // onKeyDown()

	// key up
	this.onKeyUp = function (e) {
		if (!e) var e = window.event;
		// code
		var code;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		// target
		var t;
		if (e.target) t = e.target;
		else if (e.srcElement) t = e.srcElement;
		if (t.nodeType == 3) // defeat Safari bug
			t = t.parentNode;

		// deselect?
		//if (!focusedElement) self.deselect();

		// ctrl shift released?
		if (!e.ctrlKey && self.hideQuickAppsPanel()) return; // close quick apps panel?

        if (this.cApp && this.apps[this.cApp].onKeyUp)
            this.apps[this.cApp].onKeyUp(e, code, t);
	}; // onKeyUp()

    this.onBeforeUnload = function (e) {

    };

    /////////////////////////// idle

    function stopIdleTimeout() {
        setIdleEvents(true);
        clearInterval(idleIntervalId);
    }

    function resetIdleTimeout() {
        stopIdleTimeout();
        if (config.idleTimeout && parseInt(config.idleTimeout) && !self.isLogin) {
            setIdleEvents();
            idleIntervalId = setInterval(onIdleInterval, 1000);
            localStorage.setItem("idleTimestamp",(new Date().getTime()));
        }
    }

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
		window[f](t?"touchstart":"mousedown", document.body, onIdleActivity);
		window[f](t?"touchend":"mouseup", document.body, onIdleActivity);
        window[f]("onkeydown", document.body, onIdleActivity);
	}
	function onIdleActivity(e) {
		resetIdleTimeout();
	}


};

Sfera.Wide.Apps = {};

// focus element
function focusElement(e) {
	focusedElement = e;
	if (e.focus) e.focus();
} // focus()

// focus input
function focusMe(e) {
	focusedElement = e;
} // focusMe()

// blur input
function blurMe(e) {
	focusedElement = null;
} // blurMe()

// lose focus
function loseFocus() {
	if (focusedElement) {
		try {
			focusedElement.blur();
		} catch (e) {}
		focusedElement = null;
		if (window.focus) window.focus();
	}
} // loseFocus()
