import { Link } from 'react-router-dom';
import { CalendarIcon, DocumentIcon } from '@heroicons/react/24/outline';
import MDEditor from '@uiw/react-md-editor';

export default function ReportCard({ report }) {
  const createdAt = new Date(report.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            <Link
              to={`/reports/${report.id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {report.title}
            </Link>
          </h3>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
            {report.attachments?.length || 0} attachments
          </span>
        </div>
        <div className="mt-2">
          <MDEditor.Markdown 
            source={report.content} 
            style={{ whiteSpace: 'pre-line' }}
            className="!bg-transparent text-sm text-gray-600 line-clamp-3"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            {createdAt}
          </div>
          <div className="flex items-center">
            <Link
              to={`/reports/${report.id}`}
              className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <DocumentIcon className="mr-1.5 h-4 w-4" />
              View Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
