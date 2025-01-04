import React, { useState } from "react";

const ReplyCommentInput = ({ parentId, onSubmit }) => {
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onSubmit(parentId, replyContent);
      setReplyContent("");
    }
  };

  return (
    <form onSubmit={handleReplySubmit} className="mt-2">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Write a reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
      >
        Reply
      </button>
    </form>
  );
};

export default ReplyCommentInput;
