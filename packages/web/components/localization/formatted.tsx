import React, { cloneElement, ReactElement } from "react";
import { useTranslation } from "react-multi-lang";

type Components = { [key: string]: ReactElement };
type Values = { [key: string]: string };
type ComponentFormatted = {
  element: ReactElement;
  startIndex: number;
  length: number;
  key: string;
};
type StringFormatted = {
  string: string;
  startIndex: number;
  length: number;
  key: string;
};

interface FormattedProps {
  translationKey: string;
  components: Components;
  values?: Values;
}

// Return orphan formatted with start index and length (used to build the final component)
const getOrphanFormatted = ({
  key,
  translation,
}: {
  key: string;
  translation: string;
}): null | StringFormatted => {
  const startTag = key;
  const regEx = new RegExp(`${startTag}`);
  let matchTag = translation.match(regEx);
  // Check if component is in translation
  if (matchTag && matchTag.length > 0 && matchTag.index) {
    return {
      key,
      startIndex: matchTag.index,
      length: matchTag[0].length,
      string: "",
    };
  }
  return null;
};

// Return string formatted with start index and length (used to build the final component)
const getStringFormatted = ({
  key,
  translation,
}: {
  key: string;
  translation: string;
}): null | StringFormatted => {
  const startTag = key;
  const endTagReg = key[0] + "/" + key.slice(1); // add "/" for closed tag
  const regEx = new RegExp(`${startTag}.*${endTagReg}`);
  let componentTextTranslatedReg = translation.match(regEx);
  // Check if component is in translation
  if (
    componentTextTranslatedReg &&
    componentTextTranslatedReg.length > 0 &&
    componentTextTranslatedReg.index
  ) {
    // clear translation by removing the first and last tag
    let componentTextTranslated = componentTextTranslatedReg[0].replace(
      startTag,
      ""
    );
    componentTextTranslated = componentTextTranslated.replace(endTagReg, "");
    return {
      key,
      startIndex: componentTextTranslatedReg.index,
      length: componentTextTranslatedReg[0].length,
      string: componentTextTranslated,
    };
  }
  return null;
};

// Return translated component with start index and length (used to build the final component)
const getFormattedComponent = ({
  key,
  translation,
  component,
}: {
  key: string;
  translation: string;
  component: ReactElement;
}): null | ComponentFormatted => {
  let children = null;
  // Is orphan tag without props, e.g. <br/>
  if (key.includes("/")) {
    let orphanFormatted = getOrphanFormatted({ key, translation });
    if (orphanFormatted === null) return null;
    return {
      element: cloneElement(component, {
        ...component.props,
        key,
      }),
      startIndex: orphanFormatted.startIndex,
      length: orphanFormatted.length,
      key,
    };
  }
  // Check if child is a string or a orphan tag (like <a ... />)
  if (
    typeof component.props.children === "string" ||
    component.props.children === undefined
  ) {
    // Get formatted string
    let stringFormatted = getStringFormatted({ key, translation });
    if (stringFormatted === null) return null;
    // create component with formatted child
    return {
      element: cloneElement(component, {
        ...component.props,
        key,
        children: stringFormatted.string,
      }),
      startIndex: stringFormatted.startIndex,
      length: stringFormatted.length,
      key,
    };
  } else {
    // component has several children
    let startIndex = 0;
    let length = 0;
    if (Array.isArray(component.props.children)) {
      children = component.props.children.map(
        (child: ReactElement, index: number) => {
          // if isn't a string, return it
          if (typeof child !== "string") {
            return cloneElement(component, {
              ...component.props,
              key: index,
            });
          }
          let stringFormatted = getStringFormatted({ key, translation });
          if (stringFormatted === null) return null;
          startIndex = stringFormatted.startIndex;
          length = stringFormatted.length;
          return stringFormatted.string;
        }
      );
    } else {
      children = component.props.children;
    }
    //else format it
    return {
      element: cloneElement(component, {
        ...component.props,
        children,
      }),
      startIndex: startIndex,
      length: length,
      key,
    };
  }
};

/**
 *
 * The goal is to simplify the translation and avoid cutting the translation if the translation has several components (like: <br/>, <em></em>, <p></p>,...)
 * Full exemple:
 * We have the following text:
 * "I'm text warning with <em className="font-bold">important</em> text."
 * we need three translations:
 * {
 *  "importantTextStart": "I'm text warning with",
 *  "importantTextMiddle": "important",
 *  "importantTextEnd": "text."
 * }
 * and have this result:
 * <>
 *    {t("importantTextStart")}
 *    <em className="font-bold">{t("importantTextMiddle")}</em>
 *    {("importantTextEnd")}
 * </>
 * To avoid to break the translation in several pieces we can use the Formatted component.
 * We only need one translation:
 * {
 *  "importantText": "I'm text warning with <bold>important</bold> text."
 * }
 * and use Formatted:
 * <Formatted
 *    translationKey="importantText"
 *    components={{"<bold>": <em className="font-bold" />}}
 * />
 * and get the expected result:
 * "I'm text warning with <em className="font-bold">important</em> text."
 *
 * @param translationKey the translation key is used to find de translation in translation file. (ex: "pool.title").
 * @param values the values is used to pass data to the translation. (ex: {poolName: "ATOM / OSMO"}).
 * @param components the components is used replace components in translation (ex: {"<text>": <p>}).
 * @returns an JSX element.
 */
export const Formatted = ({
  translationKey,
  values,
  components,
}: FormattedProps) => {
  const t = useTranslation();
  // get translation with values
  let translation = t(translationKey, values);
  // replace in transaltion the key by component
  let componentsFormatted: ComponentFormatted[] = [];
  Object.keys(components).forEach((key) => {
    let component = components[key];
    let formattedComponent = getFormattedComponent({
      key,
      component,
      translation,
    });

    if (formattedComponent !== null) {
      componentsFormatted.push(formattedComponent);
    }
  });

  if (componentsFormatted && componentsFormatted.length > 0) {
    componentsFormatted.sort((a, b) => a.startIndex - b.startIndex); // sort by index
    let body: Array<ReactElement> = [];
    let currentIndex = 0;
    // replace tags by formatted children
    componentsFormatted.forEach((componentFormatted, index) => {
      body.push(
        <React.Fragment key={index}>
          {translation.slice(currentIndex, componentFormatted.startIndex)}
        </React.Fragment>
      );
      body.push(componentFormatted.element);
      currentIndex = componentFormatted.startIndex + componentFormatted.length;
    });
    // add the end of body
    body.push(
      <React.Fragment key={"endbody"}>
        {translation.slice(currentIndex)}
      </React.Fragment>
    );
    return <>{body}</>;
  }
  return <>{translation}</>;
};
