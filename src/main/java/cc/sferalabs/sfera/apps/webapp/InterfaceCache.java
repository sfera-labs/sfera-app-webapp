package cc.sferalabs.sfera.apps.webapp;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLEventFactory;
import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLEventWriter;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.Attribute;
import javax.xml.stream.events.StartDocument;
import javax.xml.stream.events.StartElement;
import javax.xml.stream.events.XMLEvent;

import org.apache.http.client.utils.DateUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import cc.sferalabs.sfera.core.services.FilesWatcher;
import cc.sferalabs.sfera.core.services.console.Console;

public class InterfaceCache {

	static final Path CACHE_ROOT = WebApp.ROOT.resolve("cache/");
	static final Path INTERFACES_PATH = WebApp.ROOT.resolve("interfaces/");
	private static final String CACHE_MANIFEST_NAME = "sfera.appcache";

	private static final XMLInputFactory INPUT_FACTORY = XMLInputFactory.newInstance();
	private static final XMLOutputFactory OUTPUT_FACTORY = XMLOutputFactory.newInstance();
	private static final XMLEventFactory EVENT_FACTORY = XMLEventFactory.newInstance();

	private static final XMLEvent NL = EVENT_FACTORY.createDTD("\n");

	private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat(
			DateUtils.PATTERN_RFC1123);

	private static Set<String> interfaces;

	private static boolean useApplicationCache;

	private final static Logger logger = LogManager.getLogger();

	private final String interfaceName;
	private final Path interfaceCacheRoot;
	private final Path interfaceTmpCacheRoot;

	private Set<String> conponents = new HashSet<String>();
	private String skin = null;
	private String language = null;
	private String iconSet = null;

	/**
	 * 
	 * @param interfaceName
	 * @throws IOException
	 */
	private InterfaceCache(String interfaceName) throws IOException {
		this.interfaceName = interfaceName;
		this.interfaceTmpCacheRoot = Files.createTempDirectory(getClass().getName());
		this.interfaceCacheRoot = CACHE_ROOT.resolve(interfaceName + "/");
	}

	/**
	 * 
	 * @param useApplicationCache
	 * @param manualRebuild
	 * @throws Exception
	 */
	public synchronized static void init(boolean useApplicationCache, boolean manualRebuild)
			throws Exception {
		InterfaceCache.useApplicationCache = useApplicationCache;
		ResourcesUtil.lookForPluginsOverwritingWebapp();
		createCache();
		if (manualRebuild) {
			Console.addHandler("webapp", WebAppConsoleCommandHandler.INSTANCE);
		} else {
			try {
				FilesWatcher.register(INTERFACES_PATH, InterfaceCache::createCache, false);
				// For development
				FilesWatcher.register(Paths.get("src/main/resources/webapp/"),
						InterfaceCache::createCache, false);
			} catch (Exception e) {
				logger.error("Error registering WebApp files watcher", e);
			}
		}
	}

	/**
	 * 
	 * @return
	 */
	static Set<String> getInterfaces() {
		return interfaces;
	}

	/**
	 * 
	 */
	static void createCache() {
		interfaces = new HashSet<String>();
		try {
			try {
				for (String interfaceName : ResourcesUtil.listDirectoriesNamesIn(INTERFACES_PATH,
						true)) {
					try {
						createCacheFor(interfaceName);
						interfaces.add(interfaceName);
					} catch (Exception e) {
						logger.error("Error creating cache for interface '" + interfaceName + "'",
								e);
					}
				}

				for (String interfaceName : ResourcesUtil.listDirectoriesNamesIn(CACHE_ROOT,
						false)) {
					if (!interfaces.contains(interfaceName)) {
						ResourcesUtil.deleteRecursive(CACHE_ROOT.resolve(interfaceName + "/"));
					}
				}
			} catch (NoSuchFileException nsfe) {
				ResourcesUtil.deleteRecursive(CACHE_ROOT);
			}
		} catch (IOException e) {
			logger.error("Error creating cache", e);
		}
	}

	/**
	 * 
	 * @param interfaceName
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private synchronized static void createCacheFor(String interfaceName)
			throws IOException, XMLStreamException {
		try {
			logger.debug("Creating cache for interface '{}'...", interfaceName);
			InterfaceCache icc = new InterfaceCache(interfaceName);
			icc.create();
			logger.info("Created cache for interface '{}'", interfaceName);
		} finally {
			ResourcesUtil.release();
		}
	}

	/**
	 * 
	 * @throws XMLStreamException
	 * @throws IOException
	 */
	private void create() throws XMLStreamException, IOException {
		try {
			createIntefaceCache();
			createLoginCache();
			ResourcesUtil.deleteRecursive(interfaceCacheRoot);
			Files.createDirectories(CACHE_ROOT);
			Files.move(interfaceTmpCacheRoot, interfaceCacheRoot);
		} finally {
			try {
				ResourcesUtil.deleteRecursive(interfaceTmpCacheRoot);
			} catch (Exception e) {
			}
		}
	}

	/**
	 * 
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void createIntefaceCache() throws IOException, XMLStreamException {
		createInterfaceXmlAndExtractAttributes();
		createDictionaryAndExtractSkinIconSet();
		Set<Path> resources = copyResources();
		createIndex("skins/index.html", "index.html", "/" + CACHE_MANIFEST_NAME, false);
		createInterfaceCode();
		createInterfaceCSS();
		if (useApplicationCache) {
			resources.add(interfaceTmpCacheRoot.resolve("style.css"));
			resources.add(interfaceTmpCacheRoot.resolve("code.js"));
			createManifest(CACHE_MANIFEST_NAME, resources);
		}
	}

	/**
	 * 
	 * @throws IOException
	 */
	private void createLoginCache() throws IOException {
		Files.createDirectories(interfaceTmpCacheRoot.resolve("login"));
		Set<String> imgs = createIndex("skins/login.html", "login/index.html",
				"/login/" + CACHE_MANIFEST_NAME, true);
		Set<Path> loginResources = copyLoginResources(imgs);
		createLoginCode();
		createLoginCSS();
		if (useApplicationCache) {
			loginResources.add(interfaceTmpCacheRoot.resolve("login/style.css"));
			loginResources.add(interfaceTmpCacheRoot.resolve("login/code.js"));
			createManifest("login/" + CACHE_MANIFEST_NAME, loginResources);
		}
	}

	/**
	 * 
	 * @throws IOException
	 */
	private void createInterfaceCSS() throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("style.css"), StandardCharsets.UTF_8)) {
			writeContentFrom("skins/" + skin + "/" + skin + ".css", writer);

			for (String comp : conponents) {
				try {
					writeContentFrom("components/" + comp + "/" + comp + ".css", writer);
				} catch (NoSuchFileException e) {
				}
			}

			try {
				writeContentFrom("interfaces/" + interfaceName + "/style.css", writer);
			} catch (NoSuchFileException e) {
			}
		}
	}

	/**
	 * 
	 * @throws IOException
	 */
	private void createLoginCSS() throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("login/style.css"), StandardCharsets.UTF_8)) {
			writeContentFrom("skins/" + skin + "/login/style.css", writer);
		}
	}

	/**
	 * 
	 * @throws IOException
	 */
	private void createInterfaceCode() throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("code.js"), StandardCharsets.UTF_8)) {
			try {
				writeContentFrom("code/client.min.js", writer);
			} catch (NoSuchFileException e) {
				writeContentFrom("code/client.js", writer);
			}

			try {
				writeContentFrom("skins/" + skin + "/" + skin + ".min.js", writer);
			} catch (NoSuchFileException e) {
				writeContentFrom("skins/" + skin + "/" + skin + ".js", writer);
			}

			for (String comp : conponents) {
				try {
					writeContentFrom("components/" + comp + "/" + comp + ".min.js", writer);
				} catch (NoSuchFileException e) {
					writeContentFrom("components/" + comp + "/" + comp + ".js", writer);
				}
			}

			String interfacePath = "interfaces/" + interfaceName + "/";
			try {
				Set<String> files = ResourcesUtil
						.listRegularFilesNamesIn(WebApp.ROOT.resolve(interfacePath), true);
				for (String file : files) {
					if (file.toLowerCase().endsWith(".js")) {
						writeContentFrom(interfacePath + file, writer);
					}
				}
			} catch (NoSuchFileException e) {
			}
		}
	}

	/**
	 * 
	 * @throws IOException
	 */
	private void createLoginCode() throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("login/code.js"), StandardCharsets.UTF_8)) {
			try {
				writeContentFrom("code/login.min.js", writer);
			} catch (NoSuchFileException e) {
				writeContentFrom("code/login.js", writer);
			}
		}
	}

	/**
	 * 
	 * @param file
	 * @param writer
	 * @throws IOException
	 * @throws NoSuchFileException
	 */
	private void writeContentFrom(String file, BufferedWriter writer)
			throws IOException, NoSuchFileException {
		Path filePath = ResourcesUtil.getResource(WebApp.ROOT.resolve(file));
		try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
			String line = null;
			while ((line = reader.readLine()) != null) {
				writer.write(line);
				writer.write("\n");
			}
		}
	}

	/**
	 * 
	 * @param source
	 * @param target
	 * @param manifestPath
	 * @param extractImages
	 * @return
	 * @throws IOException
	 */
	private Set<String> createIndex(String source, String target, String manifestPath,
			boolean extractImages) throws IOException {
		Path indexPath = ResourcesUtil.getResource(WebApp.ROOT.resolve(source));
		Set<String> imgs = new HashSet<String>();
		List<String> lines = new ArrayList<String>();
		try (BufferedReader reader = Files.newBufferedReader(indexPath, StandardCharsets.UTF_8)) {
			boolean manifestReplaced = false;
			String line = null;
			while ((line = reader.readLine()) != null) {
				if (!manifestReplaced && line.contains("$manifest;")) {
					String replacement;
					if (useApplicationCache) {
						replacement = "manifest=\"/" + interfaceName + manifestPath + "\"";
					} else {
						replacement = "";
					}
					line = line.replace("$manifest;", replacement);
					manifestReplaced = true;
				}
				if (line.contains("$interface;")) {
					if (extractImages) {
						String img = extractImage(line);
						if (img != null) {
							imgs.add(img);
						}
					}
					line = line.replace("$interface;", interfaceName);
				}
				lines.add(line);
			}
		}

		Files.write(interfaceTmpCacheRoot.resolve(target), lines, StandardCharsets.UTF_8);

		return imgs;
	}

	/**
	 * 
	 * @param line
	 * @return
	 */
	private String extractImage(String line) {
		String imgPrefix = "/$interface;/login/icons/";
		int imgIdx = line.indexOf(imgPrefix);
		if (imgIdx >= 0) {
			int begin = imgIdx + imgPrefix.length();
			char[] terminators = { ')', ',', '"' };
			int end = line.length();
			for (char t : terminators) {
				int tIdx = line.indexOf(t, begin);
				if (tIdx > 0 && tIdx < end) {
					end = tIdx;
				}
			}

			return line.substring(begin, end);
		}

		return null;
	}

	/**
	 * 
	 * @throws IOException
	 */
	private Set<Path> copyResources() throws IOException {
		Set<Path> resources = new HashSet<Path>();
		resources.addAll(ResourcesUtil.copyRecursive(
				WebApp.ROOT.resolve("interfaces/" + interfaceName + "/assets/"),
				interfaceTmpCacheRoot.resolve("assets/"), true));

		Files.createDirectories(interfaceTmpCacheRoot.resolve("images/components/"));

		resources.addAll(
				ResourcesUtil.copyRecursive(WebApp.ROOT.resolve("skins/" + skin + "/images/"),
						interfaceTmpCacheRoot.resolve("images/skin/"), true));

		for (String o : conponents) {
			resources.addAll(ResourcesUtil.copyRecursive(
					WebApp.ROOT.resolve("components/" + o + "/images/" + iconSet + "/"),
					interfaceTmpCacheRoot.resolve("images/components/" + o + "/"), true));
		}

		resources.addAll(ResourcesUtil.copyRecursive(WebApp.ROOT.resolve("icons/" + iconSet + "/"),
				interfaceTmpCacheRoot.resolve("icons/"), true));

		return resources;
	}

	/**
	 * 
	 * @param images
	 * @return
	 * @throws IOException
	 */
	private Set<Path> copyLoginResources(Set<String> images) throws IOException {
		Set<Path> loginResources = new HashSet<Path>();

		Files.createDirectories(interfaceTmpCacheRoot.resolve("login/images/"));

		loginResources.addAll(
				ResourcesUtil.copyRecursive(WebApp.ROOT.resolve("skins/" + skin + "/login/images/"),
						interfaceTmpCacheRoot.resolve("login/images/skin/"), true));

		Files.createDirectories(interfaceTmpCacheRoot.resolve("login/icons/"));

		for (String img : images) {
			Files.copy(
					ResourcesUtil.getResource(WebApp.ROOT.resolve("icons/" + iconSet + "/" + img)),
					interfaceTmpCacheRoot.resolve("login/icons/" + img));
		}

		return loginResources;
	}

	/**
	 * 
	 * @param resources
	 * @throws IOException
	 */
	private void createManifest(String path, Set<Path> resources) throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(interfaceTmpCacheRoot.resolve(path),
				StandardCharsets.UTF_8)) {
			writer.write("CACHE MANIFEST\r\n\r\n# ");
			writer.write(DATE_FORMAT.format(new Date()));
			writer.write("\r\n\r\nCACHE:\r\n");

			for (Path r : resources) {
				if (Files.isRegularFile(r)) {
					if (!r.startsWith(interfaceTmpCacheRoot.resolve("assets/no-cache/"))) {
						writer.write("/" + interfaceName + "/"
								+ interfaceTmpCacheRoot.relativize(r).toString());
						writer.write("\r\n");
					}
				}
			}

			writer.write("\r\nNETWORK:\r\n*");
			writer.flush();
		}
	}

	/**
	 * 
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void createDictionaryAndExtractSkinIconSet() throws IOException, XMLStreamException {
		XMLEventWriter eventWriter = null;
		try (BufferedWriter out = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("dictionary.xml"), StandardCharsets.UTF_8)) {
			eventWriter = OUTPUT_FACTORY.createXMLEventWriter(out);

			StartDocument startDocument = EVENT_FACTORY.createStartDocument();
			eventWriter.add(startDocument);
			eventWriter.add(NL);

			StartElement dictionaryStartElement = EVENT_FACTORY.createStartElement("", "",
					"dictionary");
			eventWriter.add(dictionaryStartElement);
			eventWriter.add(NL);

			addSkinDefinitionAndExtractIconSet(eventWriter);
			addComponents(eventWriter);

			eventWriter.add(EVENT_FACTORY.createEndElement("", "", "dictionary"));
			eventWriter.add(NL);

			eventWriter.add(EVENT_FACTORY.createEndDocument());

		} finally {
			try {
				eventWriter.close();
			} catch (Exception e) {
			}
		}
	}

	/**
	 * 
	 * @param eventWriter
	 * @throws XMLStreamException
	 * @throws IOException
	 */
	private void addComponents(XMLEventWriter eventWriter) throws XMLStreamException, IOException {
		eventWriter.add(EVENT_FACTORY.createStartElement("", "", "components"));
		eventWriter.add(NL);

		for (String comp : conponents) {
			eventWriter.add(EVENT_FACTORY.createStartElement("", "", comp));
			addElementWithCDataContentFromFile(
					WebApp.ROOT.resolve("components/" + comp + "/" + comp + ".html"), "src",
					eventWriter, EVENT_FACTORY);
			try {
				addElementWithCDataContentFromFile(
						WebApp.ROOT
								.resolve("components/" + comp + "/languages/" + language + ".ini"),
						"language", eventWriter, EVENT_FACTORY);
			} catch (NoSuchFileException e) {
				// this component has no languages, and that's fine
			}
			eventWriter.add(EVENT_FACTORY.createEndElement("", "", comp));
			eventWriter.add(NL);
		}

		eventWriter.add(EVENT_FACTORY.createEndElement("", "", "components"));
		eventWriter.add(NL);
	}

	/**
	 * 
	 * @param eventWriter
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void addSkinDefinitionAndExtractIconSet(XMLEventWriter eventWriter)
			throws IOException, XMLStreamException {
		Path skinDefXmlPath = ResourcesUtil
				.getResource(WebApp.ROOT.resolve("skins/" + skin + "/" + "definition.xml"));

		XMLEventReader eventReader = null;
		try (BufferedReader in = Files.newBufferedReader(skinDefXmlPath, StandardCharsets.UTF_8)) {
			eventReader = INPUT_FACTORY.createXMLEventReader(in);
			boolean nextIsIconSet = false;
			while (eventReader.hasNext()) {
				XMLEvent event = eventReader.nextEvent();
				if (!event.isStartDocument() && !event.isEndDocument()) {
					eventWriter.add(event);
					if (iconSet == null) {
						if (!nextIsIconSet && event.isStartElement()) {
							if (event.asStartElement().getName().getLocalPart().equals("iconset")) {
								nextIsIconSet = true;
							}
						} else if (nextIsIconSet) {
							iconSet = event.asCharacters().getData();
						}
					}
				}
			}
			eventWriter.add(NL);

		} finally {
			try {
				eventReader.close();
			} catch (Exception e) {
			}
		}
	}

	/**
	 * Extracts skin, language and components used in the interface
	 * 
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void createInterfaceXmlAndExtractAttributes() throws IOException, XMLStreamException {
		Path indexXml = ResourcesUtil
				.getResource(WebApp.ROOT.resolve("interfaces/" + interfaceName + "/index.xml"));
		Path cacheXml = interfaceTmpCacheRoot.resolve("index.xml");
		Files.copy(indexXml, cacheXml);

		XMLEventReader eventReader = null;
		try (BufferedReader in = Files.newBufferedReader(cacheXml, StandardCharsets.UTF_8)) {
			eventReader = INPUT_FACTORY.createXMLEventReader(in);

			while (eventReader.hasNext()) {
				XMLEvent event = eventReader.nextEvent();
				if (event.isStartElement()) {
					StartElement startElement = event.asStartElement();
					String comp = startElement.getName().getLocalPart();
					conponents.add(comp);

					if (comp.equals("interface")) {
						Iterator<?> attributes = startElement.getAttributes();
						while (attributes.hasNext()) {
							Attribute attribute = (Attribute) attributes.next();
							String attributeName = attribute.getName().getLocalPart();
							if (attributeName.equals("language")) {
								language = attribute.getValue();
							} else if (attributeName.equals("skin")) {
								skin = attribute.getValue();
							}
						}
					}
				}
			}

		} finally {
			try {
				eventReader.close();
			} catch (Exception e) {
			}
		}
	}

	/**
	 * 
	 * @param file
	 * @param elementLocalName
	 * @param eventWriter
	 * @param eventFactory
	 * @throws XMLStreamException
	 * @throws IOException
	 */
	private void addElementWithCDataContentFromFile(Path file, String elementLocalName,
			XMLEventWriter eventWriter, XMLEventFactory eventFactory)
					throws XMLStreamException, IOException {
		Path filePath = ResourcesUtil.getResource(file);

		try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
			eventWriter.add(eventFactory.createStartElement("", "", elementLocalName));

			StringBuilder content = new StringBuilder();
			String line = null;
			while ((line = reader.readLine()) != null) {
				content.append(line).append('\n');
			}

			eventWriter.add(eventFactory.createCData(content.substring(0, content.length() - 1)));

			eventWriter.add(eventFactory.createEndElement("", "", elementLocalName));
			eventWriter.add(NL);
		}
	}

}
