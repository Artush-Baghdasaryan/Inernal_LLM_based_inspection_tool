import {
    Component,
    signal,
    viewChild,
    inject,
    OnInit,
    effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';
import { AttachmentsPanelComponent } from '../../components/attachments-panel/attachments-panel.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { CodeAttachmentsService } from '../../services/code-attachments.service';
import { UserStateService } from '../../services/user-state.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CodeAttachmentMetadata } from '../../models/code-attachments/code-attachment-metadata.model';
import { PromptSettings } from '../../models/users/prompt-settings.model';
import { SaveUserRequest } from '../../models/users/save-user-request.model';
import { Analysis } from '../../models/analysis/analysis.model';
import { IssuesDisplayComponent } from '../../components/issues-display/issues-display.component';
import { DiffModalComponent } from '../../components/diff-modal/diff-modal.component';
import { SvgIcons } from '../../shared/svg-icons';
import { FixCodeResult } from '../../models/code-attachments/fix-code-result.model';
import { SaveCodeAttachmentRequest } from '../../models/code-attachments/save-code-attachment-request.model';
import { calculateUnifiedDiff } from '../../utils/diff-calculator.util';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        CodeEditorComponent,
        AttachmentsPanelComponent,
        ToastComponent,
        IssuesDisplayComponent,
        DiffModalComponent,
    ],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit {
    public showIssuesModal = signal<boolean>(false);
    public showPromptSettingsModal = signal<boolean>(false);
    public showFixDiffModal = signal<boolean>(false);
    public attachments = signal<CodeAttachmentMetadata[]>([]);
    public currentAttachmentId = signal<string | null>(null);
    public currentEditedData = signal<string>('');
    public fixedCode = signal<string>('');
    public promptSettings = signal<PromptSettings | null>(null);
    public originalPromptSettings = signal<PromptSettings | null>(null);
    public analysisResult = signal<Analysis | null>(null);
    public readonly closeIcon: SafeHtml;
    public lastFixedIssueIndices = signal<number[]>([]);

    public readonly codeEditor = viewChild(CodeEditorComponent);
    private readonly codeAttachmentsService = inject(CodeAttachmentsService);
    private readonly userStateService = inject(UserStateService);
    private readonly apiService = inject(ApiService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);

    constructor(private readonly sanitizer: DomSanitizer) {
        this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.close(24, 24),
        );

        effect(() => {
            const user = this.userStateService.user();
            if (user) {
                this.loadAttachments(user.id);
            }
        });
    }

    public async ngOnInit(): Promise<void> {
        const user = this.userStateService.user();
        if (!user || !user.id) {
            this.router.navigate(['/']);
            return;
        }

        await this.loadAttachments(user.id);
    }

    public onIssuesClick(): void {
        const attachmentId = this.currentAttachmentId();
        if (!attachmentId) {
            this.toastService.show(
                'Please select a file first',
                'info',
            );
            return;
        }

        this.codeAttachmentsService.getAnalysisByAttachmentId(attachmentId).subscribe({
            next: (analysis) => {
                if (analysis) {
                    this.analysisResult.set(analysis);
                    this.showIssuesModal.set(true);
                } else {
                    this.toastService.show(
                        'No analysis found for this file. Please run analysis first.',
                        'info',
                    );
                }
            },
            error: (error) => {
                console.error('Error loading analysis:', error);
                this.toastService.show(
                    'Failed to load analysis',
                    'error',
                );
            },
        });
    }

    public closeIssuesModal(): void {
        this.showIssuesModal.set(false);
    }

    public onPromptSettingsClick(): void {
        const user = this.userStateService.user();
        if (!user) {
            return;
        }
        this.originalPromptSettings.set(
            JSON.parse(JSON.stringify(user.promptSettings)),
        );
        this.promptSettings.set(
            JSON.parse(JSON.stringify(user.promptSettings)),
        );
        this.showPromptSettingsModal.set(true);
    }

    public closePromptSettingsModal(): void {
        this.showPromptSettingsModal.set(false);
        this.promptSettings.set(null);
        this.originalPromptSettings.set(null);
    }

    public hasPromptSettingsChanges(): boolean {
        const current = this.promptSettings();
        const original = this.originalPromptSettings();
        if (!current || !original) {
            return false;
        }
        return JSON.stringify(current) !== JSON.stringify(original);
    }

    public async savePromptSettings(): Promise<void> {
        const user = this.userStateService.user();
        const settings = this.promptSettings();
        if (!user || !settings) {
            return;
        }

        const request: SaveUserRequest = {
            nickname: user.nickname,
            promptSettings: settings,
        };

        this.apiService.updateUser(user.id, request).subscribe({
            next: (updatedUser) => {
                this.userStateService.setUser(updatedUser);
                this.originalPromptSettings.set(
                    JSON.parse(JSON.stringify(updatedUser.promptSettings)),
                );
                this.promptSettings.set(
                    JSON.parse(JSON.stringify(updatedUser.promptSettings)),
                );
                this.toastService.show(
                    'Prompt settings saved successfully',
                    'success',
                );
            },
            error: (error) => {
                console.error('Error saving prompt settings:', error);
                this.toastService.show(
                    'Failed to save prompt settings',
                    'error',
                );
            },
        });
    }

    public loadAttachments(userId: string): void {
        this.codeAttachmentsService.getMetadataByUserId(userId).subscribe({
            next: (attachments) => {
                this.attachments.set(attachments);
            },
            error: (error) => {
                console.error('Error loading attachments:', error);
            },
        });
    }

    public onAttachmentsChanged(): void {
        const user = this.userStateService.user();
        if (user) {
            this.loadAttachments(user.id);
        }
    }

    public onAttachmentCreated(): void {
        this.onAttachmentsChanged();
        const editor = this.codeEditor();
        if (editor && editor.currentAttachmentId()) {
            this.currentAttachmentId.set(editor.currentAttachmentId()!);
        }
    }

    public onAnalysisCompleted(analysis: Analysis): void {
        this.analysisResult.set(analysis);
        this.showIssuesModal.set(true);
    }

    public onAttachmentSelected(attachment: CodeAttachmentMetadata): void {
        this.codeAttachmentsService.getById(attachment.id).subscribe({
            next: (fullAttachment) => {
                if (
                    !fullAttachment.originalData ||
                    !fullAttachment.editedData
                ) {
                    console.error('Attachment data is incomplete');
                    return;
                }

                let editor = this.codeEditor();
                if (!editor) {
                    setTimeout(() => {
                        editor = this.codeEditor();
                        if (editor) {
                            editor.loadAttachment(fullAttachment);
                            this.currentAttachmentId.set(attachment.id);
                        } else {
                            console.error(
                                'Code editor component is not available',
                            );
                        }
                    }, 100);
                    return;
                }

                editor.loadAttachment(fullAttachment);
                this.currentAttachmentId.set(attachment.id);
                this.currentEditedData.set(fullAttachment.editedData);
            },
            error: (error) => {
                console.error('Error loading attachment data:', error);
            },
        });
    }

    public onFixCodeResult(result: FixCodeResult): void {
        const editor = this.codeEditor();
        if (!editor) {
            console.error('Code editor component is not available');
            return;
        }

        const currentEditedData = editor.getEditedData();
        const codeLanguage = editor.getCodeLanguage();

        this.currentEditedData.set(currentEditedData);
        this.fixedCode.set(result.fixedCode);
        this.showFixDiffModal.set(true);
        this.showIssuesModal.set(false);
    }

    public onIssuesFixed(issueIndices: number[]): void {
        // Store indices for marking as fixed after accepting changes
        this.lastFixedIssueIndices.set(issueIndices);
    }

    public onAcceptFixedChanges(fixedCode: string): void {
        const editor = this.codeEditor();
        const attachmentId = this.currentAttachmentId();
        const user = this.userStateService.user();

        if (!editor || !attachmentId || !user) {
            console.error('Missing required data for accepting changes');
            this.toastService.show('Failed to accept changes', 'error');
            return;
        }

        // Update editor content
        editor.updateEditedData(fixedCode);

        // Get attachment data
        this.codeAttachmentsService.getById(attachmentId).subscribe({
            next: (attachment) => {
                if (!attachment.originalData || !attachment.editedData) {
                    console.error('Attachment data is incomplete');
                    this.toastService.show('Failed to accept changes', 'error');
                    return;
                }

                // Calculate diff hunks
                const originalData = attachment.originalData;
                const codeLanguage = attachment.codeLanguage;
                
                if (!originalData || !codeLanguage) {
                    console.error('Attachment data is incomplete');
                    this.toastService.show('Failed to accept changes', 'error');
                    return;
                }

                calculateUnifiedDiff(originalData, fixedCode).then((diffHunks) => {
                    const updateRequest: SaveCodeAttachmentRequest = {
                        userId: user.id,
                        name: attachment.name,
                        mimeType: attachment.mimeType,
                        codeLanguage: codeLanguage,
                        originalData: originalData,
                        editedData: fixedCode,
                        diffHunks: diffHunks,
                    };

                    this.codeAttachmentsService.update(attachmentId, updateRequest).subscribe({
                        next: () => {
                            // Mark issues as fixed after saving changes
                            const fixedIndices = this.lastFixedIssueIndices();
                            if (fixedIndices.length > 0) {
                                this.codeAttachmentsService.markIssuesAsFixed(attachmentId, fixedIndices).subscribe({
                                    next: () => {
                                        // Reload analysis to reflect fixed issues
                                        setTimeout(() => {
                                            this.codeAttachmentsService.getAnalysisByAttachmentId(attachmentId).subscribe({
                                                next: (analysis) => {
                                                    if (analysis) {
                                                        this.analysisResult.set(analysis);
                                                    }
                                                },
                                                error: (error) => {
                                                    console.error('Failed to reload analysis:', error);
                                                }
                                            });
                                        }, 500);
                                    },
                                    error: (error) => {
                                        console.error('Failed to mark issues as fixed:', error);
                                    }
                                });
                            }

                            this.toastService.show('Changes accepted and saved', 'success');
                            this.showFixDiffModal.set(false);
                            this.currentEditedData.set(fixedCode);
                            this.lastFixedIssueIndices.set([]);
                        },
                        error: (error) => {
                            console.error('Failed to save changes:', error);
                            this.toastService.show('Failed to save changes', 'error');
                        },
                    });
                });
            },
            error: (error) => {
                console.error('Failed to load attachment:', error);
                this.toastService.show('Failed to accept changes', 'error');
            },
        });
    }

    public closeFixDiffModal(): void {
        this.showFixDiffModal.set(false);
    }
}
