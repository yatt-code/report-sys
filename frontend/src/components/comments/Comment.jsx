import React, { useState } from "react";
import ReplyCommentInput from "./ReplyCommentInput";

const Comment = ({ comment, onReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div className="border-b pb-4 mb-4">
      <p className="text-sm font-medium">{comment.content}</p>
      <div className="text-xs text-gray-500">Posted by User {comment.user_id}</div>
      <button
        onClick={() => setShowReplyInput(!showReplyInput)}
        className="text-blue-500 text-xs mt-2"
      >
        Reply
      </button>
      {showReplyInput && (
        <ReplyCommentInput
          parentId={comment.id}
          onSubmit={(parentId, replyContent) => {
            onReply(parentId, replyContent);
            setShowReplyInput(false);
          }}
        />
      )}
      {comment.replies?.length > 0 && (
        <div className="pl-4 border-l mt-4">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
