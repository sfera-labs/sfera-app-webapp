//--------------------------------------------------------------------------------------------------------------------------
// File Manager ------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

Sfera.Wide.Apps.FileManager = function() {
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
		selectedItem : -1, // currently selected item,
        itemButtons:[]
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
		uploadProgressReq.onNoAccess = function () {fileManager.onUploadProgressError(); wide.showErrorPopup("No access");};
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
		wide.hideOtherApps(this);

		this.e.style.display = "inline";

		this.adjustLayout();

		// loading popup?
		/*
		if (wide.cPopup && wide.cPopup.id == "loading")
			wide.closePopup();
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

		this.open = true;
	} // start()

	// hide (switching to another app)
	this.hide = function () {
		this.e.style.display = "none";

		// select mode? selMode: null, key, bt
		if (selMode == "key")
			self.toggleSelMode("");

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
		var a = o.currentPath.split("/");
		var n = a.pop();
        var p = a.join("/");
        selectOnRefresh = {path:p, name:n};
		this.browseTo(p);
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

            o.itemButtons = [];

			for (var i=0; i<data.sub.length; i++) {
				// file or dir
				if (!data.sub[i].sub) {
					var icon = this.canEdit(i)?"bticontextfile":"bticonfile";
					h  = '<div class="icon"><img src="/wide/images/'+icon+'.png" width="16" height="16" onmousedown="return false;"></div>';
					h += '<div class="name"></div>'; // set on adjustFileNames
					if (!this.popupMode)
						h += '<div class="modified">'+(data.sub[i].upload?"-":wide.formatDate(data.sub[i].lastModified))+'</div>';
					h += '<div class="size">'+wide.formatFS(data.sub[i].size)+'</div>';
				} else {
					h  = '<div class="icon"><img src="/wide/images/bticonfolder.png" width="16" height="16" onmousedown="return false;"></div>';
					h += '<div class="name"></div>';  // set on adjustFileNames
					if (!this.popupMode)
						h += '<div class="modified">'+wide.formatDate(data.sub[i].lastModified)+'</div>';
					h += '<div class="size"></div>';
				}

				e = document.createElement('div');
				e.innerHTML = h;

				e.className = "fileItem mLineButton"+(data.sub[i].upload?" disabled":"")+(o.selectedItems.indexOf(i)!=-1?" selected":"");

                o.itemButtons.push(new Sfera.UI.Button(e,{onclick:"fileManager.selectItem("+i+")"}));

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
			if (selectOnRefresh.path == o.currentPath &&
                selectOnRefresh.path+"/"+selectOnRefresh.name != o.currentFile) {
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
				detailsIPE.src = "/wide/images/empty.png";

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
			detailsSE.innerHTML = (t=="d")?"-":wide.formatFS(s);

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
		var ic = '<img src="/wide/images/miniiconopen.png" class="openIcon">'; // open icon
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
			o.itemButtons[i].setAttribute("selected", (o.selectedItems.indexOf(i)!=-1));
			o.itemButtons[i].setAttribute("disabled", (this.uploading && uploadData.index == i));
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
        var p = "";
        for (i=0; i<as.length; i++) {
            p += (p?'/':'')+paths[i];
            this.pathButtons.push(new Sfera.UI.Button(as[i],{onclick:"fileManager.browseTo('"+p+"')"}));
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
        var dirsCE = (this.popupMode)?dirsPContentE:dirsContentE;

		var i = o.selectedItem<0?dirsCE.childNodes.length-1:o.selectedItem-1;
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
		var name = wide.cPopup.data.input["n"].value;
		if (!name) return; // nothing selected
		if (o.currentPath) name = o.currentPath+"/"+name;

		wide.closePopup(); // close new folder popup
		wide.showLoadingPopup();

		files.load("newfolder",name);
	} // newFolder()

	// delete items
	this.deleteItems = function () {
		var o = this.popupMode?this.popupData:this;
		wide.closePopup();
		wide.showLoadingPopup();

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
		var n = wide.cPopup.data.input["n"].value;

		if (!n) return; // nothing selected

		wide.closePopup(); // close new file popup

		self.currentFile = o.currentPath+(o.currentPath?"/":"")+n;
		self.openEditor(true);
	} // newFile()

    this.openEditor = function (isNew) {
        var o = self.popupMode?self.popupData:self;
        wide.switchApp("te",{from:"fm", open:o.currentFile, isNew:isNew});
    }

	// rename file
	this.renameFile = function () {
		var o = self.popupMode?self.popupData:self;
		var n = wide.cPopup.data.input["n"].value;
		if (!n) return; // nothing selected
		var p = (o.currentPath)?o.currentPath+"/":"";

		wide.closePopup(); // close rename file popup

		selectOnRefresh = {path:o.currentPath, name:n};
		files.load("renamefile",[fileManager.currentFile,p+n]);
	} // renameFile()

	// open in project editor
	this.openInProjectEditor = function () {
		var o = this.popupMode?this.popupData:this;
		projectEditor.toLoad = o.currentPath.split("/").pop();
		wide.switchApp("pe");
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
			url += (i?"&":"")+"path="+files.encodeFileName(n);
		}

        url += "&ts="+ts;
		document.getElementById("downloadTarget").src = url;
		if (o.currentFolder.sub[o.selectedItem].sub)
			wide.showNotice("Download requested, please wait...");
	}

	// download backup
	this.downloadBackup = function () {
		var ts = "."+(new Date()).getTime();
		document.getElementById("downloadTarget").src = "/api/files/download?path=.&ts="+ts;
		wide.showNotice("Backup requested, please wait...");
		wide.closeToolbarPopup();
	}

	// new folder popup
	this.openNewFolderPopup = function () {
		var u = this.popupMode;
		wide.openPopup("newfolder",true);
	} // openNewFolderPopup()

	// new file popup
	this.openNewFilePopup = function () {
		wide.openPopup("newfile",true);
	} // openNewFilePopup()

	// new folder popup
	this.openRenameFilePopup = function () {
		wide.openPopup("renamefile",true);
		wide.cPopup.data.input["n"].value = this.currentFolder.sub[this.selectedItem].name;
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
		wide.closePopup();
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
			wide.openPopup("uploadfile", true);
		} else {
			wide.openPopup("uploadingfile", true);
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
					wide.openPopup("uploadoverwrite", true);
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
		if (wide.cPopup && wide.cPopup.id == "uploadoverwrite")
			wide.closePopup(); // close upload overwrite
		if (wide.cPopup && wide.cPopup.id == "uploadfile")
			wide.closePopup(); // close choose file
		if (self.popupMode)
			wide.openPopup("uploadingfile", false);
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
                wide.showErrorPopup("Error uploading: "+json.error);
            }
        };
        uploadReq.onLoaded = function () {
            wide.showNotice("upload finished");
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
					fs?wide.formatFS(Math.round(fs*v/100)):"";
			}
		} else if (self.uploading) { // not canceled?
			self.uploading = false;

			wide.showNotice("upload finished");
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

			wide.closePopup();
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
		uploadPBytesE.innerHTML = fs?(wide.formatFS(cs)+"/"+ wide.formatFS(fs)):"";
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
		wide.showNotice("error uploading "+fs);
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
		wide.closePopup();
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
		wide.showNotice("upload canceled");
		wide.closePopup();
	}

	function onDirsContentDrop(e) {
		this.className = "fm_dirsContent";
		if (!e || !e.dataTransfer) return false;
		Sfera.Browser.preventDefault(e);
		initUpload(e.dataTransfer.files);
	}

	function showDirsOver(e) {
		try {
		    Sfera.Browser.preventDefault(e);
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
		wide.openPopup("choosefile", true, function(){
            fileManager.popupMode = false;
            self.onList(self.currentFolder); // refresh
        });

		// if f is null, don't refresh: we're reopening after upload, or new folder
		if (f) {
			this.popupData.onChoose = f;

			switch(t) {
			case "img":
				wide.cPopup.contentE.getElementsByTagName("span")[0].innerHTML = "Choose File";

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
				wide.cPopup.contentE.getElementsByTagName("span")[0].innerHTML = "Choose File";

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
				wide.cPopup.contentE.getElementsByTagName("span")[0].innerHTML = "Choose Destination";

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
		wide.closePopup();
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
		this.showFolder(f);

        // main app path, popup path
        var i, c,
            p = "",
            a = [this.open?this.currentPath:null,
                this.popupMode?this.popupData.currentPath:null];
        for (i=0; i<2; i++) {
            if (a[i] !== null) {
                c = a[i]?a[i]:".";
                if (c != p)
                    p += (p?",":"") + c;
            }
        }

        var r = {
            action: "subscribe",
            files: p ? p : ".",
            tag: (new Date()).getTime() // request id
        };
        Sfera.Net.wsSend(JSON.stringify(r));
	} // onList()

	// key down
	this.onKeyDown = function (e, code, t) {
		// shift, select mode? selMode: null, key, bt
		if (e.shiftKey && !selMode)
			self.toggleSelMode("key");

		if (wide.cPopup && wide.cPopup.id != "choosefile") {
			if (code == 13) { // return
            Sfera.Browser.preventDefault(e);
			switch (wide.cPopup.id) {
				case "newfolder":
					if (focusedElement == wide.cPopup.data.input["n"])
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

		switch (code) {
        case 38: // up
			Sfera.Browser.preventDefault(e);
			fileManager.selectPrev();
			break;
		case 40: // down
			Sfera.Browser.preventDefault(e);
			fileManager.selectNext();
			break;

		case 8: // backspace
		case 37: // left
			Sfera.Browser.preventDefault(e);
            fileManager.parentFolder();
			break;

        case 39: // right
            var o = fileManager.popupMode?fileManager.popupData:fileManager;
            if (o.selectedItem == -1) {
                fileManager.selectNext();
                break;
            }
		case 13: // enter
			Sfera.Browser.preventDefault(e);
			o = o || (fileManager.popupMode?fileManager.popupData:fileManager);
			if (o.selectedItem>=0)
				fileManager.selectItem(o.selectedItem);
			break;

		case 90: // z
			break;
		}
	} // onKeyDown()

	// key up
	this.onKeyUp = function (e) {
		// shift, select mode? selMode: null, key, bt
		if (!e.shiftKey && selMode == "key")
			self.toggleSelMode("");
	} // onKeyUp()

	init();
};
