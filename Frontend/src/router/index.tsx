import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts & Protection
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { RoleIndexRedirect } from '../components/common/RoleIndexRedirect';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Shared / User Pages
import { ProfilePage } from '../pages/shared/ProfilePage';
import { UserUpgradesPage } from '../pages/user/UserUpgradesPage';
import { PublicCollegesPage } from '../pages/user/PublicCollegesPage';
import { PublicCompaniesPage } from '../pages/user/PublicCompaniesPage';
import { UnauthorizedPage } from '../pages/shared/UnauthorizedPage';
import { NotFoundPage } from '../pages/shared/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCollegesPage } from '../pages/admin/AdminCollegesPage';
import { AdminCompaniesPage } from '../pages/admin/AdminCompaniesPage';
import { AdminUpgradesPage } from '../pages/admin/AdminUpgradesPage';

// College Pages
import { CollegeDashboardPage } from '../pages/college/CollegeDashboardPage';
import { CollegeProfilePage } from '../pages/college/CollegeProfilePage';
import { CollegeStudentsPage } from '../pages/college/CollegeStudentsPage';
import { CollegePendingRequestsPage } from '../pages/college/CollegePendingRequestsPage';
import { CollegeTemplatesPage } from '../pages/college/CollegeTemplatesPage';
import { CollegeEvaluationsPage } from '../pages/college/CollegeEvaluationsPage';

// Company Pages
import { CompanyDashboardPage } from '../pages/company/CompanyDashboardPage';
import { CompanyTraineesPage } from '../pages/company/CompanyTraineesPage';
import { CompanyTemplatesPage } from '../pages/company/CompanyTemplatesPage';
import { CompanyEvaluationsPage } from '../pages/company/CompanyEvaluationsPage';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentCollegePage } from '../pages/student/StudentCollegePage';
import { StudentReportsPage } from '../pages/student/StudentReportsPage';

import { enRoles } from '../types/enums';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Protected App Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <RoleIndexRedirect /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/user/upgrades', element: <UserUpgradesPage /> },
          { path: '/user/colleges', element: <PublicCollegesPage /> },
          { path: '/user/companies', element: <PublicCompaniesPage /> },

          // SuperAdmin Routes
          {
            element: <ProtectedRoute allowedRoles={[enRoles.SuperAdmin]} />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/colleges', element: <AdminCollegesPage /> },
              { path: '/admin/companies', element: <AdminCompaniesPage /> },
              { path: '/admin/upgrades', element: <AdminUpgradesPage /> },
            ],
          },

          // CollegeRep Routes
          {
            element: <ProtectedRoute allowedRoles={[enRoles.CollegeRep]} />,
            children: [
              { path: '/college', element: <CollegeDashboardPage /> },
              { path: '/college/profile', element: <CollegeProfilePage /> },
              { path: '/college/students', element: <CollegeStudentsPage /> },
              { path: '/college/pending-requests', element: <CollegePendingRequestsPage /> },
              { path: '/college/templates', element: <CollegeTemplatesPage /> },
              { path: '/college/evaluations', element: <CollegeEvaluationsPage /> },
            ],
          },

          // CompanyRep Routes
          {
            element: <ProtectedRoute allowedRoles={[enRoles.CompanyRep]} />,
            children: [
              { path: '/company', element: <CompanyDashboardPage /> },
              { path: '/company/trainees', element: <CompanyTraineesPage /> },
              { path: '/company/templates', element: <CompanyTemplatesPage /> },
              { path: '/company/evaluations', element: <CompanyEvaluationsPage /> },
            ],
          },

          // Student Routes
          {
            element: <ProtectedRoute allowedRoles={[enRoles.Student]} />,
            children: [
              { path: '/student', element: <StudentDashboardPage /> },
              { path: '/student/college', element: <StudentCollegePage /> },
              { path: '/student/reports', element: <StudentReportsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Fallbacks
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
