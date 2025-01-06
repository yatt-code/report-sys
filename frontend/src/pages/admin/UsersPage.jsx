import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list()
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => api.users.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setSelectedUser(null);
    }
  });

  const handleUpdateUser = async (userData) => {
    try {
      await updateUserMutation.mutateAsync(userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="grid gap-4">
        {users?.map(user => (
          <div key={user.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{user.full_name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
              
              <button
                onClick={() => setSelectedUser(user)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md"
              >
                Edit
              </button>
            </div>
            
            {selectedUser?.id === user.id && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Assigned Projects</h4>
                {Object.values(Project).map(project => (
                  <label key={project} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={user.projects.includes(project)}
                      onChange={(e) => {
                        const newProjects = e.target.checked
                          ? [...user.projects, project]
                          : user.projects.filter(p => p !== project);
                        
                        handleUpdateUser({
                          ...user,
                          projects: newProjects
                        });
                      }}
                    />
                    <span>{project}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 