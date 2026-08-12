export default function MetricCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary-50 rounded-full text-primary-600">
          <Icon size={24} />
        </div>
      </div>
      {trend && <p className="text-xs text-green-600 mt-2">{trend}</p>}
    </div>
  );
}