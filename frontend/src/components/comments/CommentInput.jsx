import React, { useState } from "react";

export default function CommentInput({ onSubmit }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-primary-500 focus:outline-none"
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Post Comment
        </button>
      </div>
    </form>
  );
}
