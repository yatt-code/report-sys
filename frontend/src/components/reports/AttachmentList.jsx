import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import 'file-icon-vectors/dist/file-icon-vectors.min.css';

export default function AttachmentList({ attachments, onDelete, readonly }) {
  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = getAttachmentUrl(attachment);
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAttachmentUrl = (attachment) => {
    // Remove any double slashes except after http(s):
    return `${import.meta.env.VITE_API_URL}${attachment.file_path}`.replace(/([^:])\/\//g, '$1/');
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const getFileIconClass = (filename, contentType) => {
    const ext = getFileExtension(filename);
    
    // Special handling for common programming files
    const programmingExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'cs', 'php', 'rb'];
    if (programmingExts.includes(ext)) {
      return `fiv-viv fiv-icon-${ext}`;
    }

    // Special handling for office documents
    if (contentType?.includes('wordprocessingml.document') || ext === 'docx') {
      return 'fiv-viv fiv-icon-docx';
    }
    if (contentType?.includes('spreadsheetml.sheet') || ext === 'xlsx') {
      return 'fiv-viv fiv-icon-xlsx';
    }
    if (contentType?.includes('presentationml.presentation') || ext === 'pptx') {
      return 'fiv-viv fiv-icon-pptx';
    }

    // Check if the extension has a corresponding icon
    const iconExists = document.createElement('div');
    iconExists.className = `fiv-viv fiv-icon-${ext}`;
    const hasIcon = getComputedStyle(iconExists).backgroundImage !== 'none';

    return hasIcon ? `fiv-viv fiv-icon-${ext}` : 'fiv-viv fiv-icon-blank';
  };

  if (!attachments?.length) {
    return <div className="text-sm text-gray-500 italic">No attachments</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {attachments.map((attachment) => {
          const isImage = attachment.content_type?.startsWith('image/');
          const iconClass = getFileIconClass(attachment.filename, attachment.content_type);

          return (
            <div
              key={attachment.id}
              className="group relative flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail/Icon Container */}
              <div 
                className={`relative overflow-hidden rounded-t-lg ${
                  isImage ? 'bg-gray-50' : 'bg-gray-100'
                }`}
                style={{ paddingBottom: '75%' }} // 4:3 aspect ratio
              >
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  {isImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={getAttachmentUrl(attachment)}
                        alt={attachment.filename}
                        className="absolute inset-0 h-full w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.svg';
                          e.target.classList.add('p-4', 'opacity-40');
                        }}
                      />
                      <div className="absolute inset-0 shadow-inner rounded-t-lg"></div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <i className={`${iconClass} text-6xl opacity-80`} />
                    </div>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={attachment.filename}>
                  {attachment.filename}
                </h3>
                <p className="mt-1 text-xs text-gray-500 truncate" title={attachment.content_type}>
                  {attachment.content_type || 'Unknown type'}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md p-1">
                <button
                  type="button"
                  onClick={() => downloadAttachment(attachment)}
                  className="rounded-md p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                {!readonly && (
                  <button
                    type="button"
                    onClick={() => onDelete(attachment.id)}
                    className="rounded-md p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
