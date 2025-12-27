"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import {
  IconGripVertical,
  IconClock,
  IconAlertTriangle,
  IconDeviceDesktop,
  IconBuilding,
  IconUser,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Types
interface KanbanRequest {
  id: number;
  subject: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  equipment_id: number;
  equipment_name: string;
  serial_number: string;
  equipment_location: string;
  department_id: number;
  department_name: string;
  category_name: string;
  team_id: number;
  team_name: string;
  created_by_name: string;
  technician_id: number | null;
  technician_name: string | null;
  scheduled_date: string | null;
  is_overdue: number;
  created_at: string;
  updated_at: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

interface KanbanBoardProps {
  requests: KanbanRequest[];
  loading: boolean;
  onStatusChange: (requestId: number, newStatus: string, durationHours?: number) => Promise<boolean>;
  onRefresh: () => void;
}

const columns: KanbanColumn[] = [
  {
    id: "new",
    title: "New",
    status: "new",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    icon: <IconClock className="h-5 w-5" />,
  },
  {
    id: "assigned",
    title: "Assigned",
    status: "assigned",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    icon: <IconUser className="h-5 w-5" />,
  },
  {
    id: "in_progress",
    title: "In Progress",
    status: "in_progress",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-300 dark:border-yellow-700",
    icon: <IconLoader2 className="h-5 w-5" />,
  },
  {
    id: "repaired",
    title: "Completed",
    status: "repaired",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-300 dark:border-green-700",
    icon: <IconAlertTriangle className="h-5 w-5" />,
  },
];

const priorityConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  critical: { color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/50", icon: "🔴" },
  high: { color: "text-orange-700 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/50", icon: "🟠" },
  medium: { color: "text-yellow-700 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/50", icon: "🟡" },
  low: { color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/50", icon: "🟢" },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  corrective: { label: "Corrective", color: "bg-red-500" },
  preventive: { label: "Preventive", color: "bg-blue-500" },
  predictive: { label: "Predictive", color: "bg-purple-500" },
};

// Kanban Card Component
function KanbanCard({
  request,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  request: KanbanRequest;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, request: KanbanRequest) => void;
  onDragEnd: () => void;
}) {
  const priority = priorityConfig[request.priority] || priorityConfig.medium;
  const type = typeConfig[request.type] || { label: request.type, color: "bg-gray-500" };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, request)}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 rounded-lg border shadow-sm transition-all duration-200",
        isDragging
          ? "opacity-50 scale-95 rotate-2 shadow-lg"
          : "hover:shadow-md hover:border-primary/50",
        request.is_overdue && "border-l-4 border-l-red-500"
      )}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <IconGripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-mono text-muted-foreground">#{request.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">{priority.icon}</span>
            <div className={cn("w-2 h-2 rounded-full", type.color)} title={type.label} />
          </div>
        </div>

        {/* Subject */}
        <h4 className="font-medium text-sm leading-tight mb-2 line-clamp-2">
          {request.subject}
        </h4>

        {/* Equipment Info */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <IconDeviceDesktop className="h-3 w-3" />
          <span className="truncate">{request.equipment_name}</span>
        </div>

        {/* Department */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <IconBuilding className="h-3 w-3" />
          <span className="truncate">{request.department_name}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconCalendar className="h-3 w-3" />
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
          {request.is_overdue === 1 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              Overdue
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumnComponent({
  column,
  requests,
  draggedRequest,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  column: KanbanColumn;
  requests: KanbanRequest[];
  draggedRequest: KanbanRequest | null;
  onDragStart: (e: React.DragEvent, request: KanbanRequest) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: string) => void;
  isDragOver: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-xl border-2 transition-all duration-200",
        column.bgColor,
        column.borderColor,
        isDragOver && "ring-2 ring-primary ring-offset-2 scale-[1.02]"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.status)}
    >
      {/* Column Header */}
      <div className={cn("flex items-center justify-between p-4 border-b", column.borderColor)}>
        <div className="flex items-center gap-2">
          <span className={column.color}>{column.icon}</span>
          <h3 className={cn("font-semibold", column.color)}>{column.title}</h3>
        </div>
        <Badge variant="secondary" className="font-mono">
          {requests.length}
        </Badge>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[200px]">
        {requests.length === 0 ? (
          <div className={cn(
            "flex items-center justify-center h-24 border-2 border-dashed rounded-lg",
            column.borderColor,
            isDragOver && "bg-primary/10"
          )}>
            <p className="text-sm text-muted-foreground">
              {isDragOver ? "Drop here" : "No tasks"}
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <KanbanCard
              key={request.id}
              request={request}
              isDragging={draggedRequest?.id === request.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Main Kanban Board Component
export function KanbanBoard({ requests, loading, onStatusChange, onRefresh }: KanbanBoardProps) {
  const [draggedRequest, setDraggedRequest] = useState<KanbanRequest | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, request: KanbanRequest) => {
    setDraggedRequest(request);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", request.id.toString());
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedRequest(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: string) => {
      e.preventDefault();
      setDragOverColumn(null);

      if (!draggedRequest) return;

      // Don't do anything if dropping in the same column
      if (draggedRequest.status === targetStatus) {
        setDraggedRequest(null);
        return;
      }

      // Validate status transitions
      const currentStatus = draggedRequest.status;
      
      // Define valid transitions
      const validTransitions: Record<string, string[]> = {
        new: ["assigned", "in_progress"],
        assigned: ["in_progress", "new"],
        in_progress: ["repaired", "assigned"],
        repaired: [], // Can't move back from completed
      };

      if (!validTransitions[currentStatus]?.includes(targetStatus)) {
        toast.error(`Cannot move from ${currentStatus.replace("_", " ")} to ${targetStatus.replace("_", " ")}`);
        setDraggedRequest(null);
        return;
      }

      setIsUpdating(true);

      try {
        // For completing work, we might need to ask for duration
        // For now, we'll use a default duration of 1 hour
        const durationHours = targetStatus === "repaired" ? 1 : undefined;

        const success = await onStatusChange(draggedRequest.id, targetStatus, durationHours);

        if (success) {
          toast.success(`Task moved to ${targetStatus.replace("_", " ").toUpperCase()}`);
          onRefresh();
        }
      } catch (error) {
        toast.error("Failed to update status");
      } finally {
        setIsUpdating(false);
        setDraggedRequest(null);
      }
    },
    [draggedRequest, onStatusChange, onRefresh]
  );

  // Group requests by status
  const getRequestsByStatus = useCallback(
    (status: string) => {
      return requests.filter((r) => r.status === status);
    },
    [requests]
  );

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-xl border-2",
              column.bgColor,
              column.borderColor
            )}
          >
            <div className={cn("flex items-center justify-between p-4 border-b", column.borderColor)}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="p-3 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 bg-background p-4 rounded-lg shadow-lg">
            <IconLoader2 className="h-5 w-5 animate-spin" />
            <span>Updating status...</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            requests={getRequestsByStatus(column.status)}
            draggedRequest={draggedRequest}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={handleDrop}
            isDragOver={dragOverColumn === column.id}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">Priority:</span>
            {Object.entries(priorityConfig).map(([key, value]) => (
              <span key={key} className="flex items-center gap-1">
                {value.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Type:</span>
            {Object.entries(typeConfig).map(([key, value]) => (
              <span key={key} className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", value.color)} />
                {value.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
