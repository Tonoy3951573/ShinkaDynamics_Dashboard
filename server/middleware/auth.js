import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    
    // We expect the token to contain user id, organization_id, and role
    req.user = decoded;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_user')) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

export const requireSuperUser = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_user') {
    return res.status(403).json({ error: 'Super User privileges required' });
  }
  next();
};

export const enforceTenantScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  if (req.user.role === 'super_user') {
    // Allows super-user to bypass or impersonate other organizations via query params or X-Tenant-ID header
    const targetOrgId = req.query.orgId || req.headers['x-tenant-id'];
    req.tenantId = targetOrgId || req.user.organization_id;
  } else {
    req.tenantId = req.user.organization_id;
  }
  next();
};
