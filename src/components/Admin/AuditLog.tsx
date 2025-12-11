import React, { useState, useEffect } from 'react';
import { FileText, Calendar } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const auditLogs = JSON.parse(localStorage.getItem('audit_log') || '[]');
    setLogs(auditLogs.reverse());
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.actor.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-3xl mb-2">Audit Log</h2>
      <p className="text-gray-600 mb-8">View system activity log</p>

      <div className="mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter logs..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left">Timestamp</th>
              <th className="px-4 py-4 text-left">Action</th>
              <th className="px-4 py-4 text-left">Actor</th>
              <th className="px-4 py-4 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice(0, 100).map((log, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-4 text-sm">
                  {new Date(log.ts).toLocaleString()}
                </td>
                <td className="px-4 py-4">{log.action}</td>
                <td className="px-4 py-4">{log.actor}</td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {JSON.stringify(log.details).substring(0, 50)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
