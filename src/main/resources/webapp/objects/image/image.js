// image class
Objects.image = function () {
	this.popups = {}; // can have associated popups

	this.src = ""; // image src

	var foo = this;
	
	var imageE = null;

	var _init = this.init;
	this.init = function (e, obj) {
		_init.call(this, e, obj);
		imageE = this.e.getElementsByTagName("img")[0];
	}

	// events. not to be assigned externally
	this.onShow = function () {} // do nothing on show
	this.onHide = function () {
		browser.onButtonEvent(null,this.e,"mouseout");
		// close all non modal popups, those are closed by showPage
		for (var id in this.popups) if (this.popups[id].popupType != "modal") {
			client.closePopup(this.popups[id]); // so popups don't float, we close them
		}
	}

	// set attribute
	var _setAttribute = this.setAttribute;
	this.setAttribute = function (name, value) {
		var v;
		switch (name) {
		case "src":
			imageE.src = value;
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

Objects.extend("image","__base","__pos");