import {
    Component,
    input,
    output,
    signal,
    inject,
    HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Analysis } from '../../models/analysis/analysis.model';
import { Issue, IssueLevel, IssueSeverity, IssueCategory } from '../../models/analysis/issue.model';
import { SvgIcons } from '../../shared/svg-icons';
import { CodeAttachmentsService } from '../../services/code-attachments.service';
import { ToastService } from '../../services/toast.service';
import { FixCodeRequest } from '../../models/code-attachments/fix-code-request.model';
import { FixCodeResult } from '../../models/code-attachments/fix-code-result.model';
import { LoadingModalComponent } from '../loading-modal/loading-modal.component';

@Component({
    selector: 'app-issues-display',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingModalComponent],
    templateUrl: './issues-display.component.html',
    styleUrl: './issues-display.component.scss',
})
export class IssuesDisplayComponent {
    public analysis = input<Analysis>();
    public attachmentId = input<string>();
    public currentEditedData = input<string>();
    public codeLanguage = input<string>('typescript');
    public isOpen = input<boolean>(false);
    public onClose = input<(() => void) | null>(null);
    public onFixCodeResult = output<FixCodeResult>();
    public onIssuesFixed = output<number[]>();

    public readonly closeIcon: SafeHtml;
    public readonly selectedIssues = signal<Set<number>>(new Set());
    public readonly isFixing = signal<boolean>(false);
    public readonly activeTab = signal<'issues' | 'fixed'>('issues');

    private readonly codeAttachmentsService = inject(CodeAttachmentsService);
    private readonly toastService = inject(ToastService);

    constructor(private readonly sanitizer: DomSanitizer) {
        this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.close(24, 24),
        );
    }

    public get issues(): Issue[] {
        const allIssues = this.analysis()?.issues || [];
        if (this.activeTab() === 'fixed') {
            return allIssues.filter(issue => issue.isFixed === true);
        }
        return allIssues.filter(issue => issue.isFixed !== true);
    }

    public get allIssues(): Issue[] {
        return this.analysis()?.issues || [];
    }

    public switchTab(tab: 'issues' | 'fixed'): void {
        this.activeTab.set(tab);
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

    @HostListener('document:keydown.escape', ['$event'])
    public onEscapeKey(event: Event): void {
        if (this.isOpen()) {
            this.closeModal();
        }
    }

    public getIssueBorderColor(issue: Issue): string {
        if (issue.level === IssueLevel.Error) {
            return '#ef4444';
        } else if (issue.level === IssueLevel.Warning) {
            return '#f59e0b';
        } else {
            return '#3b82f6';
        }
    }

    public getIssueLevelLabel(level: IssueLevel): string {
        switch (level) {
            case 2:
                return 'Error';
            case 1:
                return 'Warning';
            case 0:
                return 'Info';
            default:
                return 'Unknown';
        }
    }

    public getIssueSeverityLabel(severity: IssueSeverity): string {
        switch (severity) {
            case 2:
                return 'Critical';
            case 1:
                return 'Important';
            case 0:
                return 'Minor';
            default:
                return 'Unknown';
        }
    }

    public getIssueCategoryLabel(category: IssueCategory): string {
        switch (category) {
            case 0:
                return 'Readability';
            case 1:
                return 'Performance';
            case 2:
                return 'Correctness';
            case 3:
                return 'Style';
            case 4:
                return 'Maintainability';
            case 5:
                return 'Security';
            default:
                return 'Unknown';
        }
    }

    public getConfidencePercentage(confidence: number): string {
        return `${Math.round(confidence * 100)}%`;
    }

    public isIssueSelected(index: number): boolean {
        // Get the actual index in allIssues for the filtered issue
        const allIssues = this.allIssues;
        const filteredIssues = this.issues;
        const filteredIssue = filteredIssues[index];
        if (!filteredIssue) {
            return false;
        }
        const actualIndex = allIssues.findIndex(issue => 
            issue.title === filteredIssue.title &&
            issue.description === filteredIssue.description &&
            issue.level === filteredIssue.level
        );
        return actualIndex !== -1 && this.selectedIssues().has(actualIndex);
    }

    public toggleIssueSelection(index: number): void {
        // Get the actual index in allIssues for the filtered issue
        const allIssues = this.allIssues;
        const filteredIssues = this.issues;
        const filteredIssue = filteredIssues[index];
        if (!filteredIssue) {
            return;
        }
        const actualIndex = allIssues.findIndex(issue => 
            issue.title === filteredIssue.title &&
            issue.description === filteredIssue.description &&
            issue.level === filteredIssue.level
        );
        
        if (actualIndex === -1) {
            return;
        }

        const current = new Set(this.selectedIssues());
        if (current.has(actualIndex)) {
            current.delete(actualIndex);
        } else {
            current.add(actualIndex);
        }
        this.selectedIssues.set(current);
    }

    public getSelectedIssuesCount(): number {
        return this.selectedIssues().size;
    }

    public getUnfixedIssuesCount(): number {
        return this.allIssues.filter(issue => issue.isFixed !== true).length;
    }

    public getFixedIssuesCount(): number {
        return this.allIssues.filter(issue => issue.isFixed === true).length;
    }

    public onFixIssuesClick(): void {
        const selectedIndices = Array.from(this.selectedIssues());
        const attachmentId = this.attachmentId();
        
        if (selectedIndices.length === 0 || !attachmentId) {
            this.toastService.show('Please select issues to fix', 'error');
            return;
        }

        this.isFixing.set(true);

        const request: FixCodeRequest = {
            attachmentId: attachmentId,
            issueIndices: selectedIndices
        };

        this.codeAttachmentsService.fixCode(request).subscribe({
            next: (result) => {
                // Delay closing to allow progress to complete
                setTimeout(() => {
                    this.isFixing.set(false);
                    this.onFixCodeResult.emit(result);
                    this.onIssuesFixed.emit(selectedIndices);
                    this.toastService.show('Code fixed successfully', 'success');
                }, 600);
            },
            error: (error) => {
                console.error('Failed to fix code:', error);
                this.isFixing.set(false);
                this.toastService.show('Failed to fix code', 'error');
            }
        });
    }

}

