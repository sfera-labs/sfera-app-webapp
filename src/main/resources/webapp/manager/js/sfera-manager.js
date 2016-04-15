/*! sfera-webapp - Manager - v0.0.2 - 2016-04-15 */

var files;
var fileManager;
var textEditor;
var systemConsole;
var docViewer;

var focusedElement; // currently focused element

Sfera.Manager = function(config) {

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


        this.initEvents(document.getElementById("manager"));

        // animations
		animations = new Animations();

        // files
        files = new Sfera.Manager.Files();
        // file manager
        fileManager = addApp(new Sfera.Manager.Apps.FileManager());
        // text editor
        textEditor = addApp(new Sfera.Manager.Apps.TextEditor());
        // system console
        systemConsole = addApp(new Sfera.Manager.Apps.SystemConsole());
        // doc viewer
        docViewer = addApp(new Sfera.Manager.Apps.DocViewer());

        window.onresize = this.onResize.bind(this);
        /*
        window.onload = onLoadInit;
        window.onorientationchange = onOrientationChange;
        window.onbeforeunload = onBeforeUnload;
        */

       this.onResize();

       this.showAppsPopup();

       Sfera.Net.boot();
       Sfera.Net.wsOpen();
       Sfera.Net.onMessage.add(onWSMessage);
    }

    function onWSMessage(jsonStr) {
        json = JSON.parse(jsonStr);
        switch (json.type) {
            case "console":
                systemConsole.output(json.output);
                break;
            case "event":
                // manager.showNotice("hsyco.jar updated");
                if (json.files)
                    fileManager.onWSMessage(json);
                break;
        }
    }

    // focus, restore key events
	this.focus = function () {
		document.onkeydown = this.onKeyDown;
		document.onkeyup = this.onKeyUp;
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

    // adjust manager layout. viewport size
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

		// panel and arrow pos, better fixed position???
		/*
		switch (cToolbarPopup) {
		case "pe_edit":
			toolbarArrowE.style.left = Math.round(document.getElementById("pe_toolbarToolsBt").offsetLeft+document.getElementById("pe_toolbarToolsBt").offsetWidth/2+192)+"px"; // 192 = 200 (left panel) - 16/2 (arrow width)
			break;
		case "pe_warnings":
			toolbarPopupPEWarningsE.style.left = Math.round(document.getElementById("pe_toolbarWarningsBt").offsetLeft+document.getElementById("pe_toolbarWarningsBt").offsetWidth/2+100)+"px"; // 100 = 200 (left panel) - 200/2 (panel width)
			toolbarArrowE.style.left = Math.round(document.getElementById("pe_toolbarWarningsBt").offsetLeft+document.getElementById("pe_toolbarWarningsBt").offsetWidth/2+192)+"px";
			break;
		case "fm_edit":
			var ebt = document.getElementById("fm_toolbarToolsBt");
			toolbarArrowE.style.left = Math.round(ebt.offsetLeft+ebt.offsetWidth/2-8+tbW)+"px"; // (16/2) arrow width
			break;
		case "fm_warnings":
			toolbarPopupTEWarningsE.style.left = Math.round(document.getElementById("fm_toolbarWarningsBt").offsetLeft+document.getElementById("fm_toolbarWarningsBt").offsetWidth/2-100)+"px";  // -100 = - 200/2 (panel width)
			toolbarArrowE.style.left = Math.round(document.getElementById("fm_toolbarWarningsBt").offsetLeft+document.getElementById("fm_toolbarWarningsBt").offsetWidth/2-8)+"px";  // -8 = - (16/2) arrow width
			break;
		}
        */
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

		function initInput(e) {
            /*
			f = e.getAttribute("data-autocomplete"); // autocomplete values
			if (f!=null) { // any values?
				self.initAutocomplete(e, f);
			}
            */
		}

		function initLabel(e) {
            /*
			e.onclick = function (){
				var pe = this.previousSibling;
				if (pe.nodeType == 3) pe = pe.previousSibling; // text node? try previous one
				pe.checked = !pe.checked;
				if (pe.onchange) pe.onchange();
			};
            */
		}

		var d,i;
		// add onmousedown on images
		for (i = 0; (d = e.getElementsByTagName("img")[i]); i++) initImg(d);
		if (e.nodeName == "IMG") initImg(e);

		for (i = 0; (d = e.getElementsByTagName("div")[i]); i++) initDiv(d);
		if (e.nodeName == "DIV") initDiv(e);

		for (i = 0; (d = e.getElementsByTagName("span")[i]); i++) initDiv(d);
		if (e.nodeName == "SPAN") initDiv(e);

		for (i = 0; (d = e.getElementsByTagName("input")[i]); i++) initInput(d);
		if (e.nodeName == "DIV") initInput(e);

		for (i = 0; (d = e.getElementsByTagName("label")[i]); i++) initLabel(d);
		if (e.nodeName == "LABEL") initLabel(e);
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
			// focus, restore events..
			switch (this.cApp) {
			case "te": textEditor.focus(); break;
			case "fm": fileManager.focus(); break;
			case "sb": statusBrowser.focus(); break;

			case "lv": logViewer.focus(); break;
			case "sm": systemMonitor.focus(); break;
			}
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
		// check if can open (no blocking popups). appswitch is closed even if blocking (when opening the manager)
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
			noticeTimeout = setTimeout(function() {manager.clearNotice()}, ms); // specifying directly the function gave closeNow values
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

};

Sfera.Manager.Apps = {};

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


//--------------------------------------------------------------------------------------------------------------------------
// Animations --------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

// Animations Class
function Animations() {
	var step = 50; // animation step msec

	var anims = {}; // animation data
	var cAnimation = 0; // current animation id

	var foo = this;

	// options: waitTime, fadeInTime, idleTime, fadeOutTime (msec time), fadeFrom, fadeTo (opacity), onFadeIn, onFadedIn, onFadeOut, onFadedOut (events)
	this.fadeAnimation = function(e, options) {
		if (!options) return; // ?
		cAnimation++;
		var a = options; // get all options and add
		a.e = e;
		a.type = "fade";
		a.id = cAnimation;
		a.timeout = null;
		a.s = 0; // status: 0 init (and wait), 1 fadeIn, 2 idle, 3 fadeOut
		a.c = 0; // current step. for status 1,3
		a.t = 0; // total steps for current status
		if (a.fadeFrom == null)
			a.fadeFrom = 0;
		if (a.fadeTo == null)
			a.fadeTo = 100;
		if (a.fadeFrom == a.fadeTo) { // shouldn't happen
			setOpacity(a.fadeFrom);
			return null;
		}
		// there's already a fade animation on this object?
		for (var i in anims) {
			if (anims[i] && anims[i].e == e) {
				if (anims[i].type == "fade")
					a.cv = anims[i].v; // save current value, so we fade from there
				this.removeAnimation(anims[i]);
			}
		}
		anims["a"+cAnimation] = a;
		onAnimationUpdate(a);
		return a;
	} // fadeInOut()

	// size animation
	this.sizeAnimation = function(e, f, time, w, h) {
		if (!options) return; // ?
		cAnimation++;
		var a = { e:e, type:"size", id:cAnimation, timeout:null, a:time, w:w, h:h, ow:e.offsetWidth, oh:e.offsetHeight };
		a.s = 0; // status: 0 init, 1 resizing
		a.t = 0; // current steps
		// there's already a size animation on this object?
		for (var i in anims) {
			if (anims[i] && anims[i].e == e) {
				this.removeAnimation(anims[i]);
			}
		}
		anims["a"+cAnimation] = a;
		onAnimationUpdate(a);
		return a;
	} // sizeAnimation()

	// remove animation
	this.removeAnimation = function(a) {
		// interval?
		if (a.timeout) {
			clearTimeout(a.timeout);
			a.timeout = null;
		}
		anims[a.id] = null;
		delete anims[a.id];
	} // removeAnimation()

	//
	function callAnimationUpdateOnTimeout(a,msec) {
		a.timeout = setTimeout(function(){onAnimationUpdate(a)},msec);
	} // callAnimationUpdateOnTimeout()

	//  on animation update
	function onAnimationUpdate(a) {
		//var a = anims["a"+id];
		if (!a) return; // error
		// interval?
		if (a.timeout) {
			clearTimeout(a.timeout);
			a.timeout = null;
		}
		// still there?
		if (!a.e) {
			foo.removeAnimation(a);
			return;
		}
		// animation
		switch (a.type) {
		case "fade":
			switch (a.s) {
			case 0: // init, wait
				a.s = 1;
				if (a.onFadeIn) // event
					a.onFadeIn();
				if (a.fadeInTime) { // fadeInTime
					a.t = Math.floor(a.fadeInTime/step); // total steps
					if (a.cv != null) {
						a.v = a.cv; // current value
						a.cv = null; // so we don't do it again on fadeOut
						a.c = Math.round(a.t*((a.v-a.fadeFrom)/(a.fadeTo-a.fadeFrom))); // calc current step, so we fade from there
					} else {
						a.v = a.fadeFrom; // current value
					}
					setOpacity(a.e,a.v);
					a.e.style.display = "inline";
					callAnimationUpdateOnTimeout(a,a.waitTime?a.waitTime:step);
					break;
				}
				// next state, don't break
			case 1: // fading in
				// done?
				if (!a.fadeInTime || a.c == a.t) {
					a.v = a.cv?a.cv:a.fadeTo; // current value
					setOpacity(a.e,a.v);
					a.s = 2;
					if (a.onFadedIn) // event
						a.onFadedIn();
					if (a.idleTime) {
						callAnimationUpdateOnTimeout(a,a.idleTime);
						break;
					} // else next state, don't break
				} else {
					a.c++;
					a.v = a.fadeFrom+((a.fadeTo-a.fadeFrom)*a.c/a.t); // current value
					setOpacity(a.e,a.v);
					callAnimationUpdateOnTimeout(a,step);
					break;
				}
			case 2: // idle
				if (!a.fadeOutTime) {
					foo.removeAnimation(a); // all done
					break;
				} else {
					a.s = 3;
					a.c = 0;
					a.t = Math.floor(a.fadeOutTime/step); // total steps
					if (a.cv != null) {
						a.v = a.cv; // current value
						a.c = Math.round(a.t*((a.fadeTo-a.v)/(a.fadeTo-a.fadeFrom))); // calc current step, so we fade from there
					}
					if (a.onFadeOut) // event
						a.onFadeOut();
					// next state, don't break
				}
			case 3: // fading out
				// done?
				if (a.c == a.t) {
					a.v = a.fadeFrom; // current value
					setOpacity(a.e,a.v);
					a.e.style.display = "none"; // optimize
					foo.removeAnimation(a); // all done
					if (a.onFadedOut) // event
						a.onFadedOut();
				} else {
					a.c++;
					a.v = a.fadeTo-((a.fadeTo-a.fadeFrom)*a.c/a.t); // current value
					setOpacity(a.e,a.v);
					callAnimationUpdateOnTimeout(a,step);
				}
				break;
			}
			break;
		case "size":
			switch (a.s) {
			case 0: // init
				a.s = 1;
				a.t = Math.floor(a.a/step); // total steps
			}

		}
	} // onAnimationUpdate()

	// set element opacity
	function setOpacity(obj,opacity) {
		opacity = (opacity == 100)?99.999:opacity; // why?
		obj.style.filter = "alpha(opacity:"+opacity+")"; // IE/Win
		obj.style.KHTMLOpacity = opacity/100; // Safari<1.2, Konqueror
		obj.style.MozOpacity = opacity/100; // Older Mozilla and Firefox
		obj.style.opacity = opacity/100; // Safari 1.2, newer Firefox and Mozilla, CSS3
	} // setOpacity()

	//--------------------------------------------------------------------------------------------------------------------------------
	// Blinker -----------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------

	var blinkInterval = null;
	var blinkE = []; // elements that blink
	var blinkC = 0; // counter 0->3

	this.getBlinks = function () {
		return blinkE;
	}

	// check if the element is not null and currently inside the DOM
	function isInDOMTree(node) {
		if (!node) return false;
		// find ultimate ancestor
		while(node.parentNode)
			node = node.parentNode;
		return !!(node.body);
	}

	// set blinking. mode: true|slow; fast; false;. r:reserved for interface objects, stopAll doesn't stop these
	this.setBlink = function (e,mode,r) {
		// already there?
		for (var i=0; i<blinkE.length; i++) {
			if (blinkE[i].e == e) {
				updateElementBlink(e,null);
				blinkE.splice(i,1);
				break;
			}
		}
		// add?
		if (mode && mode != "false") {
			blinkE.push({e:e, f:(mode == "fast"), r:r});
		}
		// start or clear
		if (blinkE.length && !blinkInterval) {
			blinkInterval = setInterval(updateBlink,250);
		} else if (!blinkE.length && blinkInterval) {
			clearInterval(blinkInterval);
			blinkInterval = null;
		}
	} // setBlink()

	// stop all
	this.stopAllBlink = function () {
		for (var i=0; i<blinkE.length; i++) {
			// stop all not reserved
			if (!blinkE[i].r) {
				updateElementBlink(blinkE[i].e,null); // null resets it
				blinkE.splice(i,1);
				i--;
			}
		}
		if (!blinkE.length && blinkInterval) {
			clearInterval(blinkInterval);
			blinkInterval = null;
		}
	} // stopAllBlink()

	// update blinking
	function updateBlink() {
		blinkC = blinkC.next(4);
		for (var i=0; i<blinkE.length; i++) {
			// not in DOM anymore?
			if (!isInDOMTree(blinkE[i].e)) {
				updateElementBlink(blinkE[i].e,null); // null resets it
				blinkE.splice(i,1);
				i--;
			}
			else if (blinkE[i].f)
				updateElementBlink(blinkE[i].e, (blinkC%2==0));
			else
				updateElementBlink(blinkE[i].e, (blinkC<2));
		}
		// if we removed stuff
		if (!blinkE.length && blinkInterval) {
			clearInterval(blinkInterval);
			blinkInterval = null;
		}
	} // updateBlink()

	// set blink on or off
	function updateElementBlink(e,b) {
		if (!e) return; // element no longer exists
		browser.setOpacity(e, (b==null)?null:(b?1:0.3));
		//if (browser.browser == "Safari" && !browser.iOS) // prevents weird artifacts on Safari
		//	e.style.webkitTransform = (b!=null)?"translateZ(0)":"";
	} // updateElementBlink()
} // Animation Class

//--------------------------------------------------------------------------------------------------------------------------
// Files -------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Manager.Files = function () {
	var req = new Sfera.Net.Request();

	// name and type of resource currently loading
	this.resID = "";
	this.resType = "";

	var foo = this;

	// init
	function init() {
		req.onLoaded = onResourceLoaded;
		req.onError = onResourceError;
		// req.onAuthenticate = showPin; TODO
		//req.onNoAccess = function () {manager.showErrorPopup("No access");}; TODO
	} // init()

	// encode file name
	this.encodeFileName = function (n) {
		if (n=="") n=".";
		n = encodeURIComponent(n);
		return n.replace(/\*/g,"%2A"); //.replace(/\./g,"%2E");
	} // encodeFileName()

	// load a file. type, value, wait msec?
	this.load = function (type, value, msec) {
		if (!msec) msec = 10; // default 10 msec timeout
		var url = "";
		var ts = (new Date()).getTime();
		var resID = value;

		req.method = "GET";
		switch (type) {
		// file manager
		case "list":
		case "refresh_list":
            url = "/api/files/ls?path="+this.encodeFileName(value);
            url += "&depth=0";
			break;
		case "readfile":
            url = "/api/files/read?path="+this.encodeFileName(value);
			break;
		case "writefile":
			resID = value[0];
			url = "/api/files/write";
			req.addData("path",value[0]);
			req.addData("content",value[1]);
			req.method = "POST";
			break;
		case "newfolder":
			url = "/api/files/mkdir?path="+this.encodeFileName(value);
			break;
		case "deletefile":
			url = "/api/files/rm?";
			for (var i=0; i<value.length; i++)
				url += (i?"&":"")+"path="+this.encodeFileName(value[i]);
			break;
		case "renamefile":
		case "movefiles":
		case "movefilesoverwrite":
			url = "/api/files/mv?";
			for (var i=0; i<value.length-1; i++)
				url += (i?"&":"")+"source="+this.encodeFileName(value[i]);
			url += "&target="+this.encodeFileName(value.last());
			if (type == "movefilesoverwrite")
				url += "&force=true";
			break;
		case "duplicatefile":
		case "copyfiles":
		case "copyfilesoverwrite":
			url = "/api/files/cp?";
			for (var i=0; i<value.length-1; i++)
				url += (i?"&":"")+"source="+this.encodeFileName(value[i]);
			url += "&target="+this.encodeFileName(value.last());
			if (type == "copyfilesoverwrite")
				url += "&force=true";
			break;
		case "gettextpreview":
			url = "/api/files/read?path="+this.encodeFileName(value);
			url += "&lines=9";
			break;
		}

		// avoid caching
		if (req.method == "GET")
			url += "&ts="+ts;

		this.resType = type;
		this.resID = resID;

		req.open(url,msec);
	} // load()

	// delete a file
	this.del = function (name) {
		var ts = "."+(new Date()).getTime();
		var url = "/x/files?dr"+ts;
		url += "*"+this.encodeFileName(name);
		this.resType = "delproj";
		this.resID = name;
		req.open(url);
	} // del()

	// on resource loaded event
	function onResourceLoaded() {
		var json;
		if (foo.resType == "readfile" || foo.resType == "gettextpreview")
			json = {content:this.getResponseText()};
		else
        	json = this.getResponseJSON();

		onResource(json, 0);
	}

	// error
	function onResourceError(errCode) {
		var json = this.getResponseJSON();
		onResource(json, errCode)
	}

	function onResource(json, errCode) {
		var noticeTxt = "";
		var errorText = "";
		var errorDescr = "";

		if (errCode) {
			// close popups?
		    if (manager.cPopup && (manager.cPopup.id == "saving" || manager.cPopup.id == "loading"))
		    	manager.closePopup();
			// error
			manager.clearNotice();

			errorDescr = json ? json.error : "";
			if (errorDescr)
				errorDescr = errorDescr[0].toLowerCase() + errorDescr.substr(1);
			errorText = "Error loading "+files.resType;
			if (files.resID) errorText += ", "+files.resID;
		}

		var w = 100; // wait before next request (prevents hanging?)
	    switch(foo.resType) {
	    // file manager
	    case "list":
			if (!errCode)
				fileManager.onList(json.result);
	    	break;

		case "refresh_list":
			if (!errCode)
				fileManager.refreshFolder(json.result);
			break;

		case "readfile":
			if (!errCode && manager.cApp == "te")
				textEditor.onFileRead(json.content);
			break;

		case "writefile":
			if (!errCode && manager.cApp == "te")
				textEditor.onFileSaved(json);
	    	break;

		case "newfolder":
			manager.closePopup();
			var name = foo.resID.split("/").pop();
			if (!errCode)
				noticeTxt = "new folder (<b>"+name+"</b>) created";
			else
				noticeTxt = "error creating new folder: "+err;
			var o = fileManager.popupMode?fileManager.popupData:fileManager;
			fileManager.browseTo(o.currentPath);
			break;

		case "deletefile":
			manager.closePopup();
			var n = foo.resID.length;
			var fs = "file"+(foo.resID.length>1?"s":""); // file string
			if (errCode)
				noticeTxt = "error deleting "+fs+": "+json.error;
			else
				noticeTxt = n+" "+fs+" deleted";
			var o = fileManager.popupMode?fileManager.popupData:fileManager;
			fileManager.browseTo(o.currentPath);
			break;

		case "renamefile":
		case "duplicatefile":
			var s1 = (foo.resType == "renamefile")?"renaming":"duplicating";
			var s2 = (foo.resType == "renamefile")?"renamed":"duplicated";

			var name = foo.resID[0].split("/").pop();
			if (errCode) {
				noticeTxt = "error "+s1+" <b>"+name+"</b>: "+json.error;
			} else {
				noticeTxt = "<b>"+name+"</b> "+s2;
				// select the new file
				var o = fileManager.popupMode?fileManager.popupData:fileManager;
				fileManager.selectItem(-1);
				fileManager.browseTo(o.currentPath);
			}
			break;

		case "movefiles":
		case "movefilesoverwrite":
		case "copyfiles":
		case "copyfilesoverwrite":
			var n = foo.resID.length-1; // last param is target folder
			var fs = "file"+(n>1?"s":""); // file string
			var m = (foo.resType == "movefiles" || foo.resType == "movefilesoverwrite");
			var as1 = m?"moved":"copied"; // action string 1
			var as2 = m?"moving":"copying"; // 2

			if (errCode)
				noticeTxt = "error "+as2+" "+fs+": "+errorDescr;
			else
				noticeTxt = n+" "+fs+" "+as1+" to <b>"+foo.resID.last()+"</b>";

			if (errorDescr == "target file already exists") {
				manager.openPopup("overwritefiles",true);
			}

			/*
			switch (this.getResponseText()) {
			case "ack":			noticeTxt = n+" "+fs+" "+as1+" to <b>"+foo.resID.last()+"</b>"; break; // mv, mvo
			case "error":		noticeTxt = "error "+as2+" "+fs; break; // mv, mvo
			case "error:size":	noticeTxt = "error "+as2+" "+fs+": total size exceeds the limit"; break; // mv, mvo
			case "error:same":	noticeTxt = "error "+as2+" "+fs+": source and destination folders are the same"; break;
			case "error:exists":
				break;  // mv
			}
			*/

			break;

		case "gettextpreview":
			fileManager.updateTextPreview(json.content);
			break;

	    }


		// show a notice
		if (noticeTxt) {
			manager.showNotice(noticeTxt);
			errorText = "";
		}

		// still an error to show?
		if (errorText) {
			var str = errorText + ": "+errorDescr+" ("+errCode+")";
			manager.showErrorPopup(str);
		}
	} // onResourceLoaded()

	// get skin from source
	this.getSkin = function (txt) {
		var p = txt.indexOf("(#skin ");
		var b = p+7;
		var e = txt.indexOf(")",b);
		// TODO:errors
		return txt.substr(b,e-b);
	} // getSkin

	init();
} // Files()


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
window.addEventListener("load", function() {
    Z("bg").innerHTML = "<canvas id='c'></canvas>";
    setInterval(dr, 50);
});


//--------------------------------------------------------------------------------------------------------------------------
// Documentation Viewer ----------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Manager.Apps.DocViewer = function() {
    this.id = "dv";
	this.open = false; // currently open. set by start, hide

    var started = false; // if already started, will just switch

	this.fontSize = 12;

	this.e = document.getElementById("docViewer");

    var toolbarE = document.getElementById("dv_toolbar");

	var panelE = document.getElementById("dv_docPanel");
	var headerLabelE = document.getElementById("dv_editorHeaderLabel");

	var self = this;

	// init
	function init() {
	} // init()

	// start
	this.start = function (options) {
		manager.hideOtherApps(this);

		this.e.style.display = "inline";

        generate();

		this.adjustLayout();
	} // start()

	// hide (switching to another app)
	this.hide = function () {
		this.e.style.display = "none";

		manager.focus();

		this.open = false;
	} // hide()

	// adjust layout. viewport size
	this.adjustLayout = function () {
		if (!manager.viewportWidth || !manager.viewportHeight) return;

		var	vw = manager.viewportWidth;
		var	vh = manager.viewportHeight;

		// tool bar size
		var tbW = 0; // left one
		var tbH = 36; // top one

		// editable area size
		var eW = vw - tbW;
		var eH = vh - tbH;

		toolbarE.style.left = (tbW-1)+"px"; // +1, attach it to the iconPanel
		toolbarE.style.width = (eW+1)+"px";

		// panels
		var bs = 1; // border size
		var pm = 5+bs; // panel margin: padding + border size
		var pd = 7; // panel distance from border
		var pw = Math.round((vw-pd*3-pm*4)/2); //;
		var ph = vh-tbH-pm*2-pd*2;
		if (pw<340) pw = 340;

		pw = (vw-pd*3-pm*4) -pw; // fix it: since it's /2, pw could be 1 pixel wider

		var eW = vw-pm*2-pd*2; // full content width

		panelE.style.left = (pd)+"px";
		panelE.style.top = (tbH+pd)+"px";
		panelE.style.width = (eW)+"px";
		panelE.style.height = (ph)+"px";
	} // adjustLayout()

    // set edit font size
	this.setFontSize = function (a) {
		if (a) this.fontSize++; else this.fontSize--;
		editorE.style.fontSize = this.fontSize+"px";
		//editorE.style.lineHeight = Math.round(this.editorFontSize + this.editorFontSize/2)+"px";
	} // setEditFontSize()



    function generate() {
        var html = "";

        panelE.innerHTML = "<iframe>"+html+"</iframe>";
        var iframeDoc = panelE.childNodes[0].contentWindow.document;

        for (var c in Sfera.Components.Classes) {
            if (c[0] == "_")
                continue;

            html += getComponentHTML(Sfera.Components.Classes[c]);
        }

        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    }

    function getComponentHTML(cc) {
        var res = "";
        function $(txt) {
            res += txt;
        }
        function _br() {
            return '<br />';
        }
        function _s() {
            return '&nbsp;';
        }
        function _b(txt) {
            return '<b>'+txt+'</b>';
        }
        function _a(txt,link) {
            return '<a href="' + link + '">' + txt + '</a>';
        }
        function _h(l,name) {
            return '<h' + l + '>' + name + '</h' + l + '>';
        }
        function _ta(e,c) {
            return (e?"</":"<") + "table" + (e || !c?">":" class='"+c+"'");
        }
        function _r(e) {
            return (e?"</":"<") + "tr>"
        }
        function _c(text) {
            return "<td>" + text + "</td>";
        }
        function _ch(text) {
            return "<th>" + text + "</th>";
        }

        var co = new cc({doc:true});

        // title
        $(_h(1,_a(co.type,"#"+co.type)));

        try {
            $(co.doc);
        } catch (e) {
            console.log(e);
        }

        for (sub in co.subComponents) {
            $(_h(2,"Sub components"));
            break;
        }
        for (var sub in co.subComponents) {
            var t = co.subComponents[sub].type;
            $(_sub + _s());
            $(_a("["+t+"]", "#"+t));
            $(_br());
        }

        $(_h(2, "Attributes"));
        $(_ta(0,"docTable"));
        
        $(_r());
        $(_ch("Name"));
        $(_ch("Type"));
        $(_ch("Values"));
        $(_ch("Description"));
        $(_r(1));

        for (var attr in co.attributes) {
            $(_r());

            var a = co.attributes[attr];

            $(_c(_b(attr)));

            $(_c(a.type));

            var str = "";
            var av = co.attributes[attr].values;
            if (av) {
                if (Sfera.Utils.isFunction(av)) {
                    try {
                        av = av();
                    } catch (e) {
                        av = [];
                    }
                }
                if (Sfera.Utils.isArray(av)) {
                    while (str.length < 35) str += " ";
                    str += "<" + av.join("|") + ">";
                }
            }

            $(_c(str));

            $(_c(a.doc?a.doc:""));

            $(_r(1));
        }
        $(_ta(1));

        $('<link rel="stylesheet" href="css/style.css">');

        return res;
    }

	init();
};


//--------------------------------------------------------------------------------------------------------------------------
// File Manager ------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Manager.Apps.FileManager = function() {
    this.id = "fm";
	this.open = false; // currently open. set by start, hide

    var started = false; // if already started, will just switch

	// upload progress
	var uploadProgressReq = new Sfera.Net.Request();
	var uploadReq; // xmlHTTPRequest for upload

	this.rootPath = ""; // root folder. never changes?

	this.currentPath = ""; // path
	this.currentFile = ""; // current file, full path
	this.currentFolder = null; // contents of the current folder (array)
	this.folderTs = 0; // timestamp
	this.filesInFolder = 0; // number of files in folder, from data (currentFolder)

	this.filter = null; // reg exp

	this.selectedItem = -1; // currently selected item (or last selected item if multiple)
	this.selectedItems = []; // for multiple selection

    this.itemButtons = [];
    this.pathButtons = [];

	// multiple file selection
	var selMode; // null, key, bt

	// save copy, move data to resend on overwrite confirm
	var copyData = [];
	var moveData = [];

	this.dirsPanelWidth = 0; // width of the dir panel

	this.popupMode = false; // open in popup
	this.popupData = {
		currentPath : "", // path
		currentFile : "", // current file, full path
		currentFolder : null, // contents of the current folder (array)
		folderTs : 0, // folder timestamp
		filter : null, // view file filter
		replace : [], // replaces once file is chosen
		rootPath: "", // folder root (can't go up)
		defaultPath: "", // default root (start browsing from here)
		selectedItem : -1 // currently selected item
	}

	this.uploadCheckInterval = null; // interval to check the current upload

	this.logPreviewVisible = false; // is log visible?

	this.uploading = false; // upload panel will be visible
	this.uploadProgressVisible = false; // will be visible for a while after uploading is done
	var uploadData = {}; // upload data, filename, size
	this.uploadDoneTimeout = null; // timeout to close the panel when done
	var formDataSupport = (!!window.FormData); // support for xmlhttpreq upload method

	var selectOnRefresh; // item to select {path:..., name:...}

	this.e = document.getElementById("fileManager");

	var pathE = document.getElementById("fm_dirsPath");
	var pathPE = document.getElementById("fm_dirsPPath");

	var dirsHeaderE = document.getElementById("fm_dirsHeader");
	var dirsPanelE = document.getElementById("fm_dirsPanel");
	var dirsContentE = document.getElementById("fm_dirsContent");
	var dirsParentBtE = document.getElementById("fm_dirsParentBt");
	var dirsUploadBtE = document.getElementById("fm_dirsUploadBt");
	var dirsNewFileBtE = document.getElementById("fm_dirsNewFileBt");
	var dirsNewFolderBtE = document.getElementById("fm_dirsNewFolderBt");

	var dirsPHeaderE = document.getElementById("fm_dirsPHeader");
	var dirsPContentE = document.getElementById("fm_dirsPContent");
	var dirsPParentBtE = document.getElementById("fm_dirsPParentBt");
	var dirsPUploadBtE = document.getElementById("fm_dirsPUploadBt");
	var dirsPNewFolderBtE = document.getElementById("fm_dirsPNewFolderBt");

	var dirsPConfirmBtE = document.getElementById("fm_dirsPConfirmBt");

	var detailsContentE = document.getElementById("fm_detailsContent");
	var detailsPContentE = document.getElementById("fm_detailsPContent");

	var detailsPanelE = document.getElementById("fm_detailsPanel");
	var detailsPPanelE = document.getElementById("fm_detailsPPanel");

	var toolbarE = document.getElementById("fm_toolbar");

	var loadingE = document.getElementById("fm_dirsLoading");
	var loadingLabelE = document.getElementById("fm_dirsLoadingLabel");

	var loadingPE = document.getElementById("fm_dirsPLoading");

	var detailsSelE = document.getElementById("fm_detailsSel");
	var detailsSelNE = document.getElementById("fm_detailsSelN");
	var detailsTotE = document.getElementById("fm_detailsTot");
	var detailsNameE = document.getElementById("fm_detailsName");
	var detailsNameVE = document.getElementById("fm_detailsNameV");
	var detailsKindE = document.getElementById("fm_detailsKind");
	var detailsKindVE = document.getElementById("fm_detailsKindV");
	var detailsSizeE = document.getElementById("fm_detailsSizeV");

	var detailsPSelE = document.getElementById("fm_detailsPSel");
	var detailsPSelNE = document.getElementById("fm_detailsPSelN");
	var detailsPTotE = document.getElementById("fm_detailsPTot");
	var detailsPNameE = document.getElementById("fm_detailsPName");
	var detailsPNameVE = document.getElementById("fm_detailsPNameV");
	var detailsPKindE = document.getElementById("fm_detailsPKind");
	var detailsPKindVE = document.getElementById("fm_detailsPKindV");
	var detailsPSizeE = document.getElementById("fm_detailsPSizeV");

	var detailsDirIconE = document.getElementById("fm_detailsDirIcon");
	var detailsFileIconE = document.getElementById("fm_detailsFileIcon");
	var detailsFilesIconE = document.getElementById("fm_detailsFilesIcon");
	var detailsTextPreviewE = document.getElementById("fm_detailsTextPreview");
	var detailsFileIconOverE = document.getElementById("fm_detailsFileIconOver");
	var detailsImgPreviewE = document.getElementById("fm_detailsImgPreview");

	var detailsPDirIconE = document.getElementById("fm_detailsPDirIcon");
	var detailsPFileIconE = document.getElementById("fm_detailsPFileIcon");
	var detailsPFilesIconE = document.getElementById("fm_detailsPFilesIcon");
	var detailsPTextPreviewE = document.getElementById("fm_detailsPTextPreview");
	var detailsPFileIconOverE = document.getElementById("fm_detailsPFileIconOver");
	var detailsPImgPreviewE = document.getElementById("fm_detailsPImgPreview");

	var detailsBtOpenFolderE = document.getElementById("fm_detailsBtOpenFolder");
	var detailsBtEditE = document.getElementById("fm_detailsBtEdit");
	var detailsBtOpenVEE = document.getElementById("fm_detailsBtOpenVE");
	var detailsBtDeleteE = document.getElementById("fm_detailsBtDelete");
	var detailsBtRestartE = document.getElementById("fm_detailsBtRestart");
	var detailsBtMoveE = document.getElementById("fm_detailsBtMove");
	var detailsBtDuplicateE = document.getElementById("fm_detailsBtDuplicate");
	var detailsBtRenameE = document.getElementById("fm_detailsBtRename");
	var detailsBtDownloadE = document.getElementById("fm_detailsBtDownload");

	var uploadProgressPanelE = document.getElementById("fm_uploadProgressPanel");
	var uploadContentE = document.getElementById("fm_uploadContent");
	var uploadFileNameE = document.getElementById("fm_uploadFileName");
	var uploadBarE = document.getElementById("fm_uploadBar");
	var uploadProgressE = document.getElementById("fm_uploadProgress");
	var uploadBytesE = document.getElementById("fm_uploadBytes");

	var uploadPFileNameE = document.getElementById("fm_uploadPFileName");
	var uploadPBarE = document.getElementById("fm_uploadPBar");
	var uploadPProgressE = document.getElementById("fm_uploadPProgress");
	var uploadPBytesE = document.getElementById("fm_uploadPBytes");

	var uploadFileInputE = document.getElementById("fm_uploadFileInput");

	var self = this;

	// init
	function init() {
		uploadProgressReq.onLoaded = onUploadProgressUpdate;
		uploadProgressReq.onAuthenticate = function (lock) {fileManager.onUploadProgressError(); showPin(lock);}; // showPin will stop apps
		uploadProgressReq.onNoAccess = function () {fileManager.onUploadProgressError(); manager.showErrorPopup("No access");};
		uploadProgressReq.onError = self.onUploadProgressError; // other errors, connection..

		if (Sfera.Device.iOS) {
			dirsUploadBtE.style.display = "none";
			dirsPUploadBtE.style.display = "none";
		}

		selMode = "meh"; // force update
		self.toggleSelMode(""); // off by default

		// drag and drop?
		if ("draggable" in document.createElement('span')) {
			dirsContentE.ondragover = showDirsOver;
			dirsContentE.ondragend = showDirsOver;
			dirsContentE.ondragleave = showDirsLeave;
			dirsContentE.ondrop = onDirsContentDrop;
			dirsPContentE.ondragover = showDirsOver;
			dirsPContentE.ondragend = showDirsOver;
			dirsPContentE.ondragleave = showDirsLeave;
			dirsPContentE.ondrop = onDirsContentDrop;
		}
	} // init()

	// start
	this.start = function (options) {
		manager.hideOtherApps(this);

		this.e.style.display = "inline";

		this.adjustLayout();

		// loading popup?
		/*
		if (manager.cPopup && manager.cPopup.id == "loading")
			manager.closePopup();
        */

        if (options && options.sel) {
            var p = options.sel.split("/");
            selectOnRefresh = { name: p.pop(), path:p.join("/") };
        }

		if (!started) {
			started = true;
			this.browseTo("");
		} else {
			this.browseTo(this.currentPath); // refresh

			// log preview
			if (this.logPreviewVisible)
				logViewer.startPreview(5);
		}

		this.focus();
		this.open = true;
	} // start()

	// hide (switching to another app)
	this.hide = function () {
		this.e.style.display = "none";

		manager.focus();

		// select mode? selMode: null, key, bt
		if (selMode == "key")
			self.toggleSelMode("");

		this.open = false;
	} // hide()

	// focus, restore key events
	this.focus = function () {
		document.onkeydown = this.onKeyDown;
		document.onkeyup = this.onKeyUp;
		if (window.focus) window.focus();
		//manager.deselect();
	} // focus()

	// adjust layout. viewport size
	this.adjustLayout = function () {
		if (!manager.viewportWidth || !manager.viewportHeight) return;

		var	vw = manager.viewportWidth;
		var	vh = manager.viewportHeight;

		// tool bar size
		var tbW = 0; // left one
		var tbH = 36; // top one

		// editable area size
		var eW = vw - tbW;
		var eH = vh - tbH;

		toolbarE.style.left = (tbW-1)+"px"; // +1, attach it to the iconPanel
		toolbarE.style.width = (eW+1)+"px";

		// panels
		var bs = 1; // border size
		var pm = 5+bs; // panel margin: padding + border size
		var pd = 7; // panel distance from border
		var pw = Math.round((vw-pd*3-pm*4)/2); //;
		var ph = vh-tbH-pm*2-pd*2;
		if (pw<340) pw = 340;
		this.dirsPanelWidth = pw; // used in adjustFileNames

		// detail, upload, log panels
		var upH = 0;
		var lpH = 140; // log panel height
		var lpW = pw+pm*2; // = pw minus the panel margin
		var upH = 70; // upload panel height
		var dpH = ph;
		if (this.logPreviewVisible) 	dpH -= lpH+pd;
		var edH = dpH; // same as details, without the upload progress
		if (this.uploadProgressVisible) dpH -= upH+pm*2+pd;

		dirsPanelE.style.left = (pd)+"px";
		dirsPanelE.style.top = (tbH+pd)+"px";
		dirsPanelE.style.width = pw+"px";
		dirsPanelE.style.height = ph+"px";

		uploadProgressPanelE.style.left =
		detailsPanelE.style.left = (pd*2+pm*2+pw)+"px";
		detailsPanelE.style.top = (tbH+pd)+"px";

		pw = (vw-pd*3-pm*4) -pw; // fix it: since it's /2, pw could be 1 pixel wider

		uploadProgressPanelE.style.width =
		detailsPanelE.style.width = pw+"px";
		detailsPanelE.style.height = dpH+"px";

		uploadProgressPanelE.style.height = upH+"px";
		uploadProgressPanelE.style.top = (tbH+pd+pm*2+pd+dpH)+"px";

		dirsContentE.style.height = (vh-144-pm)+"px";
		loadingE.style.height = (vh-144-pm)+"px";

		loadingLabelE.style.left = Math.round((dirsContentE.offsetWidth-70)/2)+"px";

		uploadContentE.style.left = Math.round((pw-250)/2)+"px";
		detailsContentE.style.left = Math.round((pw-360)/2)+"px";

		// details content top, we move contents down max 30px from top
		var dfs = (detailsPanelE.offsetHeight - detailsContentE.offsetHeight)/2-30;
		dfs = Math.round(dfs<40?dfs:40);

		detailsContentE.style.top = dfs+"px";

		var eW = vw-pm*2-pd*2; // full content width

		// mini icons?
		//browser.miniButton(dirsUploadBtE, pw<370);
		//browser.miniButton(dirsNewFileBtE, pw<370);
		//browser.miniButton(dirsNewFolderBtE, pw<370);

		if (this.logPreviewVisible) {
			var lpT = tbH+pd+edH+pm*2+pd;
			logViewer.panelShape.y = lpT;
			logViewer.panelShape.x = detailsPanelE.offsetLeft;
			logViewer.panelShape.width = lpW;
			logViewer.panelShape.height = lpH;
			logViewer.adjustLayout();
		}

		adjustFileNames();
		adjustHeader();
	} // adjustLayout()

    this.onWSMessage = function(json) {
        console.log(json);
        if (json && json.files) {
            var o = this.popupMode?this.popupData:this;
            var p = o.currentPath;
            if (p == "") p = ".";
            for (var f in json.files) {
                if (f == p) {
                    files.load("refresh_list",f);
                    return;
                }
            }
        }
    }

	// show / hide loading
	this.showLoading = function (show) {
		var lE = (this.popupMode)?loadingPE:loadingE;
		lE.style.display = show?"inline":"none";
		// bts are enabled only when folder is loaded

		var dirsUE = (this.popupMode)?dirsPUploadBtE:dirsUploadBtE;
		var dirsFoE = (this.popupMode)?dirsPNewFolderBtE:dirsNewFolderBtE;
		var dirsFiE = (this.popupMode)?null:dirsNewFileBtE;

		//browser.enableButton(dirsUE, !show);
		//browser.enableButton(dirsFoE, !show);
		//if (dirsFiE) browser.enableButton(dirsFiE, !show);
	} // showLoading()

	// browse to folder
	this.browseTo = function (folder) {
		//timestampChecker.stop(); // pause it, we resume when we receive: onList TODO
		var o = this.popupMode?this.popupData:this;
		if (o.currentPath != folder) {
			o.currentPath = folder;
			o.currentFolder = null;
			this.selectItem(-1);
		}
		this.showFolderSel(); // remove highlighted in background
		this.showLoading(true);
		files.load("list",folder);
		this.updatePath();
	} // browseTo()

	// browse to parent folder
	this.parentFolder = function () {
		var o = this.popupMode?this.popupData:this;
		if (!o.currentPath) return;
		var p = o.currentPath.split("/");
		p.pop();
		this.browseTo(p.join("/"));
	} // parentFolder()

	// show folder contents. data
	this.showFolder = function (data) {
		var o = this.popupMode?this.popupData:this;
		var dirsCE = (this.popupMode)?dirsPContentE:dirsContentE;
		var dirsPE = (this.popupMode)?dirsPParentBtE:dirsParentBtE;
		var dirsUE = (this.popupMode)?dirsPUploadBtE:dirsUploadBtE;
		var dirsFoE = (this.popupMode)?dirsPNewFolderBtE:dirsNewFolderBtE;
		var dirsFiE = (this.popupMode)?null:dirsNewFileBtE;

		var st = 0; // scroll top
		if (data) {
			o.currentFolder = data;
			o.folderTs = 0; //data[4]; TODO???????
			o.filesInFolder = (data.sub && data.sub != "?") ? data.sub.length : 0;
		} else { // if no data, we're just refreshing (show uploading file)
			data = o.currentFolder;
			st = dirsCE.scrollTop;
		}

		// enable/disable buttons
	    /*
		browser.enableButton(dirsUE, data!=null);
		browser.enableButton(dirsFoE, data!=null);
		if (dirsFiE)
			browser.enableButton(dirsFiE, data!=null);
        */

		if (!data) {
			dirsCE.innerHTML = '<div class="fileItem mLineButton">Path not found.</div>';
		} else {
			// add uploading file?
			if (this.open && this.uploading && uploadData.files && uploadData.files.length) {
				if (this.currentPath == uploadData.path) {
                    var file, n, i, f, fData;
                    for (f=0; f<uploadData.files.length; f++) {
                        ufp = -1;
                        file = uploadData.files[f];
                        n = file.name;
                        fData = {name:file.name, size:file.size, lastModified:"-", upload:true};
    					for (i=0; i<data.sub.length; i++) {
    						if (n == data.sub[i].name) {
                                ufp = i;
    							data.sub[i] = fData;
    							break;
    						} else if (n.toLowerCase()<data.sub[i].name.toLowerCase()) {
                                ufp = i;
                                data.sub.splice(i,0,fData);
    							break;
    						}
    					}
                        if (ufp == -1) {
                            ufp = 0;
                            data.sub.push(fData);
                        }

                        file.index = ufp; // used on selectItem
                    }
				}
			}

			// filter, remove unwanted files
			if (o.filter) {
				var p = o.currentPath?o.currentPath+"/":"";
				for (var i=0; i<data.sub.length; i++) {
					// test paths and files
					if ((data.sub[i].sub && (!o.filter.path || !o.filter.path.test(p+data.sub[i].name))) || // test paths to show
						(!data.sub[i].sub && (!o.filter.file || !o.filter.file.test(p+data.sub[i].name)))) { // test files that can be selected
						data.sub.splice(i,1);
						i--;
					}
				}
			}

			// gen html
			dirsCE.innerHTML = "";
			var e,h;

            this.itemButtons = [];

			for (var i=0; i<data.sub.length; i++) {
				// file or dir
				if (!data.sub[i].sub) {
					var icon = this.canEdit(i)?"bticontextfile":"bticonfile";
					h  = '<div class="icon"><img src="/manager/images/'+icon+'.png" width="16" height="16" onmousedown="return false;"></div>';
					h += '<div class="name"></div>'; // set on adjustFileNames
					if (!this.popupMode)
						h += '<div class="modified">'+(data.sub[i].upload?"-":manager.formatDate(data.sub[i].lastModified))+'</div>';
					h += '<div class="size">'+manager.formatFS(data.sub[i].size)+'</div>';
				} else {
					h  = '<div class="icon"><img src="/manager/images/bticonfolder.png" width="16" height="16" onmousedown="return false;"></div>';
					h += '<div class="name"></div>';  // set on adjustFileNames
					if (!this.popupMode)
						h += '<div class="modified">'+manager.formatDate(data.sub[i].lastModified)+'</div>';
					h += '<div class="size"></div>';
				}

				e = document.createElement('div');
				e.innerHTML = h;

				e.className = "fileItem mLineButton"+(data.sub[i].upload?" disabled":"")+(o.selectedItems.indexOf(i)!=-1?" selected":"");

                this.itemButtons.push(new Sfera.UI.Button(e,{onclick:"fileManager.selectItem("+i+")"}));

				dirsCE.appendChild(e);
			}

			adjustFileNames();
		}
		adjustHeader();

		dirsPE.style.display = (o.currentPath!=o.rootPath)?"inline":"none";

		dirsCE.scrollTop = st;

		this.showLoading(false);

		// selected? update details
		if (!this.popupMode && this.selectedItem)
			this.showDetails();

		// auto select after uploading?
		if (selectOnRefresh) {
			if (selectOnRefresh.path == o.currentPath) {
				for (var i=0; i<data.sub.length; i++) {
					if (selectOnRefresh.name==data.sub[i].name) {
						this.selectItem(i); // just uploaded, popup mode. select it
						break;
					}
				}
			}
			selectOnRefresh = null; // done
		}
	} // showFolder()

	// show details
	this.showDetails = function () {
		var o = this.popupMode?this.popupData:this;

		var detailsCE = (this.popupMode)?detailsPContentE:detailsContentE;

		var detailsTPE = (this.popupMode)?detailsPTextPreviewE:detailsTextPreviewE;
		var detailsDIE = (this.popupMode)?detailsPDirIconE:detailsDirIconE;
		var detailsFIE = (this.popupMode)?detailsPFileIconE:detailsFileIconE;
		var detailsFsIE = (this.popupMode)?detailsPFilesIconE:detailsFilesIconE;
		var detailsFIOE = (this.popupMode)?detailsPFileIconOverE:detailsFileIconOverE;
		var detailsIPE = (this.popupMode)?detailsPImgPreviewE:detailsImgPreviewE;

		var detailsSNE = (this.popupMode)?detailsPSelNE:detailsSelNE;
		var detailsTE = (this.popupMode)?detailsPTotE:detailsTotE;
		var detailsNE = (this.popupMode)?detailsPNameE:detailsNameE;
		var detailsNVE = (this.popupMode)?detailsPNameVE:detailsNameVE;
		var detailsKE = (this.popupMode)?detailsPKindE:detailsKindE;
		var detailsKVE = (this.popupMode)?detailsPKindVE:detailsKindVE;
		var detailsSE = (this.popupMode)?detailsPSizeE:detailsSizeE;

		if (o.selectedItem == -1) {
			detailsTPE.innerHTML = "";
			detailsIPE.style.display = "none";
			detailsIPE.style.visibility = "hidden";
		} else {
			var multi = (o.selectedItems.length>1);
			var i = o.selectedItem;
			var n = o.currentFolder.sub[i].name;
			var t = multi?"multi":(o.currentFolder.sub[i].sub?"d":"f");
			var p = o.currentPath+(o.currentPath?"/":"")+n;
			var r = /^www\/([^\/]*\/)?img\/[^\.]*\.(gif|jpe?g|png)$/; // www/(1 folder/)?img(anything but .)(extensions)
			// calculate size
			var s = 0;
			for (k=0; k<o.selectedItems.length; k++)
				s += o.currentFolder.sub[o.selectedItems[k]].size; // size
			var isImg = (!multi && t=="f" && r.test(p) && s<300000);

			detailsDIE.style.display = (t=="d" && !isImg)?"inline":"none";
			detailsFIE.style.display = (t=="f" && !isImg)?"inline":"none";
			detailsFsIE.style.display = (multi)?"inline":"none";
			detailsTPE.style.display = (t=="f" && !isImg && this.canEdit(i))?"inline":"none";
			detailsFIOE.style.display = (t=="f" && !isImg)?"inline":"none";

			detailsIPE.style.display = (isImg)?"inline":"none";
			detailsIPE.style.visibility = "hidden";
			if (isImg)
				detailsIPE.src = "/x/files?gv*"+files.encodeFileName(o.currentFile);
			else
				detailsIPE.src = "/manager/images/empty.png";

			// load preview?
			detailsTPE.innerHTML = ""; // reset text preview, if any
			if (t=="f" && this.canEdit(i)) {
				files.load("gettextpreview",p);
			}

			detailsSNE.innerHTML = o.selectedItems.length;
			detailsTE.innerHTML = o.filesInFolder; // should use a var instead!!!
			detailsNE.style.display = multi?"none":"block";
			detailsNVE.innerHTML = multi?"":o.currentFolder.sub[i].name;
			detailsKE.style.display = multi?"none":"block";
			detailsKVE.innerHTML = multi?"":this.getFileKind(p,t);
			detailsSE.innerHTML = (t=="d")?"-":manager.formatFS(s);

			if (!this.popupMode) {
				// special files, can't be deleted, renamed or moved
				var special = false;
				if (o.currentPath == "") {
					for (k=0; k<o.selectedItems.length; k++) {
						n = o.currentFolder.sub[o.selectedItems[k]].name; // name
						if (n == "hsyco.jar" ||
							n == "hsyco.ini" ||
							n == "access.ini") {
							special = true;
							break;
						}
					}
				}

				// buttons
				detailsBtOpenFolderE.style.display = (t=="d")?"inline":"none";
				detailsBtEditE.style.display = (!multi && this.canEdit(i))?"inline":"none";
				detailsBtOpenVEE.style.display = (!multi && p.search(/www\/[^\/]+\/index.hsm/) != -1)?"inline":"none";
				detailsBtDeleteE.style.display = (special)?"none":"inline";
				detailsBtRestartE.style.display = (!multi && o.currentPath+o.currentFile == "hsyco.jar")?"inline":"none";
				detailsBtMoveE.style.display = (special)?"none":"inline";
				detailsBtDuplicateE.style.display = (!multi)?"inline":"none";
				detailsBtRenameE.style.display = (multi || special)?"none":"inline";
				detailsBtDownloadE.style.display = "inline";
			}
		}
		detailsCE.style.visibility = (o.selectedItem >= 0)?"visible":"hidden";
	} // showDetails()

	// adjust file names
	function adjustFileNames() {
		var o = self.popupMode?self.popupData:self;
		var dirsCE = (self.popupMode)?dirsPContentE:dirsContentE;

		var data = o.currentFolder;
		var ic = '<img src="/manager/images/miniiconopen.png" class="openIcon">'; // open icon
		var w = self.popupMode?440:self.dirsPanelWidth;
		for (var i=0; i<dirsCE.childNodes.length; i++) {
			var e = dirsCE.childNodes[i];
			var c = self.canOpen(i); // can open
			// length
			var n = data.sub[i].name;
			var n1 = "";
			var n2 = "";
			e.childNodes[1].innerHTML = n+(c?ic:"");
			while (w-e.childNodes[1].offsetWidth<260) { // 260 is calculated: minimum
				if (!n1) {
					n1 = n.substr(0,Math.round(n.length/2));
					n2 = n.substr(n1.length);
				}
				n1 = n1.substr(0,n1.length-1);
				n2 = n2.substr(1);
				if (n1=="" || n2=="") break;
				e.childNodes[1].innerHTML = n1+"..."+n2+(c?ic:"");
			}
		}
	} // adjustFileNames()

	// adjust files header
	function adjustHeader() {
		var dirsCE = (this.popupMode)?dirsPContentE:dirsContentE;
		var s = (dirsCE.scrollHeight>dirsCE.clientHeight);
		var hE = self.popupMode?dirsPHeaderE:dirsHeaderE;
		//hE.getElementsByTagName("DIV")[1].style.marginRight = s?browser.scrollBarSize+"px":"";
	}

	// show selected, set classes
	this.showFolderSel = function () {
		var o = this.popupMode?this.popupData:this;
		var dirsCE = (this.popupMode)?dirsPContentE:dirsContentE;

		var s,t;
		for (var i=0; i<dirsCE.childNodes.length; i++) {
			this.itemButtons[i].setAttribute("selected", (o.selectedItems.indexOf(i)!=-1));
			this.itemButtons[i].setAttribute("disabled", (this.uploading && uploadData.index == i));
		}
	} // showFolderSel()

	// refresh folder contents (on timestamp change)
	this.refreshFolder = function (json) {
		var o = this.popupMode?this.popupData:this;
		var dirsCE = (this.popupMode)?dirsPContentE:dirsContentE;

		var st = 0;
		if (o.currentFolder) {
			st = dirsCE.scrollTop; // refreshing
			if (JSON.stringify(o.currentFolder) == JSON.stringify(json)) { // slow
				return; // nothing to do here, it's the same
			}
		}

		// keep selection?
		var sf = []; // saved filenames
		var k,n;
		var r = false; // reselect if anything changed
		for (var i=0; i<o.selectedItems.length; i++) {
			k = o.selectedItems[i];
			n = o.currentFolder.sub[k].name;
			sf.push(n); // save filename
			// changed?
			if (!r && (json.sub.length <= k || json.sub[k].name != n))
				r = true; // need to reselect so...
		}

		if (r)
			this.selectItem(-1); // deselect all

		this.showFolder(json);

		// restore selection?
		if (r) {
			var ts = []; // to select indexes
			for (var i=0; i<json.sub.length; i++) {
				if (sf.indexOf(json.sub[i].name) != -1)
					ts.push(i);
			}
			// same number of selected items?
			if (ts.length == sf.length) {
				var s = selMode;
				selMode = "key"; // force multi selection
				for (var i=0; i<ts.length; i++)
					this.selectItem(ts[i]);
				selMode = s;
			}
		}

		// restore scrolling
		dirsCE.scrollTop = st;
	} // refreshFolder()

	// update path
	this.updatePath = function () {
		var o = this.popupMode?this.popupData:this;
		a = o.currentPath.split("/");
		if (o.rootPath)
			a.splice(0,o.rootPath.split("/").length); // so we start looping from the rooth

        var i;
		var txt = "";
		var fun = ""; // functions
		var dir = o.rootPath?o.rootPath:"Sfera Server";

        var paths = [o.rootPath];
		txt += " <span class='mTextButton "+((o.currentPath!=o.rootPath)?"checked":"selected")+"'>"+dir+"</span>";

		if (o.currentPath) {
			for (i=0; i<a.length; i++) {
				dir = a[i];
                paths.push((o.rootPath?"/":"")+dir);
				txt += "&nbsp;&raquo;&nbsp;<span class='mTextButton "+((i<a.length-1)?"checked":"selected")+"'>"+dir+"</span>";
			}
		}

        var o = (!this.popupMode)?pathE:pathPE;
        o.innerHTML = txt;
        Sfera.UI.destroyButtons(this.pathButtons);
        var as = o.getElementsByTagName("SPAN");
        for (i=0; i<as.length; i++) {
            this.pathButtons.push(new Sfera.UI.Button(as[i],{onclick:"fileManager.browseTo('"+paths[i]+"')"}));
        }
	} // updatePath()

	// null (this.currentFile) or directory, file name, path array, file extension
	function isEventsFile(d,n,ap,ext) {
		if (!d) {
			var p = self.currentFile;
			ap = p.split("/");
			n = ap.pop(); // remove file name
			var an = n.split(".");
			ext = an[an.length-1];
		}

		if (!d && n=="events.txt")
			return true;

		if (ap && ap.length==2 && ap[0]=="plugins" && n=="events.txt")
			return true;

		if (ap && ap[0] == "events" && ext=="txt")
			return true;

		return false;
	}

	// get file kind
	this.getFileKind = function (p,t) {
		if (t=="d") return "Folder";

		var ap = p.split("/");
		var n = ap.pop(); // remove file name
		var d = ap.join("/");
		var an = n.split(".");
		var ext = an[an.length-1];

		if (isEventsFile(d,n,ap,ext))
			return "Events File";

		switch (ext) {
		case "txt": return "Plain Text";
		case "xml": return "XML Document";
		case "ini": return "Ini File";
		case "jar": return "Java JAR File";
		case "jpg": case "jpeg": case "gif":
		case "png": return "Image";
		case "avi": return "Video";
		case "log": return "Log File";
		case "css": return "CSS Stylesheet";
		case "hsc": return "HSC File";
		case "hsm": return "Project File";
		default:
			if (an[an.length-2] == "log")
				return "Log File";
			return "Document";
		}
	} // getFileKind()

	// can open. index on currentFolder
	this.canOpen = function (i) {
		if (this.popupMode) return true; // can select all the files that are shown
		var o = this;
		var n = o.currentFolder.sub[i].name; // name
		var t = o.currentFolder.sub[i].sub?"d":"t"; // type
		if (t=="d") return true; // can open folders
		return this.canEdit(i);
	} // canOpen()

	// can edit
	this.canEdit = function (i) {
		if (this.popupMode) return false; // can't edit if popup

		var n = this.currentFolder.sub[i].name; // name
		var t = this.currentFolder.sub[i].sub ? "d":"f"; // type
		if (t=="d") return false; // can't edit folders

		var s = this.currentFolder.sub[i].size; // size
		var p = this.currentPath+(this.currentPath?"/":"")+n; // full path
		var a = n.split(".");
		var e = (a.length>1)?a.pop():""; // extension

        var unsupported = ["jpg","jpeg","png","apng","gif","bmp","exe","jar"];
        for (var i=0; i<unsupported.length; i++) {
            if (e == unsupported[i]) {
                return false;
            }
        }

        return true;
        /*
		switch (e) {
		case "ini": case "hsc": case "hsm": case "sh":
		case "csv": case "js": case "log":
		case "java": case "htm": case "html": case "txt": case "xml": case "css":
			return true;
		}
        var ee = (a.length>1)?a.pop():""; // extension
		if (ee == "log") return true; // .log.1 ..
        */
	} // canEdit()

	// select item. if i is null, select again
	this.selectItem = function (i) {
		var o = this.popupMode?this.popupData:this;
		var multi = selMode && !this.popupMode; // multiple selection not enabled in popup
		var okb = false; // ok button enabled (only in popup)
		if (i==null) i = o.selectedItem;
		if (i>=0) {
			if (this.uploading && uploadData.index == i) return; // can't select, it's still uploading
			var n = o.currentFolder.sub[i].name;
			var t = o.currentFolder.sub[i].sub?"d":"f";
			var p = o.currentPath+(o.currentPath?"/":"")+n;
			if (o.selectedItem != i || multi) { // not selected or selecting multiple files?
				if (multi) {
					var k = o.selectedItems.indexOf(i);
					// selecting?
					if (k == -1) {
						o.selectedItem = i;
						o.selectedItems.push(i);
					}
					// delesecting?
					else {
						o.selectedItems.splice(k,1);
						o.selectedItem = o.selectedItems.length?o.selectedItems.last():-1;
					}
				} else {
					o.selectedItem = i;
					o.selectedItems = [i];
					o.currentFile = p;
				}
				if (this.popupMode)
					okb = (o.selectedItems.length && t=="f") || (o.filter && o.filter.folder); // file or folder
				// update details
				this.showDetails();
			} else { // clicked again on the same "double click"
				o.selectedItems = [o.selectedItem]; // select just one
				if (t=="d") {
					this.browseTo(o.currentPath+(o.currentPath?"/":"")+n);
				} else if (this.popupMode) {
					this.confirmChooseFilePopup();
					return;
				} else if (this.canEdit(i)) {
                    this.openEditor();
				}
			}
		} else {
			o.selectedItem = -1;
			o.selectedItems = [];
			if (this.popupMode) // choose folder is always on
				okb = (o.filter && o.filter.folder); // folder
		}
		if (o.selectedItem == -1) {
			o.currentFile = "";
			// will hide details
			this.showDetails();
		}
		// enable ok button for choose popup
		//if (this.popupMode) 			browser.enableButton(dirsPConfirmBtE, okb);
		this.showFolderSel();
	} // selectItem()

	this.selectNext = function () {
		var o = this.popupMode?this.popupData:this;
		var dirsCE = (this.popupMode)?dirsPContentE:dirsContentE;

		var i = o.selectedItem+1;
		if (i >= dirsCE.childNodes.length) return;
		this.selectItem(i);
	} // selectNext()

	this.selectPrev = function () {
		var o = this.popupMode?this.popupData:this;

		var i = o.selectedItem-1;
		if (i < 0) return;
		this.selectItem(i);
	} // selectPrev()

	// toggle selection mode. mode:null (toggle "bt"/null), "key", "" (null)
	this.toggleSelMode = function (mode) {
		var v = selMode;
		if (mode)
			selMode = mode;
		else if (mode === "")
			selMode = null;
		else
			selMode = selMode?null:"bt"; // toggle
		// changed?
		if (v != selMode) {
			// button
			document.getElementById("selectButtonFm").getElementsByTagName("img")[0].style.display = selMode?"inline":"none";
			document.getElementById("selectButtonFm").getElementsByTagName("img")[1].style.display = selMode?"none":"inline";
		}
	} // toggleSelMode()

	// new folder
	this.newFolder = function () {
		var o = self.popupMode?self.popupData:self;
		var u = self.popupMode;
		var name = manager.cPopup.data.input["n"].value;
		if (!name) return; // nothing selected
		if (o.currentPath) name = o.currentPath+"/"+name;

		manager.closePopup(); // close new folder popup
		manager.showLoadingPopup();

		files.load("newfolder",name);
	} // newFolder()

	// delete items
	this.deleteItems = function () {
		var o = this.popupMode?this.popupData:this;
		manager.closePopup();
		manager.showLoadingPopup();

		// data, array of source pathnames
		delData = [];
		var k,n;
		for (var i=0; i<self.selectedItems.length; i++) {
			k = self.selectedItems[i];
			n = self.currentFolder.sub[k].name;
			if (self.currentPath) n = self.currentPath+"/"+n; // add path
			delData.push(n); // save filename
		}
		files.load("deletefile",delData);
		this.selectItem(-1);
	} // deleteFile()

	// new file
	this.newFile = function () {
		var o = self.popupMode?self.popupData:self;
		var u = self.popupMode;
		var n = manager.cPopup.data.input["n"].value;

		if (!n) return; // nothing selected

		manager.closePopup(); // close new file popup

		self.currentFile = o.currentPath+(o.currentPath?"/":"")+n;
		self.openEditor(true);
	} // newFile()

    this.openEditor = function (isNew) {
        var o = self.popupMode?self.popupData:self;
        manager.switchApp("te",{from:"fm", open:o.currentFile, isNew:isNew});
    }

	// rename file
	this.renameFile = function () {
		var o = self.popupMode?self.popupData:self;
		var n = manager.cPopup.data.input["n"].value;
		if (!n) return; // nothing selected
		var p = (o.currentPath)?o.currentPath+"/":"";

		manager.closePopup(); // close rename file popup

		selectOnRefresh = {path:o.currentPath, name:n};
		files.load("renamefile",[fileManager.currentFile,p+n]);
	} // renameFile()

	// open in project editor
	this.openInProjectEditor = function () {
		var o = this.popupMode?this.popupData:this;
		projectEditor.toLoad = o.currentPath.split("/").pop();
		manager.switchApp("pe");
	} // openInProjectEditor()

	// show preview
	this.updateTextPreview = function (text) {
		var o = this.popupMode?this.popupData:this;
		text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
		text = "<pre><div class='title'>"+o.currentFile.split("/").pop()+"</div>"+text+"</pre>";
		detailsTextPreviewE.innerHTML = text;
	} // updateTextPreview()

	// download
	this.downloadFiles = function () {
		var o = this.popupMode?this.popupData:this;
		var ts = "."+(new Date()).getTime();
        var url = "/api/files/download?";

        for (var i=0; i<this.selectedItems.length; i++) {
			k = this.selectedItems[i];
			n = this.currentFolder.sub[k].name;
			if (this.currentPath) n = self.currentPath+"/"+n; // add path
			url += (i?"&":"")+"path="+this.encodeFileName(n);
		}

        url += "&ts="+ts;
		document.getElementById("downloadTarget").src = url;
		if (o.currentFolder.sub[o.selectedItem].sub)
			manager.showNotice("Download requested, please wait...");
	}

	// download backup
	this.downloadBackup = function () {
		var ts = "."+(new Date()).getTime();
		document.getElementById("downloadTarget").src = "/api/files/download?path=.&ts="+ts;
		manager.showNotice("Backup requested, please wait...");
		manager.closeToolbarPopup();
	}

	// new folder popup
	this.openNewFolderPopup = function () {
		var u = this.popupMode;
		manager.openPopup("newfolder",true);
	} // openNewFolderPopup()

	// new file popup
	this.openNewFilePopup = function () {
		manager.openPopup("newfile",true);
	} // openNewFilePopup()

	// new folder popup
	this.openRenameFilePopup = function () {
		manager.openPopup("renamefile",true);
		manager.cPopup.data.input["n"].value = this.currentFolder.sub[this.selectedItem].name;
	} // openNewFolderPopup()

	// copy items
	this.copyItems = function () {
		self.openChooseFilePopup(onChoosePathCopy,"folder");
	} // copyItems()

	// confirm choose path for copy popup
	function onChoosePathCopy(v) {
		moveData = null;
		// picked or confirmed?
		if (v != null) {
			// data, array of source pathnames
			copyData = [];
			var k,n;
			for (var i=0; i<self.selectedItems.length; i++) {
				k = self.selectedItems[i];
				n = self.currentFolder.sub[k].name;
				if (self.currentPath) n = self.currentPath+"/"+n; // add path
				copyData.push(n); // save filename
			}
			// add destination direcory
			copyData.push(v);
			files.load("copyfiles",copyData);
		} else {
			files.load("copyfilesoverwrite",copyData);
		}
	} // onChoosePathCopy()

	// move items
	this.moveItems = function (confirm) {
		self.openChooseFilePopup(onChoosePathMove,"folder");
	} // moveItems()

	// confirm choose path for move popup
	function onChoosePathMove(v) {
		copyData = null;
		// picked or confirmed?
		if (v != null) {
			// data, array of source pathnames
			moveData = [];
			var k,n;
			for (var i=0; i<self.selectedItems.length; i++) {
				k = self.selectedItems[i];
				n = self.currentFolder.sub[k].name;
				if (self.currentPath) n = self.currentPath+"/"+n; // add path
				moveData.push(n); // save filename
			}
			// add destination direcory
			moveData.push(v);
			files.load("movefiles",moveData);
		} else {
			files.load("movefilesoverwrite",moveData);
		}
	} // onChoosePathMove()

	// confirm overwrite on copy or move
	this.confirmOverwrite = function () {
		manager.closePopup();
		if (copyData)
			onChoosePathCopy();
		else
			onChoosePathMove();
	} // confirmOverwrite()

	// duplicate file
	this.duplicateFile = function () {
		var k = self.selectedItems[0];
		var n = self.currentFolder.sub[k].name; // file name
		var p = self.currentPath?self.currentPath+"/":""; // path
		var a = n.split(".");
		var c = this.canEdit(k);
		a[a.length>1 && c?a.length-2:0] += "_copy"; // add before recognized extension, or at the end
		var nn = a.join(".");
		selectOnRefresh = {path:p, name:nn};
		files.load("duplicatefile",[p+n,p+nn]);
	} // duplicateFile()
    // --------------------------------------------------------------------------------------------------------------------------
	// Upload -------------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// upload bt > this.uploadFile > initUploadData(uploadFileInputE.files)
	//                                      |- > [open overwrite popup] > confirmUpload > sendUpload
	// drag & drop                 > initUploadData(e.dataTransfer.files)

	// open upload file popup
	this.openUploadPopup = function () {
		var o = this.popupMode?this.popupData:this;
 		var u = this.popupMode; // opening/closing will change it
		if (!this.uploading) {
			manager.openPopup("uploadfile", true);
		} else {
			manager.openPopup("uploadingfile", true);
		}
	} // openUploadPopup()

	// upload file (from upload popup)
	this.uploadFile = function () {
		var data;
		if (uploadFileInputE.files && formDataSupport) // input supports files and xmlhttpreq method available
			data = uploadFileInputE.files;

		initUpload(data);
	} //  uploadFile()

	// init upload. data (e.dataTransfer.files || uploadFileInputE.files || no data: form submit)
	function initUpload(data) {
		var o = self.popupMode?self.popupData:self;
		var timestamp = (new Date()).getTime()+"";
		var n, fs; // name, file size

		// reset uploadData with a new id, target path name
		uploadData = {id:timestamp.substr(5), files:[], path:o.currentPath};
		if (data) {
			uploadData.size = 0;
			uploadData.data = [];
			for (var i=0; i<data.length; i++) {
				uploadData.data.push(data[i]);
				n = data[i].name;
				fs = data[i].size;
				uploadData.files.push({name:n, size:fs});
				uploadData.size += fs;
			}
		} else { // old method
			n = uploadFileInputE.value;
			if (!n) return; // nothing chosen
			n = n.split("\\").pop(); // remove path
			uploadData.files = [{name:n, size:null}]; // single size won't be used
			uploadData.size = null; // don't know, will ask to the server
		}

		// file already exists?
		for (var i=0; i<uploadData.files.length; i++) {
			for (var k=0; k<o.currentFolder.sub.length; k++) {
				if (uploadData.files[i].name == o.currentFolder.sub[k].name) {
					manager.openPopup("uploadoverwrite", true);
					return;
				}
			}
		}

		// no overwrite, confirm
		self.confirmUpload();
	} // initUpload

	// confirm upload (true: from overwrite popup)
	this.confirmUpload = function (force) {
        if (!uploadData.data) {
            console.log("ERROR");
        }

		if (!sendUpload(force)) {
			self.onUploadProgressError();
			return;
		}

		self.showUploadProgress(true);
		self.uploading = true;
		if (self.uploadDoneTimeout) {
			clearTimeout(self.uploadDoneTimeout);
			self.uploadDoneTimeout = null;
		}

		// popups
		if (manager.cPopup && manager.cPopup.id == "uploadoverwrite")
			manager.closePopup(); // close upload overwrite
		if (manager.cPopup && manager.cPopup.id == "uploadfile")
			manager.closePopup(); // close choose file
		if (self.popupMode)
			manager.openPopup("uploadingfile", false);
	} // confirmUpload()

	// send upload
	function sendUpload(force) {
	    if (!formDataSupport) return false; // not supported (shouldn't get here)
	    if (!uploadData.data) return false; // no data?

        uploadReq = new Sfera.Net.Request({method:"POST"});
        uploadReq.onError = function (errCode) {
            self.onUploadProgressError();

            if (errCode == uploadReq.ERROR_FORBIDDEN) {
                var json = this.getResponseJSON();
                manager.showErrorPopup("Error uploading: "+json.error);
            }
        };
        uploadReq.onLoaded = function () {
            manager.showNotice("upload finished");
        };
        uploadReq.onProgress = onUploadProgressUpdate;

        uploadReq.addData("path",uploadData.path);
        if (force)
            uploadReq.addData("force","true");

		for (var i = 0; i < uploadData.data.length; i++)
			uploadReq.addData("file", uploadData.data[i]);

	    uploadReq.open("/api/files/upload");

	    return true; // done
	} // sendUpload()

	// show upload progress
	this.showUploadProgress = function (show) {
		self.uploadProgressVisible = show;
		uploadProgressPanelE.style.display = show?"inline":"none";
		self.adjustLayout();
		// reset panel
		uploadFileNameE.innerHTML = "";
		uploadProgressE.innerHTML = "";
		uploadBytesE.innerHTML = ""
		uploadBarE.style.display = "none";
		// popup
		uploadPFileNameE.innerHTML = "&nbsp;";
		uploadPProgressE.innerHTML = "&nbsp;";
		uploadPBytesE.innerHTML = "&nbsp;";
		uploadPBarE.style.display = "none";
		// file name
		if (show) {
			var txt = "Uploading";
			if (uploadData.files.length>1)
				txt += " (1/"+uploadData.files.length+")";
			txt += ": "+uploadData.files[0].name;
			uploadFileNameE.innerHTML =
			uploadPFileNameE.innerHTML = txt;
		}
		// timeout
		if (!show && self.uploadDoneTimeout) {
			clearTimeout(self.uploadDoneTimeout);
			self.uploadDoneTimeout = null;
		}
	} // showUploadProgress()

	// upload progress update
	function onUploadProgressUpdate(e) {
		// do it just the first time
		if (self.uploading && !uploadData.started) { // not canceled and size
            uploadData.started = true;
			if (self.open && self.currentPath == uploadData.path) {
				if (self.popupMode) {
					self.popupMode = false;
					self.showFolder();
					self.popupMode = true;
				} else {
					self.showFolder();
				}
			}
		}

        uploadData.progress = e.loaded;
		var v = (e.loaded/e.total) * 100;

		var fs = uploadData.size; // total size
		if (v != 100) {
			if (!self.popupMode && self.currentPath == uploadData.path &&
				uploadData.index!=-1 &&
				dirsContentE.childNodes[uploadData.index]) {
				dirsContentE.childNodes[uploadData.index].childNodes[3].innerHTML =
					fs?manager.formatFS(Math.round(fs*v/100)):"";
			}
		} else if (self.uploading) { // not canceled?
			self.uploading = false;

			manager.showNotice("upload finished");
			self.uploadDoneTimeout = setTimeout(self.showUploadProgress,5000);

			if (!self.popupMode && self.open && self.currentPath == uploadData.path) {
				self.browseTo(uploadData.path);
			} else if (self.popupMode) {
				selectOnRefresh = {path:uploadData.path, name:uploadData.name}; // so we auto select when refreshing
				self.browseTo(uploadData.path); // popup mode, so we must be in the same dir
				// we update fileManager too
				if (self.currentPath == uploadData.path && self.open) {
					self.popupMode = false;
					self.browseTo(self.currentPath);
					self.popupMode = true; // restore
				}
			}

			manager.closePopup();
		}
		// show progress
		if (v != 0) {
			uploadBarE.style.display = "";
			uploadPBarE.style.display = "";
			uploadBarE.style.width = Math.round(238*v/100)+"px";
			uploadPBarE.style.width = Math.round(174*v/100)+"px";
		}
		uploadProgressE.innerHTML =
		uploadPProgressE.innerHTML = (Math.round(v*100)/100)+"%"; //(v!="error"?v+"%":"");
		var cs = (v!="error")?Math.round(fs*v/100):0; // current size of uploaded data
		uploadBytesE.innerHTML =
		uploadPBytesE.innerHTML = fs?(manager.formatFS(cs)+"/"+ manager.formatFS(fs)):"";
		// show file name if multiple
		if (v != 0 && uploadData.files.length>1) {
			// find out which one
			var t = 0; // current size
			for (var i=0; i<uploadData.files.length; i++) {
				t += uploadData.files[i].size;
				if (t>=cs) break;
			}
			// text
			var txt = "Uploading";
			txt += " ("+(i+1)+"/"+uploadData.files.length+")";
			txt += ": "+uploadData.files[i].name;
			uploadFileNameE.innerHTML =
			uploadPFileNameE.innerHTML = txt;
		}
	} // onUploadProgressUpdate()

	// upload progress error
	this.onUploadProgressError = function () {
		uploadProgressE.innerHTML =
		uploadPProgressE.innerHTML = "error";
		// abort upload if necessary
		if (uploadReq) {
			try {
				req.abort();
			} catch (err) {}
		}
		var fs = "file"+(uploadData.files.length>1?"s":""); // file string
		manager.showNotice("error uploading "+fs);
		self.uploadDoneTimeout = setTimeout(self.showUploadProgress,5000);

		if (!self.popupMode && self.open && self.currentPath == uploadData.path) {
			self.browseTo(uploadData.path);
		} else if (self.popupMode) {
			self.browseTo(uploadData.path); // popup mode, so we must be in the same dir
			// we update fileManager too
			if (self.currentPath == uploadData.path && self.open) {
				self.popupMode = false;
				self.browseTo(self.currentPath);
				self.popupMode = true; // restore
			}
		}

		self.uploading = false;
		manager.closePopup();
	} // onUploadProgressError()

	// stop the upload
	this.cancelUpload = function () {
		//uploadFileFrameE.src = "about:blank";
		this.uploading = false;
		uploadProgressReq.stop();
		this.showUploadProgress(false);
		if (!this.popupMode && this.currentPath == uploadData.path)
			this.browseTo(this.currentPath);
        uploadData = {};
		manager.showNotice("upload canceled");
		manager.closePopup();
	}

	function onDirsContentDrop(e) {
		this.className = "fm_dirsContent";
		if (!e || !e.dataTransfer) return false;
		e.stopPropagation();
		e.preventDefault();
		initUpload(e.dataTransfer.files);
	}

	function showDirsOver(e) {
		try {
			e.stopPropagation();
		    e.preventDefault();
		    e.dataTransfer.dropEffect = "copy";
		} catch (err) {}

		this.className = "fm_dirsContent hover";
		return false;
	}

	function showDirsLeave() {
		this.className = "fm_dirsContent";
		return false;
	}

	// --------------------------------------------------------------------------------------------------------------------------
	// Choose File --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// open popup, function when file chosen, file filter (if f is null, don't refresh). type
	this.openChooseFilePopup = function (f,t) {
		this.popupMode = true;
		// timestampChecker.stop(); // will be restarted by browse, and on close popup TODO:
		manager.openPopup("choosefile",true,function(){fileManager.popupMode = false;
        //    timestampChecker.start();
        });

		// if f is null, don't refresh: we're reopening after upload, or new folder
		if (f) {
			this.popupData.onChoose = f;

			switch(t) {
			case "img":
				manager.cPopup.contentE.getElementsByTagName("span")[0].innerHTML = "Choose File";

				this.popupData.rootPath = "www";
				this.popupData.defaultPath = (!this.popupData.currentPath)?"www/img":this.popupData.currentPath;

				// filter
				this.popupData.filter = {};
				var r = "^(www(/img(/.+)?"; // www, www/img
				if (projectEditor.open && project && project.name)
					r += "|/"+project.name+"|/"+project.name+"/img(/.+)?"; // www/[proj], www/[proj]/img
				r += ")?)$";
				this.popupData.filter.path = new RegExp(r);
				r = "^(www(/img/";
				if (projectEditor.open && project && project.name)
					r += "|/"+project.name+"/img/";
				r += ")).*\.(jpe?g|gif|png)$";
				this.popupData.filter.file = new RegExp(r);

				// replace once file is chosen
				this.popupData.replace = [];
				r = /(www\/([^\/]*\/)?img\/)/; // remove img folder
				this.popupData.replace.push({a:new RegExp(r),b:""});

				this.popupData.filter.folder = false; // select file, not folder

				break;
			case "video":
				manager.cPopup.contentE.getElementsByTagName("span")[0].innerHTML = "Choose File";

				this.popupData.rootPath = "www";
				this.popupData.defaultPath = (!this.popupData.currentPath)?"www/img":this.popupData.currentPath;

				this.popupData.filter = {};
				var r = "^(www(/img(/.+)?"; // www, www/img
				if (projectEditor.open && project && project.name)
					r += "|/"+project.name+"|/"+project.name+"/img(/.+)?"; // www/[proj], www/[proj]/img
				r += ")?)$";
				this.popupData.filter.path = new RegExp(r);
				r = "^(www(/img/";
				if (projectEditor.open && project && project.name)
					r += "|/"+project.name+"/img/";
				r += ")).*\.(mp4|webm|ogv)$";
				this.popupData.filter.file = new RegExp(r);

				// replace once file is chosen
				this.popupData.replace = [];
				r = /(www\/([^\/]*\/)?img\/)/; // remove img folder
				this.popupData.replace.push({a:r,b:""});
				r = /\.(mp4|webm|ogv)$/; // remove extension
				this.popupData.replace.push({a:r,b:""});

				this.popupData.filter.folder = false; // select file, not folder

				break;
			case "folder":
				manager.cPopup.contentE.getElementsByTagName("span")[0].innerHTML = "Choose Destination";

				this.popupData.rootPath = this.rootPath; // popup starts with same root as fm
				this.popupData.defaultPath = this.currentPath;

				// filter
				this.popupData.filter = {};
				var r = ".";
				this.popupData.filter.path = new RegExp(r);
				this.popupData.filter.file = null;

				// replace once file is chosen
				this.popupData.replace = [];

				this.popupData.filter.folder = true; // select folder

				break;
			}

			this.browseTo(this.popupData.defaultPath);
			this.selectItem(-1);

			dirsPUploadBtE.style.display = this.popupData.filter.folder?"none":"inline";
		}
		this.focus();
	} // openChooseFilePopup()

	// confirm choose file popup
	this.confirmChooseFilePopup = function () {
		var v = self.popupData.currentFile;
		if (!v && self.popupData.filter && self.popupData.filter.folder) // selecting a folder from within (nothing selected)?
			v = self.popupData.currentPath;
		// appy replace
		for (var i=0; i<self.popupData.replace.length; i++)
			v = v.replace(self.popupData.replace[i].a, self.popupData.replace[i].b);
		// external call
		self.popupData.onChoose(v);
		manager.closePopup();
	} // confirmChooseFilePopup()

	// --------------------------------------------------------------------------------------------------------------------------
	// Event handling -----------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------------------

	// catch blank clicks to deselect
	this.onDirsClick = function (event,e) {
		// event target
		var evt = window.event || event;
		if (evt) evt.target = evt.target || evt.srcElement; // e.target not supported?
		if (evt && evt.target && evt.target == e) {
			var x = (evt.offsetX)?evt.offsetX:evt.layerX;
			if (x == null ||
				x<30 ||
				dirsPanelE.offsetWidth-x<30) return;
			this.selectItem(-1);
		}
	} // dirsClick()

	// on list, from files
	this.onList = function (f) {
		if (!this.editorOpen) // if editor is open, currentFile has to remain the same
			this.selectItem(-1);
		this.showFolder(f);

        var o = this.popupMode?this.popupData:this;
        var p = o.currentPath;
        var r = {
            action: "subscribe",
            files: p ? p : ".",
            tag: (new Date()).getTime() // request id
        };
        Sfera.Net.wsSend(JSON.stringify(r));
	} // onList()

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
			browser.preventDefault(e);
			return false;
		}

		// color editor. ctrl + shift + c
		if (e.ctrlKey && e.shiftKey && code == 67) {
			this.toggleColorMode();
			manager.hideQuickAppsPanel(true); // quick apps panel opened on ctrl+shift, hide it (true: cancel switching)
			return false;
		}

		// ctrl shift, show quick apps panel
		if (code == 16 && e.ctrlKey)
			manager.showQuickAppsPanel();

		// esc
		if (manager.cPopup && manager.cPopup.closeBt && code == 27) {
			manager.closePopup();
			browser.preventDefault(e);
			return;
		}

		// shift, select mode? selMode: null, key, bt
		if (e.shiftKey && !selMode)
			self.toggleSelMode("key");

		if (manager.cPopup && manager.cPopup.id != "choosefile") {
			if (code == 13) { // return
			switch (manager.cPopup.id) {
				case "newfolder":
					if (focusedElement == manager.cPopup.data.input["n"])
						fileManager.newFolder();
					break;
				case "newfile":
					if (focusedElement == manager.cPopup.data.input["n"])
						fileManager.newFile();
					break;
				case "renamefile":
					if (focusedElement == manager.cPopup.data.input["n"])
						fileManager.renameFile();
					break;
				}
			}
			return; // popup open
		}

		if (self.popupMode) {
			switch (code) {
			case 8: // backspace
				break;
			case 37: // left
				browser.preventDefault(e);
				break;
			case 38: // up
				browser.preventDefault(e);
				fileManager.selectPrev();
				break;
			case 39: // right
				browser.preventDefault(e);
				break;
			case 40: // down
				browser.preventDefault(e);
				fileManager.selectNext();
				break;

			case 13: // enter
				browser.preventDefault(e);
				var o = fileManager.popupMode?fileManager.popupData:fileManager;
				if (o.selectedItem>=0)
					fileManager.selectItem(o.selectedItem);
				break;
			case 90: // z
				break;
			}
		}
	} // onKeyDown()

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
		if (!focusedElement) manager.deselect();

		// shift, select mode? selMode: null, key, bt
		if (!e.shiftKey && selMode == "key")
			self.toggleSelMode("");

		// ctrl a released?
		if (!e.ctrlKey && manager.hideQuickAppsPanel()) return; // close quick apps panel?
	} // onKeyUp()

	init();
};


//--------------------------------------------------------------------------------------------------------------------------
// System Console ----------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Manager.Apps.SystemConsole = function() {
    this.id = "sc";
	this.open = false; // currently open. set by start, hide

    var started = false; // if already started, will just switch

	this.fontSize = 12;
	this.changed = false;

	this.e = document.getElementById("systemConsole");

    var toolbarE = document.getElementById("sc_toolbar");

    var inputE = document.getElementById("sc_input");

    var outputPanelE = document.getElementById("sc_outputPanel");
    var inputPanelE = document.getElementById("sc_inputPanel");
	var loadingE = document.getElementById("sc_loading");

	var self = this;

    var history = [];

	// init
	function init() {
        self.editor = ace.edit("sc_consoleText");
        self.editor.setShowPrintMargin(false);
        self.editor.setReadOnly(true);
        self.editor.renderer.setShowGutter(false);
        //self.editor.getSession().setMode("ace/mode/javascript");
        /*
        self.editor.getSession().on('change', function(e) {
            // e.type, etc
            self.changed = true;
            updateTitle();
        });
        */
	} // init()
    var focusInterval;

	// start
	this.start = function (options) {
		manager.hideOtherApps(this);

		this.e.style.display = "inline";

		this.adjustLayout();

		this.focus();
		this.open = true;
        //inputE.onblur = function(){inputE.focus()};

//                clearInterval(focusInterval)
	} // start()

	// hide (switching to another app)
	this.hide = function () {
		this.e.style.display = "none";

		manager.focus();

		this.open = false;
	} // hide()

	// focus, restore key events
	this.focus = function () {
		document.onkeydown = this.onKeyDown;
		document.onkeyup = this.onKeyUp;
		if (window.focus) window.focus();
		inputE.focus();
	} // focus()

	// adjust layout. viewport size
	this.adjustLayout = function () {
		if (!manager.viewportWidth || !manager.viewportHeight) return;

		var	vw = manager.viewportWidth;
		var	vh = manager.viewportHeight;

		// tool bar size
		var tbW = 0; // left one
		var tbH = 36; // top one

		// editable area size
		var eW = vw - tbW;
		var eH = vh - tbH;

		toolbarE.style.left = (tbW-1)+"px"; // +1, attach it to the iconPanel
		toolbarE.style.width = (eW+1)+"px";

		// panels
		var bs = 1; // border size
		var pm = 5+bs; // panel margin: padding + border size
		var pd = 7; // panel distance from border
		var pw = Math.round((vw-pd*3-pm*4)/2); //;
		var ph = vh-tbH-pm*2-pd*2;
		if (pw<340) pw = 340;

		pw = (vw-pd*3-pm*4) -pw; // fix it: since it's /2, pw could be 1 pixel wider

        var ih = 30;
		var oW = vw-pm*2-pd*2; // full content width
        var oH = ph - pd*2 - ih;


		outputPanelE.style.left = (pd)+"px";
		outputPanelE.style.top = (tbH+pd)+"px";
		outputPanelE.style.width = (oW)+"px";
		outputPanelE.style.height = (oH)+"px";

        inputPanelE.style.width = (oW)+"px";
        inputPanelE.style.height = (ih)+"px";
        inputPanelE.style.left = (pd)+"px";
        inputPanelE.style.bottom = (pd)+"px";

        inputE.style.width = (eW-125)+"px";

		loadingE.style.left = Math.round((eW - 70)/2)+"px";

	} // adjustLayout()

    this.send = function () {
        v = inputE.value;

        if (v == "clear") {
            this.editor.setValue("");
        } else {
            Sfera.Net.sendConsole({command:v});
        }
        history.push(v);
        historyPos = history.length;
        inputE.value = "";

        if (v != "clear")
            this.output("> "+v);
    }

    this.output = function (text) {
        var session = this.editor.session
        session.insert({
           row: session.getLength(),
           column: 0
       }, "\n" + text);

       this.editor.gotoLine(session.getLength());
    }

    // set edit font size
	this.setFontSize = function (a) {
		if (a) this.fontSize++; else this.fontSize--;
		editorTextE.style.fontSize = this.fontSize+"px";
		//editorTextE.style.lineHeight = Math.round(this.editorFontSize + this.editorFontSize/2)+"px";
	} // setEditFontSize()

    this.onWSMessage = function(json) {
        console.log(json);
        if (json && json.files) {
            var o = this.popupMode?this.popupData:this;
            var p = o.currentPath;
            if (p == "") p = ".";
            for (var f in json.files) {
                if (f == p) {
                    files.load("refresh_list",f);
                    return;
                }
            }
        }
    }

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
			browser.preventDefault(e);
			return false;
		}

		// color editor. ctrl + shift + c
		if (e.ctrlKey && e.shiftKey && code == 67) {
			this.toggleColorMode();
			manager.hideQuickAppsPanel(true); // quick apps panel opened on ctrl+shift, hide it (true: cancel switching)
			return false;
		}

		// ctrl shift, show quick apps panel
		if (code == 16 && e.ctrlKey)
			manager.showQuickAppsPanel();

        if (code == 13 && !e.ctrlKey && !e.shiftKey) {
            self.send();
            return;
        }

        if (code == 38 || code == 40) {
            if (code == 38) { // up
                historyPos--;
            } else if (code == 40) { // down
                historyPos++;
            }

            if (historyPos < 0)
                historyPos = 0;
            if (historyPos > history.length)
                historyPos = history.length;

            var v = "";
            if (historyPos < history.length)
                v = history[historyPos];

            inputE.focus();
            inputE.value = v;
            inputE.selectionStart = inputE.selectionEnd = v.length;
        }

		// esc
		if (manager.cPopup && manager.cPopup.closeBt && code == 27) {
			manager.closePopup();
			browser.preventDefault(e);
			return;
		}
	} // onKeyDown()

	// key up
	this.onKeyUp = function (e) {
		if (!e) var e = window.event;
		// code
		var code;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;

		// ctrl a released?
		if (!e.ctrlKey && manager.hideQuickAppsPanel()) return; // close quick apps panel?
	} // onKeyUp()


	// show editor loading
	this.showLoading = function (show) {
		if (show) {
			editorTextE.style.display = "none";
			editorLoadingE.style.display = "inline";
		} else {
			toolbarSaveBtE.style.display = "inline";
			editorTextE.style.display = "inline";
			editorLoadingE.style.display = "none";
		}
	} // showLoading()

    this.updateEditor = function (text) {
		this.showLoading(false);
        this.editor.setValue(text);
        this.editor.clearSelection();
        this.editor.moveCursorTo(0,0);
        this.editor.getSession().setScrollTop(0);
        this.editor.focus();
        updateTitle();
    }



	init();
};


//--------------------------------------------------------------------------------------------------------------------------
// File Manager ------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Manager.Apps.TextEditor = function() {
    this.id = "te";
	this.open = false; // currently open. set by start, hide
    this.closing = false; // TODO: used now because te is not stand alone

    var started = false; // if already started, will just switch

	this.currentFile = ""; // current file, full path

	this.fontSize = 12;
	this.changed = false;

    this.returnToFM = false; // if opened from filemanager, on close return to file manager

	this.e = document.getElementById("textEditor");

    var toolbarE = document.getElementById("te_toolbar");

	var panelE = document.getElementById("te_editorPanel");
	var headerLabelE = document.getElementById("te_editorHeaderLabel");
	var editorE = document.getElementById("te_editorText");

	var loadingE = document.getElementById("te_editorLoading");

	var toolbarSaveBtE = document.getElementById("te_toolbarSaveBt");

	var modeBtE = document.getElementById("te_editorModeBt");

	var self = this;

    var closeOnSave = false;

	// init
	function init() {
        modeBtE.style.display = "none";
		//updateToolbarPopupButtons(); TODO:
        self.editor = ace.edit("te_editorText");
        //self.editor.setTheme("ace/theme/monokai");
        self.editor.setShowPrintMargin(false);
        self.editor.getSession().setMode("ace/mode/javascript");
        self.editor.getSession().on('change', function(e) {
            // e.type, etc
            self.changed = true;
            updateTitle();
        });
        //this.editor.getSession().setMode("ace/mode/html");
	} // init()

	// start
	this.start = function (options) {
		manager.hideOtherApps(this);

		this.e.style.display = "inline";

		this.adjustLayout();

		// loading popup?
		/*
		if (manager.cPopup && manager.cPopup.id == "loading")
			manager.closePopup();
        toolbarSaveBtE.style.display = "none";
        */
        this.showLoading(false);

		this.focus();
		this.open = true;
        this.closing = false;

        if (options) {
            if (options.from == "fm")
                this.returnToFM = true;
            if (options.open) {
                if (options.isNew)
                    this.newFile(options.open);
                else
                    this.openFile(options.open);
            }
        }
	} // start()

	// hide (switching to another app)
	this.hide = function () {
		this.e.style.display = "none";

		manager.focus();

		this.open = false;
	} // hide()

	// focus, restore key events
	this.focus = function () {
		document.onkeydown = this.onKeyDown;
		document.onkeyup = this.onKeyUp;
		if (window.focus) window.focus();
		//manager.deselect();
	} // focus()

	// adjust layout. viewport size
	this.adjustLayout = function () {
		if (!manager.viewportWidth || !manager.viewportHeight) return;

		var	vw = manager.viewportWidth;
		var	vh = manager.viewportHeight;

		// tool bar size
		var tbW = 0; // left one
		var tbH = 36; // top one

		// editable area size
		var eW = vw - tbW;
		var eH = vh - tbH;

		toolbarE.style.left = (tbW-1)+"px"; // +1, attach it to the iconPanel
		toolbarE.style.width = (eW+1)+"px";

		// panels
		var bs = 1; // border size
		var pm = 5+bs; // panel margin: padding + border size
		var pd = 7; // panel distance from border
		var pw = Math.round((vw-pd*3-pm*4)/2); //;
		var ph = vh-tbH-pm*2-pd*2;
		if (pw<340) pw = 340;

		pw = (vw-pd*3-pm*4) -pw; // fix it: since it's /2, pw could be 1 pixel wider

		var eW = vw-pm*2-pd*2; // full content width

		panelE.style.left = (pd)+"px";
		panelE.style.top = (tbH+pd)+"px";
		panelE.style.width = (eW)+"px";
		panelE.style.height = (ph)+"px";

		editorE.style.width = (eW)+"px";
		editorE.style.height = (ph-30)+"px";

		loadingE.style.left = Math.round((eW - 70)/2)+"px";

	} // adjustLayout()

	// update edit toolbar popup buttons
	function updateToolbarPopupButtons() {
        // TODO
        return;
		document.getElementById("selectButtonFm").style.display = self.editorOpen?"none":"";
		document.getElementById("downloadBackupButton").style.display = self.editorOpen?"none":"";
		document.getElementById("toggleCommentButton").style.display = self.editorOpen && getSyntaxType()?"":"none";
	} // updateToolbarPopupButtons()

	// toggle comment, from button
	this.toggleComment = function () {
        return; //TODO
		var ss = editorE.selectionStart;
		var se = editorE.selectionEnd;
		var tab = "\t";

		this.changed = true;
		updateTitle();

		var s = getLinesSelection(editorE.value,ss,se);

		var al = s.sel.split("\n");
		var cc = 0; // comment count

		var comment = true;
		// check if we need to comment or uncomment
		for (var i=0; i<al.length; i++) {
			if (al[i][0] == "#") {
				comment = false;
				break;
			}
		}

		// add or remove comment
		var commLine = false; // comment on line?
		for (var i=0; i<al.length; i++) {
			commLine = (al[i][0] == "#");
			if (comment && !commLine) {
				al[i] = "#".concat(al[i]);
				if (i == 0 && s.ls < ss) ss++;
				se++;
			} else if (!comment && commLine) {
				al[i] = al[i].slice(1,al[i].length);
				if (i == 0 && s.ls < ss) ss--;
				se--;
			}
		}

		// compose
		editorE.value = s.pre.concat(al.join("\n")).concat(s.post);

		// fix selection
		editorE.selectionStart = ss;
		editorE.selectionEnd = se;

	} // toggleComment()

    // set edit font size
	this.setFontSize = function (a) {
		if (a) this.fontSize++; else this.fontSize--;
		editorE.style.fontSize = this.fontSize+"px";
		//editorE.style.lineHeight = Math.round(this.editorFontSize + this.editorFontSize/2)+"px";
	} // setEditFontSize()

    this.onWSMessage = function(json) {
        console.log(json);
        if (json && json.files) {
            var o = this.popupMode?this.popupData:this;
            var p = o.currentPath;
            if (p == "") p = ".";
            for (var f in json.files) {
                if (f == p) {
                    files.load("refresh_list",f);
                    return;
                }
            }
        }
    }

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
			browser.preventDefault(e);
			return false;
		}

		// color editor. ctrl + shift + c
		if (e.ctrlKey && e.shiftKey && code == 67) {
			this.toggleColorMode();
			manager.hideQuickAppsPanel(true); // quick apps panel opened on ctrl+shift, hide it (true: cancel switching)
			return false;
		}

		// ctrl shift, show quick apps panel
		if (code == 16 && e.ctrlKey)
			manager.showQuickAppsPanel();

		// esc
		if (manager.cPopup && manager.cPopup.closeBt && code == 27) {
			manager.closePopup();
			browser.preventDefault(e);
			return;
		}

		if (manager.cPopup && manager.cPopup.id != "choosefile") {
			if (code == 13) { // return
			switch (manager.cPopup.id) {
				case "newfolder":
					if (focusedElement ==  manager.cPopup.data.input["n"])
						fileManager.newFolder();
					break;
				case "newfile":
					if (focusedElement == manager.cPopup.data.input["n"])
						fileManager.newFile();
					break;
				case "renamefile":
					if (focusedElement == manager.cPopup.data.input["n"])
						fileManager.renameFile();
					break;
				}
			}
			return; // popup open
		}

		// ctrl/cmd s
		if (code == 83 && (e.ctrlKey || e.metaKey) && !manager.cPopup) {
			browser.preventDefault(e);
			textEditor.save();
			return;
		}

		/*
        fileManager.changed = true;
               updateTitle();
		 */
	} // onKeyDown()

	// key up
	this.onKeyUp = function (e) {
		if (!e) var e = window.event;
		// code
		var code;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;

		// ctrl a released?
		if (!e.ctrlKey && manager.hideQuickAppsPanel()) return; // close quick apps panel?
	} // onKeyUp()

    // open file
	this.openFile = function (file) {
        this.currentFile = file;
        this.showLoading(true);
		files.load("readfile",file);
	} // openFile()

    // new file
    this.newFile = function (file) {
        this.currentFile = file;
        this.changed = true;
        this.updateEditor("");
    }

	// update editor title
	function updateTitle() {
		headerLabelE.innerHTML = (self.changed?"* ":"")+self.currentFile;
	}

	// close editor. save? null to show popup, true or false
	this.close = function (save) {
		if (this.changed && save == null) {
			manager.openPopup("closeeditor",true);
			return;
		}

		updateToolbarPopupButtons();

		if (save) { // editorOpen is false, so when we're done saving, we close again
			this.saveFile(true); // true: close
            return;
		} else if (save == false) { // clicked on no, don't save

		}
        manager.closePopup();

        this.editor.setValue(""); // clear
        this.editor.resize(true);

        //this.hideWarnings();

        /*
        this.adjustLayout();
        manager.closeToolbarPopup();
        */

        if (true || this.returnToFM) { // TODO: close current file
            this.returnToFM = false;
            this.closing = true;
            manager.switchApp("fm",{sel:this.currentFile});
        }

        this.changed = false;
        this.currentFile = "";
        updateTitle();
	} // closeEditor()

	// show editor loading
	this.showLoading = function (show) {
		if (show) {
			editorE.style.display = "none";
			loadingE.style.display = "inline";
		} else {
			toolbarSaveBtE.style.display = "inline";
			editorE.style.display = "inline";
			loadingE.style.display = "none";
		}
	} // showLoading()

    this.updateEditor = function (text) {
		this.showLoading(false);
        this.editor.setValue(text);
        this.editor.clearSelection();
        this.editor.moveCursorTo(0,0);
        this.editor.getSession().setScrollTop(0);
        this.editor.focus();
        updateTitle();
    }

	// update editor with contents
	this.onFileRead = function (text) {
		this.updateEditor(text);
        this.changed = false;
        updateTitle();
		//focusElement(editorE);

		// warning check
		/*
		if (isEventsFile()) {
			this.startWarningsCheck();
		}
        */
	} // updateEditor()

    this.onFileSaved = function (text) {
        this.changed = false;
		updateTitle();
        manager.closePopup(); // save popup
        if (!r.error) {
            manager.showNotice("<b>"+files.resID+"</b> saved");
            manager.closePopup(); // close saving popup
        } else {
            manager.showNotice("error saving <b>"+files.resID+"</b>");
        }
        // focus
        this.editor.focus();
        if (closeOnSave) {
            closeOnSave = false;
            this.close();
        }
    }

	// save file
	this.saveFile = function (close) {
		manager.showSavingPopup();
		files.load("writefile",[this.currentFile, this.editor.getValue()]);
        closeOnSave = close;
	} // saveFile()

	// get syntax type, for highlighting
	function getSyntaxType() {
		if (self.currentFile.indexOf(".ini") == self.currentFile.length-4)
			return "ini";
		else if (self.currentFile == "systemtopo.txt")
			return "topo";
		else if ((self.currentFile.indexOf("events") == 0 &&
				 self.currentFile.indexOf(".txt") == self.currentFile.length-4) ||
				 self.currentFile.indexOf("events.txt") == self.currentFile.length-"events.txt".length)
			return "events";
		else if (self.currentFile.indexOf(".js") == self.currentFile.length-3) {
			return "js";
		}
		return "";
	} // getSyntaxType()


	init();
};

//# sourceMappingURL=sfera-manager.js.map