/*! sfera-webapp - v0.0.2 */

/**
 * Sfera.Doc
 * @class Sfera.Doc
 */
Sfera.Doc = new function() {
    var components = {};
    var presets = {};

    this.add = {
        component: function (name, def) {
            components[name] = def;
        },
        preset: function (name, def) {
            presets[name] = def;
        }
    };

    this.get = {
        component: function (name) {
            return components[name];
        },
        preset: function (name) {
            return presets[name];
        }
    };
};


Sfera.Doc.add.component("_Base", {
    attr:{
        id: {
            descr: "Component identifier"
        },
        cssClass: {
            descr: "Defines a custom css class that is applied to the component's html element"
        }
    }
});




Sfera.Doc.add.component("Button", {
    doc: {
        descr:"A button component used to execute customized javascript code."
    },
    attr:{
        label: {
            descr: "Specifies the label's text"
        },

        icon: {
            descr: "Specifies the url of the icon, if any"
        },

        fontSize: {
            descr: "Specifies the label's font size"
        },

        onClick: {
            descr: "Script to be run on click/touch end event"
        },

        onDown: {
            descr: "Script to be run on down/touch start event"
        },

        onMove: {
            descr: "Script to be run on mouse/touch move event"
        }
    }

});


Sfera.Doc.add.component("Checkbox", {
    doc: {
        descr:"Checkbox component"
    },
    attr:{
        focus: {
            descr: "Focus the element"
        },

        label: {
            descr: "Specifies the label's text"
        },

        value: {
            descr: "Specifies the checkbox's value"
        },

        fontSize: {
            descr: "Specifies the font size in pixels"
        },

        fontColor: {
            descr: "Specifies the font color"
        },

        changeDelay: {
            descr: "Specifies the milliseconds before a change of value is noticed"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },
        onChange: {
            descr: "Script to be run on change event"
        },
        onEnter: {
            descr: "Script to be run when the enter key is pressed"
        },
        onFocus: {
            descr: "Script to be run when the field gains focus"
        },
        onBlur: {
            descr: "Script to be run when the field loses focus"
        }
    }
});


Sfera.Doc.add.component("Container", {
    doc: {
        descr:"This component is used to group other components together. All the contained components' positions are relative to the container's top left corner. Containers can be nested."
    },
    attr:{
        
    }
});


Sfera.Doc.add.component("Image", {
    doc: {
        descr:"Image component"
    },
    attr:{
        source: {
            descr: "Specifies the image source file"
        },

    }

});


Sfera.Doc.add.component("Input", {
    doc: {
        descr:"Input component"
    },
    attr:{
        type: {
            descr: "Specifies the input type that defines its behavior"
        },

        value: {
            descr: "Specifies the field's value"
        },

        focus: {
            descr: "If true, gives the component focus"
        },

        icon: {
            descr: "Sepcifies an optional icon's url"
        },

        eraseButton: {
            descr: "If true, shows the erase button"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
        },

        keyRegex: {
            descr: "Specifies a regex to validate a key press. If the regex doesn't match, the input is canceled"
        },

        valueRegex: {
            descr: "Specifies a regex to validate the value. If the regex doesn't match, the value is not sent to the server"
        },

        fontSize: {
            descr: "Specifies the font size in pixels"
        },

        fontColor: {
            descr: "Specifies the font color"
        },

        maxLength: {
            descr: "Specifies the value's maximum length"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },

        onChange: {
            descr: "Script to be run when a change in value is detected"
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed"
        },

        onFocus: {
            descr: "Script to be run when the component receives focus"
        },

        onBlur: {
            descr: "Script to be run when the component loses focus"
        }
    }

});


Sfera.Doc.add.component("Interface", {
    doc: {
        descr:"Interface component"
    },
    attr:{
        title: {
            descr: "Specifies the interface's title"
        },

        skin: {
            descr: "Specifies the interface's skin. Can be set only on the interface's index.xml"
        },

        zoom: {
            descr: "Specifies the interfaces zoom"
        }
    }
});


Sfera.Doc.add.component("Label", {
    doc: {
        descr:"Label component"
    },
    attr:{
        text: {
            descr: "Specifies the label's text"
        }
    }
});


Sfera.Doc.add.component("Page", {
    doc: {
        descr:"Page component"
    },
    attr:{
        title: {
            descr: "Specifies the page's title, visible in the browser's tab title"
        }
    }

});


Sfera.Doc.add.component("Radio", {
    doc: {
        descr:"Radio component"
    },
    attr:{
        group: {
            descr: "Specifies the radio's group. Only one radio component of the same group can be checked at the same time"
        }
    }

});


Sfera.Doc.add.component("Select", {
    doc: {
        descr:"Select component"
    },
    attr:{
        value: {
            descr: "Specifies the current value"
        },

        focus: {
            descr: "If true the component gains focus"
        },

        icon: {
            descr: "Specifies the url of the icon, if any"
        },

        values: {
            descr: "Specifies the values of the items"
        },

        labels: {
            descr: "Specifies the labels of the items"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
        },

        fontSize: {
            descr: "Specifies the font size in pixels"
        },

        fontColor: {
            descr: "Specifies the font color"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },

        onChange: {
            descr: "Script to be run when a change in value is detected"
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed"
        },

        onFocus: {
            descr: "Script to be run when the component receives focus"
        },

        onBlur: {
            descr: "Script to be run when the component loses focus"
        }
    }

});


Sfera.Doc.add.component("Slider", {
    doc: {
        descr:"Slider component"
    },
    attr:{
        cursorSize: {
            descr: "Specifies the label's text"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
        },

        barColor: {
            descr: "Specifies the color of the bar"
        },

        min: {
            descr: "Specifies the minumum value"
        },

        max: {
            descr: "Specifies the maximum value"
        },

        value: {
            descr: "Specifies the value of the slider"
        },

        focus: {
            descr: "If true, gives the component focus"
        },

        onKeyUp: {
            descr: "Script to be run on key up event"
        },

        onChange: {
            descr: "Script to be run when a change in value is detected"
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed"
        },

        onFocus: {
            descr: "Script to be run when the component receives focus"
        },

        onBlur: {
            descr: "Script to be run when the component loses focus"
        }
    }
});


Sfera.Doc.add.preset("Color", {
    color: {
        descr: "Specifies the color"
    }
});


Sfera.Doc.add.preset("Label", {
    label: {
        descr: "Specifies the label"
    },
    color: {
        descr: "Specifies the color"
    },
    fontSize: {
        descr: "Specifies the font size in pixels"
    },
    textAlign: {
        descr: "Specifies the text alignment"
    }
});


Sfera.Doc.add.preset("Position", {
    position:{
        descr: "Specifies the type of positioning method used (static, relative, absolute or fixed)"
    },
    x: {
        descr: "Specifies the left position of the component"
    },
    y: {
        descr: "Specifies the top position of the component"
    },
    rotation: {
        descr: "Specifies the element's rotation in degrees"
    }

});


Sfera.Doc.add.preset("Size", {
    width: {
        descr: "Specifies the component's width"
    },
    height: {
        descr: "Specifies the component's height"
    }
});


Sfera.Doc.add.preset("Style", {
    style: {
        descr: "Specifies the style"
    }
});


Sfera.Doc.add.preset("Visibility", {
    visible: {
        descr: "Specifies whether or not the component is visible"
    }
});

//# sourceMappingURL=sfera-doc.js.map