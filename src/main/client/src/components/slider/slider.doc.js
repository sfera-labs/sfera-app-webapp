Sfera.Doc.add.component("Slider", {
    doc: {
        descr:"Slider component, based on [NoUiSlider](https://refreshless.com/nouislider/).",
        extra:"![slider](../images/components/slider.png)"
    },
    attr:{
        min: {
            descr: "Specifies the minumum value"
        },

        max: {
            descr: "Specifies the maximum value"
        },

        value: {
            descr: "Specifies the value of the slider"
        },
        
        decimals: {
        	descr: "Number of decimals for the value"
        },

        changeDelay: {
            descr: "Speficies the delay in milliseconds before a value's change is detected"
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

        orientation: {
            descr: "Orientation of the slider"
        }
    }
});
