package cc.sferalabs.sfera.apps.webapp.servlets;

import cc.sferalabs.sfera.apps.webapp.Cache;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class InterfaceCacheServletHolder extends WebAppServletHolder {

	public static final InterfaceCacheServletHolder INSTANCE = new InterfaceCacheServletHolder();

	/**
	 * 
	 */
	protected InterfaceCacheServletHolder() {
		super(Cache.INTERFACES_CACHE_ROOT.toString());
	}
}
