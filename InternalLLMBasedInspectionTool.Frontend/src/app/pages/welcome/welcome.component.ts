import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UserStateService } from '../../services/user-state.service';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
    private readonly router = inject(Router);
    private readonly apiService = inject(ApiService);
    private readonly userStateService = inject(UserStateService);

    public nickname: string = '';
    public isLoading: boolean = false;
    public error: string | null = null;

    public onStart(): void {
        if (!this.nickname.trim()) {
            this.error = 'Please enter a nickname';
            return;
        }

        this.isLoading = true;
        this.error = null;

        this.apiService
            .createUser({ nickname: this.nickname.trim() })
            .subscribe({
                next: (user) => {
                    if (user && user.id) {
                        this.userStateService.setUser(user);
                        this.router.navigate(['/editor']);
                    } else {
                        this.error = 'Failed to create user. Please try again.';
                        this.isLoading = false;
                    }
                },
                error: (error) => {
                    console.error('Error creating user:', error);
                    this.error = 'Error creating user. Please try again.';
                    this.isLoading = false;
                },
            });
    }
}
