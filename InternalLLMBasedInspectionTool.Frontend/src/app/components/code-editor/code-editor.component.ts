import { Component, OnInit, OnDestroy, signal, viewChild, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';
import { DiffModalComponent } from '../diff-modal/diff-modal.component';
import { SvgIcons } from '../../shared/svg-icons';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DiffModalComponent],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  public editorContainer = viewChild<ElementRef<HTMLDivElement>>('editorContainer');
  
  public selectedLanguage = signal<string>('typescript');
  public editorContent = signal<string>('');
  public originalContent = signal<string>('');
  public hasCodeUploaded = signal<boolean>(false);
  private editorInstance: Monaco.editor.IStandaloneCodeEditor | null = null;
  private monaco = signal<typeof Monaco | null>(null);
  private pendingContent: string | null = null;
  public showDiffModal = signal<boolean>(false);
  public showPromptSettingsModal = signal<boolean>(false);
  public isMonacoLoading = signal<boolean>(true);
  
  public readonly promptSettingsIcon: SafeHtml;
  public readonly closeIcon: SafeHtml;
  
  public readonly languages = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'plaintext', label: 'Other' }
  ];

  constructor(private readonly sanitizer: DomSanitizer) {
    this.promptSettingsIcon = this.sanitizer.bypassSecurityTrustHtml(SvgIcons.settings(20, 20));
    this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(SvgIcons.close(24, 24));
    
    effect(() => {
      const container = this.editorContainer();
      const monacoInstance = this.monaco();
      const hasCode = this.hasCodeUploaded();
      
      if (monacoInstance && container?.nativeElement && !this.editorInstance) {
        // Initialize editor if code is uploaded or pending, or if Monaco is loaded but editor not initialized yet
        if (hasCode || this.pendingContent !== null) {
          this.initEditor();
        } else if (this.isMonacoLoading()) {
          // Monaco is loaded but no code yet - initialize empty editor and hide loader
          this.isMonacoLoading.set(false);
        }
      }
    });
  }

  public ngOnInit(): void {
    this.loadMonaco();
  }

  public ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.dispose();
    }
  }

  private async loadMonaco(): Promise<void> {
    try {
      this.isMonacoLoading.set(true);
      const monacoInstance = await loader.init();
      this.monaco.set(monacoInstance);
      
      // Check if we need to initialize editor immediately
      const container = this.editorContainer()?.nativeElement;
      const hasCode = this.hasCodeUploaded();
      
      if (container && (hasCode || this.pendingContent !== null)) {
        // Editor will be initialized by effect() or manually
        // isMonacoLoading will be set to false in initEditor()
      } else if (container) {
        // Monaco loaded but no code - hide loader
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
      // If Monaco is loaded but can't initialize editor, hide loader
      if (monacoInstance && !this.editorInstance) {
        this.isMonacoLoading.set(false);
      }
      return;
    }

    // Ensure container is visible before initializing
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      // Container is hidden, wait a bit and try again
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
      const initialContent = this.pendingContent !== null 
        ? this.pendingContent 
        : (this.editorContent() || '');

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
        lineNumbers: 'on'
      });

      this.editorInstance.onDidChangeModelContent(() => {
        if (this.editorInstance) {
          const content = this.editorInstance.getValue();
          this.editorContent.set(content);
        }
      });

      if (this.pendingContent !== null) {
        this.editorInstance.setValue(this.pendingContent);
        this.editorContent.set(this.pendingContent);
        this.pendingContent = null;
      }

      // Hide loading indicator after editor is initialized
      this.isMonacoLoading.set(false);
    } catch (error) {
      console.error('Error initializing editor:', error);
      this.isMonacoLoading.set(false);
    }
  }

  public onLanguageChange(): void {
    const monacoInstance = this.monaco();
    if (this.editorInstance && monacoInstance) {
      const model = this.editorInstance.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, this.selectedLanguage());
      }
    }
    
    // Update code to sample for selected language when user changes language
    if (this.hasCodeUploaded()) {
      const sampleCode = this.getSampleCodeForLanguage(this.selectedLanguage());
      this.originalContent.set(sampleCode);
      
      if (this.editorInstance) {
        this.editorInstance.setValue(sampleCode);
        this.editorContent.set(sampleCode);
      }
    }
  }

  public onSeeDiff(): void {
    this.showDiffModal.set(true);
  }

  public closeDiffModal(): void {
    this.showDiffModal.set(false);
  }

  public hasDiff(): boolean {
    return this.hasCodeUploaded() && this.originalContent() !== this.editorContent();
  }

  public onFormPrompt(): void {
    console.log('Form a prompt clicked');
    // TODO: Implement prompt formation logic
  }

  public onPromptSettingsClick(): void {
    this.showPromptSettingsModal.set(true);
  }

  public closePromptSettingsModal(): void {
    this.showPromptSettingsModal.set(false);
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        return;
      }

      // Automatically detect language from file name and content
      const detectedLanguage = this.detectLanguageFromFile(file.name, content);
      this.selectedLanguage.set(detectedLanguage);

      // Update originalContent and editor content
      this.originalContent.set(content);
      this.hasCodeUploaded.set(true);

      if (this.editorInstance) {
        try {
          this.editorInstance.setValue(content);
          this.editorContent.set(content);
          // Update language in Monaco editor
          const monacoInstance = this.monaco();
          if (monacoInstance) {
            const model = this.editorInstance.getModel();
            if (model) {
              monacoInstance.editor.setModelLanguage(model, detectedLanguage);
            }
          }
        } catch (error) {
          console.error('Error setting editor value:', error);
          this.pendingContent = content;
        }
      } else {
        this.pendingContent = content;
        this.editorContent.set(content);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsText(file);

    input.value = '';
  }

  private detectLanguageFromFile(fileName: string, content: string): string {
    // First try to detect from file extension
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const extensionMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'mjs': 'javascript',
      'cjs': 'javascript',
      'py': 'python',
      'pyw': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c++': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml'
    };

    if (extension && extensionMap[extension]) {
      return extensionMap[extension];
    }

    // If not detected from extension, try to detect from content
    const contentLanguage = this.detectLanguageFromContent(content);
    if (contentLanguage !== 'plaintext') {
      return contentLanguage;
    }

    // If still not detected, return 'Other'
    return 'plaintext';
  }

  private detectLanguageFromContent(content: string): string {
    const trimmedContent = content.trim();

    // Check for JSON
    if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
      try {
        JSON.parse(trimmedContent);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }

    // Check for YAML
    if (trimmedContent.includes(':') && (trimmedContent.includes('\n') || trimmedContent.includes('  '))) {
      const yamlIndicators = ['---', 'version:', 'name:', 'description:'];
      if (yamlIndicators.some(indicator => trimmedContent.includes(indicator))) {
        return 'yaml';
      }
    }

    // Check for HTML
    if (trimmedContent.includes('<!DOCTYPE html') || 
        (trimmedContent.includes('<html') && trimmedContent.includes('</html>'))) {
      return 'html';
    }

    // Check for CSS
    if (trimmedContent.includes('{') && trimmedContent.includes('}') && 
        trimmedContent.includes(':') && trimmedContent.includes(';')) {
      // Simple heuristic: if it looks like CSS
      const cssPattern = /[a-zA-Z-]+\s*:\s*[^;]+;/;
      if (cssPattern.test(trimmedContent)) {
        return 'css';
      }
    }

    // Check for TypeScript/JavaScript
    const tsJsPatterns = {
      typescript: [
        /:\s*\w+\s*[=:]/,
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
        /<.*>/
      ],
      javascript: [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/
      ]
    };

    const tsMatches = tsJsPatterns.typescript.filter(pattern => pattern.test(trimmedContent)).length;
    const jsMatches = tsJsPatterns.javascript.filter(pattern => pattern.test(trimmedContent)).length;

    if (tsMatches > jsMatches && tsMatches > 0) {
      return 'typescript';
    } else if (jsMatches > 0) {
      return 'javascript';
    }

    // Check for Python
    if (trimmedContent.includes('def ') || trimmedContent.includes('import ') || trimmedContent.includes('print(')) {
      return 'python';
    }

    // Check for Java
    if (trimmedContent.includes('public class') || trimmedContent.includes('package ') || trimmedContent.includes('public static void main')) {
      return 'java';
    }

    // Check for C++
    if (trimmedContent.includes('#include') || trimmedContent.includes('std::')) {
      return 'cpp';
    }

    // Check for C#
    if (trimmedContent.includes('using System') || trimmedContent.includes('namespace ') || trimmedContent.includes('public class')) {
      return 'csharp';
    }

    // Check for Go
    if (trimmedContent.includes('package main') || trimmedContent.includes('func ') || trimmedContent.includes('import "fmt"')) {
      return 'go';
    }

    // Check for Rust
    if (trimmedContent.includes('fn ') || trimmedContent.includes('use ') || trimmedContent.includes('let ') && trimmedContent.includes('println!')) {
      return 'rust';
    }

    // Default to 'Other' if cannot detect
    return 'plaintext';
  }

  public onLoadSampleCode(): void {
    const sampleCode = this.getSampleCodeForLanguage(this.selectedLanguage());
    this.originalContent.set(sampleCode);
    this.editorContent.set(sampleCode);
    this.hasCodeUploaded.set(true);

    if (this.editorInstance) {
      // Editor already exists, just update content
      this.editorInstance.setValue(sampleCode);
      // Update language in Monaco editor
      const monacoInstance = this.monaco();
      if (monacoInstance) {
        const model = this.editorInstance.getModel();
        if (model) {
          monacoInstance.editor.setModelLanguage(model, this.selectedLanguage());
        }
      }
    } else {
      // Editor not yet initialized
      this.pendingContent = sampleCode;
      
      // If Monaco is already loaded, initialize editor immediately
      const monacoInstance = this.monaco();
      const container = this.editorContainer()?.nativeElement;
      if (monacoInstance && container && !this.editorInstance) {
        // Initialize editor immediately - effect() may also try to initialize
        this.initEditor();
      }
      // If Monaco is not loaded yet, effect() will initialize when it's ready
    }
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
}

