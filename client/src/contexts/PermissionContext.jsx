import { createContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

export const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { user } = useAuth();

  // Check if user has required role(s)
  const can = (roles) => {
    if (!user || !user.role) return false;
    
    const userRole = String(user.role).toLowerCase();
    
    if (Array.isArray(roles)) {
      return roles.some(role => String(role).toLowerCase() === userRole);
    }
    return String(roles).toLowerCase() === userRole;
  };

  // Get all modules accessible to the user
  const getAccessibleModules = () => {
    if (!user || !user.role) return [];
    const { ROLE_MODULES } = require('../app/constants');
    return ROLE_MODULES[String(user.role).toLowerCase()] || [];
  };

  const value = useMemo(() => ({ can, user, getAccessibleModules }), [user]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}