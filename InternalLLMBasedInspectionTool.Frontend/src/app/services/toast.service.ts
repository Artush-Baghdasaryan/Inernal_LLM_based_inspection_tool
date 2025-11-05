import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private readonly _toasts = signal<ToastMessage[]>([]);
    public readonly toasts = this._toasts.asReadonly();

    public show(
        message: string,
        type: 'success' | 'error' | 'info' = 'success',
        duration: number = 3000,
    ): void {
        const toast: ToastMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            message,
            type,
        };

        this._toasts.update((toasts) => [...toasts, toast]);

        setTimeout(() => {
            this.remove(toast.id);
        }, duration);
    }

    public remove(id: string): void {
        this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
    }
}
