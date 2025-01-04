import React, { useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { reports } from '../../services/api';

export default function ReportEditor({ value, onChange }) {
  const onImagePaste = useCallback(
    async (dataTransfer, setMarkdown) => {
      const files = Array.from(dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length === 0) return;

      try {
        const file = files[0];
        const response = await reports.uploadInlineImage(file);
        const imageUrl = response.url;
        
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        setMarkdown((prev) => {
          const textarea = document.querySelector('.w-md-editor-text-input');
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          return (
            prev.substring(0, start) +
            imageMarkdown +
            prev.substring(end)
          );
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    },
    []
  );

  return (
    <div data-color-mode="light" className="w-md-editor-content">
      <MDEditor
        value={value}
        onChange={onChange}
        height={500}
        onPaste={(event) => {
          onImagePaste(event.clipboardData, onChange);
        }}
        onDrop={(event) => {
          event.preventDefault();
          onImagePaste(event.dataTransfer, onChange);
        }}
      />
    </div>
  );
}
