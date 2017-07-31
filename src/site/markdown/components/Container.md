
# Container

This component is used to group other components together.
All the contained components' positions are relative to the container's top left corner. Containers can be nested.
## Attributes

|Name|Type|Description|
|---|---|---|
|**[id](#id)**|string|Component identifier. Allows the component to be reached through an identifier.|
|**[cssClass](#cssClass)**|string|Defines a custom css class that is applied to the component's html element. The css class can then be defined in a css file inside the interface's directory.|
|**[visible](#visible)**|boolean|Specifies whether or not the component is visible|
|**[x](#x)**|integer|Specifies the left position of the component in pixels, relative to its parent container (a page or a container component)|
|**[y](#y)**|integer|Specifies the top position of the component in pixels, relative to its parent container (a page or a container component)|
|**[rotation](#rotation)**|integer|Specifies the element's clockwise rotation in degrees|
|**[opacity](#opacity)**|float|Specifies the element's opacity (0..1)|
|**[width](#width)**|size|Specifies the component's width in pixels|
|**[height](#height)**|size|Specifies the component's height in pixels|


---

### id

Component identifier. Allows the component to be reached through an identifier.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### cssClass

Defines a custom css class that is applied to the component's html element. The css class can then be defined in a css file inside the interface's directory.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### visible

Specifies whether or not the component is visible.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr></table>

>**Example:**
>
>Set the component's visibility to false.
>

>In index.xml:

>``` xml
<container id="myContainer" visible="false" />
```

>Via scripting:

>``` js
setAttribute("myContainer","visible","false")
```



---

### x

Specifies the left position of the component in pixels, relative to its parent container (a page or a container component).
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Set the left edge of the component to 30 pixels to the right of the left edge of the page.
>

>In index.xml:

>``` xml
<container id="myContainer" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("myContainer","x","30")
```



---

### y

Specifies the top position of the component in pixels, relative to its parent container (a page or a container component).
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Set the top edge of the component to 10 pixels to the bottom of the top edge of the page.
>

>In index.xml:

>``` xml
<container id="myContainer" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("myContainer","y","10")
```



---

### rotation

Specifies the element's clockwise rotation in degrees.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Set the rotation of the component to 90&deg;.
>

>In index.xml:

>``` xml
<container id="myContainer" x="30" y="10" rotation="90" />
```

>Via scripting:

>``` js
setAttribute("myContainer","rotation","90")
```



---

### opacity

Specifies the element's opacity (0..1).
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>float</td></tr></table>

>**Example:**
>
>Set the opacity of the component to 50%.
>

>In index.xml:

>``` xml
<container id="myContainer" x="30" y="10" opacity="0.5" />
```

>Via scripting:

>``` js
setAttribute("myContainer","opacity","0.5")
```



---

### width

Specifies the component's width in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>size</td></tr></table>

>**Example:**
>
>Sets the component's width to 100 pixels wide.
>

>In index.xml:

>``` xml
<container id="myContainer" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myContainer","width","100")
```



---

### height

Specifies the component's height in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>size</td></tr></table>

>**Example:**
>
>Sets the component's height to 50 pixels tall.
>

>In index.xml:

>``` xml
<container id="myContainer" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myContainer","height","50")
```

