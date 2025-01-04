import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

export default function MarkdownRenderer({ content }) {
  const slugify = (text) => {
    if (typeof text !== 'string') {
      return '';
    }
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const createHeadingComponent = (level) => {
    return ({ children, ...props }) => {
      const textContent = React.Children.toArray(children)
        .map(child => {
          if (typeof child === 'string') return child;
          if (typeof child === 'object' && child.props && child.props.children) {
            return child.props.children;
          }
          return '';
        })
        .join('');

      const id = slugify(textContent);
      const className = `text-${level === 1 ? '2xl' : level === 2 ? 'xl' : 'lg'} font-${level === 3 ? 'semibold' : 'bold'} ${level === 1 ? 'mb-4' : level === 2 ? 'mt-6 mb-3' : 'mt-4 mb-2'} text-gray-900 group flex items-center`;

      return React.createElement(
        `h${level}`,
        { id, className, ...props },
        <>
          {children}
          <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
            </svg>
          </a>
        </>
      );
    };
  };

  return (
    <div className="markdown-content bg-white text-gray-800">
      <MDEditor.Markdown
        source={content}
        rehypePlugins={[[rehypeSanitize]]}
        style={{
          backgroundColor: 'white',
          color: '#1f2937', // text-gray-800
        }}
        components={{
          img: ({ alt, src, ...props }) => (
            <div className="my-4">
              <img
                alt={alt}
                src={src}
                {...props}
                className="max-w-full h-auto rounded-lg shadow-md"
                loading="lazy"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>
          ),
          h1: createHeadingComponent(1),
          h2: createHeadingComponent(2),
          h3: createHeadingComponent(3),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-4 pl-4 text-gray-800" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-4 pl-4 text-gray-800" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="mb-1 text-gray-800" {...props}>
              {children}
            </li>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-4 text-gray-800" {...props}>
              {children}
            </p>
          ),
          code: ({ children, ...props }) => (
            <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded" {...props}>
              {children}
            </code>
          ),
          pre: ({ children, ...props }) => (
            <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg mb-4 overflow-x-auto" {...props}>
              {children}
            </pre>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-4" {...props}>
              {children}
            </blockquote>
          ),
          a: ({ children, ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 hover:underline" {...props}>
              {children}
            </a>
          ),
        }}
      />
    </div>
  );
}
