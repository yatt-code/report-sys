import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MentionSuggestions } from '../MentionSuggestions';
import { useAuth } from '../../contexts/AuthContext';

export function CommentForm({ reportId, parentId = null, onSuccess }) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => api.comments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', reportId]);
      setContent('');
      onSuccess?.();
    },
  });

  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);

    // Handle mention suggestions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const matches = textBeforeCursor.match(/@(\w*)$/);

    if (matches) {
      setMentionQuery(matches[1]);
    } else {
      setMentionQuery('');
    }
  };

  const handleMentionSelect = (user) => {
    const textBeforeCursor = content.slice(0, textareaRef.current.selectionStart);
    const textAfterCursor = content.slice(textareaRef.current.selectionStart);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const newContent = 
      textBeforeCursor.slice(0, lastAtSymbol) + 
      `@${user.username} ` + 
      textAfterCursor;
    
    setContent(newContent);
    setMentions([...mentions, user]);
    setMentionQuery('');
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          rows={3}
          placeholder="Write a comment..."
        />
        {mentionQuery && (
          <div className="absolute bottom-full mb-1 w-full">
            <MentionSuggestions
              query={mentionQuery}
              onSelect={handleMentionSelect}
            />
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => {
            mutation.mutate({
              content,
              reportId,
              parentId,
              mentions: mentions.map(u => u.id)
            });
          }}
          disabled={!content.trim() || mutation.isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {mutation.isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
} 