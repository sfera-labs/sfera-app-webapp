package cc.sferalabs.sfera.apps.webapp;

import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.common.eventbus.Subscribe;

import cc.sferalabs.sfera.apps.Application;
import cc.sferalabs.sfera.apps.webapp.events.WebAppNode;
import cc.sferalabs.sfera.apps.webapp.events.WebAppUIEvent;
import cc.sferalabs.sfera.apps.webapp.servlets.AuthInterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.InterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.ManagerCacheServletHolder;
import cc.sferalabs.sfera.core.Configuration;
import cc.sferalabs.sfera.events.Bus;
import cc.sferalabs.sfera.http.HttpServer;
import cc.sferalabs.sfera.http.HttpServerException;
import cc.sferalabs.sfera.http.api.RemoteApiEvent;

public class WebApp extends Application {

	static final Path ROOT = Paths.get("webapp/");
	private static final String UI_EVENTS_PREFIX = WebAppNode.INSTANCE.getId() + ".ui.";

	static boolean useApplicationCache;
	static boolean useJSBuilder;
	static int idleTimeout;

	@Override
	public void onEnable(Configuration config) {
		useApplicationCache = config.get("application_cache", true);
		useJSBuilder = config.get("js_builder", false);
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
			HttpServer.removeServlet(AuthInterfaceCacheServletHolder.INSTANCE);
			HttpServer.removeServlet(InterfaceCacheServletHolder.INSTANCE);
			HttpServer.removeServlet(ManagerCacheServletHolder.INSTANCE);
		} catch (HttpServerException e) {
			log.error("Error removing servlet", e);
		}
	}

	@Subscribe
	public void handleHttpEvent(RemoteApiEvent event) {
		String id = event.getSubId();
		if (id.startsWith(UI_EVENTS_PREFIX)) {
			Bus.post(new WebAppUIEvent(id.substring(UI_EVENTS_PREFIX.length()), event));
		}
	}

}
