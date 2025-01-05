import React, { useState, useEffect } from 'react';
import { comments } from '../../services/api';
import CommentItem from '../../components/comments/CommentItem';
import CommentForm from '../../components/comments/CommentForm';

function CommentsListPage({ reportId }) {
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!reportId) return; // Validation check
      try {
        const data = await comments.list(reportId);
        setCommentList(data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    fetchComments();
  }, [reportId]);

  const handleAddComment = async (content) => {
    try {
      const newComment = await comments.create(reportId, { parentId: null, content });
      setCommentList((prev) => [...prev, newComment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleReplyComment = async (parentId, content) => {
    try {
      const newReply = await comments.create(reportId, { parentId, content });
      setCommentList((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to reply to comment:', error);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Comments</h2>

      {/* Add Comment Form */}
      <CommentForm onSubmit={handleAddComment} />

      {/* List of Comments */}
      <div className="mt-6">
        {commentList.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReplyComment}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentsListPage;
