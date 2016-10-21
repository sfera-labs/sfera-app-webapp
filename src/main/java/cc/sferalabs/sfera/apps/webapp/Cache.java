/*-
 * +======================================================================+
 * Sfera Web App
 * ---
 * Copyright (C) 2015 - 2016 Sfera Labs S.r.l.
 * ---
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * -======================================================================-
 */

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
		Files.createDirectories(INTERFACES_PATH);
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
			WebServer.addServlet(WebIdeLoginCacheServletHolder.INSTANCE,
					"/" + WEB_IDE_URL_NAME + "/login/*");
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

			try {
				interfaces = ResourcesUtil.listDirectoriesNamesIn(INTERFACES_PATH, true);
			} catch (NoSuchFileException nsfe) {
				// No interface found
				interfaces = new HashSet<String>();
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
				}
			}

			Path tmpCache = FilesUtil.getTempDirectory().resolve(Cache.class.getName());
			try {
				FilesUtil.delete(tmpCache);
			} catch (Exception e) {
			}
			long timestamp = System.currentTimeMillis();
			for (String interfaceName : interfaces) {
				try {
					logger.debug("Building cache for interface '{}'...", interfaceName);
					InterfaceCacheBuilder icb = new InterfaceCacheBuilder(interfaceName, timestamp,
							tmpCache);
					icb.build();
					logger.info("Interface '{}' built", interfaceName);
				} catch (Exception e) {
					logger.error("Error building cache for interface '" + interfaceName + "'", e);
				}
			}

			try {
				FilesUtil.delete(INTERFACES_CACHE_ROOT);
			} catch (NoSuchFileException e) {
			}
			Files.createDirectories(CACHE_ROOT);
			FilesUtil.move(tmpCache, INTERFACES_CACHE_ROOT);
			try {
				FilesUtil.delete(tmpCache);
			} catch (Exception e) {
			}

			for (String interfaceName : interfaces) {
				Bus.post(new InterfaceUpdateEvent(interfaceName, timestamp));
			}

		} catch (IOException e) {
			logger.error("Error creating interfaces cache", e);
		}
	}

}
