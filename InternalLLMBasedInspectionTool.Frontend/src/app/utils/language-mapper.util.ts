import { CodeLanguage } from '../models/code-attachments/code-attachment.model';

export function mapLanguageToCodeLanguage(language: string): CodeLanguage {
    const languageMap: Record<string, CodeLanguage> = {
        typescript: CodeLanguage.TypeScript,
        javascript: CodeLanguage.JavaScript,
        python: CodeLanguage.Python,
        java: CodeLanguage.Java,
        kotlin: CodeLanguage.Kotlin,
        cpp: CodeLanguage.Cpp,
        csharp: CodeLanguage.CSharp,
        go: CodeLanguage.Go,
        rust: CodeLanguage.Rust,
        html: CodeLanguage.Html,
        css: CodeLanguage.Css,
        json: CodeLanguage.Json,
        yaml: CodeLanguage.Yaml,
        plaintext: CodeLanguage.Other,
    };

    return languageMap[language.toLowerCase()] || CodeLanguage.Other;
}

export function mapCodeLanguageToLanguage(codeLanguage: CodeLanguage): string {
    const languageMap: Record<CodeLanguage, string> = {
        [CodeLanguage.Unknown]: 'plaintext',
        [CodeLanguage.CSharp]: 'csharp',
        [CodeLanguage.Java]: 'java',
        [CodeLanguage.Kotlin]: 'kotlin',
        [CodeLanguage.TypeScript]: 'typescript',
        [CodeLanguage.JavaScript]: 'javascript',
        [CodeLanguage.Python]: 'python',
        [CodeLanguage.Cpp]: 'cpp',
        [CodeLanguage.Go]: 'go',
        [CodeLanguage.Rust]: 'rust',
        [CodeLanguage.Html]: 'html',
        [CodeLanguage.Css]: 'css',
        [CodeLanguage.Json]: 'json',
        [CodeLanguage.Xml]: 'plaintext',
        [CodeLanguage.Yaml]: 'yaml',
        [CodeLanguage.Markdown]: 'plaintext',
        [CodeLanguage.Other]: 'plaintext',
    };

    return languageMap[codeLanguage] || 'plaintext';
}
