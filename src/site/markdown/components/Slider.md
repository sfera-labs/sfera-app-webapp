
# Slider

Slider component, allows the user to input a numeric [value](#value) between a [minimum](#min) and [maximum](#max) value.
The decimal digits in the value are based on the maximum amount of decimal digits in the min and max attributes.
![slider](../images/components/slider.png)
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
|**[enabled](#enabled)**|boolean|Specifies whether the component is enabled or not|
|**[cursorSize](#cursorSize)**|integer|Specifies the cursor's size in pixels|
|**[barColor](#barColor)**|color|Specifies the color of the bar|
|**[min](#min)**|float|Specifies the minumum value|
|**[max](#max)**|float|Specifies the maximum value|
|**[focus](#focus)**|boolean|If true, gives the component focus|
|**[value](#value)**|float|Specifies the value of the slider|
|**[changeDelay](#changeDelay)**|integer|Speficies the delay in milliseconds before a value's change is detected|
|**[onKeyUp](#onKeyUp)**|js|Script to be run on key up event|
|**[onChange](#onChange)**|js|Script to be run when a change in value is detected. Variables id and value can be used.|
|**[onEnterKey](#onEnterKey)**|js|Script to be run when enter key is pressed|
|**[onFocus](#onFocus)**|js|Script to be run when the component receives focus|
|**[onBlur](#onBlur)**|js|Script to be run when the component loses focus|


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
<slider id="mySlider" visible="false" />
```

>Via scripting:

>``` js
setAttribute("mySlider","visible","false")
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
<slider id="mySlider" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("mySlider","x","30")
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
<slider id="mySlider" x="30" y="10" />
```

>Via scripting:

>``` js
setAttribute("mySlider","y","10")
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
<slider id="mySlider" x="30" y="10" rotation="90" />
```

>Via scripting:

>``` js
setAttribute("mySlider","rotation","90")
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
<slider id="mySlider" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("mySlider","width","100")
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
<slider id="mySlider" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("mySlider","height","50")
```



---

### style

Specifies the style.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr><tr><td><b>Values:</b></td><td>default</td></tr></table>



---

### color

Specifies the color.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr><tr><td><b>Values:</b></td><td>default, light, stable, positive, calm, balanced, energized, assertive, royal, dark</td></tr></table>



---

### enabled

Specifies whether the component is enabled or not.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>true</td></tr></table>



---

### cursorSize

Specifies the cursor's size in pixels.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr><tr><td><b>Default value:</b></td><td>30</td></tr></table>



---

### barColor

Specifies the color of the bar.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>color</td></tr><tr><td><b>Default value:</b></td><td>transparent</td></tr></table>



---

### min

Specifies the minumum value.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>float</td></tr><tr><td><b>Default value:</b></td><td>0</td></tr></table>



---

### max

Specifies the maximum value.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>float</td></tr><tr><td><b>Default value:</b></td><td>100</td></tr></table>



---

### focus

If true, gives the component focus.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr></table>



---

### value

Specifies the value of the slider.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>float</td></tr></table>



---

### changeDelay

Speficies the delay in milliseconds before a value's change is detected.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>integer</td></tr><tr><td><b>Default value:</b></td><td>0</td></tr></table>



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
<slider id="mySlider" x="10" y="10" on-change="alert(id+' changed. Current value: '+value)" />
```

>Via scripting:

>``` js
setAttribute("mySlider","onChange","alert(id+' changed. Current value: '+value)")
```



---

### onEnterKey

Script to be run when enter key is pressed.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onFocus

Script to be run when the component receives focus.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>



---

### onBlur

Script to be run when the component loses focus.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>js</td></tr></table>

