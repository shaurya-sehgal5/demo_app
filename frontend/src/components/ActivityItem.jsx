import { formatDistanceToNow } from 'date-fns';

export default function ActivityItem({ activity }) {
  const { message, created_at } = activity;
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true });

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-2 h-2 mt-2 rounded-full bg-primary-400 flex-shrink-0"></div>
      <div>
        <p className="text-sm text-gray-700">{message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}