import {
    Component,
    OnInit,
    OnDestroy,
    signal,
    viewChild,
    effect,
    ElementRef,
    inject,
    output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';
import { DiffModalComponent } from '../diff-modal/diff-modal.component';
import { PromptModalComponent } from '../prompt-modal/prompt-modal.component';
import { LoadingModalComponent } from '../loading-modal/loading-modal.component';
import { SvgIcons } from '../../shared/svg-icons';
import { CodeAttachmentsService } from '../../services/code-attachments.service';
import { UserStateService } from '../../services/user-state.service';
import { ToastService } from '../../services/toast.service';
import { SaveCodeAttachmentRequest } from '../../models/code-attachments/save-code-attachment-request.model';
import { calculateUnifiedDiff } from '../../utils/diff-calculator.util';
import { CodeAttachment } from '../../models/code-attachments/code-attachment.model';
import {
    mapLanguageToCodeLanguage,
    mapCodeLanguageToLanguage,
} from '../../utils/language-mapper.util';
import { detectLanguageFromFile } from '../../utils/language-detector.util';
import { Analysis } from '../../models/analysis/analysis.model';
import { AnalyseCodeRequest } from '../../models/analysis/analyse-code-request.model';

@Component({
    selector: 'app-code-editor',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DiffModalComponent,
        PromptModalComponent,
        LoadingModalComponent,
    ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss',
})
export class CodeEditorComponent implements OnInit, OnDestroy {
    public readonly attachmentCreated = output<void>();
    public readonly analysisCompleted = output<Analysis>();

    public editorContainer =
        viewChild<ElementRef<HTMLDivElement>>('editorContainer');

    public selectedLanguage = signal<string>('typescript');
    public editorContent = signal<string>('');
    public originalContent = signal<string>('');
    private loadedEditedContent = signal<string | null>(null);
    public hasCodeUploaded = signal<boolean>(false);
    private editorInstance: Monaco.editor.IStandaloneCodeEditor | null = null;
    private monaco = signal<typeof Monaco | null>(null);
    private pendingContent = signal<string | null>(null);
    private _currentAttachmentId = signal<string | null>(null);
    public readonly currentAttachmentId =
        this._currentAttachmentId.asReadonly();
    private currentAttachmentName: string | null = null;
    private currentAttachmentMimeType: string | null = null;
    private saveTimeout: ReturnType<typeof setTimeout> | null = null;
    public showDiffModal = signal<boolean>(false);
    public showLoadSampleModal = signal<boolean>(false);
    public showPromptModal = signal<boolean>(false);
    public systemPrompt = signal<string>('');
    public userPrompt = signal<string>('');
    public isMonacoLoading = signal<boolean>(true);
    public isFormingPrompt = signal<boolean>(false);
    public isFileLoading = signal<boolean>(false);
    public isAnalyzing = signal<boolean>(false);

    private readonly codeAttachmentsService = inject(CodeAttachmentsService);
    private readonly userStateService = inject(UserStateService);
    private readonly toastService = inject(ToastService);

    public readonly closeIcon: SafeHtml;

    public readonly languages = [
        { value: 'typescript', label: 'TypeScript' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'kotlin', label: 'Kotlin' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'plaintext', label: 'Other' },
    ];

    constructor(private readonly sanitizer: DomSanitizer) {
        this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.close(24, 24),
        );

        effect(() => {
            const container = this.editorContainer();
            const monacoInstance = this.monaco();
            const hasCode = this.hasCodeUploaded();
            const pending = this.pendingContent();

            if (
                monacoInstance &&
                container?.nativeElement &&
                !this.editorInstance
            ) {
                if (hasCode || pending !== null) {
                    this.initEditor();
                } else if (this.isMonacoLoading()) {
                    this.isMonacoLoading.set(false);
                }
            }
        });

        effect(() => {
            const content = this.editorContent();
            const loaded = this.loadedEditedContent();

            if (
                this.hasCodeUploaded() &&
                loaded !== null &&
                content !== loaded &&
                this._currentAttachmentId()
            ) {
                this.scheduleAutoSave();
            }
        });
    }

    public ngOnInit(): void {
        this.loadMonaco();
    }

    public ngOnDestroy(): void {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        if (this.editorInstance) {
            this.editorInstance.dispose();
        }
    }

    private async loadMonaco(): Promise<void> {
        try {
            this.isMonacoLoading.set(true);
            const monacoInstance = await loader.init();
            this.monaco.set(monacoInstance);

            const container = this.editorContainer()?.nativeElement;
            const hasCode = this.hasCodeUploaded();

            if (container && !hasCode && this.pendingContent() === null) {
                this.isMonacoLoading.set(false);
            }
        } catch (error) {
            console.error('Failed to load Monaco Editor:', error);
            this.isMonacoLoading.set(false);
        }
    }

    private initEditor(): void {
        const container = this.editorContainer()?.nativeElement;
        const monacoInstance = this.monaco();
        if (!monacoInstance || this.editorInstance || !container) {
            if (monacoInstance && !this.editorInstance) {
                this.isMonacoLoading.set(false);
            }
            return;
        }

        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            setTimeout(() => {
                if (!this.editorInstance && container && monacoInstance) {
                    this.initEditor();
                } else {
                    this.isMonacoLoading.set(false);
                }
            }, 100);
            return;
        }

        try {
            const pending = this.pendingContent();
            const initialContent =
                pending !== null ? pending : this.editorContent() || '';

            this.editorInstance = monacoInstance.editor.create(container, {
                value: initialContent,
                language: this.selectedLanguage(),
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: 14,
                fontFamily: 'Consolas, "Courier New", monospace',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
            });

            this.editorInstance.onDidChangeModelContent(() => {
                if (this.editorInstance) {
                    const content = this.editorInstance.getValue();
                    this.editorContent.set(content);
                }
            });

            if (pending !== null) {
                this.editorInstance.setValue(pending);
                this.editorContent.set(pending);
                this.pendingContent.set(null);
            }

            this.isMonacoLoading.set(false);
        } catch (error) {
            console.error('Error initializing editor:', error);
            this.isMonacoLoading.set(false);
        }
    }

    public onSeeDiff(): void {
        this.showDiffModal.set(true);
    }

    public closeDiffModal(): void {
        this.showDiffModal.set(false);
    }

    public async onMergeToOriginal(): Promise<void> {
        const editedContent = this.editorContent();
        this.originalContent.set(editedContent);
        this.loadedEditedContent.set(editedContent);

        if (this.editorInstance) {
            this.editorInstance.setValue(editedContent);
        }

        if (this._currentAttachmentId()) {
            await this.updateAttachmentWithMergedContent(editedContent);
        }

        this.showDiffModal.set(false);
        this.toastService.show('Changes merged to original', 'success');
    }

    private async updateAttachmentWithMergedContent(
        mergedContent: string,
    ): Promise<void> {
        const user = this.userStateService.user();
        if (!user || !user.id) {
            console.error('User not found');
            return;
        }

        const request: SaveCodeAttachmentRequest = {
            userId: user.id,
            name: this.currentAttachmentName || 'untitled',
            mimeType: this.currentAttachmentMimeType || 'text/plain',
            codeLanguage: mapLanguageToCodeLanguage(this.selectedLanguage()),
            originalData: mergedContent,
            editedData: mergedContent,
            diffHunks: [],
        };

        this.codeAttachmentsService
            .update(this._currentAttachmentId()!, request)
            .subscribe({
                next: () => {
                    this.loadedEditedContent.set(mergedContent);
                },
                error: (error) => {
                    console.error('Error updating attachment:', error);
                    this.toastService.show('Failed to merge changes', 'error');
                },
            });
    }

    public hasDiff(): boolean {
        return (
            this.hasCodeUploaded() &&
            this.originalContent() !== this.editorContent()
        );
    }

    public loadAttachment(attachment: CodeAttachment): void {
        if (!attachment.originalData || !attachment.editedData) {
            console.error('Attachment data is missing');
            return;
        }

        const language = mapCodeLanguageToLanguage(attachment.codeLanguage);
        this.selectedLanguage.set(language);

        this.originalContent.set(attachment.originalData);
        this.loadedEditedContent.set(attachment.editedData);
        this.editorContent.set(attachment.editedData);
        this.hasCodeUploaded.set(true);
        this._currentAttachmentId.set(attachment.id);
        this.currentAttachmentName = attachment.name;
        this.currentAttachmentMimeType = attachment.mimeType;

        if (this.editorInstance) {
            this.editorInstance.setValue(attachment.editedData);
            this.setEditorLanguage(language);
        } else {
            this.pendingContent.set(attachment.editedData);

            const monacoInstance = this.monaco();
            const container = this.editorContainer()?.nativeElement;

            if (monacoInstance && container && !this.editorInstance) {
                setTimeout(() => {
                    if (!this.editorInstance) {
                        this.initEditor();
                    }
                }, 50);
            }
        }
    }

    public updateEditedData(newEditedData: string): void {
        this.editorContent.set(newEditedData);
        this.loadedEditedContent.set(newEditedData);
        
        if (this.editorInstance) {
            this.editorInstance.setValue(newEditedData);
        }
    }

    public getEditedData(): string {
        return this.editorContent();
    }

    public getCodeLanguage(): string {
        return this.selectedLanguage();
    }

    private setEditorLanguage(language: string): void {
        const monacoInstance = this.monaco();
        if (monacoInstance && this.editorInstance) {
            const model = this.editorInstance.getModel();
            if (model) {
                monacoInstance.editor.setModelLanguage(model, language);
            }
        }
    }

    public onFormPrompt(): void {
        const user = this.userStateService.user();
        const attachmentId = this._currentAttachmentId();

        if (!user || !user.id) {
            this.toastService.show(
                'User not found. Please refresh the page and try again.',
                'error',
            );
            return;
        }

        if (!attachmentId) {
            this.toastService.show(
                'No attachment found. Please upload code first.',
                'error',
            );
            return;
        }

        this.isFormingPrompt.set(true);
        this.codeAttachmentsService
            .formPrompt(attachmentId, user.id)
            .subscribe({
                next: (result) => {
                    this.systemPrompt.set(result.systemPrompt);
                    this.userPrompt.set(result.userPrompt);
                    this.showPromptModal.set(true);
                    this.isFormingPrompt.set(false);
                },
                error: (error) => {
                    console.error('Error forming prompt:', error);
                    this.toastService.show('Failed to form prompt', 'error');
                    this.isFormingPrompt.set(false);
                },
            });
    }

    public closePromptModal(): void {
        this.showPromptModal.set(false);
    }

    public onAnalyse(systemPrompt: string): void {
        const attachmentId = this.currentAttachmentId();
        const user = this.userStateService.user();

        if (!attachmentId || !user?.id) {
            this.toastService.show(
                'Необходимо выбрать файл для анализа',
                'error',
            );
            return;
        }

        // Close prompt modal first
        this.showPromptModal.set(false);
        
        // Start loading
        this.isAnalyzing.set(true);

        const request: AnalyseCodeRequest = {
            systemPrompt: systemPrompt,
        };

        this.codeAttachmentsService
            .analyse(attachmentId, user.id, request)
            .subscribe({
                next: (analysis) => {
                    // Wait a bit for progress to complete, then close modal
                    setTimeout(() => {
                        this.isAnalyzing.set(false);
                        // Emit to parent component instead of showing modal here
                        this.analysisCompleted.emit(analysis);
                        this.toastService.show('Анализ завершен успешно', 'success');
                    }, 500);
                },
                error: (error) => {
                    console.error('Ошибка при анализе кода:', error);
                    this.isAnalyzing.set(false);
                    this.toastService.show('Ошибка при анализе кода', 'error');
                },
            });
    }


    public async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            return;
        }

        this.isFileLoading.set(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            if (!content) {
                return;
            }

            const detectedLanguage = detectLanguageFromFile(file.name, content);
            this.selectedLanguage.set(detectedLanguage);

            this.originalContent.set(content);
            this.loadedEditedContent.set(content);
            this.hasCodeUploaded.set(true);

            if (this.editorInstance) {
                try {
                    this.editorInstance.setValue(content);
                    this.editorContent.set(content);
                    this.setEditorLanguage(detectedLanguage);
                } catch (error) {
                    console.error('Error setting editor value:', error);
                    this.pendingContent.set(content);
                }
            } else {
                this.pendingContent.set(content);
                this.editorContent.set(content);
            }

            await this.createAttachment(
                file.name,
                file.type,
                content,
                detectedLanguage,
            );
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            this.isFileLoading.set(false);
        };

        reader.readAsText(file);
        input.value = '';
    }

    public onLoadSampleClick(): void {
        this.showLoadSampleModal.set(true);
    }

    public closeLoadSampleModal(): void {
        this.showLoadSampleModal.set(false);
    }

    public async onLoadSampleCode(language: string): Promise<void> {
        const sampleCode = this.getSampleCodeForLanguage(language);
        this.selectedLanguage.set(language);
        this.originalContent.set(sampleCode);
        this.loadedEditedContent.set(sampleCode);
        this.editorContent.set(sampleCode);
        this.hasCodeUploaded.set(true);

        if (this.editorInstance) {
            this.editorInstance.setValue(sampleCode);
            this.setEditorLanguage(language);
        } else {
            this.pendingContent.set(sampleCode);
            const monacoInstance = this.monaco();
            const container = this.editorContainer()?.nativeElement;
            if (monacoInstance && container && !this.editorInstance) {
                this.initEditor();
            }
        }

        const fileExtension = this.getFileExtensionForLanguage(language);
        const fileName = `sample.${fileExtension}`;
        await this.createAttachment(
            fileName,
            'text/plain',
            sampleCode,
            language,
        );
        this.showLoadSampleModal.set(false);
    }

    private getSampleCodeForLanguage(language: string): string {
        switch (language) {
            case 'typescript':
                return this.getTypeScriptSample();
            case 'javascript':
                return this.getJavaScriptSample();
            case 'python':
                return this.getPythonSample();
            case 'java':
                return this.getJavaSample();
            case 'kotlin':
                return this.getKotlinSample();
            case 'cpp':
                return this.getCppSample();
            case 'csharp':
                return this.getCSharpSample();
            case 'go':
                return this.getGoSample();
            case 'rust':
                return this.getRustSample();
            case 'html':
                return this.getHtmlSample();
            case 'css':
                return this.getCssSample();
            case 'json':
                return this.getJsonSample();
            case 'yaml':
                return this.getYamlSample();
            case 'plaintext':
            default:
                return '# Plain Text File\n# No syntax highlighting available';
        }
    }

    private getTypeScriptSample(): string {
        return `function calculateSum(a: number, b: number): number {
  return a + b;
}

const result = calculateSum(5, 3);
console.log('Result:', result);`;
    }

    private getJavaScriptSample(): string {
        return `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log('Result:', result);`;
    }

    private getPythonSample(): string {
        return `def calculate_sum(a, b):
    return a + b

result = calculate_sum(5, 3)
print(f'Result: {result}')`;
    }

    private getJavaSample(): string {
        return `public class Calculator {
    public static int calculateSum(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        int result = calculateSum(5, 3);
        System.out.println("Result: " + result);
    }
}`;
    }

    private getKotlinSample(): string {
        return `fun calculateSum(a: Int, b: Int): Int {
    return a + b
}

fun main() {
    val result = calculateSum(5, 3)
    println("Result: $result")
}`;
    }

    private getCppSample(): string {
        return `#include <iostream>

int calculateSum(int a, int b) {
    return a + b;
}

int main() {
    int result = calculateSum(5, 3);
    std::cout << "Result: " << result << std::endl;
    return 0;
}`;
    }

    private getCSharpSample(): string {
        return `using System;

public class Calculator {
    public static int CalculateSum(int a, int b) {
        return a + b;
    }
    
    public static void Main(string[] args) {
        int result = CalculateSum(5, 3);
        Console.WriteLine($"Result: {result}");
    }
}`;
    }

    private getGoSample(): string {
        return `package main

import "fmt"

func calculateSum(a, b int) int {
    return a + b
}

func main() {
    result := calculateSum(5, 3)
    fmt.Printf("Result: %d\\n", result)
}`;
    }

    private getRustSample(): string {
        return `fn calculate_sum(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    let result = calculate_sum(5, 3);
    println!("Result: {}", result);
}`;
    }

    private getHtmlSample(): string {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Sample Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`;
    }

    private getCssSample(): string {
        return `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #333;
}`;
    }

    private getJsonSample(): string {
        return `{
  "name": "example",
  "version": "1.0.0",
  "description": "Sample JSON"
}`;
    }

    private getYamlSample(): string {
        return `name: example
version: 1.0.0
description: Sample YAML`;
    }

    private async createAttachment(
        fileName: string,
        mimeType: string,
        content: string,
        language: string,
    ): Promise<void> {
        const user = this.userStateService.user();
        if (!user || !user.id) {
            console.error(
                'User not found. Please make sure you are logged in.',
            );
            this.toastService.show(
                'User not found. Please refresh the page and try again.',
                'error',
            );
            return;
        }

        const userId = user.id;

        const request: SaveCodeAttachmentRequest = {
            userId: userId,
            name: fileName,
            mimeType: mimeType || 'text/plain',
            codeLanguage: mapLanguageToCodeLanguage(language),
            originalData: content,
            editedData: content,
            diffHunks: [],
        };

        this.codeAttachmentsService.create(request).subscribe({
            next: (attachment) => {
                this._currentAttachmentId.set(attachment.id);
                this.currentAttachmentName = attachment.name;
                this.currentAttachmentMimeType = attachment.mimeType;
                this.loadedEditedContent.set(content);
                this.attachmentCreated.emit();
                this.toastService.show('File saved successfully', 'success');
                this.isFileLoading.set(false);
            },
            error: (error) => {
                console.error('Error creating attachment:', error);
                this.toastService.show('Failed to save file', 'error');
                this.isFileLoading.set(false);
            },
        });
    }

    private scheduleAutoSave(): void {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(() => {
            this.autoSave();
        }, 3000);
    }

    private async autoSave(): Promise<void> {
        if (!this._currentAttachmentId()) {
            return;
        }

        const user = this.userStateService.user();
        if (!user || !user.id) {
            console.error(
                'User not found. Please make sure you are logged in.',
            );
            this.toastService.show(
                'User not found. Please refresh the page and try again.',
                'error',
            );
            return;
        }

        const userId = user.id;
        const originalContent = this.originalContent();
        const editedContent = this.editorContent();

        const diffHunks = await calculateUnifiedDiff(
            originalContent,
            editedContent,
        );

        const request: SaveCodeAttachmentRequest = {
            userId: userId,
            name: this.currentAttachmentName || 'untitled',
            mimeType: this.currentAttachmentMimeType || 'text/plain',
            codeLanguage: mapLanguageToCodeLanguage(this.selectedLanguage()),
            originalData: originalContent,
            editedData: editedContent,
            diffHunks: diffHunks,
        };

        this.codeAttachmentsService
            .update(this._currentAttachmentId()!, request)
            .subscribe({
                next: () => {
                    this.loadedEditedContent.set(this.editorContent());
                    this.toastService.show('Changes saved', 'success');
                },
                error: (error) => {
                    console.error('Error updating attachment:', error);
                    this.toastService.show('Failed to save changes', 'error');
                },
            });
    }

    private getFileExtensionForLanguage(language: string): string {
        const extensionMap: Record<string, string> = {
            typescript: 'ts',
            javascript: 'js',
            python: 'py',
            java: 'java',
            kotlin: 'kt',
            cpp: 'cpp',
            csharp: 'cs',
            go: 'go',
            rust: 'rs',
            html: 'html',
            css: 'css',
            json: 'json',
            yaml: 'yaml',
            plaintext: 'txt',
        };

        return extensionMap[language.toLowerCase()] || 'txt';
    }
}
