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
