package cc.sferalabs.sfera.apps.webapp;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class InterfaceCacheServletHolder extends WebAppServletHolder {

	static final InterfaceCacheServletHolder INSTANCE = new InterfaceCacheServletHolder();

	/**
	 * 
	 */
	protected InterfaceCacheServletHolder() {
		super(Cache.INTERFACES_CACHE_ROOT.toString());
	}
}
