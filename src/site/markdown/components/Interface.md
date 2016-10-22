
# Interface

Interface component, the root component that contains all the others.
## Attributes

|Name|Type|Description|
|---|---|---|
|**[id](#id)**|string|Component identifier. Allows the component to be reached through an identifier.|
|**[cssClass](#cssClass)**|string|Defines a custom css class that is applied to the component's html element. The css class can then be defined in a css file inside the interface's directory.|
|**[visible](#visible)**|boolean|Specifies whether or not the component is visible|
|**[width](#width)**|integer|Specifies the component's width in pixels|
|**[height](#height)**|integer|Specifies the component's height in pixels|
|**[title](#title)**|string|Specifies the interface's title|
|**[skin](#skin)**|string|Specifies the interface's skin. Can be set only on the interface's index.xml|
|**[zoom](#zoom)**|float|Specifies the interface's zoom. A value of 2 means the interface is scaled at 200%|
|**[autoReload](#autoReload)**|boolean|If true, the interface reloads when the cache is updated (wherever the interface's sources change)|
|**[bodyBackgroundColor](#bodyBackgroundColor)**|color|Specifies the background CSS color of the interface (the body of the page, visible around the interface's pages)|
|**[frameBackgroundColor](#frameBackgroundColor)**|color|Specifies the background CSS color for the interface's central frame that contains pages|


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
<interface id="myInterface" visible="false" />
```

>Via scripting:

>``` js
setAttribute("myInterface","visible","false")
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
<interface id="myInterface" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myInterface","width","100")
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
<interface id="myInterface" width="100" height="50" />
```

>Via scripting:

>``` js
setAttribute("myInterface","height","50")
```



---

### title

Specifies the interface's title.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr></table>



---

### skin

Specifies the interface's skin. Can be set only on the interface's index.xml.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>string</td></tr><tr><td><b>Default value:</b></td><td>default</td></tr></table>



---

### zoom

Specifies the interface's zoom. A value of 2 means the interface is scaled at 200%.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>float</td></tr></table>



---

### autoReload

If true, the interface reloads when the cache is updated (wherever the interface's sources change).
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>boolean</td></tr><tr><td><b>Default value:</b></td><td>true</td></tr></table>



---

### bodyBackgroundColor

Specifies the background CSS color of the interface (the body of the page, visible around the interface's pages).
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>color</td></tr></table>



---

### frameBackgroundColor

Specifies the background CSS color for the interface's central frame that contains pages.
<table class='attrTable table' style='width:auto'><tr><td><b>Type:</b></td><td>color</td></tr></table>

