---
title: Convert the React SVG component into a Base64 URL
date: '2024-0-20'
tags: ['IMG', 'WEB', 'BASE64', 'SVG']
draft: false
summary: One way to convert the React SVG component into a real DOM element and then into a Base64 URL
---

When working with React and third-party modules, some modules may not accept SVG as React components directly. In such cases, you need to convert the React SVG component into a real DOM element and then into a Base64 URL.

```tsx
import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Convert an SVG string to a Base64 encoded URL
const svgToBase64 = (svgString) => {
  // Encode the SVG string as a UTF-8 byte array
  const utf8Bytes = new TextEncoder().encode(svgString);

  // Convert the byte array to a binary string
  const binaryString = Array.from(utf8Bytes)
    .map((byte) => String.fromCharCode(byte))
    .join(''); // Join the array into a single string

  // Encode the binary string to Base64
  return 'data:image/svg+xml;base64,' + btoa(binaryString);
};

// Convert a React SVG component to a Base64 URL
const convertReactDOMToBase64Url = (reactDOM) => {
  // Render the React component to a static HTML string
  const htmlString = ReactDOMServer.renderToStaticMarkup(reactDOM);

  // Parse the HTML string to a document object
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Get the outer HTML of the first child element
  const outerHTML = doc?.body?.firstChild?.outerHTML || ''; // Fallback to an empty string if not found

  // Convert the outer HTML to a Base64 URL
  return svgToBase64(outerHTML);
};

// Example: Create a simple React component
const testDOM = <div>testDOM</div>;

// Convert the React component to a Base64 encoded URL
convertReactDOMToBase64Url(testDOM);
```
