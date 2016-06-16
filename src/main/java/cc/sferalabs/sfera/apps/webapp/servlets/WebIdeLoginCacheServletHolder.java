package cc.sferalabs.sfera.apps.webapp.servlets;

import cc.sferalabs.sfera.apps.webapp.Cache;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebIdeLoginCacheServletHolder extends WebAppServletHolder {

	public static final WebIdeLoginCacheServletHolder INSTANCE = new WebIdeLoginCacheServletHolder();

	/**
	 * 
	 */
	protected WebIdeLoginCacheServletHolder() {
		super(Cache.CACHE_ROOT.toString());
	}

}
