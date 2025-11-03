import { Component, signal, viewChild, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';
import { AttachmentsPanelComponent } from '../../components/attachments-panel/attachments-panel.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { CodeAttachmentsService } from '../../services/code-attachments.service';
import { UserStateService } from '../../services/user-state.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CodeAttachment } from '../../models/code-attachments/code-attachment.model';
import { CodeAttachmentMetadata } from '../../models/code-attachments/code-attachment-metadata.model';
import { PromptSettings } from '../../models/users/prompt-settings.model';
import { SaveUserRequest } from '../../models/users/save-user-request.model';
import { SvgIcons } from '../../shared/svg-icons';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, CodeEditorComponent, AttachmentsPanelComponent, ToastComponent],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {
    public showIssuesModal = signal<boolean>(false);
    public showPromptSettingsModal = signal<boolean>(false);
    public attachments = signal<CodeAttachmentMetadata[]>([]);
    public currentAttachmentId = signal<string | null>(null);
    public promptSettings = signal<PromptSettings | null>(null);
    public originalPromptSettings = signal<PromptSettings | null>(null);
    public readonly closeIcon: SafeHtml;
    
    private readonly codeEditor = viewChild(CodeEditorComponent);
    private readonly codeAttachmentsService = inject(CodeAttachmentsService);
    private readonly userStateService = inject(UserStateService);
    private readonly apiService = inject(ApiService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);

    constructor(private readonly sanitizer: DomSanitizer) {
        this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(SvgIcons.close(24, 24));

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
        this.showIssuesModal.set(true);
    }

    public closeIssuesModal(): void {
        this.showIssuesModal.set(false);
    }

    public onPromptSettingsClick(): void {
        const user = this.userStateService.user();
        if (!user) {
            return;
        }
        this.originalPromptSettings.set(JSON.parse(JSON.stringify(user.promptSettings)));
        this.promptSettings.set(JSON.parse(JSON.stringify(user.promptSettings)));
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
            promptSettings: settings
        };

        try {
            const updatedUser = await firstValueFrom(this.apiService.updateUser(user.id, request));
            this.userStateService.setUser(updatedUser);
            this.originalPromptSettings.set(JSON.parse(JSON.stringify(updatedUser.promptSettings)));
            this.promptSettings.set(JSON.parse(JSON.stringify(updatedUser.promptSettings)));
            this.toastService.show('Prompt settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving prompt settings:', error);
            this.toastService.show('Failed to save prompt settings', 'error');
        }
    }

    public async loadAttachments(userId: string): Promise<void> {
        try {
            const attachments = await firstValueFrom(this.codeAttachmentsService.getMetadataByUserId(userId));
            this.attachments.set(attachments);
        } catch (error) {
            console.error('Error loading attachments:', error);
        }
    }

    public async onAttachmentsChanged(): Promise<void> {
        const user = this.userStateService.user();
        if (user) {
            await this.loadAttachments(user.id);
        }
    }

    public async onAttachmentCreated(): Promise<void> {
        await this.onAttachmentsChanged();
        const editor = this.codeEditor();
        if (editor && editor.currentAttachmentId()) {
            this.currentAttachmentId.set(editor.currentAttachmentId()!);
        }
    }

    public async onAttachmentSelected(attachment: CodeAttachmentMetadata): Promise<void> {
        try {
            console.log('Loading attachment:', attachment.id);
            const fullAttachment = await firstValueFrom(this.codeAttachmentsService.getById(attachment.id));
            console.log('Full attachment loaded:', fullAttachment);
            
            if (!fullAttachment.originalData || !fullAttachment.editedData) {
                console.error('Attachment data is incomplete:', {
                    hasOriginal: !!fullAttachment.originalData,
                    hasEdited: !!fullAttachment.editedData
                });
                return;
            }

            let editor = this.codeEditor();
            if (!editor) {
                console.warn('Editor not immediately available, waiting...');
                await new Promise(resolve => setTimeout(resolve, 100));
                editor = this.codeEditor();
            }

            if (!editor) {
                console.error('Code editor component is not available after wait');
                return;
            }

            console.log('Loading attachment into editor');
            editor.loadAttachment(fullAttachment);
            this.currentAttachmentId.set(attachment.id);
        } catch (error) {
            console.error('Error loading attachment data:', error);
        }
    }
}
