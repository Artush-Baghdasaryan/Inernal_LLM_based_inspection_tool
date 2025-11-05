import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    input,
    output,
    viewChild,
    effect,
    signal,
    HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';
import { SvgIcons } from '../../shared/svg-icons';

@Component({
    selector: 'app-diff-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './diff-modal.component.html',
    styleUrl: './diff-modal.component.scss',
})
export class DiffModalComponent implements OnInit, OnDestroy {
    public originalContent = input<string>('');
    public editedContent = input<string>('');
    public language = input<string>('typescript');
    public isOpen = input<boolean>(false);
    public onClose = input<(() => void) | null>(null);
    public onAcceptChanges = output<string>();

    private diffEditor: Monaco.editor.IStandaloneDiffEditor | null = null;
    private monaco = signal<typeof Monaco | null>(null);
    private originalModel: Monaco.editor.ITextModel | null = null;
    private modifiedModel: Monaco.editor.ITextModel | null = null;

    public diffContainer =
        viewChild<ElementRef<HTMLDivElement>>('diffContainer');
    public readonly closeIcon: SafeHtml;

    constructor(private readonly sanitizer: DomSanitizer) {
        this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.close(24, 24),
        );

        effect(() => {
            const monacoInstance = this.monaco();
            const isOpen = this.isOpen();

            if (
                isOpen &&
                monacoInstance &&
                this.diffContainer()?.nativeElement
            ) {
                if (!this.diffEditor) {
                    this.initDiffEditor();
                } else {
                    // Update models when content changes and editor already exists
                    this.updateDiffModels();
                }
            }
        });
    }

    public ngOnInit(): void {
        this.loadMonaco();
    }

    public ngOnDestroy(): void {
        this.diffEditor?.dispose();
        this.originalModel?.dispose();
        this.modifiedModel?.dispose();
    }

    private async loadMonaco(): Promise<void> {
        try {
            const monacoInstance = await loader.init();
            this.monaco.set(monacoInstance);

            if (
                this.isOpen() &&
                this.diffContainer()?.nativeElement &&
                !this.diffEditor
            ) {
                this.initDiffEditor();
            }
        } catch (error) {
            console.error('Failed to load Monaco Editor:', error);
        }
    }

    private initDiffEditor(): void {
        const container = this.diffContainer()?.nativeElement;
        const monacoInstance = this.monaco();
        if (!monacoInstance || this.diffEditor || !container) {
            return;
        }

        setTimeout(() => {
            if (!container || this.diffEditor || !monacoInstance) {
                return;
            }

            this.originalModel = monacoInstance.editor.createModel(
                this.originalContent() || '',
                this.language(),
            );

            this.modifiedModel = monacoInstance.editor.createModel(
                this.editedContent() || '',
                this.language(),
            );

            this.diffEditor = monacoInstance.editor.createDiffEditor(
                container,
                {
                    theme: 'vs-dark',
                    readOnly: true,
                    automaticLayout: true,
                    fontSize: 14,
                    fontFamily: 'Consolas, "Courier New", monospace',
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    enableSplitViewResizing: true,
                },
            );

            this.diffEditor.setModel({
                original: this.originalModel,
                modified: this.modifiedModel,
            });
        }, 100);
    }

    private updateDiffModels(): void {
        if (!this.diffEditor || !this.monaco()) {
            return;
        }

        const monacoInstance = this.monaco();
        if (!monacoInstance) {
            return;
        }

        // Dispose old models
        if (this.originalModel) {
            this.originalModel.dispose();
        }
        if (this.modifiedModel) {
            this.modifiedModel.dispose();
        }

        // Create new models with updated content
        this.originalModel = monacoInstance.editor.createModel(
            this.originalContent() || '',
            this.language(),
        );

        this.modifiedModel = monacoInstance.editor.createModel(
            this.editedContent() || '',
            this.language(),
        );

        // Update diff editor with new models
        this.diffEditor.setModel({
            original: this.originalModel,
            modified: this.modifiedModel,
        });

        // Update layout after model change
        setTimeout(() => {
            if (this.diffEditor) {
                this.diffEditor.layout();
            }
        }, 50);
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

    public acceptChanges(): void {
        // Get the modified content (right side) from the diff editor
        const modifiedContent = this.modifiedModel?.getValue() || this.editedContent();
        this.onAcceptChanges.emit(modifiedContent);
    }

    @HostListener('document:keydown.escape', ['$event'])
    public onEscapeKey(event: Event): void {
        if (this.isOpen()) {
            this.closeModal();
        }
    }
}
