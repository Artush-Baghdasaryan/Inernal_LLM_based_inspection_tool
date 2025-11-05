import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserStateService } from '../services/user-state.service';

export const authGuard: CanActivateFn = (route, state) => {
    const userStateService = inject(UserStateService);
    const router = inject(Router);

    const user = userStateService.user();
    if (!user || !user.id) {
        router.navigate(['/']);
        return false;
    }

    return true;
};
