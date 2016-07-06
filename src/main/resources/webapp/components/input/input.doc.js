Sfera.Doc.add.component("Input", {
    doc: {
        descr:"Input component, to allow the user to input a value of various types (defined by the type attribute).\nIts appearance is defined by a [style](#style) attribute."
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
