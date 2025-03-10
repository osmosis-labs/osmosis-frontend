import React, { useEffect, useState } from "react";
import { SvgProps, SvgXml } from "react-native-svg";

interface StyleMap {
  [key: string]: string;
}

// Helper function to parse CSS into a style map
const parseStyleContent = (styleContent: string): StyleMap => {
  const styleMap: StyleMap = {};
  const rules = styleContent.split("}").filter((rule: string) => rule.trim());

  rules.forEach((rule: string) => {
    const [selectorPart, stylesPart] = rule.split("{");
    const selector = selectorPart.trim();
    const styles = stylesPart.trim().replace(/;/g, " ").trim();
    if (selector && styles) {
      styleMap[selector] = styles;
    }
  });

  return styleMap;
};

// Helper function to apply styles to SVG elements
const applyStylesToElements = (
  svgString: string,
  styleMap: StyleMap
): string => {
  Object.entries(styleMap).forEach(([selector, styles]) => {
    const className = selector.replace(".", "");
    const regex = new RegExp(`<(\\w+)[^>]*class="${className}"[^>]*>`, "g");

    svgString = svgString.replace(regex, (match: string) => {
      const styleAttr = `style="${styles}"`;
      if (match.includes('style="')) {
        return match.replace(/style="[^"]*"/, styleAttr);
      } else {
        return match.replace(`class="${className}"`, styleAttr);
      }
    });
  });

  return svgString;
};

export const SvgUri = ({ uri, ...props }: { uri: string } & SvgProps) => {
  const [svgXml, setSvgXml] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessSvg = async () => {
      try {
        // Step 1: Fetch the SVG
        const response = await fetch(uri);
        let svgString = await response.text();

        // Step 2: Extract and parse <style> content
        const styleMatch = svgString.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        if (styleMatch) {
          const styleContent = styleMatch[1];
          const styleMap = parseStyleContent(styleContent);

          // Remove the <style> tag since we'll use inline styles
          svgString = svgString.replace(/<style[^>]*>[\s\S]*?<\/style>/, "");

          // Step 3: Apply styles to elements
          svgString = applyStylesToElements(svgString, styleMap);
        }

        // Step 4: Set the modified SVG for rendering
        setSvgXml(svgString);
      } catch (error) {
        console.error("Error fetching or processing SVG:", error);
      }
    };

    fetchAndProcessSvg();
  }, [uri]);

  return <>{svgXml ? <SvgXml xml={svgXml} {...props} /> : null}</>;
};
