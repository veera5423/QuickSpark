import { resilientRequest } from './axiosClient';

// Admin API with resilience patterns
class AdminAPI {
  // Get all users with error handling
  static async getAllUsers() {
    return resilientRequest({
      method: 'GET',
      url: '/api/admin/users'
    }, {
      maxRetries: 2,
      serviceName: 'User Management',
      fallbackData: { users: [] }
    });
  }

  // Toggle user status (admin/pro)
  static async toggleUserStatus(userId, field) {
    return resilientRequest({
      method: 'POST',
      url: `/api/admin/users/${userId}/toggle`,
      data: { field }
    }, {
      maxRetries: 1,
      serviceName: 'User Status Update'
    });
  }

  // Get all resources for admin
  static async getAllResources() {
    return resilientRequest({
      method: 'GET',
      url: '/api/admin/resources/all'
    }, {
      maxRetries: 2,
      serviceName: 'Resource Management',
      fallbackData: { resources: [] }
    });
  }

  // Verify a resource
  static async verifyResource(resourceId) {
    return resilientRequest({
      method: 'POST',
      url: `/api/admin/resources/${resourceId}/verify`
    }, {
      maxRetries: 1,
      serviceName: 'Resource Verification'
    });
  }

  // Delete a resource
  static async deleteResource(resourceId) {
    return resilientRequest({
      method: 'DELETE',
      url: `/api/admin/resources/${resourceId}`
    }, {
      maxRetries: 1,
      serviceName: 'Resource Deletion'
    });
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    return resilientRequest({
      method: 'GET',
      url: '/api/admin/dashboard-stats'
    }, {
      maxRetries: 2,
      serviceName: 'Dashboard Statistics',
      fallbackData: {
        total_users: 0,
        total_resources: 0,
        verified_resources: 0,
        unverified_resources: 0
      }
    });
  }

  // Get resource reports
  static async getResourceReports() {
    return resilientRequest({
      method: 'GET',
      url: '/api/admin/reports'
    }, {
      maxRetries: 2,
      serviceName: 'Reports System',
      fallbackData: { reports: [] }
    });
  }

  // Get Pro requests
  static async getProRequests() {
    return resilientRequest({
      method: 'GET',
      url: '/api/users/get-user-requests'
    }, {
      maxRetries: 2,
      serviceName: 'Pro Requests',
      fallbackData: { requests: [] }
    });
  }

  // Resolve Pro request
  static async resolveProRequest(requestId, action, notes = '') {
    return resilientRequest({
      method: 'POST',
      url: `/api/users/user-requests/${requestId}/resolve`,
      data: { action, notes }
    }, {
      maxRetries: 1,
      serviceName: 'Pro Request Resolution'
    });
  }

  // Health check for admin services
  static async healthCheck() {
    return resilientRequest({
      method: 'GET',
      url: '/api/admin/health'
    }, {
      maxRetries: 1,
      serviceName: 'Admin Health Check'
    });
  }
}

export default AdminAPI;