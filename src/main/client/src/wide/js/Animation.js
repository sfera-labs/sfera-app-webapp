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