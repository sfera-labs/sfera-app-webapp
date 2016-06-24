/**
 * @author       Gionatan Iasio <gionatan@sferalabs.cc>
 * @copyright    2016 SferaLabs
 * @license      {@link http://sfera.sferalabs.cc/docs/sfera/license.html|LGPL License}
 */

/**
* Sfera.ComponentManager holds current client's components
*
* @class Sfera.ComponentManager
* @constructor
*/
Sfera.ComponentManager = function (client) {

    this.client = client;

	var all = [];

	// sets of component pointers {id:[ ... ], ...}
	var byId = {};
	var byGroup = {};
	var byType = {};

	// generic add by function. component, which set (byId, byAddress..), value (component.id, component.group..)
	function addBy(co,set,value) {
		if (!set[value]) // ex. byId["dummy.1"]
			set[value] = [];
		set[value].push(co);
	}
    function removeBy(co,set,value) {
        for (var i=0; i<set[value].length; i++) {
            if (set[value] == co) {
                set[value] = null;
                delete set[value];
                return;
            }
        }
    }

	// generic get by function
	function getBy(arr,value) {
		return (arr[value]?arr[value]:[]); // if no array return an empty one
	}

	// index component
	this.index = function (co) {
		all.push(co);
		addBy(co,byType,co.type);
		if (co.id)		addBy(co,byId,co.id);
		if (co.group)	addBy(co,byGroup,co.group);
	};

    // live group indexing
    // add to byGroup set
    this.addByGroup = function (co, group) {
        addBy(co,byGroup,group);
    }
    // remove component from byGroup set
    this.removeByGroup = function (co, group) {
        removeBy(co,byGroup,group);
    }

	// get single object (first) by id
	this.getFirstById = function (id) {
		return this.getById(id)[0];
	};

	// get components by id
	this.getById = function (id) {
		return getBy(byId,id);
	};

	// get components by type
	this.getByType = function (type) {
		return getBy(byType,type);
	};

    // get by group
    this.getByGroup = function (group) {
        return getBy(byGroup,group)
    };

	// get value from single component (first) by id
	this.getValue = function (id) {
		var co = this.getFirstById(id);
		return co ? co.getAttribute("value") : null;
	};

};
