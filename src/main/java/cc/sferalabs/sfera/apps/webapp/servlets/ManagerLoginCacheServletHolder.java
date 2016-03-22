package cc.sferalabs.sfera.apps.webapp.servlets;

import cc.sferalabs.sfera.apps.webapp.Cache;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class ManagerLoginCacheServletHolder extends WebAppServletHolder {

	public static final ManagerLoginCacheServletHolder INSTANCE = new ManagerLoginCacheServletHolder();

	/**
	 * 
	 */
	protected ManagerLoginCacheServletHolder() {
		super(Cache.CACHE_ROOT.toString());
	}

}
