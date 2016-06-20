package cc.sferalabs.sfera.apps.webapp;

import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.common.eventbus.Subscribe;

import cc.sferalabs.sfera.apps.Application;
import cc.sferalabs.sfera.apps.webapp.events.WebAppNode;
import cc.sferalabs.sfera.apps.webapp.events.WebAppUIEvent;
import cc.sferalabs.sfera.apps.webapp.servlets.AuthInterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.InterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.WebIdeCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.WebIdeLoginCacheServletHolder;
import cc.sferalabs.sfera.core.Configuration;
import cc.sferalabs.sfera.events.Bus;
import cc.sferalabs.sfera.web.WebServer;
import cc.sferalabs.sfera.web.WebServerException;
import cc.sferalabs.sfera.web.api.WebApiEvent;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class WebApp extends Application {

	static final Path ROOT = Paths.get("webapp/");
	private static final String UI_EVENTS_PREFIX = WebAppNode.INSTANCE.getId() + ".ui.";

	static boolean useApplicationCache;
	static boolean useJSBuilder;
	static boolean useJSMin;
	static int idleTimeout;

	@Override
	public void onEnable(Configuration config) {
		useApplicationCache = config.get("application_cache", true);
		useJSBuilder = config.get("js_builder", false);
		useJSMin = config.get("js_use_min", true);
		idleTimeout = config.get("idle_timeout", 600);
		boolean manualRebuild = config.get("manual_rebuild", false);
		try {
			Cache.init(manualRebuild);
		} catch (Exception e) {
			log.error("Error creating cache", e);
		}
	}

	@Override
	public void onDisable() {
		try {
			WebServer.removeServlet(AuthInterfaceCacheServletHolder.INSTANCE);
			WebServer.removeServlet(InterfaceCacheServletHolder.INSTANCE);
			WebServer.removeServlet(WebIdeCacheServletHolder.INSTANCE);
			WebServer.removeServlet(WebIdeLoginCacheServletHolder.INSTANCE);
		} catch (WebServerException e) {
			log.error("Error removing servlet", e);
		}
	}

	@Subscribe
	public void handleHttpEvent(WebApiEvent event) {
		String id = event.getSubId();
		if (id.startsWith(UI_EVENTS_PREFIX)) {
			Bus.post(new WebAppUIEvent(id.substring(UI_EVENTS_PREFIX.length()), event));
		}
	}

}
