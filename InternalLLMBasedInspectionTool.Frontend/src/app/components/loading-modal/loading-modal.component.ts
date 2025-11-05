import { Component, input, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loading-modal.component.html',
    styleUrl: './loading-modal.component.scss',
})
export class LoadingModalComponent implements OnDestroy {
    public isOpen = input<boolean>(false);
    public message = input<string>('Loading...');

    public progress = signal<number>(0);
    private progressInterval: ReturnType<typeof setInterval> | null = null;
    private completionTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        effect(() => {
            const isOpenValue = this.isOpen();
            if (isOpenValue) {
                this.startProgress();
            } else {
                this.stopProgress();
                this.progress.set(0);
            }
        });
    }

    private startProgress(): void {
        this.progress.set(0);
        
        // Slowly increase progress to 99%
        this.progressInterval = setInterval(() => {
            this.progress.update((current) => {
                if (current >= 99) {
                    return 99; // Stuck at 99%
                }
                // Gradually increase, slowing down as we approach 99%
                const increment = current < 50 ? 1.5 : current < 80 ? 0.8 : current < 95 ? 0.4 : 0.2;
                return Math.min(current + increment, 99);
            });
        }, 200); // Update every 200ms for slower, smoother animation
    }

    private stopProgress(): void {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    public completeProgress(): void {
        // Complete progress to 100% when result is received
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // Animate to 100%
        this.progress.set(100);
        
        // Close modal after a short delay
        this.completionTimeout = setTimeout(() => {
            this.progress.set(0);
        }, 500);
    }

    public ngOnDestroy(): void {
        this.stopProgress();
        if (this.completionTimeout) {
            clearTimeout(this.completionTimeout);
        }
    }
}

