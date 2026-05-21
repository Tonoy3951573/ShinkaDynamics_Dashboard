export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('shinka-token');
  const tenantOverride = localStorage.getItem('shinka-tenant-override');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantOverride ? { 'X-Tenant-ID': tenantOverride } : {}),
    ...options.headers,
  };

  let url = `/api${endpoint}`;
  if (tenantOverride) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}orgId=${tenantOverride}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('shinka-token');
    localStorage.removeItem('shinka-tenant-override');
    window.dispatchEvent(new Event('auth-unauthorized'));
    // Error will be thrown below, handled by caller
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
};
