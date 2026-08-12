import { useEffect, useState } from 'react';
import { getActivity } from '../api';
import ActivityItem from '../components/ActivityItem';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchActivity() {
      try {
        const data = await getActivity();
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Timeline</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[70vh] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No activity yet.</p>
        ) : (
          <div className="relative pl-4 border-l-2 border-primary-200">
            {activities.map((item) => (
              <div key={item.id} className="mb-4">
                <ActivityItem activity={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}