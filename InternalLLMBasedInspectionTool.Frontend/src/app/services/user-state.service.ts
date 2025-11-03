import { Injectable, signal } from '@angular/core';
import { User } from '../models/users/user.model';

const USER_STORAGE_KEY = 'app_user';

@Injectable({
    providedIn: 'root'
})
export class UserStateService {
    private readonly _user = signal<User | null>(this.loadUserFromStorage());
    
    public readonly user = this._user.asReadonly();

    constructor() {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): User | null {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                return JSON.parse(storedUser) as User;
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
        }
        return null;
    }

    public setUser(user: User): void {
        this._user.set(user);
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user to storage:', error);
        }
    }

    public clearUser(): void {
        this._user.set(null);
        try {
            localStorage.removeItem(USER_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing user from storage:', error);
        }
    }

    public getUserId(): string | null {
        return this._user()?.id || null;
    }
}

