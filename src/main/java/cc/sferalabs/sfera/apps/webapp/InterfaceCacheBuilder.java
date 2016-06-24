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

/**
 *
 */
package cc.sferalabs.sfera.apps.webapp;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cc.sferalabs.sfera.util.files.FilesUtil;

/**
 *
 * @author Giampiero Baggiani
 *
 * @version 1.0.0
 *
 */
public class InterfaceCacheBuilder {

	private static final Logger logger = LoggerFactory.getLogger(InterfaceCacheBuilder.class);

	private static final String CACHE_MANIFEST_NAME = "sfera.appcache";

	private static final XMLInputFactory INPUT_FACTORY = XMLInputFactory.newInstance();
	private static final XMLOutputFactory OUTPUT_FACTORY = XMLOutputFactory.newInstance();
	private static final XMLEventFactory EVENT_FACTORY = XMLEventFactory.newInstance();

	private static final XMLEvent NL = EVENT_FACTORY.createDTD("\n");

	private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat(
			DateUtils.PATTERN_RFC1123);

	private final String interfaceName;
	private final long timestamp;
	private final Path interfaceCacheRoot;
	private final Path interfaceTmpCacheRoot;

	/**
	 *
	 * @param interfaceName
	 * @param timestamp
	 * @throws IOException
	 */
	InterfaceCacheBuilder(String interfaceName, long timestamp) throws IOException {
		this.interfaceName = interfaceName;
		this.timestamp = timestamp;
		this.interfaceTmpCacheRoot = Files.createTempDirectory(getClass().getName());
		this.interfaceCacheRoot = Cache.INTERFACES_CACHE_ROOT.resolve(interfaceName + "/");
	}

	/**
	 *
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	void build() throws IOException, XMLStreamException {
		try {
			Files.createDirectories(interfaceTmpCacheRoot.resolve("login"));
			Map<String, String> attributes = new HashMap<>();
			attributes.put("language", null);
			attributes.put("skin", null);
			createCache("/", attributes);
			createCache("/login/", attributes);
			try {
				FilesUtil.delete(interfaceCacheRoot);
			} catch (NoSuchFileException e) {
			}
			FilesUtil.move(interfaceTmpCacheRoot, interfaceCacheRoot);
		} finally {
			try {
				FilesUtil.delete(interfaceTmpCacheRoot);
			} catch (Exception e) {
			}
			ResourcesUtil.release();
		}
	}

	/**
	 *
	 * @param sub
	 * @param attributes
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void createCache(String sub, Map<String, String> attributes)
			throws IOException, XMLStreamException {
		Path indexXml;
		try {
			indexXml = copyToCache("interfaces/" + interfaceName + sub + "index.xml",
					sub + "index.xml");
		} catch (NoSuchFileException nsfe) {
			String skin = attributes.get("skin");
			if (skin == null) {
				throw nsfe;
			}
			indexXml = copyToCache("skins/" + skin + sub + "index.xml", sub + "index.xml");
		}
		Set<String> components = new HashSet<>();
		extractComponentsAndInterfaceAttributes(indexXml, components, attributes);
		addSubComponents(components);
		createDictionaryAndExtractSkinIconSet(sub, components, attributes);
		Set<Path> resources = copyResources(sub, components, attributes);
		createHTML(sub + "index.html", sub + CACHE_MANIFEST_NAME);
		createCode(sub, components, attributes);
		createCSS(sub, components, attributes);
		if (WebApp.useApplicationCache) {
			resources.add(interfaceTmpCacheRoot.resolve("." + sub + "style.css"));
			resources.add(interfaceTmpCacheRoot.resolve("." + sub + "code.js"));
			createManifest(sub + CACHE_MANIFEST_NAME, resources);
		}
	}

	/**
	 * @param components
	 * @throws IOException
	 * @throws NoSuchFileException
	 * @throws XMLStreamException
	 */
	private static void addSubComponents(Set<String> components)
			throws NoSuchFileException, IOException, XMLStreamException {
		HashSet<String> original = new HashSet<>(components);
		for (String comp : original) {
			addSubComponents(comp, components);
		}
	}

	/**
	 * @param component
	 * @param components
	 * @throws IOException
	 * @throws NoSuchFileException
	 * @throws XMLStreamException
	 */
	private static void addSubComponents(String component, Set<String> components)
			throws NoSuchFileException, IOException, XMLStreamException {
		for (String sub : getDirectSubComponents(component)) {
			if (components.add(sub)) {
				addSubComponents(sub, components);
			}
		}
	}

	/**
	 * @param component
	 * @return
	 * @throws IOException
	 * @throws NoSuchFileException
	 * @throws XMLStreamException
	 */
	private static Set<String> getDirectSubComponents(String component)
			throws IOException, XMLStreamException {
		Set<String> sub = new HashSet<>();
		Path path;
		try {
			path = ResourcesUtil.getResource(
					WebApp.ROOT.resolve("components/" + component + "/" + component + ".html"));
		} catch (NoSuchFileException nsfe) {
			return sub;
		}
		String content = new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
		String[] smls = content.split("<!--sml|-->");
		for (int i = 1; i < smls.length; i += 2) {
			String sml = smls[i];
			XMLEventReader eventReader = null;
			try {
				eventReader = INPUT_FACTORY.createXMLEventReader(new StringReader(sml));
				while (eventReader.hasNext()) {
					XMLEvent event = eventReader.nextEvent();
					if (event.isStartElement()) {
						StartElement startElement = event.asStartElement();
						String comp = startElement.getName().getLocalPart();
						sub.add(comp);
					}
				}
			} finally {
				try {
					eventReader.close();
				} catch (Exception e) {
				}
			}
		}
		return sub;
	}

	/**
	 *
	 * @param source
	 * @param target
	 * @return
	 * @throws IOException
	 */
	private Path copyToCache(String source, String target) throws IOException {
		Path s = ResourcesUtil.getResource(WebApp.ROOT.resolve(source));
		Path t = interfaceTmpCacheRoot.resolve("." + target);
		return Files.copy(s, t);
	}

	/**
	 *
	 * @param file
	 * @param components
	 * @param attributes
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void extractComponentsAndInterfaceAttributes(Path file, Set<String> components,
			Map<String, String> attributes) throws IOException {
		XMLEventReader eventReader = null;
		try (BufferedReader in = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
			eventReader = INPUT_FACTORY.createXMLEventReader(in);
			while (eventReader.hasNext()) {
				XMLEvent event = eventReader.nextEvent();
				if (event.isStartElement()) {
					StartElement startElement = event.asStartElement();
					String comp = startElement.getName().getLocalPart();
					components.add(comp);
					if (comp.equals("interface")) {
						Iterator<?> attrs = startElement.getAttributes();
						while (attrs.hasNext()) {
							Attribute attribute = (Attribute) attrs.next();
							String attributeName = attribute.getName().getLocalPart();
							if (attributes.containsKey(attributeName)) {
								attributes.put(attributeName, attribute.getValue());
							}
						}
					}
				}
			}
		} catch (XMLStreamException e) {
			logger.error("Error parsing index of interface '" + interfaceName + "'", e);
		} finally {
			try {
				eventReader.close();
			} catch (Exception e) {
			}
		}
	}

	/**
	 *
	 * @param sub
	 * @param components
	 * @param attributes
	 * @throws IOException
	 */
	private void createCSS(String sub, Set<String> components, Map<String, String> attributes)
			throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("." + sub + "style.css"), StandardCharsets.UTF_8)) {
			String skin = attributes.get("skin");
			writeContentFrom("skins/" + skin + "/" + skin + ".css", writer);
			for (String comp : components) {
				try {
					writeContentFrom("components/" + comp + "/" + comp + ".css", writer);
				} catch (NoSuchFileException e) {
				}
			}
			try {
				writeContentFrom("interfaces/" + interfaceName + sub + "style.css", writer);
			} catch (NoSuchFileException e) {
			}
		}
	}

	/**
	 *
	 * @param sub
	 * @param components
	 * @param attributes
	 * @throws IOException
	 */
	private void createCode(String sub, Set<String> components, Map<String, String> attributes)
			throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("." + sub + "sfera-client.js"), StandardCharsets.UTF_8)) {
			writeContentFrom("code/sfera-client.js", writer);
		}

		if (!WebApp.useJSMin) {
			try (BufferedWriter writer = Files.newBufferedWriter(
					interfaceTmpCacheRoot.resolve("." + sub + "sfera-client.js.map"), StandardCharsets.UTF_8)) {
				writeContentFrom("code/sfera-client.js.map", writer);
			}
		}

		String skin = attributes.get("skin");
		List<String> files = new ArrayList<>();
		files.add("skins/" + skin + "/" + skin + ".js");
		for (String comp : components) {
			files.add("components/" + comp + "/" + comp + ".js");
		}
		files.add("code/custom_intro.js");
		String interfacePath = "interfaces/" + interfaceName + sub;
		try {
			Set<String> customJsFiles = ResourcesUtil
					.listRegularFilesNamesIn(WebApp.ROOT.resolve(interfacePath), true);
			for (String file : customJsFiles) {
				if (file.toLowerCase().endsWith(".js")) {
					files.add(interfacePath + file);
				}
			}
		} catch (NoSuchFileException e) {
		}
		files.add("code/custom_outro.js");

		if (WebApp.useJSBuilder) {
			try {
				JavaScriptBuilder.build(files, interfaceTmpCacheRoot.resolve("." + sub));
				return;
			} catch (Exception e) {
				logger.warn("Error building cache for interface '" + interfaceName
						+ "'. Reverting to other method", e);
			}
		}

		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("." + sub + "interface.js"),
				StandardCharsets.UTF_8)) {
			for (String file : files) {
				writeContentFrom(file, writer);
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
	private static void writeContentFrom(String file, BufferedWriter writer)
			throws IOException, NoSuchFileException {
		Path filePath = null;
		if (WebApp.useJSMin) {
			int extSep = file.lastIndexOf('.');
			String minFile = file.substring(0, extSep) + ".min" + file.substring(extSep);
			try {
				filePath = ResourcesUtil.getResource(WebApp.ROOT.resolve(minFile));
			} catch (NoSuchFileException nsfe) {
			}
		}
		if (filePath == null) {
			filePath = ResourcesUtil.getResource(WebApp.ROOT.resolve(file));
		}
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
	 * @param target
	 * @param manifestPath
	 * @return
	 * @throws IOException
	 */
	private Set<String> createHTML(String target, String manifestPath) throws IOException {
		Path indexPath = ResourcesUtil.getResource(WebApp.ROOT.resolve("html/index.html"));
		Set<String> imgs = new HashSet<String>();
		List<String> lines = new ArrayList<String>();
		try (BufferedReader reader = Files.newBufferedReader(indexPath, StandardCharsets.UTF_8)) {
			boolean interfaceReplaced = false;
			boolean manifestReplaced = false;
			boolean tsReplaced = false;
			boolean idleTimeoutReplaced = false;
			boolean appCacheEnabledReplaced = false;
			String manifestReplacement;
			if (WebApp.useApplicationCache) {
				manifestReplacement = "manifest=\"/" + interfaceName + manifestPath + "\"";
			} else {
				manifestReplacement = "";
			}
			String line = null;
			while ((line = reader.readLine()) != null) {
				if (!manifestReplaced && line.contains("$manifest;")) {
					line = line.replace("$manifest;", manifestReplacement);
					manifestReplaced = true;
				}
				if (!appCacheEnabledReplaced && line.contains("$appCacheEnabled;")) {
					line = line.replace("$appCacheEnabled;", "" + WebApp.useApplicationCache);
					appCacheEnabledReplaced = true;
				}
				if (!tsReplaced && line.contains("$timestamp;")) {
					line = line.replace("$timestamp;", "" + timestamp);
					tsReplaced = true;
				}
				if (!idleTimeoutReplaced && line.contains("$idleTimeout;")) {
					line = line.replace("$idleTimeout;", "" + WebApp.idleTimeout);
					idleTimeoutReplaced = true;
				}
				if (!interfaceReplaced && line.contains("$interface;")) {
					line = line.replace("$interface;", interfaceName);
					interfaceReplaced = true;
				}
				lines.add(line);
			}
		}

		Files.write(interfaceTmpCacheRoot.resolve("." + target), lines, StandardCharsets.UTF_8);

		return imgs;
	}

	/**
	 *
	 * @param sub
	 * @param components
	 * @param attributes
	 * @return
	 * @throws IOException
	 */
	private Set<Path> copyResources(String sub, Set<String> components,
			Map<String, String> attributes) throws IOException {
		Set<Path> resources = new HashSet<Path>();
		resources.addAll(ResourcesUtil.copyRecursive(
				WebApp.ROOT.resolve("interfaces/" + interfaceName + sub + "assets/"),
				interfaceTmpCacheRoot.resolve("." + sub + "assets/"), true));

		Files.createDirectories(interfaceTmpCacheRoot.resolve("." + sub + "images/components/"));

		resources.addAll(ResourcesUtil.copyRecursive(
				WebApp.ROOT.resolve("skins/" + attributes.get("skin") + sub + "images/"),
				interfaceTmpCacheRoot.resolve("." + sub + "images/skin/"), true));

		String iconSet = attributes.get("iconSet");
		for (String c : components) {
			resources.addAll(ResourcesUtil.copyRecursive(
					WebApp.ROOT.resolve("components/" + c + "/images/" + iconSet + "/"),
					interfaceTmpCacheRoot.resolve("." + sub + "images/components/" + c + "/"),
					true));
		}

		resources.addAll(ResourcesUtil.copyRecursive(WebApp.ROOT.resolve("icons/" + iconSet + "/"),
				interfaceTmpCacheRoot.resolve("." + sub + "icons/"), true));

		return resources;
	}

	/**
	 *
	 * @param path
	 * @param resources
	 * @throws IOException
	 */
	private void createManifest(String path, Set<Path> resources) throws IOException {
		try (BufferedWriter writer = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("." + path), StandardCharsets.UTF_8)) {
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
	 * @param sub
	 * @param components
	 * @param attributes
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private void createDictionaryAndExtractSkinIconSet(String sub, Set<String> components,
			Map<String, String> attributes) throws IOException, XMLStreamException {
		XMLEventWriter eventWriter = null;
		try (BufferedWriter out = Files.newBufferedWriter(
				interfaceTmpCacheRoot.resolve("." + sub + "dictionary.xml"),
				StandardCharsets.UTF_8)) {
			eventWriter = OUTPUT_FACTORY.createXMLEventWriter(out);

			StartDocument startDocument = EVENT_FACTORY.createStartDocument();
			eventWriter.add(startDocument);
			eventWriter.add(NL);

			StartElement dictionaryStartElement = EVENT_FACTORY.createStartElement("", "",
					"dictionary");
			eventWriter.add(dictionaryStartElement);
			eventWriter.add(NL);

			addSkinDefinitionAndExtractIconSet(eventWriter, attributes);
			addComponents(eventWriter, components, attributes);

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
	 * @param attributes
	 * @throws IOException
	 * @throws XMLStreamException
	 */
	private static void addSkinDefinitionAndExtractIconSet(XMLEventWriter eventWriter,
			Map<String, String> attributes) throws IOException, XMLStreamException {
		Path skinDefXmlPath = ResourcesUtil.getResource(
				WebApp.ROOT.resolve("skins/" + attributes.get("skin") + "/" + "definition.xml"));
		String iconSet = null;
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
							attributes.put("iconSet", iconSet);
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
	 *
	 * @param eventWriter
	 * @param components
	 * @param attributes
	 * @throws XMLStreamException
	 * @throws IOException
	 */
	private static void addComponents(XMLEventWriter eventWriter, Set<String> components,
			Map<String, String> attributes) throws XMLStreamException, IOException {
		eventWriter.add(EVENT_FACTORY.createStartElement("", "", "components"));
		eventWriter.add(NL);

		for (String comp : components) {
			eventWriter.add(EVENT_FACTORY.createStartElement("", "", comp));
			try {
				addElementWithCDataContentFromFile(
						WebApp.ROOT.resolve("components/" + comp + "/" + comp + ".html"), "src",
						eventWriter, EVENT_FACTORY);
			} catch (NoSuchFileException nsfe) {
				// this component has no html, and that's fine
			}
			try {
				addElementWithCDataContentFromFile(
						WebApp.ROOT.resolve("components/" + comp + "/languages/"
								+ attributes.get("language") + ".ini"),
						"language", eventWriter, EVENT_FACTORY);
			} catch (NoSuchFileException nsfe) {
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
	 * @param file
	 * @param elementLocalName
	 * @param eventWriter
	 * @param eventFactory
	 * @throws XMLStreamException
	 * @throws IOException
	 */
	private static void addElementWithCDataContentFromFile(Path file, String elementLocalName,
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
			if (content.length() > 0) {
				eventWriter
						.add(eventFactory.createCData(content.substring(0, content.length() - 1)));
			}
			eventWriter.add(eventFactory.createEndElement("", "", elementLocalName));
			eventWriter.add(NL);
		}
	}

}
