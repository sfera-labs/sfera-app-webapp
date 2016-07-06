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
