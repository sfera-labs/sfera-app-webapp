package cc.sferalabs.sfera.apps.webapp;

import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.common.eventbus.Subscribe;

import cc.sferalabs.sfera.apps.Application;
import cc.sferalabs.sfera.apps.webapp.events.WebUIEvent;
import cc.sferalabs.sfera.core.Configuration;
import cc.sferalabs.sfera.events.Bus;
import cc.sferalabs.sfera.http.HttpServer;
import cc.sferalabs.sfera.http.HttpServerException;
import cc.sferalabs.sfera.http.api.HttpApiEvent;

public class WebApp extends Application {

	static final Path ROOT = Paths.get("webapp/");
	private static final String UI_EVENTS_PREFIX = "webapp.ui.";

	@Override
	public void onEnable(Configuration config) {
		boolean useApplicationCache = config.get("application_cache", true);
		try {
			InterfaceCache.init(useApplicationCache);
		} catch (Exception e) {
			log.error("Error creating cache", e);
		}

		for (String interfaceName : InterfaceCache.getInterfaces()) {
			try {
				HttpServer.addServlet(InterfaceServletHolder.INSTANCE, "/" + interfaceName + "/*");
				HttpServer.addServlet(WebappServletHolder.INSTANCE,
						"/" + interfaceName + "/login/*");
			} catch (Exception e) {
				log.error("Error registering servlet for interface " + interfaceName, e);
			}
		}
	}

	@Override
	public void onDisable() {
		try {
			HttpServer.removeServlet(InterfaceServletHolder.INSTANCE);
			HttpServer.removeServlet(WebappServletHolder.INSTANCE);
		} catch (HttpServerException e) {
			log.error("Error removing servlet", e);
		}
	}

	@Subscribe
	public void handleHttpEvent(HttpApiEvent event) {
		String id = event.getSubId();
		if (id.startsWith(UI_EVENTS_PREFIX)) {
			Bus.post(new WebUIEvent(id.substring(UI_EVENTS_PREFIX.length()), event));
		}
	}

}
