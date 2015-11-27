package cc.sferalabs.sfera.apps.webapp;

import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.common.eventbus.Subscribe;

import cc.sferalabs.sfera.apps.Application;
import cc.sferalabs.sfera.apps.webapp.events.WebUIEvent;
import cc.sferalabs.sfera.apps.webapp.servlets.AuthInterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.InterfaceCacheServletHolder;
import cc.sferalabs.sfera.core.Configuration;
import cc.sferalabs.sfera.events.Bus;
import cc.sferalabs.sfera.http.HttpServer;
import cc.sferalabs.sfera.http.HttpServerException;
import cc.sferalabs.sfera.http.api.HttpApiEvent;

public class WebApp extends Application {

	static final Path ROOT = Paths.get("webapp/");
	private static final String EVENTS_PREFIX = "webapp.ui.";

	@Override
	public void onEnable(Configuration config) {
		boolean useApplicationCache = config.get("application_cache", true);
		boolean manualRebuild = config.get("manual_rebuild", false);
		boolean useJSBuilder = config.get("js_builder", false);
		try {
			Cache.init(useApplicationCache, manualRebuild, useJSBuilder);
		} catch (Exception e) {
			log.error("Error creating cache", e);
		}
	}

	@Override
	public void onDisable() {
		try {
			HttpServer.removeServlet(AuthInterfaceCacheServletHolder.INSTANCE);
			HttpServer.removeServlet(InterfaceCacheServletHolder.INSTANCE);
		} catch (HttpServerException e) {
			log.error("Error removing servlet", e);
		}
	}

	@Subscribe
	public void handleHttpEvent(HttpApiEvent event) {
		String id = event.getSubId();
		if (id.startsWith(EVENTS_PREFIX)) {
			Bus.post(new WebUIEvent(id.substring(EVENTS_PREFIX.length()), event));
		}
	}

}
