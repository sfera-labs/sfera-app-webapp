//--------------------------------------------------------------------------------------------------------------------------
// Files -------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Wide.Files = function () {
	var req = new Sfera.Net.Request();

	// name and type of resource currently loading
	this.resID = "";
	this.resType = "";

	var _onLoaded;

	var foo = this;

	// init
	function init() {
		req.onLoaded = onResourceLoaded;
		req.onError = onResourceError;
		// req.onAuthenticate = showPin; TODO
		//req.onNoAccess = function () {wide.showErrorPopup("No access");}; TODO
	} // init()

	// encode file name
	this.encodeFileName = function (n) {
		if (n=="") n=".";
		n = encodeURIComponent(n);
		return n.replace(/\*/g,"%2A"); //.replace(/\./g,"%2E");
	} // encodeFileName()

	// load a file. type, value, wait msec?
	this.load = function (type, value, msec, onLoaded) {
		if (!msec) msec = 10; // default 10 msec timeout
		_onLoaded = onLoaded;
		var url = "";
		var ts = (new Date()).getTime();
		var resID = value;

		req.method = "GET";
		switch (type) {
		// file manager
		case "list":
		case "refresh_list":
			url = "/api/files/ls?path=";
			if (value && value.isArray) {
				url += this.encodeFileName(value[0]);
				url += "&depth="+value[1];
			} else {
            	url += this.encodeFileName(value);
				url += "&depth=0";
			}
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
		    if (wide.cPopup && (wide.cPopup.id == "saving" || wide.cPopup.id == "loading"))
		    	wide.closePopup();
			// error
			wide.clearNotice();

			errorDescr = json ? json.error : "";
			if (errorDescr)
				errorDescr = errorDescr[0].toLowerCase() + errorDescr.substr(1);
			errorText = "Error loading "+files.resType;
			if (files.resID) errorText += ", "+files.resID;
		}

		// custom on loaded event
		if (_onLoaded) {
			_onLoaded(json, errCode?{code:errCode, descr:errorDescr}:null);
			return;
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
			if (!errCode && wide.cApp == "te")
				textEditor.onFileRead(json.content);
			break;

		case "writefile":
			if (!errCode && wide.cApp == "te")
				textEditor.onFileSaved(json);
	    	break;

		case "newfolder":
			wide.closePopup();
			var name = foo.resID.split("/").pop();
			if (!errCode)
				noticeTxt = "new folder (<b>"+name+"</b>) created";
			else
				noticeTxt = "error creating new folder: "+err;
			var o = fileManager.popupMode?fileManager.popupData:fileManager;
			fileManager.browseTo(o.currentPath);
			break;

		case "deletefile":
			wide.closePopup();
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
				wide.openPopup("overwritefiles",true);
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
			wide.showNotice(noticeTxt);
			errorText = "";
		}

		// still an error to show?
		if (errorText) {
			var str = errorText + ": "+errorDescr+" ("+errCode+")";
			wide.showErrorPopup(str);
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
