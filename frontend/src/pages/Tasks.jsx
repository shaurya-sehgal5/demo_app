import { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../api';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      // Refetch to get updated tasks and activity
      await fetchTasks();
    } catch (err) {
      alert('Failed to update task status: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const columns = [
    { title: 'To Do', key: 'todo', tasks: todoTasks },
    { title: 'In Progress', key: 'in_progress', tasks: inProgressTasks },
    { title: 'Done', key: 'done', tasks: doneTasks },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => (
          <div key={col.key} className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">{col.title} ({col.tasks.length})</h2>
            <div className="space-y-2 min-h-[100px]">
              {col.tasks.map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))}
              {col.tasks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}