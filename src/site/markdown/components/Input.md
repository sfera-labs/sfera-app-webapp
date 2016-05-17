
# Input

Input component
## Attributes

|Name|Type|Default|Values|Description|
|---|---|---|---|---|
|**id**|string|||Component identifier|
|**cssClass**|string|||Defines a custom css class that is applied to the component's html element|
|**visible**|boolean|||Specifies whether or not the component is visible|
|**position**|string|||Specifies the type of positioning method used (static, relative, absolute or fixed)|
|**x**|integer|||Specifies the left position of the component|
|**y**|integer|||Specifies the top position of the component|
|**rotation**|integer|||Specifies the element's rotation in degrees|
|**width**|integer|||Specifies the component's width|
|**height**|integer|||Specifies the component's height|
|**style**|string|default|default, clear|Specifies the style|
|**value**|string|||Specifies the field's value|
|**type**|string|input|input, textarea, color, date, datetime, email, number, password, tel, time, url|Specifies the input type that defines its behavior|
|**focus**|boolean|||If true, gives the component focus|
|**icon**|string|||Sepcifies an optional icon's url|
|**eraseButton**|boolean|false||If true, shows the erase button|
|**changeDelay**|integer|1000||Speficies the delay in milliseconds before a value's change is detected|
|**keyRegex**|regexp|||Specifies a regex to validate a key press. If the regex doesn't match, the input is canceled|
|**valueRegex**|regexp|||Specifies a regex to validate the value. If the regex doesn't match, the value is not sent to the server|
|**fontSize**|integer|||Specifies the font size in pixels|
|**fontColor**|string|||Specifies the font color|
|**maxLength**|integer|||Specifies the value's maximum length|
|**onKeyUp**|js|||Script to be run on key up event|
|**onChange**|js|event(id,value)||Script to be run when a change in value is detected|
|**onEnterKey**|js|||Script to be run when enter key is pressed|
|**onFocus**|js|||Script to be run when the component receives focus|
|**onBlur**|js|||Script to be run when the component loses focus|

