import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CommentForm } from './CommentForm';

export function CommentItem({ comment, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="flex space-x-3">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.user.full_name}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Reply
          </button>
        </div>
        <div className="text-sm text-gray-700">{comment.content}</div>
        
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              reportId={comment.report_id}
              parentId={comment.id}
              onSuccess={() => setShowReplyForm(false)}
            />
          </div>
        )}
        
        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-200">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 