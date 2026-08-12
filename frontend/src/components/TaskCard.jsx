import StatusBadge from './StatusBadge';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function TaskCard({ task, onStatusChange }) {
  const { id, title, project_name, assignee, status, priority } = task;

  const handleStatusChange = (e) => {
    onStatusChange(id, e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-800">{title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[priority] || 'bg-gray-100'}`}>
          {priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Project: {project_name}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-600">{assignee || 'Unassigned'}</span>
        <select
          value={status}
          onChange={handleStatusChange}
          className="text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}