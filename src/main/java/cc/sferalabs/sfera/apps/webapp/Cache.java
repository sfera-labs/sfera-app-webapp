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

import cc.sferalabs.sfera.apps.webapp.servlets.AuthInterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.InterfaceCacheServletHolder;
import cc.sferalabs.sfera.apps.webapp.servlets.ManagerCacheServletHolder;
import cc.sferalabs.sfera.core.events.PluginsEvent;
import cc.sferalabs.sfera.core.services.FilesWatcher;
import cc.sferalabs.sfera.core.services.console.Console;
import cc.sferalabs.sfera.events.Bus;
import cc.sferalabs.sfera.http.HttpServer;
import cc.sferalabs.sfera.http.HttpServerException;

public abstract class Cache {

	private static final Logger logger = LoggerFactory.getLogger(Cache.class);

	static final Path INTERFACES_PATH = WebApp.ROOT.resolve("interfaces/");
	static final Path MANAGER_PATH = WebApp.ROOT.resolve("manager/");

	public static final Path CACHE_ROOT = WebApp.ROOT.resolve("cache/");
	public static final Path INTERFACES_CACHE_ROOT = CACHE_ROOT.resolve("interfaces/");
	public static final Path MANAGER_CACHE_ROOT = CACHE_ROOT.resolve("manager/");

	private static Set<String> interfaces;

	static boolean useApplicationCache;
	static boolean useJSBuilder;

	/**
	 * 
	 * @param useApplicationCache
	 * @param manualRebuild
	 * @param useJSBuilder
	 * @throws Exception
	 */
	public synchronized static void init(boolean useApplicationCache, boolean manualRebuild,
			boolean useJSBuilder) throws Exception {
		Cache.useApplicationCache = useApplicationCache;
		Cache.useJSBuilder = useJSBuilder;
		ResourcesUtil.lookForPluginsOverwritingWebapp();
		buildCache();
		if (manualRebuild) {
			Console.setHandler("webapp", WebAppConsoleCommandHandler.INSTANCE);
		} else {
			try {
				FilesWatcher.register(INTERFACES_PATH, Cache::buildInterfacesCache, false);
				FilesWatcher.register(MANAGER_PATH, Cache::buildManagerCache, false);
			} catch (Exception e) {
				logger.error("Error registering WebApp files watcher", e);
			}
		}

		Bus.register(new EventListener() {

			@Subscribe
			public void buildCache(PluginsEvent event) {
				if (event == PluginsEvent.RELOAD) {
					Cache.buildCache();
				}
			}
		});

		try {
			HttpServer.addServlet(ManagerCacheServletHolder.INSTANCE, "/manager/*");
		} catch (HttpServerException e) {
			logger.error("Error registering servlet for manager", e);
		}
	}

	/**
	 * 
	 */
	static void buildCache() {
		buildManagerCache();
		buildInterfacesCache();
	}

	/**
	 * 
	 */
	private synchronized static void buildManagerCache() {
		try {
			ResourcesUtil.deleteRecursive(MANAGER_CACHE_ROOT);
			logger.debug("Building cache for manager...");
			ResourcesUtil.copyRecursive(MANAGER_PATH, MANAGER_CACHE_ROOT, true);
			logger.info("WebApp manager built");
		} catch (IOException e) {
			logger.error("Error building manager cache", e);
		}
	}

	/**
	 * 
	 */
	private synchronized static void buildInterfacesCache() {
		try {
			if (interfaces != null) {
				for (String interfaceName : interfaces) {
					try {
						HttpServer.removeServlet(AuthInterfaceCacheServletHolder.INSTANCE);
						HttpServer.removeServlet(InterfaceCacheServletHolder.INSTANCE);
					} catch (Exception e) {
						logger.error("Error removing old servlet for interface " + interfaceName,
								e);
					}
				}
			}

			interfaces = new HashSet<String>();
			ResourcesUtil.deleteRecursive(INTERFACES_CACHE_ROOT);
			Files.createDirectories(INTERFACES_CACHE_ROOT);
			try {
				for (String interfaceName : ResourcesUtil.listDirectoriesNamesIn(INTERFACES_PATH,
						true)) {
					try {
						logger.debug("Building cache for interface '{}'...", interfaceName);
						InterfaceCacheBuilder icb = new InterfaceCacheBuilder(interfaceName,
								useJSBuilder);
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

			for (String interfaceName : interfaces) {
				try {
					HttpServer.addServlet(AuthInterfaceCacheServletHolder.INSTANCE,
							"/" + interfaceName + "/*");
					HttpServer.addServlet(InterfaceCacheServletHolder.INSTANCE,
							"/" + interfaceName + "/login/*");
				} catch (Exception e) {
					logger.error("Error registering servlet for interface " + interfaceName, e);
				}
			}
		} catch (IOException e) {
			logger.error("Error creating interfaces cache", e);
		}
	}

}
