import React, { useState, useMemo } from 'react';
import {
  LuChevronDown as ChevronDown,
  LuChevronRight as ChevronRight,
  LuList as List,
} from 'react-icons/lu';

// Define the heading structure
interface TocHeading {
  id: string;
  title: string;
  level: number;
  children: TocHeading[];
}

// Collapsible component interfaces
interface CollapsibleTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  isOpen?: boolean;
  className?: string;
  [key: string]: any;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function CollapsibleTrigger({
  children,
  onClick,
  isOpen,
  className = '',
  ...props
}: CollapsibleTriggerProps) {
  return (
    <button
      className={`flex items-center gap-2 w-full text-left hover:text-foreground transition-colors ${className}`}
      onClick={onClick}
      {...props}
    >
      {isOpen ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}

function CollapsibleContent({
  children,
  className = '',
  ...props
}: CollapsibleContentProps) {
  return (
    <div className={`ml-6 mt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

function Collapsible({
  open = false,
  onOpenChange,
  children,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open);

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div data-state={isOpen ? 'open' : 'closed'}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === CollapsibleTrigger) {
            return React.cloneElement(
              child as React.ReactElement<CollapsibleTriggerProps>,
              {
                onClick: handleToggle,
                isOpen,
              },
            );
          }
          if (child.type === CollapsibleContent) {
            return isOpen ? child : null;
          }
        }
        return child;
      })}
    </div>
  );
}

// Extract headings from markdown content
function extractHeadings(markdown: string): TocHeading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    headings.push({
      id,
      title,
      level,
      children: [],
    });
  }

  return buildHeadingTree(headings);
}

// Build a nested tree structure from flat headings array
function buildHeadingTree(headings: TocHeading[]): TocHeading[] {
  const root: TocHeading[] = [];
  const stack: TocHeading[] = [];

  for (const heading of headings) {
    // Remove items from stack that are at same level or deeper
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(heading);
    } else {
      stack[stack.length - 1].children.push(heading);
    }

    stack.push(heading);
  }

  return root;
}

// Individual TOC item component
function TocItem({
  heading,
  onHeadingClick,
}: {
  heading: TocHeading;
  onHeadingClick?: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = heading.children.length > 0;

  const handleClick = () => {
    onHeadingClick?.(heading.id);

    const element = document.getElementById(heading.id);
    const previewer = document.querySelector('.markdown-previewer');

    if (element && previewer) {
      const previewerRect = previewer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const y =
        elementRect.top - previewerRect.top + previewer.scrollTop - 3.75 * 20;

      previewer.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!hasChildren) {
    return (
      <div className="py-0.5">
        <button
          onClick={handleClick}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors text-left w-full"
        >
          {heading.title}
        </button>
      </div>
    );
  }

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="text-xs text-muted-foreground">
          <span
            onClick={handleClick}
            className="hover:text-foreground hover:underline transition-colors"
          >
            {heading.title}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {heading.children.map((child, index) => (
            <TocItem
              key={`${child.id}-${index}`}
              heading={child}
              onHeadingClick={onHeadingClick}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Main TOC component
export function MarkdownToc({
  content,
  className = '',
  onHeadingClick,
  collapsible = true,
}: {
  content: string;
  className?: string;
  onHeadingClick?: (id: string) => void;
  collapsible?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) {
    return null;
  }

  if (!collapsible) {
    return (
      <div
        className={`bg-surface rounded-lg p-4 max-h-[90vh]  custom-scrollbar ${className}`}
      >
        <nav className="">
          {headings.map((heading, index) => (
            <TocItem
              key={`${heading.id}-${index}`}
              heading={heading}
              onHeadingClick={onHeadingClick}
            />
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface rounded-lg p-4 max-h-[90vh]  custom-scrollbar ${className}`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="mb-2 text-xs font-semibold text-gray-200">
          <List className="w-4 h-4 text-gray-400" />
          <span>Table of Contents</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav className="space-y-1">
            {headings.map((heading, index) => (
              <TocItem
                key={`${heading.id}-${index}`}
                heading={heading}
                onHeadingClick={onHeadingClick}
              />
            ))}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
