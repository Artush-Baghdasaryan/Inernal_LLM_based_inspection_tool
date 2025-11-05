import { Component, input, output, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodeAttachmentMetadata } from '../../models/code-attachments/code-attachment-metadata.model';
import { CodeAttachmentsService } from '../../services/code-attachments.service';
import { SvgIcons } from '../../shared/svg-icons';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-attachments-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './attachments-panel.component.html',
    styleUrl: './attachments-panel.component.scss',
})
export class AttachmentsPanelComponent {
    public readonly attachments = input.required<CodeAttachmentMetadata[]>();
    public readonly currentAttachmentId = input<string | null>(null);
    public readonly onAttachmentSelected = output<CodeAttachmentMetadata>();
    public readonly onAttachmentsChanged = output<void>();

    private readonly codeAttachmentsService = inject(CodeAttachmentsService);
    private readonly toastService = inject(ToastService);
    private readonly sanitizer = inject(DomSanitizer);

    public isCollapsed = true;
    public readonly kebabMenuIcon: SafeHtml;
    public chevronIcon!: SafeHtml;
    public hoveredAttachmentId: string | null = null;
    public openMenuId: string | null = null;

    constructor() {
        this.kebabMenuIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.kebabMenu(16, 16),
        );
        this.updateChevronIcon();
    }

    private updateChevronIcon(): void {
        this.chevronIcon = this.sanitizer.bypassSecurityTrustHtml(
            this.isCollapsed
                ? SvgIcons.chevronRight(16, 16)
                : SvgIcons.chevronDown(16, 16),
        );
    }

    public toggleCollapse(): void {
        this.isCollapsed = !this.isCollapsed;
        this.updateChevronIcon();
    }

    public onAttachmentClick(attachment: CodeAttachmentMetadata): void {
        this.onAttachmentSelected.emit(attachment);
    }

    public onKebabMenuClick(
        event: Event,
        attachment: CodeAttachmentMetadata,
    ): void {
        event.stopPropagation();
        
        if (this.openMenuId === attachment.id) {
            this.openMenuId = null;
        } else {
            this.openMenuId = attachment.id;
        }
    }

    public onDownloadClick(
        event: Event,
        attachment: CodeAttachmentMetadata,
    ): void {
        event.stopPropagation();
        this.openMenuId = null;

        this.codeAttachmentsService.download(attachment.id, attachment.name).subscribe({
            next: () => {
                this.toastService.show('File downloaded successfully', 'success');
            },
            error: (error) => {
                console.error('Error downloading attachment:', error);
                this.toastService.show('Failed to download file', 'error');
            },
        });
    }

    public onRemoveClick(
        event: Event,
        attachment: CodeAttachmentMetadata,
    ): void {
        event.stopPropagation();
        this.openMenuId = null;

        if (!confirm(`Are you sure you want to delete "${attachment.name}"?`)) {
            return;
        }

        this.codeAttachmentsService.delete(attachment.id).subscribe({
            next: () => {
                this.onAttachmentsChanged.emit();
                this.toastService.show('File deleted successfully', 'success');
            },
            error: (error) => {
                console.error('Error deleting attachment:', error);
                this.toastService.show('Failed to delete file', 'error');
            },
        });
    }

    public onItemMouseEnter(attachmentId: string): void {
        this.hoveredAttachmentId = attachmentId;
    }

    public onItemMouseLeave(): void {
        this.hoveredAttachmentId = null;
    }

    public isMenuOpen(attachmentId: string): boolean {
        return this.openMenuId === attachmentId;
    }

    @HostListener('document:click', ['$event'])
    public onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.kebab-menu-container')) {
            this.openMenuId = null;
        }
    }
}
