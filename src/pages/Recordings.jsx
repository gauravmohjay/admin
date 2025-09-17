import { VideoIcon } from 'lucide-react';
import EmptyState from '../components/UI/EmptyState';

const Recordings = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recordings</h1>
          <p className="text-gray-600">View and manage session recordings</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <EmptyState
          title="Recordings feature coming soon"
          description="This section will display session recordings and provide management capabilities."
          icon={VideoIcon}
        />
      </div>
    </div>
  );
};

export default Recordings;