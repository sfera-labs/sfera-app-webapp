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
