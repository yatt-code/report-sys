import React, { useState } from 'react';

function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    onSubmit(content).then(() => {
      setContent('');
      setError('');
    });
  };

  return (
    <div className="mt-6">
      <textarea
        className="w-full border p-2 rounded text-gray-700"
        placeholder="Write a new comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={handleSubmit}
      >
        Add Comment
      </button>
    </div>
  );
}

export default CommentForm;
