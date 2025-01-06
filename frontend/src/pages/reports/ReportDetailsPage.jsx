import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReportEditor from '../../components/reports/ReportEditor';
import MarkdownRenderer from '../../components/reports/MarkdownRenderer';
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { reports } from '../../services/api';
import AttachmentList from '../../components/reports/AttachmentList';
import { useDropzone } from 'react-dropzone';
import CommentList from '../../components/comments/CommentList';

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [deletedAttachments, setDeletedAttachments] = useState([]);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reports.get(id),
  });

  useEffect(() => {
    if (report) {
      setTitle(report.title || '');
      setEditedContent(report.content || '');
    }
  }, [report]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      try {
        let content = data.content;
        console.log("Original content length:", content.length);
        console.log("Content preview:", content.substring(0, 200));
        
        // Process inline images if there are any blob URLs
        if (content.includes('blob:')) {
          content = await processInlineImages(content);
          console.log("Content after image processing length:", content.length);
          console.log("Processed content preview:", content.substring(0, 200));
        }
        
        const updateData = {
          title: data.title,
          content: content
        };
        
        console.log("Final update data:", {
          titleLength: updateData.title.length,
          contentLength: updateData.content.length,
          contentPreview: updateData.content.substring(0, 200)
        });
        
        return reports.update(id, updateData);
      } catch (error) {
        console.error("Error in mutation:", error);
        console.error("Error response:", error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['report', id]);
      setIsEditing(false);
      setFiles([]);
      setDeletedAttachments([]);
    },
    onError: (error) => {
      console.error("Update error full details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorDetail = error.response?.data?.detail;
      if (errorDetail?.error) {
        setError(`Error: ${errorDetail.error} (${errorDetail.type})`);
      } else {
        setError(error.message || 'Failed to update report');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reports.delete(id),
    onSuccess: () => {
      navigate('/reports');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate();
    }
  };

  const handleSave = async () => {
    try {
      console.log('Saving with content:', editedContent);
      await updateMutation.mutateAsync({
        title,
        content: editedContent,
      });
    } catch (error) {
      console.error('Failed to save report:', error);
      if (error.response?.data) {
        console.error('Validation error details:', error.response.data);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(report.title || '');
    setEditedContent(report.content || '');
    setFiles([]);
    setDeletedAttachments([]);
  };

  const processInlineImages = async (content) => {
    if (!content) {
      console.log('No content to process');
      return '';
    }
    
    const regex = /!\[.*?\]\((blob:.*?)\)/g;
    const matches = content.match(regex);
    
    if (!matches) {
      console.log('No blob URLs found in content');
      return content;
    }
    
    console.log('Found blob URLs:', matches);
    let processedContent = content;
    
    for (const match of matches) {
      try {
        const blobUrl = match.match(/\((blob:.*?)\)/)[1];
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.png', { type: blob.type });
        const uploadedImage = await reports.uploadInlineImage(file);
        processedContent = processedContent.replace(blobUrl, uploadedImage.url);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
    
    console.log('Processed content:', processedContent);
    return processedContent;
  };

  const onDrop = (acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Report not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold mb-4 px-2 py-1 border rounded text-gray-900"
              placeholder="Report Title"
            />
            <ReportEditor value={editedContent} onChange={setEditedContent} />
            <div
              {...getRootProps()}
              className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-500"
            >
              <input {...getInputProps()} />
              <p className="text-center text-gray-600">
                Drag and drop files here, or click to select files
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium">New Attachments:</h3>
                <ul className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>{file.name}</span>
                      <button
                        onClick={() =>
                          setFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Cancel editing"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title="Save changes"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <div className="flex space-x-2">
                <button
                  onClick={startEditing}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="Edit report"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="Delete report"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="prose max-w-none bg-white">
              <MarkdownRenderer content={report.content || ''} />
            </div>
            {report.attachments && report.attachments.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <h2 className="text-lg font-semibold mb-4">Attachments</h2>
                <AttachmentList
                  attachments={report.attachments}
                  isEditing={isEditing}
                  onDelete={(id) =>
                    setDeletedAttachments((prev) => [...prev, id])
                  }
                />
              </div>
            )}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Comments</h2>
              <CommentList reportId={report.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
