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
