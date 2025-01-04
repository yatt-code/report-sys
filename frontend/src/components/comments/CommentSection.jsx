import React, { useState, useEffect } from 'react';

const CommentSection = ({ reportId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    
    return date.toLocaleDateString();
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${reportId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (parentId = null) => {
    const content = parentId ? replyingTo.content : newComment;
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('report_id', reportId);
    if (parentId) formData.append('parent_id', parentId);

    try {
      await fetch('/api/comments', {
        method: 'POST',
        body: formData,
      });
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    const formData = new FormData();
    formData.append('content', editContent);

    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: formData,
      });
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const Comment = ({ comment, depth = 0 }) => {
    const isEditing = editingComment === comment.id;

    return (
      <div className={`ml-${depth * 4} mb-4`}>
        <div className="bg-white rounded-lg p-4 shadow">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                className="w-full p-2 border rounded"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-600">
                  User {comment.user_id} • {formatDate(comment.created_at)}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-800">{comment.content}</p>
              <div className="mt-2">
                <button
                  onClick={() => setReplyingTo({ id: comment.id, content: '' })}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Reply
                </button>
              </div>
            </>
          )}
        </div>

        {replyingTo?.id === comment.id && (
          <div className="ml-4 mt-2">
            <textarea
              className="w-full p-2 border rounded"
              value={replyingTo.content}
              onChange={(e) => setReplyingTo({ ...replyingTo, content: e.target.value })}
              placeholder="Write a reply..."
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleSubmitComment(comment.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reply
              </button>
              <button
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies?.map((reply) => (
          <Comment key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      
      {/* New comment form */}
      <div className="mb-6">
        <textarea
          className="w-full p-3 border rounded"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows="3"
        />
        <button
          onClick={() => handleSubmitComment()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Comment
        </button>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;