import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await getProject(id);
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  const taskCounts = {
    todo: project.tasks?.filter(t => t.status === 'todo').length || 0,
    in_progress: project.tasks?.filter(t => t.status === 'in_progress').length || 0,
    done: project.tasks?.filter(t => t.status === 'done').length || 0,
  };

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to Projects
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 mt-1">{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="text-gray-500">Owner: <span className="font-medium text-gray-700">{project.owner}</span></span>
          <span className="text-gray-500">Progress: <span className="font-medium text-gray-700">{project.progress}%</span></span>
          <span className="text-gray-500">Tasks: <span className="font-medium text-gray-700">{project.tasks?.length || 0}</span></span>
        </div>
        <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">To Do</p>
          <p className="text-2xl font-bold text-gray-800">{taskCounts.todo}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-gray-800">{taskCounts.in_progress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Done</p>
          <p className="text-2xl font-bold text-gray-800">{taskCounts.done}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>
        {project.tasks && project.tasks.length > 0 ? (
          <div className="space-y-2">
            {project.tasks.map(task => (
              <div key={task.id} className="flex justify-between items-center border-b border-gray-100 py-2">
                <span className="text-sm text-gray-700">{task.title}</span>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tasks for this project.</p>
        )}
      </div>

      {project.recent_activity && project.recent_activity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {project.recent_activity.map(act => (
              <div key={act.id} className="text-sm text-gray-600 border-b border-gray-100 py-2">
                {act.message}
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(act.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}