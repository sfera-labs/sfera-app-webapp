Sfera.Doc.add.component("Page", {
    doc: {
        descr:"Page component, used to group components in different views.\nPage ids are usually prefixed with \"page:\" to differentiate them from other components.",
        extra:"\
To open a page from a script use the _[page(id)](../client-scripting.html)_ function.\n\
The id can optionally include the \"page:\" prefix.\n\
**Example**:\n\
\n\
	page(\"home\") or page(\"page:home\")\n\
\n\
        "
    },
    attr:{
        title: {
            descr: "Specifies the page's title, visible in the browser's tab title"
        }
    }

});
