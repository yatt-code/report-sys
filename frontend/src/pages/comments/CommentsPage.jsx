import React, { useState, useEffect } from "react";
import axios from "axios";
import CommentInput from "../../components/comments/CommentInput";
import CommentList from "../../components/comments/CommentList";

const CommentsPage = ({ reportId }) => {
  const [comments, setComments] = useState([]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/${reportId}`);
      setComments(response.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleAddComment = async (content) => {
    try {
      await axios.post("/api/comments", {
        content,
        report_id: reportId,
        parent_id: null,
      });
      fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleReply = async (parentId, replyContent) => {
    try {
      await axios.post("/api/comments", {
        content: replyContent,
        report_id: reportId,
        parent_id: parentId,
      });
      fetchComments();
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      <CommentInput onSubmit={handleAddComment} />
      <CommentList comments={comments} onReply={handleReply} />
    </div>
  );
};

export default CommentsPage;
