package cc.sferalabs.sfera.apps.webapp;

import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.common.eventbus.Subscribe;

import cc.sferalabs.sfera.apps.Application;
import cc.sferalabs.sfera.core.Configuration;
import cc.sferalabs.sfera.http.HttpServer;
import cc.sferalabs.sfera.http.HttpServerException;
import cc.sferalabs.sfera.http.api.RemoteEvent;

public class WebApp extends Application {

	static final Path ROOT = Paths.get("webapp/");

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
	public void handleHttpEvent(RemoteEvent e) {
		// TODO handle user events here
		try {
			e.reply("ciao " + e.getUser().getUsername() + " - " + e.getValue());
		} catch (Exception e1) {
			e1.printStackTrace();
		}
	}

}
