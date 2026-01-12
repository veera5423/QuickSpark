import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ServiceErrorBoundary from '../../components/ui/ServiceErrorBoundary';
import {
  UserManagementFallback,
  ReportsFallback,
  StatsFallback,
  ResourcesFallback,
  ProRequestsFallback,
  ServiceLoading
} from '../../components/ui/ServiceFallbacks';
import { useCircuitBreaker } from '../../hooks/useCircuitBreaker';
import AdminAPI from '../../api/adminAPI';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Circuit breakers for each service
  const usersCircuit = useCircuitBreaker('User Management');
  const resourcesCircuit = useCircuitBreaker('Resource Management');
  const statsCircuit = useCircuitBreaker('Dashboard Statistics');
  const reportsCircuit = useCircuitBreaker('Reports System');
  const proRequestsCircuit = useCircuitBreaker('Pro Requests');

  // State management
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Service status states
  const [serviceStatus, setServiceStatus] = useState({
    users: 'loading',
    resources: 'loading',
    stats: 'loading',
    reports: 'loading',
    proRequests: 'loading'
  });

  const loadUsers = useCallback(async () => {
    try {
      setServiceStatus(prev => ({ ...prev, users: 'loading' }));
      const response = await usersCircuit.execute(() => AdminAPI.getAllUsers());

      if (response.success) {
        setUsers(response.data.users || []);
        setServiceStatus(prev => ({ ...prev, users: 'success' }));
      } else {
        console.warn('Users service failed:', response.message);
        setServiceStatus(prev => ({ ...prev, users: 'error' }));
      }
    } catch (error) {
      console.error('Users service error:', error);
      setServiceStatus(prev => ({ ...prev, users: 'error' }));
    }
  }, [usersCircuit.execute]);

  const loadResources = useCallback(async () => {
    try {
      setServiceStatus(prev => ({ ...prev, resources: 'loading' }));
      const response = await resourcesCircuit.execute(() => AdminAPI.getAllResources());

      if (response.success) {
        setResources(response.data.resources || []);
        setServiceStatus(prev => ({ ...prev, resources: 'success' }));
      } else {
        console.warn('Resources service failed:', response.message);
        setServiceStatus(prev => ({ ...prev, resources: 'error' }));
      }
    } catch (error) {
      console.error('Resources service error:', error);
      setServiceStatus(prev => ({ ...prev, resources: 'error' }));
    }
  }, [resourcesCircuit.execute]);

  const loadStats = useCallback(async () => {
    try {
      setServiceStatus(prev => ({ ...prev, stats: 'loading' }));
      const response = await statsCircuit.execute(() => AdminAPI.getDashboardStats());

      if (response.success) {
        setStats(response.data);
        setServiceStatus(prev => ({ ...prev, stats: 'success' }));
      } else {
        console.warn('Stats service failed:', response.message);
        setServiceStatus(prev => ({ ...prev, stats: 'error' }));
      }
    } catch (error) {
      console.error('Stats service error:', error);
      setServiceStatus(prev => ({ ...prev, stats: 'error' }));
    }
  }, [statsCircuit.execute]);

  const loadReports = useCallback(async () => {
    try {
      setServiceStatus(prev => ({ ...prev, reports: 'loading' }));
      const response = await reportsCircuit.execute(() => AdminAPI.getResourceReports());

      if (response.success) {
        setReports(response.data.reports || []);
        setServiceStatus(prev => ({ ...prev, reports: 'success' }));
      } else {
        console.warn('Reports service failed:', response.message);
        setServiceStatus(prev => ({ ...prev, reports: 'error' }));
      }
    } catch (error) {
      console.error('Reports service error:', error);
      setServiceStatus(prev => ({ ...prev, reports: 'error' }));
    }
  }, [reportsCircuit.execute]);

  const loadProRequests = useCallback(async () => {
    try {
      setServiceStatus(prev => ({ ...prev, proRequests: 'loading' }));
      const response = await proRequestsCircuit.execute(() => AdminAPI.getProRequests());

      if (response.success) {
        setRequests(response.data.requests || []);
        setServiceStatus(prev => ({ ...prev, proRequests: 'success' }));
      } else {
        console.warn('Pro requests service failed:', response.message);
        setServiceStatus(prev => ({ ...prev, proRequests: 'error' }));
      }
    } catch (error) {
      console.error('Pro requests service error:', error);
      setServiceStatus(prev => ({ ...prev, proRequests: 'error' }));
    }
  }, [proRequestsCircuit.execute]);

  const loadDashboardData = useCallback(async () => {
    try {
      // Load each service independently
      await Promise.all([
        loadUsers(),
        loadResources(),
        loadStats(),
        loadReports(),
        loadProRequests()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadResources, loadStats, loadReports, loadProRequests]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleResolveRequest = async (requestId, action) => {
    try {
      setProcessing(requestId + action);
      const response = await proRequestsCircuit.execute(() => AdminAPI.resolveProRequest(requestId, action));

      if (response.success) {
        // Reload requests and users to get updated status
        loadProRequests();
        loadUsers();
      } else {
        console.error('Failed to resolve pro request:', response.message);
        setError('Failed to resolve request');
      }
    } catch (error) {
      console.error('Failed to resolve pro request:', error);
      setError('Failed to resolve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleUserStatus = async (userId, field) => {
    try {
      setProcessing(userId);
      const response = await usersCircuit.execute(() => AdminAPI.toggleUserStatus(userId, field));

      if (response.success) {
        // Reload users to get updated status
        loadUsers();
      } else {
        console.error('Failed to toggle user status:', response.message);
        setError('Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      setError('Failed to update user status');
    } finally {
      setProcessing(null);
    }
  };

  const handleVerifyResource = async (resourceId) => {
    try {
      setProcessing(resourceId);
      const response = await resourcesCircuit.execute(() => AdminAPI.verifyResource(resourceId));

      if (response.success) {
        // Reload resources to get updated status
        loadResources();
      } else {
        console.error('Failed to verify resource:', response.message);
        setError('Failed to verify resource');
      }
    } catch (error) {
      console.error('Failed to verify resource:', error);
      setError('Failed to verify resource');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(resourceId);
      const response = await resourcesCircuit.execute(() => AdminAPI.deleteResource(resourceId));

      if (response.success) {
        // Reload resources to reflect the deletion
        loadResources();
      } else {
        console.error('Failed to delete resource:', response.message);
        setError('Failed to delete resource');
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      setError('Failed to delete resource');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-indigo-600 font-medium">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Access Error</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 text-white">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users, resources, and system statistics.</p>
        </div>
      </div>

      {/* --- ERROR MESSAGE --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* --- TAB NAVIGATION --- */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👥 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'resources'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📚 Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📨 Pro Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🚨 Reports ({reports.length})
        </button>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <ServiceErrorBoundary serviceName="Dashboard Statistics" fallback={<StatsFallback />}>
          {serviceStatus.stats === 'loading' && <ServiceLoading serviceName="Statistics" />}
          {serviceStatus.stats === 'error' && <StatsFallback />}
          {serviceStatus.stats === 'success' && stats && (
            <div className="space-y-8">
              {/* Key Metrics Grid */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="p-5 border-l-4 border-indigo-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Total Users</div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total_users}</div>
                        <div className="text-xs text-green-600 mt-2">👥 Active</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-5 border-l-4 border-blue-600">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">Pro Members</div>
                      <div className="text-3xl font-bold text-blue-600 mt-1">{stats.pro_members}</div>
                      <div className="text-xs text-gray-500 mt-2">{stats.pro_percentage}% of users</div>
                    </div>
                  </Card>
                  <Card className="p-5 border-l-4 border-amber-600">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">Total Resources</div>
                      <div className="text-3xl font-bold text-amber-600 mt-1">{stats.total_resources}</div>
                      <div className="text-xs text-gray-500 mt-2">{stats.verification_percentage}% verified</div>
                    </div>
                  </Card>
                  <Card className="p-5 border-l-4 border-orange-600">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">Pending Review</div>
                      <div className="text-3xl font-bold text-orange-600 mt-1">{stats.pending_review}</div>
                      <div className="text-xs text-gray-500 mt-2">Need action</div>
                    </div>
                  </Card>
                  <Card className="p-5 border-l-4 border-red-600">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">Reports</div>
                      <div className="text-3xl font-bold text-red-600 mt-1">{stats.total_reports}</div>
                      <div className="text-xs text-gray-500 mt-2">🚨 Need attention</div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Action Required Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Required</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.pending_review > 0 && (
                    <Card className="p-5 bg-orange-50 border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">⏳</div>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">{stats.pending_review} pending</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-3">Resources Pending Verification</p>
                      <Button
                        onClick={() => setActiveTab('resources')}
                        className="w-full text-xs py-2 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Review Now
                      </Button>
                    </Card>
                  )}
                  {stats.total_reports > 0 && (
                    <Card className="p-5 bg-red-50 border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🚨</div>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{stats.total_reports} reports</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-3">User Reports to Review</p>
                      <Button
                        onClick={() => setActiveTab('reports')}
                        className="w-full text-xs py-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        View Reports
                      </Button>
                    </Card>
                  )}
                  {stats.pending_pro_requests > 0 && (
                    <Card className="p-5 bg-blue-50 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">📨</div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{stats.pending_pro_requests} pending</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-3">Pro Upgrade Requests</p>
                      <Button
                        onClick={() => setActiveTab('requests')}
                        className="w-full text-xs py-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Approve/Reject
                      </Button>
                    </Card>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Resource Verification Status</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600">{stats.verified_resources}</span>
                          <span className="text-sm text-gray-500">verified</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{stats.pending_review}</div>
                        <div className="text-xs text-gray-500">pending</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stats.verification_percentage}%` }}
                      />
                    </div>
                  </Card>
                  <Card className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Pro Member Distribution</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-blue-600">{stats.pro_members}</span>
                          <span className="text-sm text-gray-500">pro users</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-600">{stats.total_users - stats.pro_members}</div>
                        <div className="text-xs text-gray-500">free users</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.pro_percentage}%` }}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </ServiceErrorBoundary>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <ServiceErrorBoundary serviceName="User Management" fallback={<UserManagementFallback />}>
          {serviceStatus.users === 'loading' && <ServiceLoading serviceName="User Management" />}
          {serviceStatus.users === 'error' && <UserManagementFallback />}
          {serviceStatus.users === 'success' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <Button onClick={loadUsers} className="bg-indigo-600 text-white">
                  🔄 Refresh
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Registered</th>
                      <th className="text-center py-2">Admin</th>
                      <th className="text-center py-2">Pro Member</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-b">
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">{new Date(user.date_registered).toLocaleDateString()}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_admin ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_pro_member ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_pro_member ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 text-center space-x-2">
                          <Button
                            onClick={() => handleToggleUserStatus(user._id, 'is_admin')}
                            disabled={processing === user._id}
                            className={`text-xs px-2 py-1 ${
                              user.is_admin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          <Button
                            onClick={() => handleToggleUserStatus(user._id, 'is_pro_member')}
                            disabled={processing === user._id}
                            className={`text-xs px-2 py-1 ${
                              user.is_pro_member ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                          >
                            {user.is_pro_member ? 'Remove Pro' : 'Make Pro'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </ServiceErrorBoundary>
      )}

      {/* --- RESOURCES TAB --- */}
      {activeTab === 'resources' && (
        <ServiceErrorBoundary serviceName="Resource Management" fallback={<ResourcesFallback />}>
          {serviceStatus.resources === 'loading' && <ServiceLoading serviceName="Resource Management" />}
          {serviceStatus.resources === 'error' && <ResourceManagementFallback />}
          {serviceStatus.resources === 'success' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resource Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Filename</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Uploader</th>
                      <th className="text-left py-2">Created</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(resource => (
                      <tr key={resource.id} className="border-b">
                        <td className="py-3 truncate max-w-xs" title={resource.filename}>
                          {resource.filename}
                        </td>
                        <td className="py-3">{resource.type}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            resource.status === 'verified' ? 'bg-green-100 text-green-800' :
                            resource.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {resource.status}
                          </span>
                        </td>
                        <td className="py-3">{resource.uploader_email}</td>
                        <td className="py-3">{new Date(resource.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-center space-x-2">
                          {resource.status === 'pending' && (
                            <Button
                              onClick={() => handleVerifyResource(resource.id)}
                              disabled={processing === resource.id}
                              className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 text-white"
                            >
                              {processing === resource.id ? 'Verifying...' : 'Verify'}
                            </Button>
                          )}
                          {resource.source_url !== 'N/A' && (
                            <a
                              href={resource.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View
                            </a>
                          )}
                          <Button
                            onClick={() => handleDeleteResource(resource.id)}
                            disabled={processing === resource.id}
                            className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white"
                          >
                            {processing === resource.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {resources.length === 0 && (
                  <div className="text-center text-gray-500 py-6">No resources yet.</div>
                )}
              </div>
            </Card>
          )}
        </ServiceErrorBoundary>
      )}

      {/* --- PRO REQUESTS TAB --- */}
      {activeTab === 'requests' && (
        <ServiceErrorBoundary serviceName="Pro Requests Management" fallback={<ProRequestsFallback />}>
          {serviceStatus.proRequests === 'loading' && <ServiceLoading serviceName="Pro Requests Management" />}
          {serviceStatus.proRequests === 'error' && <ProRequestsFallback />}
          {serviceStatus.proRequests === 'success' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pro Access Requests</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Pro Status</th>
                      <th className="text-left py-2">Message</th>
                      <th className="text-left py-2">Requested</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req._id} className="border-b align-top">
                        <td className="py-3">{req.name || req.user_id}</td>
                        <td className="py-3">{req.email || '—'}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              req.is_pro_member ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {req.is_pro_member ? 'Pro' : 'Free'}
                          </span>
                        </td>
                        <td className="py-3 max-w-md whitespace-pre-wrap">{req.message || 'No message provided'}</td>
                        <td className="py-3">{new Date(req.created_at).toLocaleString()}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              req.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : req.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {req.status || 'pending'}
                          </span>
                          {req.resolved_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              {`on ${new Date(req.resolved_at).toLocaleString()}`}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-center space-x-2">
                          {req.status === 'pending' ? (
                            <>
                              <Button
                                onClick={() => handleResolveRequest(req._id, 'approve')}
                                disabled={processing === req._id + 'approve'}
                                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {processing === req._id + 'approve' ? 'Approving...' : 'Make Pro'}
                              </Button>
                              <Button
                                onClick={() => handleResolveRequest(req._id, 'reject')}
                                disabled={processing === req._id + 'reject'}
                                className="text-xs px-3 py-1 bg-red-400 hover:bg-red-500 text-gray-800"
                              >
                                {processing === req._id + 'reject' ? 'Rejecting...' : 'Reject'}
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {req.status === 'approved' ? 'Approved' : req.status === 'rejected' ? 'Rejected' : 'Handled'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {requests.length === 0 && (
                  <div className="text-center text-gray-500 py-6">No Pro requests yet.</div>
                )}
              </div>
            </Card>
          )}
        </ServiceErrorBoundary>
      )}

      {/* --- REPORTS TAB --- */}
      {activeTab === 'reports' && (
        <ServiceErrorBoundary serviceName="Reports System" fallback={<ReportsFallback />}>
          {serviceStatus.reports === 'loading' && <ServiceLoading serviceName="Reports System" />}
          {serviceStatus.reports === 'error' && <ReportsFallback />}
          {serviceStatus.reports === 'success' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Resource Reports</h2>
                <Button onClick={loadReports} className="bg-indigo-600 text-white">
                  🔄 Refresh
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Resource</th>
                      <th className="text-left py-2">Reporter</th>
                      <th className="text-left py-2">Reason</th>
                      <th className="text-left py-2">Reported At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b">
                        <td className="py-3 truncate max-w-xs" title={report.resource_name}>
                          {report.resource_name}
                        </td>
                        <td className="py-3">{report.reporter_email}</td>
                        <td className="py-3 max-w-md whitespace-pre-wrap">{report.reason}</td>
                        <td className="py-3">{new Date(report.reported_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reports.length === 0 && (
                  <div className="text-center text-gray-500 py-6">No reports yet.</div>
                )}
              </div>
            </Card>
          )}
        </ServiceErrorBoundary>
      )}
    </div>
  );
};

export default AdminDashboard;
