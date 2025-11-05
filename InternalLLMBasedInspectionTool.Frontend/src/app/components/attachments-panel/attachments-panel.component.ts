import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodeAttachmentMetadata } from '../../models/code-attachments/code-attachment-metadata.model';
import { CodeAttachmentsService } from '../../services/code-attachments.service';
import { SvgIcons } from '../../shared/svg-icons';

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
    private readonly sanitizer = inject(DomSanitizer);

    public isCollapsed = true;
    public readonly removeIcon: SafeHtml;
    public chevronIcon!: SafeHtml;
    public hoveredAttachmentId: string | null = null;

    constructor() {
        this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.remove(16, 16),
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

    public onRemoveClick(
        event: Event,
        attachment: CodeAttachmentMetadata,
    ): void {
        event.stopPropagation();

        if (!confirm(`Are you sure you want to delete "${attachment.name}"?`)) {
            return;
        }

        this.codeAttachmentsService.delete(attachment.id).subscribe({
            next: () => {
                this.onAttachmentsChanged.emit();
            },
            error: (error) => {
                console.error('Error deleting attachment:', error);
                alert('Failed to delete attachment. Please try again.');
            },
        });
    }

    public onItemMouseEnter(attachmentId: string): void {
        this.hoveredAttachmentId = attachmentId;
    }

    public onItemMouseLeave(): void {
        this.hoveredAttachmentId = null;
    }
}
