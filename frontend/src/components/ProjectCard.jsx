import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { id, name, description, owner, status, progress, task_count } = project;

  return (
    <div
      onClick={() => navigate(`/projects/${id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">Owner: <span className="font-medium text-gray-700">{owner}</span></span>
          <span className="text-gray-500">{task_count || 0} tasks</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium">{progress}%</span>
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}