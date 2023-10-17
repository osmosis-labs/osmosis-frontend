import React, { FunctionComponent } from "react";
import ReactMarkdown from "react-markdown";
import {
  ComponentPropsWithoutRef,
  ComponentType,
  ReactMarkdownProps,
} from "react-markdown/lib/ast-to-react";

interface MarkdownProps {
  children?: string;
}

type NormalMarkdownComponent<TagName extends React.ElementType<any>> =
  ComponentType<ComponentPropsWithoutRef<TagName> & ReactMarkdownProps>;

const MarkdownLink: NormalMarkdownComponent<"a"> = ({ node, ...props }) => {
  return <a {...props} className="text-white-high"></a>;
};

const MarkdownParagraph: NormalMarkdownComponent<"p"> = ({
  node,
  ...props
}) => {
  return (
    <p {...props} className="text-body2 font-medium text-osmoverse-300"></p>
  );
};

const Markdown: FunctionComponent<MarkdownProps> = ({ children }) => {
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

export default Markdown;
