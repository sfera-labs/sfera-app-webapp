package cc.sferalabs.sfera.apps.webapp;

import java.io.Closeable;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.DirectoryStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.ProviderNotFoundException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import cc.sferalabs.sfera.core.Plugin;
import cc.sferalabs.sfera.core.Plugins;

public abstract class ResourcesUtil {

	private static final Set<Closeable> OPEN_RESOURCES = new HashSet<Closeable>();

	private static final Comparator<? super Path> PLUGINS_NAME_COMPARATOR = new Comparator<Path>() {

		@Override
		public int compare(Path o1, Path o2) {
			return o1.getFileName().toString().compareTo(o2.getFileName().toString());
		}
	};

	private static final Logger logger = LogManager.getLogger();

	private static Path webAppPluginPath;
	private static Set<Path> pluginsOverwritingWebapp;

	/**
	 * 
	 * @throws IOException
	 */
	public static void lookForPluginsOverwritingWebapp() throws IOException {
		pluginsOverwritingWebapp = new TreeSet<Path>(PLUGINS_NAME_COMPARATOR);
		String webAppPluginId = WebApp.class.getPackage().getName();
		Plugin webAppPlugin = Plugins.get(webAppPluginId);
		if (webAppPlugin != null) {
			webAppPluginPath = webAppPlugin.getPath();
		} else {
			// When developing is OK...
			logger.warn("WebApp plugin not found");
		}
		for (Plugin plugin : Plugins.getAll().values()) {
			if (!plugin.getId().equals(webAppPluginId)) {
				try (FileSystem pluginFs = FileSystems.newFileSystem(plugin.getPath(), null)) {
					Path webappDir = pluginFs.getPath("webapp");
					if (Files.exists(webappDir) && Files.isDirectory(webappDir)) {
						pluginsOverwritingWebapp.add(plugin.getPath());
					}
				} catch (Exception e) {
				}
			}
		}
	}

	/**
	 * 
	 * @param path
	 * @return
	 * @throws NoSuchFileException
	 * @throws IOException
	 */
	public static Path getResource(Path path) throws NoSuchFileException, IOException {
		if (Files.exists(path)) {
			return path;
		}

		for (Path plugin : pluginsOverwritingWebapp) {
			try {
				return getPluginResource(plugin, path);
			} catch (NoSuchFileException nsfe) {
			}
		}

		return getWebAppResource(path);
	}

	/**
	 * 
	 * @param path
	 * @return
	 * @throws NoSuchFileException
	 * @throws IOException
	 */
	private static Path getWebAppResource(Path path) throws NoSuchFileException, IOException {
		if (webAppPluginPath != null) {
			try {
				return getPluginResource(webAppPluginPath, path);
			} catch (NoSuchFileException | ProviderNotFoundException e) {
			}
		}

		try {
			URL url = ResourcesUtil.class.getClassLoader().getResource(path.toString());
			if (url != null) {
				Path resPath = Paths.get(url.toURI());
				if (Files.exists(resPath)) {
					return resPath;
				}
			}
		} catch (URISyntaxException e) {
		}

		throw new NoSuchFileException(path.toString());
	}

	/**
	 * 
	 * @param plugin
	 * @param path
	 * @return
	 * @throws NoSuchFileException
	 * @throws IOException
	 */
	private static Path getPluginResource(Path plugin, Path path)
			throws NoSuchFileException, IOException {
		FileSystem fs = FileSystems.newFileSystem(plugin, null);
		Path pPath = fs.getPath(path.toString());
		if (pPath != null && Files.exists(pPath)) {
			return pPath;
		}
		synchronized (OPEN_RESOURCES) {
			OPEN_RESOURCES.add(fs);
		}

		throw new NoSuchFileException(path.toString());
	}

	/**
	 * 
	 * @param dir
	 * @param includeJarResources
	 * @return
	 * @throws IOException
	 */
	private static List<Path> getResources(Path dir, boolean includeJarResources)
			throws IOException {
		List<Path> paths = new ArrayList<Path>();
		if (Files.exists(dir)) {
			paths.add(dir);
		}
		if (includeJarResources) {
			for (Path plugin : pluginsOverwritingWebapp) {
				try {
					paths.add(getPluginResource(plugin, dir));
				} catch (NoSuchFileException nsfe) {
				}
			}
			try {
				paths.add(getWebAppResource(dir));
			} catch (NoSuchFileException nsfe) {
			}
		}

		return paths;
	}

	/**
	 * 
	 * @param dir
	 * @param includeJarResources
	 * @return
	 * @throws NoSuchFileException
	 * @throws IOException
	 */
	public static Set<String> listDirectoriesNamesIn(Path dir, boolean includeJarResources)
			throws NoSuchFileException, IOException {

		List<Path> paths = getResources(dir, includeJarResources);

		Set<String> list = new HashSet<String>();
		for (Path path : paths) {
			if (Files.isDirectory(path)) {
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
					for (Path file : stream) {
						if (Files.isDirectory(file) && !Files.isHidden(file)) {
							String dirName = file.getFileName().toString();
							if (dirName.endsWith("/")) {
								dirName = dirName.substring(0, dirName.length() - 1);
							}

							list.add(dirName);
						}
					}
				}
			}
		}

		if (list.isEmpty()) {
			throw new NoSuchFileException(dir.toString());
		}

		return list;
	}

	/**
	 * 
	 * @param dir
	 * @param includeJarResources
	 * @return
	 * @throws NoSuchFileException
	 * @throws IOException
	 */
	public static Set<String> listRegularFilesNamesIn(Path dir, boolean includeJarResources)
			throws NoSuchFileException, IOException {

		List<Path> paths = getResources(dir, includeJarResources);

		Set<String> list = new HashSet<String>();
		for (Path path : paths) {
			if (Files.isDirectory(path)) {
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
					for (Path file : stream) {
						if (Files.isRegularFile(file) && !Files.isHidden(file)) {
							list.add(file.getFileName().toString());
						}
					}
				}
			}
		}

		if (list.isEmpty()) {
			throw new NoSuchFileException(dir.toString());
		}

		return list;
	}

	/**
	 * 
	 * @param source
	 * @param target
	 * @param includeResources
	 * @return
	 * @throws IOException
	 */
	public static Set<Path> copyRecursive(Path source, Path target, boolean includeResources)
			throws IOException {
		Set<Path> list = copyRecursive(source, target);

		if (includeResources) {
			for (Path plugin : pluginsOverwritingWebapp) {
				try {
					Path pSource = getPluginResource(plugin, source);
					list.addAll(copyRecursive(pSource, target));
				} catch (NoSuchFileException nsfe) {
				}
			}
			try {
				Path pSource = getWebAppResource(source);
				list.addAll(copyRecursive(pSource, target));
			} catch (NoSuchFileException nsfe) {
			}
		}

		return list;
	}

	/**
	 * 
	 * @param source
	 * @param target
	 * @throws IOException
	 */
	private static Set<Path> copyRecursive(Path source, Path target) throws IOException {
		Set<Path> list = new HashSet<Path>();
		if (Files.exists(source) && !Files.isHidden(source)) {
			try {
				Files.copy(source, target);
				list.add(target);
			} catch (FileAlreadyExistsException e) {
			}
			if (Files.isDirectory(source)) {
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(source)) {
					for (Path file : stream) {
						list.addAll(
								copyRecursive(file, target.resolve(file.getFileName().toString())));
					}
				}
			}
		}

		return list;
	}

	/**
	 * 
	 * @param dir
	 * @throws IOException
	 */
	public static void deleteRecursive(Path dir) throws IOException {
		if (Files.exists(dir)) {
			if (Files.isDirectory(dir)) {
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir)) {
					for (Path file : stream) {
						deleteRecursive(file);
					}
				}
			}
			Files.delete(dir);
		}
	}

	/**
	 * 
	 */
	public static void release() {
		synchronized (OPEN_RESOURCES) {
			for (Iterator<Closeable> it = OPEN_RESOURCES.iterator(); it.hasNext();) {
				try {
					it.next().close();
				} catch (Exception e) {
				}
				it.remove();
			}
		}
	}
}
