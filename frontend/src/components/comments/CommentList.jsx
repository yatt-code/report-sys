import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { comments as commentsApi } from '../../services/api';

export default function CommentList({ reportId }) {
  const [replyTo, setReplyTo] = useState(null);
  
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['comments', reportId],
    queryFn: async () => {
      try {
        const response = await commentsApi.getReportComments(reportId);
        console.log('Comments response:', response);
        return response;
      } catch (err) {
        console.error('Error fetching comments:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading comments</div>;
  }

  return (
    <div className="space-y-6">
      <CommentForm reportId={reportId} />
      <div className="space-y-4">
        {comments?.map(comment => (
          <CommentItem 
            key={comment.id}
            comment={comment}
            onReply={() => setReplyTo(comment.id)}
          />
        ))}
      </div>
    </div>
  );
} 