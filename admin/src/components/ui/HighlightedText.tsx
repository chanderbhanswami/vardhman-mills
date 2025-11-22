'use client';

import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
}

export default function HighlightedText({
  text,
  highlight,
  className = "",
  highlightClassName = "bg-yellow-200 text-yellow-800 rounded px-1"
}: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
