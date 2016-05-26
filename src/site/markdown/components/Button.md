
# Button

A button component used to execute customized javascript code.
Its appearance is defined by a style attribute. The [onClick](#onClick) attribute is used to associate an action to execute when the button is pressed.

![button](../images/components/button.png)
## Attributes

|Name|Type|Description|
|---|---|---|
|**[id](#id)**|string|Component identifier. Allows the component to be reached through an identifier.|
|**[cssClass](#cssClass)**|string|Defines a custom css class that is applied to the component's html element. The css class can then be defined in a css file inside the interface's directory.|
|**[visible](#visible)**|boolean|Specifies whether or not the component is visible|
|**[x](#x)**|integer|Specifies the left position of the component in pixels, relative to its parent container (a page or a container component)|
|**[y](#y)**|integer|Specifies the top position of the component in pixels, relative to its parent container (a page or a container component)|
|**[rotation](#rotation)**|integer|Specifies the element's clockwise rotation in degrees|
|**[width](#width)**|integer|Specifies the component's width in pixels|
|**[height](#height)**|integer|Specifies the component's height in pixels|
|**[style](#style)**|string|Specifies the style|
|**[color](#color)**|string|Specifies the color|
|**[enabled](#enabled)**|boolean||
|**[label](#label)**|string|Specifies the label's text|
|**[icon](#icon)**|string|Specifies the url of the icon, if any|
|**[fontSize](#fontSize)**|string|Specifies the label's font size|
|**[onClick](#onClick)**|js|Script to be run on click/touch end event|
|**[onDown](#onDown)**|js|Script to be run on down/touch start event|
|**[onMove](#onMove)**|js|Script to be run on mouse/touch move event|


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

Specifies whether or not the component is visible
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr></table>

>**Example:**
>
>Set the component's visibility to false.
>

>In index.xml:

>``` xml
<button id="myButton" visible='false' />
```

>Via scripting:

>``` js
setAttribute("myButton","visible","false")
```



---

### x

Specifies the left position of the component in pixels, relative to its parent container (a page or a container component)
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Set the left edge of the component to 30 pixels to the right of the left edge of the page.
>

>In index.xml:

>``` xml
<button id="myButton" x='30' y='10' />
```

>Via scripting:

>``` js
setAttribute("myButton","x","30")
```



---

### y

Specifies the top position of the component in pixels, relative to its parent container (a page or a container component)
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Set the top edge of the component to 10 pixels to the bottom of the top edge of the page.
>

>In index.xml:

>``` xml
<button id="myButton" x='30' y='10' />
```

>Via scripting:

>``` js
setAttribute("myButton","y","10")
```



---

### rotation

Specifies the element's clockwise rotation in degrees
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Set the rotation of the component to 90&deg;.
>

>In index.xml:

>``` xml
<button id="myButton" x='30' y='10' rotation='90' />
```

>Via scripting:

>``` js
setAttribute("myButton","rotation","90")
```



---

### width

Specifies the component's width in pixels
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Sets the component's width to 100 pixels wide.
>

>In index.xml:

>``` xml
<button id="myButton" width='100' height='50' />
```

>Via scripting:

>``` js
setAttribute("myButton","width","100")
```



---

### height

Specifies the component's height in pixels
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Sets the component's height to 50 pixels tall.
>

>In index.xml:

>``` xml
<button id="myButton" width='100' height='50' />
```

>Via scripting:

>``` js
setAttribute("myButton","height","50")
```



---

### style

Specifies the style
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr><tr><td><b>Values:</b></td><td>default, clear, icon</td></tr></table>



---

### color

Specifies the color
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr><tr><td><b>Values:</b></td><td>default, light, stable, positive, calm, balanced, energized, assertive, royal, dark</td></tr></table>



---

### enabled


<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>true</td></tr></table>



---

### label

Specifies the label's text
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### icon

Specifies the url of the icon, if any
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### fontSize

Specifies the label's font size
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### onClick

Script to be run on click/touch end event
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>

>**Example:**
>
>Clicking the button will open an alert popup.
>

>In index.xml:

>``` xml
<button id="myButton" x='10' y='10' on-click='alert(&apos;hello&apos;)' />
```

>Via scripting:

>``` js
setAttribute("myButton","onClick","alert('hello')")
```



---

### onDown

Script to be run on down/touch start event
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onMove

Script to be run on mouse/touch move event
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>


