import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { DRAWER_WIDTH, ROLE_NAMES } from '../app/constants';



export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getAccessibleModules } = usePermissions();

  if (!user) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  // Menu items with required roles
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
    //   icon: <DashboardIcon />,
      roles: ['underwriter', 'admin', 'claims_adjuster', 'reinsurance_analyst']
    },
    {
      label: 'Policies',
      path: '/policies',
    //   icon: <PolicyIcon />,
      roles: ['underwriter', 'admin']
    },
    {
      label: 'Claims',
      path: '/claims',
    //   icon: <ClaimsIcon />,
      roles: ['claims_adjuster', 'admin']
    },
    {
      label: 'Reinsurance',
      path: '/reinsurance',
    //   icon: <ReinsuranceIcon />,
      roles: ['reinsurance_analyst', 'admin'],
      submenu: [
        { label: 'Treaties', path: '/reinsurance/treaties' }
      ]
    }
  ];

  const adminItems = [
    {
      label: 'Administration',
      section: true,
      roles: ['admin']
    },
    {
      label: 'Users',
      path: '/admin/users',
    //   icon: <PeopleIcon />,
      roles: ['admin']
    }
   
  ];

  const userRole = user.role?.toLowerCase() || '';

  // Filter menu items based on user role
  const visibleItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  const visibleAdminItems = adminItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <Drawer
      sx={{
         width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          mt: 8
        }
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Logged in as
        </Typography>
  
        <Typography variant="caption" sx={{ color: 'primary.main' }}>
          {ROLE_NAMES[userRole] || userRole}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {visibleItems.map((item) => (
          <React.Fragment key={item.path || item.label}>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light'
                  }
                }
              }}
            >
              {/* <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon> */}
              <ListItemText primary={item.label} />
            </ListItemButton>
            
            {item.submenu && item.submenu.map(subitem => (
              <ListItemButton
                key={subitem.path}
                selected={location.pathname === subitem.path}
                onClick={() => navigate(subitem.path)}
                sx={{
                  pl: 4,
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light'
                  }
                }}
              >
                <ListItemText primary={subitem.label} />
              </ListItemButton>
            ))}
          </React.Fragment>
        ))}
      </List>

      {visibleAdminItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <List sx={{ px: 1 }}>
            {visibleAdminItems.map((item) => (
              item.section ? (
                <Typography
                  key={item.label}
                  variant="caption"
                  sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold' }}
                >
                  {item.label}
                </Typography>
              ) : (
                <ListItemButton
                  key={item.path}
                  selected={isActive(item.path)}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'error.light',
                      '&:hover': {
                        backgroundColor: 'error.light'
                      }
                    }
                  }}
                >
                  {/* <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon> */}
                  <ListItemText primary={item.label} />
                </ListItemButton>
              )
            ))}
          </List>
        </>
      )}
    </Drawer>
  );
}

