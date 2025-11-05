import {
    Component,
    input,
    output,
    signal,
    OnInit,
    OnDestroy,
    effect,
    HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SvgIcons } from '../../shared/svg-icons';

@Component({
    selector: 'app-prompt-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './prompt-modal.component.html',
    styleUrl: './prompt-modal.component.scss',
})
export class PromptModalComponent implements OnInit, OnDestroy {
    public systemPrompt = input<string>('');
    public userPrompt = input<string>('');
    public isOpen = input<boolean>(false);
    public onClose = input<(() => void) | null>(null);
    public onAnalyse = output<string>();

    public readonly closeIcon: SafeHtml;
    public isReadonly = signal<boolean>(true);
    public editableSystemPrompt = signal<string>('');

    constructor(private readonly sanitizer: DomSanitizer) {
        this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.close(24, 24),
        );

        effect(() => {
            const systemPromptValue = this.systemPrompt();
            const isOpenValue = this.isOpen();
            if (isOpenValue && systemPromptValue) {
                this.editableSystemPrompt.set(systemPromptValue);
                this.isReadonly.set(true);
            }
        });
    }

    public ngOnInit(): void {
        this.editableSystemPrompt.set(this.systemPrompt());
    }

    public closeModal(): void {
        const closeFn = this.onClose();
        if (closeFn) {
            closeFn();
        }
    }

    public onBackdropClick(event: MouseEvent): void {
        if (
            (event.target as HTMLElement).classList.contains('modal-backdrop')
        ) {
            this.closeModal();
        }
    }

    public onAnalyseClick(): void {
        this.onAnalyse.emit(this.editableSystemPrompt());
    }

    @HostListener('document:keydown.escape', ['$event'])
    public onEscapeKey(event: Event): void {
        if (this.isOpen()) {
            this.closeModal();
        }
    }

    public ngOnDestroy(): void {
        // Cleanup if needed
    }
}
