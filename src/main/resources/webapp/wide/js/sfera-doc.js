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
            descr: "Component identifier. Allows the component to be reached through an identifier."
        },
        cssClass: {
            descr: "Defines a custom css class that is applied to the component's html element. The css class can then be defined in a css file inside the interface's directory."
        }
    }
});




Sfera.Doc.add.preset("Color", {
    color: {
        descr: "Specifies the color"
    }
});


Sfera.Doc.add.preset("Enable", {
    enabled: {
        descr: "Specifies whether the component is enabled or not"
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
        descr: "Specifies the type of positioning method used (static, relative, absolute or fixed)",
        hidden: true
    },
    x: {
        descr: "Specifies the left position of the component in pixels, relative to its parent container (a page or a container component)",
        example: {
            descr:"Set the left edge of the component to 30 pixels to the right of the left edge of the page",
            values:{
                x:30,
                y:10
            },
        }
    },
    y: {
        descr: "Specifies the top position of the component in pixels, relative to its parent container (a page or a container component)",
        example: {
            descr:"Set the top edge of the component to 10 pixels to the bottom of the top edge of the page",
            values:{
                x:30,
                y:10
            },
        }
    },
    rotation: {
        descr: "Specifies the element's clockwise rotation in degrees",
        example: {
            descr:"Set the rotation of the component to 90&deg;",
            values:{
                x:30,
                y:10,
                rotation:90
            },
        }
    },
    opacity: {
        descr: "Specifies the element's opacity (0..1)",
        example: {
            descr:"Set the opacity of the component to 50%",
            values:{
                x:30,
                y:10,
                opacity:0.5
            },
        }
    }
});


Sfera.Doc.add.preset("Size", {
    width: {
        descr: "Specifies the component's width in pixels",
        example:{
            descr:"Sets the component's width to 100 pixels wide",
            values:{
                width:100,
                height:50
            }
        }
    },
    height: {
        descr: "Specifies the component's height in pixels",
        example:{
            descr:"Sets the component's height to 50 pixels tall",
            values:{
                width:100,
                height:50
            }
        }
    }
});


Sfera.Doc.add.preset("Style", {
    style: {
        descr: "Specifies the style",
    }
});


Sfera.Doc.add.preset("Visibility", {
    visible: {
        descr: "Specifies whether or not the component is visible",
        example: {
            descr:"Set the component's visibility to false",
            values:{
                visible:false
            }
        }
    }
});


Sfera.Doc.add.component("Button", {
    doc: {
        descr:"A button component used to execute customized JavaScript code.\nIts appearance is defined by a style attribute. The [onClick](#onClick) attribute is used to associate an action to execute when the button is pressed.",
        extra:"![button](../images/components/button.png)"
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
            descr: "Script to be run on click/touch end event. The variable _id_ contains the button's id.",
            example:{
                descr:"Clicking the button will open an alert popup.",
                values: {
                    x:10,
                    y:10,
                    onClick:"alert('hello')"
                }
            }
        },

        onDown: {
            descr: "Script to be run on down/touch start event. The onClick event function as an onUp event."
        },

        onMove: {
            descr: "Script to be run on mouse/touch move event"
        }
    }

});


Sfera.Doc.add.component("Checkbox", {
    doc: {
        descr:"Checkbox component, used to represent a boolean value.\nIts appearance is defined by a [style](#style) attribute.",
        extra:"![checkbox](../images/components/checkbox.png)"
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
            descr: "Script to be run when a change in value is detected. Variables id and value can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
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
        descr:"This component is used to group other components together.\nAll the contained components' positions are relative to the container's top left corner. Containers can be nested."
    },
    attr:{

    }
});


Sfera.Doc.add.component("Image", {
    doc: {
        descr:"Image component, used to display a single image of any type supported by the target browser."
    },
    attr:{
        source: {
            descr: "Specifies the image source file"
        },
    }
});


Sfera.Doc.add.component("Input", {
    doc: {
        descr:"Input component, to allow the user to input a value of various types (defined by the type attribute).\nIts appearance is defined by a [style](#style) attribute.",
        extra:"![input](../images/components/input.png)"
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
            descr: "Script to be run when a change in value is detected. Variables `id` and `value` can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
        },

        onEnterKey: {
            descr: "Script to be run when enter key is pressed. Variables `id` and `value` can be used."
        },

        onFocus: {
            descr: "Script to be run when the component receives focus. Variables `id` and `value` can be used."
        },

        onBlur: {
            descr: "Script to be run when the component loses focus. Variables `id` and `value` can be used."
        }
    }

});


Sfera.Doc.add.component("Interface", {
    doc: {
        descr:"Interface component, the root component that contains all the others."
    },
    attr:{
        title: {
            descr: "Specifies the interface's title"
        },

        skin: {
            descr: "Specifies the interface's skin. Can be set only on the interface's index.xml"
        },

        zoom: {
            descr: "Specifies the interface's zoom. A value of 2 means the interface is scaled at 200%"
        },

        autoReload: {
            descr: "If true, the interface reloads when the cache is updated (wherever the interface's sources change)"
        },

        bodyBackgroundColor: {
            descr: "Specifies the background CSS color of the interface (the body of the page, visible around the interface's pages)"
        },

        frameBackgroundColor: {
            descr: "Specifies the background CSS color for the interface's central frame that contains pages"
        }

    }
});


Sfera.Doc.add.component("Label", {
    doc: {
        descr:"Label component, used to display a string."
    },
    attr:{
        text: {
            descr: "Specifies the label's text"
        }
    }
});


Sfera.Doc.add.component("List", {
    doc: {
        descr:"List component, to display a list of items. Each item can have an html template to vary its appearance and an (onItemClick)[#onItemClick] event"
    },
    attr:{
        values: {
            descr: "Specifies the values of the items"
        },

        labels: {
            descr: "Specifies the labels of the items"
        },

        template: {
            descr: "Specifies the template for the items"
        },

        onItemClick: {
            descr: "Script to be run when an item is clicked. Variables `id` and `value` can be used.",
            example: {
                descr: "When an item is clicked an alert will display its value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert('list '+id+' changed. Current value: '+value)"
                }
            }
        }
    }

});


Sfera.Doc.add.component("Page", {
    doc: {
        descr:"Page component, used to group components in different views.\nPage ids are usually prefixed with \"page:\" to differentiate them from other components.",
        extra:"\
To open a page from a script use the _[page(id)](../client-scripting.html)_ function.\n\
The id can optionally include the \"page:\" prefix.\n\
**Example**:\n\
\n\
	page(\"home\") or page(\"page:home\")\n\
\n\
        "
    },
    attr:{
        title: {
            descr: "Specifies the page's title, visible in the browser's tab title"
        }
    }

});


Sfera.Doc.add.component("Radio", {
    doc: {
        descr:"Radio component, used in a group of multiple radio components to represent an exclusive value.\nIts appearance is defined by a [style](#style) attribute.\nThe [group](#group) attribute defines which radio components work together.",
        extra:"![radio](../images/components/radio.png)"
    },
    attr:{
        group: {
            descr: "Specifies the radio's group. Only one radio component of the same group can be checked at the same time"
        }
    }

});


Sfera.Doc.add.component("Select", {
    doc: {
        descr:"Select component, allows the user to select a single value among a list of [values](#values).",
        extra:"![select](../images/components/select.png)"
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
            descr: "Script to be run when a change in value is detected. Variables id and value can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
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
        descr:"Slider component, allows the user to input a numeric [value](#value) between a [minimum](#min) and [maximum](#max) value.\nThe decimal digits in the value are based on the maximum amount of decimal digits in the min and max attributes.",
        extra:"![slider](../images/components/slider.png)"
    },
    attr:{
        cursorSize: {
            descr: "Specifies the cursor's size in pixels"
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
            descr: "Script to be run when a change in value is detected. Variables id and value can be used.",
            example: {
                descr: "When a change is detected (based on the changeDelay attribute) an alert will display the current value",
                values: {
                    x:10,
                    y:10,
                    onChange:"alert(id+' changed. Current value: '+value)"
                }
            }
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

//# sourceMappingURL=sfera-doc.js.map