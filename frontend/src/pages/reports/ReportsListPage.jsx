import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import { reports } from '../../services/api';  
import ReportCard from '../../components/reports/ReportCard';
import SearchInput from '../../components/reports/SearchInput';

const ITEMS_PER_PAGE = 10;

export default function ReportsListPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Force refresh when navigating back to this page
  useEffect(() => {
    console.log('ReportsListPage mounted or location changed');
    queryClient.invalidateQueries(['reports']);
  }, [queryClient, location]);

  // Debounce search
  const handleSearch = (value) => {
    setSearchTerm(value);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', page, debouncedSearch],
    queryFn: () => {
      console.log('Fetching reports:', { page, limit: ITEMS_PER_PAGE, search: debouncedSearch });
      return reports.list(page, ITEMS_PER_PAGE, debouncedSearch);  
    },
    keepPreviousData: false, // Don't keep previous data
    staleTime: 0, // Consider data always stale
    cacheTime: 0, // Don't cache the data
  });

  console.log('Reports data:', data);

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">
          Error loading reports
        </h3>
        <div className="mt-2 text-sm text-red-700">
          {error.response?.data?.detail || error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all your reports including their title, content preview,
              and creation date.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/reports/new"
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Report
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <SearchInput value={searchTerm} onChange={handleSearch} />
        </div>

        {isLoading ? (
          <div className="mt-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.items?.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {data?.items?.length === 0 && (
              <div className="mt-6 text-center">
                <h3 className="text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new report.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{data?.items?.length}</span> of{' '}
                      <span className="font-medium">{data?.total}</span> reports
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
