import React from 'react';
import { ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { MobileCard, MobileCardContent } from './ui/mobile-card';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useResponsive } from '../hooks/useResponsive';

interface Column {
  key: string;
  header: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobileHidden?: boolean;
  priority?: 'primary' | 'secondary' | 'tertiary';
}

interface MobileDataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: any) => void;
    variant?: 'default' | 'destructive';
  }[];
  emptyMessage?: string;
  className?: string;
}

export function MobileDataTable({
  data,
  columns,
  onRowClick,
  actions,
  emptyMessage = 'No data available',
  className,
}: MobileDataTableProps) {
  const { isMobile, isTablet } = useResponsive();

  // Desktop table view
  if (!isMobile && !isTablet) {
    return (
      <div className={cn("overflow-x-auto rounded-lg border", className)}>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-6 py-4 whitespace-nowrap text-sm", column.className)}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={cn(
                                action.variant === 'destructive' && "text-red-600"
                              )}
                            >
                              {action.icon && (
                                <action.icon className="mr-2 h-4 w-4" />
                              )}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile card view
  const getPrimaryColumns = () => columns.filter(c => c.priority === 'primary' || (!c.priority && !c.mobileHidden));
  const getSecondaryColumns = () => columns.filter(c => c.priority === 'secondary');

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((row, index) => (
        <MobileCard
          key={index}
          onClick={() => onRowClick?.(row)}
          className={cn(
            "p-4",
            onRowClick && "cursor-pointer active:scale-[0.98] transition-transform"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Primary content */}
              <div className="space-y-2">
                {getPrimaryColumns().map((column) => (
                  <div key={column.key}>
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      <>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {column.header}:
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {row[column.key]}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Secondary content */}
              {getSecondaryColumns().length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {getSecondaryColumns().map((column) => (
                    <div
                      key={column.key}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {column.header}:
                      </span>
                      <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions or arrow */}
            <div className="flex items-center ml-3">
              {actions && actions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.map((action, idx) => (
                      <DropdownMenuItem
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className={cn(
                          "min-h-[44px]",
                          action.variant === 'destructive' && "text-red-600"
                        )}
                      >
                        {action.icon && (
                          <action.icon className="mr-2 h-4 w-4" />
                        )}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : onRowClick ? (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              ) : null}
            </div>
          </div>
        </MobileCard>
      ))}
    </div>
  );
}