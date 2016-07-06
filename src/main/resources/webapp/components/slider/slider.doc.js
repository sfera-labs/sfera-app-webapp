Sfera.Doc.add.component("Slider", {
    doc: {
        descr:"Slider component, allows the user to input a numeric [value](#value) between a [minimum](#min) and [maximum](#max) value.\nThe decimal digits in the value are based on the maximum amount of decimal digits in the min and max attributes.",
        extra:"![slider](../images/components/slider.png)"
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
