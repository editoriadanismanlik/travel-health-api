import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '@/config/api';
import { Task } from '@/types';
import TaskCard from './TaskCard';

const columns = {
  todo: { title: 'To Do', color: 'bg-gray-100' },
  inProgress: { title: 'In Progress', color: 'bg-blue-50' },
  review: { title: 'Review', color: 'bg-yellow-50' },
  completed: { title: 'Completed', color: 'bg-green-50' }
};

const TaskBoard: React.FC<{ jobId: string }> = ({ jobId }) => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  const { isLoading } = useQuery(['tasks', jobId], async () => {
    const response = await api.get(`/jobs/${jobId}/tasks`);
    const groupedTasks = response.data.reduce((acc: Record<string, Task[]>, task: Task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {});
    setTasks(groupedTasks);
    return response.data;
  });

  const updateTaskStatus = useMutation(
    async ({ taskId, status }: { taskId: string; status: string }) => {
      return api.patch(`/tasks/${taskId}`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', jobId]);
      }
    }
  );

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      const column = tasks[source.droppableId];
      const newTasks = Array.from(column);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: newTasks
      });
    } else {
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const sourceTasks = Array.from(sourceColumn);
      const destTasks = Array.from(destColumn);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: sourceTasks,
        [destination.droppableId]: destTasks
      });

      await updateTaskStatus.mutateAsync({
        taskId: draggableId,
        status: destination.droppableId
      });
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className={`${column.color} p-4 rounded-lg`}>
            <h3 className="font-medium mb-4">{column.title}</h3>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  {tasks[columnId]?.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard; 