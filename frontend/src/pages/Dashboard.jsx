import { useEffect, useState } from 'react';
import { getStats, getProjects, getActivity } from '../api';
import MetricCard from '../components/MetricCard';
import ProjectCard from '../components/ProjectCard';
import ActivityItem from '../components/ActivityItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { FolderKanban, ClipboardCheck, CheckCircle, Users } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, projectsData, activityData] = await Promise.all([
          getStats(),
          getProjects(),
          getActivity(),
        ]);
        setStats(statsData);
        setProjects(projectsData);
        setActivity(activityData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const metrics = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban },
    { title: 'Active Tasks', value: stats?.activeTasks || 0, icon: ClipboardCheck },
    { title: 'Completed Tasks', value: stats?.completedTasks || 0, icon: CheckCircle },
    { title: 'Team Members', value: stats?.teamMembers || 0, icon: Users },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Progress</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.task_count || 0} tasks</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-80 overflow-y-auto">
            {activity.slice(0, 8).map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}