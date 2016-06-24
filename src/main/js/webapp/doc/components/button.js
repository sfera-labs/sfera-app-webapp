Sfera.Doc.add.component("Button", {
    doc: {
        descr:"A button component used to execute customized javascript code.\nIts appearance is defined by a style attribute. The [onClick](#onClick) attribute is used to associate an action to execute when the button is pressed."
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
            descr: "Script to be run on down/touch start event"
        },

        onMove: {
            descr: "Script to be run on mouse/touch move event"
        }
    }

});
