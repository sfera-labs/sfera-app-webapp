
# Input

Input component, to allow the user to input a value of various types (defined by the type attribute).
Its appearance is defined by a [style](#style) attribute.
![input](../images/components/input.png)
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
|**[enabled](#enabled)**|boolean|Specifies whether the component is enabled or not|
|**[value](#value)**|string|Specifies the field's value|
|**[type](#type)**|string|Specifies the input type that defines its behavior|
|**[focus](#focus)**|boolean|If true, gives the component focus|
|**[icon](#icon)**|string|Sepcifies an optional icon's url|
|**[eraseButton](#eraseButton)**|boolean|If true, shows the erase button|
|**[error](#error)**|boolean||
|**[changeDelay](#changeDelay)**|integer|Speficies the delay in milliseconds before a value's change is detected|
|**[keyRegex](#keyRegex)**|regexp|Specifies a regex to validate a key press. If the regex doesn't match, the input is canceled|
|**[valueRegex](#valueRegex)**|regexp|Specifies a regex to validate the value. If the regex doesn't match, the value is not sent to the server|
|**[fontSize](#fontSize)**|integer|Specifies the font size in pixels|
|**[fontColor](#fontColor)**|string|Specifies the font color|
|**[maxLength](#maxLength)**|integer|Specifies the value's maximum length|
|**[onChange](#onChange)**|js|Script to be run when a change in value is detected. Variables `id` and `value` can be used.|
|**[onKeyDown](#onKeyDown)**|js||
|**[onKeyUp](#onKeyUp)**|js|Script to be run on key up event|
|**[onEnterKey](#onEnterKey)**|js|Script to be run when enter key is pressed. Variables `id` and `value` can be used.|
|**[onFocus](#onFocus)**|js|Script to be run when the component receives focus. Variables `id` and `value` can be used.|
|**[onBlur](#onBlur)**|js|Script to be run when the component loses focus. Variables `id` and `value` can be used.|


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
<input id="myInput" visible="false" />
```

>Via scripting:

>``` js
setAttribute("myInput","visible","false")
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
<input id="myInput" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("myInput","x","30")
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
<input id="myInput" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("myInput","y","10")
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
<input id="myInput" x="30" y="10" rotation="90" />
```

>Via scripting:

>``` js
setAttribute("myInput","rotation","90")
```



---

### width

Specifies the component's width in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Sets the component's width to 100 pixels wide.
>

>In index.xml:

>``` xml
<input id="myInput" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myInput","width","100")
```



---

### height

Specifies the component's height in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>

>**Example:**
>
>Sets the component's height to 50 pixels tall.
>

>In index.xml:

>``` xml
<input id="myInput" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myInput","height","50")
```



---

### style

Specifies the style.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr><tr><td><b>Values:</b></td><td>default</td></tr></table>



---

### enabled

Specifies whether the component is enabled or not.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>true</td></tr></table>



---

### value

Specifies the field's value.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### type

Specifies the input type that defines its behavior.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>input</td></tr><tr><td><b>Values:</b></td><td>input, textarea, color, date, datetime, email, number, password, tel, time, url</td></tr></table>



---

### focus

If true, gives the component focus.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr></table>



---

### icon

Sepcifies an optional icon's url.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### eraseButton

If true, shows the erase button.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>false</td></tr></table>



---

### error


<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>false</td></tr></table>



---

### changeDelay

Speficies the delay in milliseconds before a value's change is detected.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr><tr><td><b>Default value:</b></td><td>1000</td></tr></table>



---

### keyRegex

Specifies a regex to validate a key press. If the regex doesn't match, the input is canceled.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>regexp</td></tr></table>



---

### valueRegex

Specifies a regex to validate the value. If the regex doesn't match, the value is not sent to the server.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>regexp</td></tr></table>



---

### fontSize

Specifies the font size in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>



---

### fontColor

Specifies the font color.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### maxLength

Specifies the value's maximum length.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>



---

### onChange

Script to be run when a change in value is detected. Variables `id` and `value` can be used.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr><tr><td><b>Default value:</b></td><td>event(id,value)</td></tr></table>

>**Example:**
>
>When a change is detected (based on the changeDelay attribute) an alert will display the current value.
>

>In index.xml:

>``` xml
<input id="myInput" x="10" y="10" on-change="alert(id+' changed. Current value: '+value)" />
```

>Via scripting:

>``` js
setAttribute("myInput","onChange","alert(id+' changed. Current value: '+value)")
```



---

### onKeyDown


<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onKeyUp

Script to be run on key up event.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onEnterKey

Script to be run when enter key is pressed. Variables `id` and `value` can be used.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onFocus

Script to be run when the component receives focus. Variables `id` and `value` can be used.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onBlur

Script to be run when the component loses focus. Variables `id` and `value` can be used.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>

