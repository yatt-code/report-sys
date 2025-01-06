import React, { useCallback, useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { reports } from '../../services/api';
import { MentionSuggestions } from '../MentionSuggestions';

export default function ReportEditor({ value, onChange }) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(null);
  const editorRef = useRef(null);

  const handleMentionSelect = (user) => {
    if (!mentionPosition) return;

    const beforeMention = value.substring(0, mentionPosition.start);
    const afterMention = value.substring(mentionPosition.end);
    const newContent = `${beforeMention}@${user.username} ${afterMention}`;
    
    onChange(newContent);
    setMentionQuery('');
    setMentionPosition(null);
  };

  const handleEditorChange = (newValue) => {
    onChange(newValue);

    // Check for mention suggestions
    const textarea = document.querySelector('.w-md-editor-text-input');
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const matches = textBeforeCursor.match(/@(\w*)$/);

    if (matches) {
      setMentionQuery(matches[1]);
      setMentionPosition({
        start: cursorPosition - matches[1].length - 1,
        end: cursorPosition
      });
    } else {
      setMentionQuery('');
      setMentionPosition(null);
    }
  };

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
    <div data-color-mode="light" className="w-md-editor-content relative">
      <MDEditor
        ref={editorRef}
        value={value}
        onChange={handleEditorChange}
        height={500}
        onPaste={(event) => {
          onImagePaste(event.clipboardData, onChange);
        }}
        onDrop={(event) => {
          event.preventDefault();
          onImagePaste(event.dataTransfer, onChange);
        }}
      />
      {mentionQuery && (
        <div className="absolute bottom-full mb-1 w-full z-50">
          <MentionSuggestions
            query={mentionQuery}
            onSelect={handleMentionSelect}
          />
        </div>
      )}
    </div>
  );
}
