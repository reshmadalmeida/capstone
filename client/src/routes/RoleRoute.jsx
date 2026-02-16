import { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import AccessDeniedModal from '../shared/common/AccessDenied';


export default function RoleRoute({ allowed, children }) {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  
  // allowed can be a single role string or array of roles
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  
  if (!can(allowedRoles)) {
    return (
      <AccessDeniedModal
        open={open}
        onClose={() => {
          setOpen(false);
          navigate(-1);
        }}
        onGoBack={() => {
          setOpen(false);
          navigate(-1);
        }}
        reason="You don't have permission to access this resource."
      />
    );
  }


  return children;
}