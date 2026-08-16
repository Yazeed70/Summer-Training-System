import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { enRoles } from '../../types/enums';

export const RoleIndexRedirect: React.FC = () => {
  const { user } = useAuthStore();

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case enRoles.SuperAdmin:
      return <Navigate to="/admin" replace />;
    case enRoles.CollegeRep:
      return <Navigate to="/college" replace />;
    case enRoles.CompanyRep:
      return <Navigate to="/company" replace />;
    case enRoles.Student:
      return <Navigate to="/student" replace />;
    case enRoles.BasicUser:
      return <Navigate to="/profile" replace />;
    default:
      return <Navigate to="/profile" replace />;
  }
};
