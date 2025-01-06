import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function MentionSuggestions({ query, onSelect }) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', query],
    queryFn: async () => {
      const response = await api.users.search(query);
      return response;
    },
    enabled: query.length > 0
  });

  if (!query || isLoading || !users?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">{user.full_name}</span>
            <span className="text-sm text-gray-500">@{user.username}</span>
          </div>
        </button>
      ))}
    </div>
  );
}