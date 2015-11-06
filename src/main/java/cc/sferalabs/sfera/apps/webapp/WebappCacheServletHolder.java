package cc.sferalabs.sfera.apps.webapp;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebappCacheServletHolder extends WebappServletHolder {

	static final WebappCacheServletHolder INSTANCE = new WebappCacheServletHolder();

	/**
	 * 
	 */
	protected WebappCacheServletHolder() {
		setInitParameter("resourceBase", InterfaceCache.CACHE_ROOT.toString());
	}
}
