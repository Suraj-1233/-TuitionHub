import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['role'] || route.parent?.data['role'];
  const requiredRolesArray = Array.isArray(requiredRoles) 
    ? requiredRoles.map(r => r.toUpperCase()) 
    : [requiredRoles?.toUpperCase()];

  const userRole = authService.getRole()?.toUpperCase();

  console.log('[RoleGuard] route:', state.url, '| required:', requiredRolesArray, '| user:', userRole);

  if (!requiredRoles || requiredRolesArray.includes(userRole)) {
    return true;
  }

  console.warn(`[RoleGuard] Access denied for ${state.url}. Required: ${requiredRolesArray}, User: ${userRole}`);

  if (userRole === 'STUDENT') return router.createUrlTree(['/student/dashboard']);
  if (userRole === 'TEACHER') return router.createUrlTree(['/teacher/dashboard']);
  if (userRole === 'PARENT') return router.createUrlTree(['/parent/dashboard']);
  if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ORG_ADMIN') return router.createUrlTree(['/admin/dashboard']);

  return router.createUrlTree(['/auth/login']);
};
