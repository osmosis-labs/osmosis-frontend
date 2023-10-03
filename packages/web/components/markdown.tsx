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

const Markdown: FunctionComponent<MarkdownProps> = ({ children }) => {
  // Define your component's logic here

  return (
    <ReactMarkdown
      components={{
        a: MarkdownLink,
      }}
    >
      {children ?? ""}
    </ReactMarkdown>
  );
};

export default Markdown;
