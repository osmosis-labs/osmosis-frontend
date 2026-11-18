import {
  ComponentPropsWithoutRef,
  ComponentType,
  ElementType,
  FunctionComponent,
} from "react";
import ReactMarkdown, { ExtraProps } from "react-markdown";

interface MarkdownProps {
  children?: string;
}

type NormalMarkdownComponent<TagName extends ElementType> = ComponentType<
  ComponentPropsWithoutRef<TagName> & ExtraProps
>;

const MarkdownLink: NormalMarkdownComponent<"a"> = ({ node, ...props }) => {
  return <a {...props} className="text-white-high"></a>;
};

const MarkdownParagraph: NormalMarkdownComponent<"p"> = ({
  node,
  ...props
}) => {
  return (
    <p {...props} className="text-body1 font-body1 text-osmoverse-300"></p>
  );
};

export const Markdown: FunctionComponent<MarkdownProps> = ({ children }) => {
  return (
    <ReactMarkdown
      components={{
        a: MarkdownLink,
        p: MarkdownParagraph,
      }}
    >
      {children ?? ""}
    </ReactMarkdown>
  );
};
