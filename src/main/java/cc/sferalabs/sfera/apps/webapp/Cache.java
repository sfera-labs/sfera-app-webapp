package cc.sferalabs.sfera.apps.webapp;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.EventListener;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.eventbus.Subscribe;

import cc.sferalabs.sfera.apps.webapp.events.InterfaceUpdateEvent;
import cc.sferalabs.sfera.apps.webapp.servlets.AuthInterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.InterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.WebIdeCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.WebIdeLoginCacheServletHolder;
import cc.sferalabs.sfera.console.Console;
import cc.sferalabs.sfera.core.events.PluginsEvent;
import cc.sferalabs.sfera.events.Bus;
import cc.sferalabs.sfera.util.files.FilesUtil;
import cc.sferalabs.sfera.util.files.FilesWatcher;
import cc.sferalabs.sfera.web.WebServer;
import cc.sferalabs.sfera.web.WebServerException;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public abstract class Cache {

	private static final Logger logger = LoggerFactory.getLogger(Cache.class);
	
	private final static String WEB_IDE_URL_NAME = "wide";

	static final Path INTERFACES_PATH = WebApp.ROOT.resolve("interfaces/");
	static final Path WEB_IDE_PATH = WebApp.ROOT.resolve(WEB_IDE_URL_NAME + "/");

	public static final Path CACHE_ROOT = WebApp.ROOT.resolve("cache/");
	public static final Path INTERFACES_CACHE_ROOT = CACHE_ROOT.resolve("interfaces/");
	public static final Path WEB_IDE_CACHE_ROOT = CACHE_ROOT.resolve(WEB_IDE_URL_NAME + "/");

	private static Set<String> interfaces;

	/**
	 * 
	 * @param manualRebuild
	 * @throws Exception
	 */
	synchronized static void init(boolean manualRebuild) throws Exception {
		ResourcesUtil.lookForPluginsOverwritingWebapp();
		interfaces = new HashSet<String>();
		buildCache();
		if (manualRebuild) {
			Console.addHandler(WebAppConsoleCommandHandler.INSTANCE);
		} else {
			try {
				FilesWatcher.register(INTERFACES_PATH, "WebApp cache builder",
						Cache::buildInterfacesCache, false, true);
			} catch (Exception e) {
				logger.error("Error registering WebApp files watcher", e);
			}
		}

		Bus.register(new EventListener() {

			@Subscribe
			public void buildCache(PluginsEvent event) {
				if (event == PluginsEvent.RELOAD) {
					ResourcesUtil.lookForPluginsOverwritingWebapp();
					Cache.buildCache();
				}
			}
		});

		try {
			WebServer.addServlet(WebIdeCacheServletHolder.INSTANCE, "/" + WEB_IDE_URL_NAME + "/*");
			WebServer.addServlet(WebIdeLoginCacheServletHolder.INSTANCE, "/" + WEB_IDE_URL_NAME + "/login/*");
		} catch (WebServerException e) {
			logger.error("Error registering servlet for Web IDE", e);
		}
	}

	/**
	 * 
	 */
	static void buildCache() {
		buildWebIdeCache();
		buildInterfacesCache();
	}

	/**
	 * 
	 */
	private synchronized static void buildWebIdeCache() {
		try {
			try {
				FilesUtil.delete(WEB_IDE_CACHE_ROOT);
			} catch (NoSuchFileException e) {
			}
			logger.debug("Building cache for Web IDE...");
			Files.createDirectories(WEB_IDE_CACHE_ROOT);
			ResourcesUtil.copyRecursive(WEB_IDE_PATH, WEB_IDE_CACHE_ROOT, true);
			logger.info("Web IDE cache built");
		} catch (IOException e) {
			logger.error("Error building Web IDE cache", e);
		}
	}

	/**
	 * 
	 */
	private synchronized static void buildInterfacesCache() {
		try {
			Set<String> oldInterfaces = interfaces;
			interfaces = new HashSet<String>();

			try {
				FilesUtil.delete(INTERFACES_CACHE_ROOT);
			} catch (NoSuchFileException e) {
			}
			Files.createDirectories(INTERFACES_CACHE_ROOT);
			long timestamp = System.currentTimeMillis();
			try {
				for (String interfaceName : ResourcesUtil.listDirectoriesNamesIn(INTERFACES_PATH,
						true)) {
					try {
						logger.debug("Building cache for interface '{}'...", interfaceName);
						InterfaceCacheBuilder icb = new InterfaceCacheBuilder(interfaceName,
								timestamp);
						icb.build();
						interfaces.add(interfaceName);
						logger.info("Interface '{}' built", interfaceName);
					} catch (Exception e) {
						logger.error("Error building cache for interface '" + interfaceName + "'",
								e);
					}
				}
			} catch (NoSuchFileException nsfe) {
				// No interface found
			}

			for (String interfaceName : oldInterfaces) {
				if (!interfaces.contains(interfaceName)) {
					try {
						WebServer.removeServlet("/" + interfaceName + "/*");
						WebServer.removeServlet("/" + interfaceName + "/login/*");
					} catch (Exception e) {
						logger.error(
								"Error removing servlet for old interface '" + interfaceName + "'",
								e);
					}
					Bus.post(new InterfaceUpdateEvent(interfaceName, timestamp));
				}
			}

			for (String interfaceName : interfaces) {
				if (!oldInterfaces.contains(interfaceName)) {
					try {
						WebServer.addServlet(AuthInterfaceCacheServletHolder.INSTANCE,
								"/" + interfaceName + "/*");
						WebServer.addServlet(InterfaceCacheServletHolder.INSTANCE,
								"/" + interfaceName + "/login/*");
					} catch (Exception e) {
						logger.error("Error adding servlet for interface '" + interfaceName + "'",
								e);
					}
				}
				Bus.post(new InterfaceUpdateEvent(interfaceName, timestamp));
			}
		} catch (IOException e) {
			logger.error("Error creating interfaces cache", e);
		}
	}

}
