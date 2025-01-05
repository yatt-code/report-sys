import React, { useState } from 'react';

function CommentItem({ comment, onReply }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    onReply(comment.id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  return (
    <div className="border-l-2 pl-4 mb-4">
      <p className="font-bold">{comment.author}</p>
      <p className="text-gray-700">{comment.content}</p>
      <button
        className="text-blue-500 text-sm mt-1"
        onClick={() => setIsReplying(!isReplying)}
      >
        {isReplying ? 'Cancel' : 'Reply'}
      </button>

      {isReplying && (
        <div className="mt-2">
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={handleReplySubmit}
          >
            Submit Reply
          </button>
        </div>
      )}

      {/* Render Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-4 mt-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
