//--------------------------------------------------------------------------------------------------------------------------
// System Console ----------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Wide.Apps.SystemConsole = function() {
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
		wide.hideOtherApps(this);

		this.e.style.display = "inline";

		this.adjustLayout();

        inputE.focus();
		this.open = true;
        //inputE.onblur = function(){inputE.focus()};

//                clearInterval(focusInterval)
	} // start()

	// hide (switching to another app)
	this.hide = function () {
		this.e.style.display = "none";
		this.open = false;
	} // hide()


	// adjust layout. viewport size
	this.adjustLayout = function () {
		if (!wide.viewportWidth || !wide.viewportHeight) return;

		var	vw = wide.viewportWidth;
		var	vh = wide.viewportHeight;

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
            this.output("> "+v+"\n");
    }

    this.output = function (text) {
        var session = this.editor.session
        session.insert({
           row: session.getLength(),
           column: 0
       }, "" + text);

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
	this.onKeyDown = function (e,code,t) {
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
		if (wide.cPopup && wide.cPopup.closeBt && code == 27) {
			wide.closePopup();
			Sfera.Browser.preventDefault(e);
			return;
		}
	} // onKeyDown()

	// key up
	this.onKeyUp = function (e,code,t) {
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
