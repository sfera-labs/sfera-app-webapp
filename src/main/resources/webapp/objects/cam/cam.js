// cam class
Objects.cam = function () {
	this.popups = {}; // can have associated popups

	this.src = ""; // image src

	var foo = this;
	var imageE = null;

	var _init = this.init;
	this.init = function (e, obj) {
		imageE = e.getElementsByTagName("img")[0];
		_init.call(this, e, obj);
	}

	var interval;
	
	// events. not to be assigned externally
	this.onShow = function () {
		clearInterval(interval);
		interval = setInterval(update,100);
	}
	
	
	this.onHide = function () {
		clearInterval(interval);
		
		browser.onButtonEvent(null,this.e,"mouseout");
		// close all non modal popups, those are closed by showPage
		for (var id in this.popups) if (this.popups[id].popupType != "modal") {
			client.closePopup(this.popups[id]); // so popups don't float, we close them
		}
	}
	
	function update() {
		value = this.src;
		value += (value.indexOf('?')!=-1)?'&':'?';
		value += 'ts='+(new Date().getTime());
		imageE.src = value;
	}

	// set attribute
	var _setAttribute = this.setAttribute;
	this.setAttribute = function (name, value) {
		var v;
		switch (name) {
		case "src":
			this.src = value;
			update();
			break;
		case "width":
			imageE.style.width = parseInt(value)+"px";
			break;
		case "height":
			imageE.style.height = parseInt(value)+"px";
			break;
		default:
			return _setAttribute.call(this, name, value);
		}

		return this.updateAttribute(name, v);
	} // setAttribute()
} // Objects.image class

Objects.extend("cam","__base","__pos");