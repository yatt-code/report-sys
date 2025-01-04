import React from "react";
import Comment from "./Comment";

const CommentList = ({ comments, onReply }) => {
  return (
    <div>
      {Array.isArray(comments) && comments.length > 0 ? (
        comments.map((comment) => (
          <Comment key={comment.id} comment={comment} onReply={onReply} />
        ))
      ) : (
        <p>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentList;
