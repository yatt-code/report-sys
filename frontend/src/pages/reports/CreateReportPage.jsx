import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import { reports } from '../../services/api';
import FileUpload from '../../components/reports/FileUpload';

export default function CreateReportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating report:', data);
      const result = await reports.create(data);
      console.log('Created report:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation successful, invalidating queries');
      // Invalidate and refetch
      queryClient.invalidateQueries(['reports']);
      // Wait for invalidation before navigating
      setTimeout(() => {
        console.log('Navigating to reports page');
        navigate('/reports');
      }, 100);
    },
    onError: (err) => {
      console.error('Mutation error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create report';
      setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    const reportData = {
      title: title.trim(),
      content: content.trim(),
      files,
    };
    console.log('Submitting report:', reportData);
    createMutation.mutate(reportData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Report</h1>
          <p className="mt-2 text-sm text-gray-700">
            Get started by filling in the information below to create your new report.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8 divide-y divide-gray-200">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-6 pt-8">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Enter report title"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Content
              </label>
              <div className="mt-2">
                <MDEditor
                  value={content}
                  onChange={setContent}
                  preview="edit"
                  height={400}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Attachments
              </label>
              <div className="mt-2">
                <FileUpload
                  onFilesSelected={(selectedFiles) => setFiles(selectedFiles)}
                  maxFiles={5}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end gap-x-3">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="inline-flex justify-center rounded-md bg-primary-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
