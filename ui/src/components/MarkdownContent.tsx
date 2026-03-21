import { Fragment, type ReactNode } from "react";

type MarkdownContentProps = {
  content: string;
};

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-zinc-900 px-1.5 py-0.5 text-[0.95em] text-sky-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      elements.push(
        <pre key={`code-${index}`} className="overflow-x-auto rounded-2xl border border-slate-800 bg-zinc-900 p-4 text-sm text-slate-200">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="mt-2 text-xl font-semibold text-white">
          {trimmed.slice(3)}
        </h2>
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${index}`} className="mt-2 text-2xl font-bold text-white">
          {trimmed.slice(2)}
        </h1>
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      elements.push(
        <ul key={`ul-${index}`} className="ml-6 list-disc space-y-2 text-sm leading-6 text-slate-300">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;
    while (index < lines.length) {
      const nextLine = lines[index].trim();
      if (!nextLine || nextLine.startsWith("#") || nextLine.startsWith("- ") || nextLine.startsWith("```")) {
        break;
      }
      paragraphLines.push(nextLine);
      index += 1;
    }

    elements.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-slate-300">
        {renderInline(paragraphLines.join(" "))}
      </p>
    );
  }

  return <div className="space-y-4">{elements}</div>;
}
