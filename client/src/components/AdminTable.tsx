import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent } from "./ui/card";
import type { User } from "@shared/schema";

interface AdminTableProps {
  users: User[];
  isLoading: boolean;
  onDeleteUser: (id: string) => void;
  onAssignProtocol: (userId: string, protocolId: string) => void;
}

export default function AdminTable({ 
  users, 
  isLoading, 
  onDeleteUser,
  onAssignProtocol
}: AdminTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    const allUserIds = users.map(user => user.id);
    setIsAllSelected(selectedIds.length > 0 && selectedIds.length === allUserIds.length);
  }, [selectedIds, users]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(user => user.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, userId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== userId));
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 animate-pulse">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center">
        <i className="fas fa-users text-3xl sm:text-4xl text-slate-300 mb-4"></i>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No users found</h3>
        <p className="text-sm sm:text-base text-slate-600">No users match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg border gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
              {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="text-slate-600 border-slate-300 hover:bg-slate-100 text-xs sm:text-sm py-2 sm:py-1"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <Card 
            key={user.id} 
            className="shadow-sm border-0 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <div className="pt-1">
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </div>

                {/* User Avatar */}
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  {user.profilePicture ? (
                    <img 
                      className="h-full w-full rounded-full object-cover" 
                      src={user.profilePicture} 
                      alt={user.email}
                    />
                  ) : (
                    <i className="fas fa-user text-slate-400 text-xl"></i>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-medium text-slate-900 line-clamp-2 pr-2">
                      {user.name || user.email}
                    </h3>
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full flex-shrink-0 ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.role === 'trainer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 mb-2">
                    {user.email}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm text-slate-600">
                      Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignProtocol(user.id, '')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Assign Protocol
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                    >
                      <i className="fas fa-times mr-1"></i>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border shadow-sm">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isAllSelected && users.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={users.length === 0}
                  />
                  <span>Select</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center mr-4">
                      {user.profilePicture ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover" 
                          src={user.profilePicture} 
                          alt={user.email}
                        />
                      ) : (
                        <i className="fas fa-user text-slate-400"></i>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{user.name || 'No name'}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : user.role === 'trainer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 min-w-[180px]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignProtocol(user.id, '')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Assign Protocol
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <i className="fas fa-times mr-1"></i>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}