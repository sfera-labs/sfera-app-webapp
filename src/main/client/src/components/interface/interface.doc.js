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

        backgroundColor: {
            descr: "Specifies the background color of the interface (the frame visible around the pages)"
        },

        pageBackgroundColor: {
            descr: "Specifies the background color for the interface's pages"
        }

    }
});
