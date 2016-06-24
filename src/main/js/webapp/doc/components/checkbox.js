Sfera.Doc.add.component("Checkbox", {
    doc: {
        descr:"Checkbox component, used to represent a boolean value.\nIts appearance is defined by a [style](#style) attribute."
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
