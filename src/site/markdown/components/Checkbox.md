
# Checkbox

Checkbox component, used to represent a boolean value.
Its appearance is defined by a [style](#style) attribute.
![checkbox](../images/components/checkbox.png)
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
|**[width](#width)**|integer|Specifies the component's width in pixels|
|**[height](#height)**|integer|Specifies the component's height in pixels|
|**[style](#style)**|string|Specifies the style|
|**[enabled](#enabled)**|boolean|Specifies whether the component is enabled or not|
|**[value](#value)**|boolean|Specifies the checkbox's value|
|**[focus](#focus)**|boolean|Focus the element|
|**[label](#label)**|string|Specifies the label's text|
|**[changeDelay](#changeDelay)**|integer|Specifies the milliseconds before a change of value is noticed|
|**[fontSize](#fontSize)**|integer|Specifies the font size in pixels|
|**[fontColor](#fontColor)**|string|Specifies the font color|
|**[onKeyUp](#onKeyUp)**|js|Script to be run on key up event|
|**[onChange](#onChange)**|js|Script to be run when a change in value is detected. Variables id and value can be used.|
|**[onEnterKey](#onEnterKey)**|js||
|**[onFocus](#onFocus)**|js|Script to be run when the field gains focus|
|**[onBlur](#onBlur)**|js|Script to be run when the field loses focus|


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
<checkbox id="myCheckbox" visible="false" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","visible","false")
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
<checkbox id="myCheckbox" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","x","30")
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
<checkbox id="myCheckbox" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","y","10")
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
<checkbox id="myCheckbox" x="30" y="10" rotation="90" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","rotation","90")
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
<checkbox id="myCheckbox" x="30" y="10" opacity="0.5" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","opacity","0.5")
```



---

### width

Specifies the component's width in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr><tr><td><b>Default value:</b></td><td>20</td></tr></table>

>**Example:**
>
>Sets the component's width to 100 pixels wide.
>

>In index.xml:

>``` xml
<checkbox id="myCheckbox" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","width","100")
```



---

### height

Specifies the component's height in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr><tr><td><b>Default value:</b></td><td>20</td></tr></table>

>**Example:**
>
>Sets the component's height to 50 pixels tall.
>

>In index.xml:

>``` xml
<checkbox id="myCheckbox" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","height","50")
```



---

### style

Specifies the style.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr><tr><td><b>Values:</b></td><td>default, radio, switch, clear</td></tr></table>



---

### enabled

Specifies whether the component is enabled or not.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>true</td></tr></table>



---

### value

Specifies the checkbox's value.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr></table>



---

### focus

Focus the element.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr></table>



---

### label

Specifies the label's text.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### changeDelay

Specifies the milliseconds before a change of value is noticed.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr><tr><td><b>Default value:</b></td><td>200</td></tr></table>



---

### fontSize

Specifies the font size in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr></table>



---

### fontColor

Specifies the font color.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### onKeyUp

Script to be run on key up event.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onChange

Script to be run when a change in value is detected. Variables id and value can be used.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr><tr><td><b>Default value:</b></td><td>event(id,value)</td></tr></table>

>**Example:**
>
>When a change is detected (based on the changeDelay attribute) an alert will display the current value.
>

>In index.xml:

>``` xml
<checkbox id="myCheckbox" x="10" y="10" on-change="alert(id+' changed. Current value: '+value)" />
```

>Via scripting:

>``` js
setAttribute("myCheckbox","onChange","alert(id+' changed. Current value: '+value)")
```



---

### onEnterKey


<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onFocus

Script to be run when the field gains focus.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onBlur

Script to be run when the field loses focus.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>

