/**
 * 
 */
package cc.sferalabs.sfera.apps.webapp.events;

import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class RemoteUi extends HashMap<String, Object> {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3835099836408879840L;

	/**
	 * @param id
	 * @param attribute
	 * @param value
	 */
	public void set(String id, String attribute, String value) {
		@SuppressWarnings("unchecked")
		Map<String, Object> uiSet = (Map<String, Object>) get("uiSet");
		if (uiSet == null) {
			uiSet = new HashMap<>();
			put("uiSet", uiSet);
		}
		uiSet.put(id + "." + attribute, value);
	}

}
