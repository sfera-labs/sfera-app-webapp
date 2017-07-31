//--------------------------------------------------------------------------------------------------------------------------
// Text Editor -------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Wide.Apps.TextEditor = function() {
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
		wide.hideOtherApps(this);

		this.e.style.display = "inline";

		this.adjustLayout();

		// loading popup?
		/*
		if (wide.cPopup && wide.cPopup.id == "loading")
			wide.closePopup();
        toolbarSaveBtE.style.display = "none";
        */
        this.showLoading(false);

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
	this.onKeyDown = function (e,code,t) {
		if (wide.cPopup && wide.cPopup.id != "choosefile") {
			if (code == 13) { // return
			switch (wide.cPopup.id) {
				case "newfolder":
					if (focusedElement ==  wide.cPopup.data.input["n"])
						fileManager.newFolder();
					break;
				case "newfile":
					if (focusedElement == wide.cPopup.data.input["n"])
						fileManager.newFile();
					break;
				case "renamefile":
					if (focusedElement == wide.cPopup.data.input["n"])
						fileManager.renameFile();
					break;
				}
			}
			return; // popup open
		}

		// ctrl/cmd s
		if (code == 83 && (e.ctrlKey || e.metaKey) && !wide.cPopup) {
            Sfera.Browser.preventDefault(e);
			this.saveFile();
			return;
		}

        fileManager.changed = true;
        updateTitle();
	} // onKeyDown()

	// key up
	this.onKeyUp = function (e,code,t) {
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
			wide.openPopup("closeeditor",true);
			return;
		}

		updateToolbarPopupButtons();

		if (save) { // editorOpen is false, so when we're done saving, we close again
			this.saveFile(true); // true: close
            return;
		} else if (save == false) { // clicked on no, don't save

		}
        wide.closePopup();

        this.editor.setValue(""); // clear
        this.editor.resize(true);

        //this.hideWarnings();

        /*
        this.adjustLayout();
        wide.closeToolbarPopup();
        */

        if (true || this.returnToFM) { // TODO: close current file
            this.returnToFM = false;
            this.closing = true;
            wide.switchApp("fm",{sel:this.currentFile});
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
        this.editor.session.setValue(text);
        /*
        this.editor.clearSelection();
        this.editor.moveCursorTo(0,0);
        */
        this.editor.getSession().setScrollTop(0);
        this.editor.session.getUndoManager().reset();
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
        wide.closePopup(); // save popup
        if (!r.error) {
            wide.showNotice("<b>"+files.resID+"</b> saved");
            wide.closePopup(); // close saving popup
        } else {
            wide.showNotice("error saving <b>"+files.resID+"</b>");
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
		wide.showSavingPopup();
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
