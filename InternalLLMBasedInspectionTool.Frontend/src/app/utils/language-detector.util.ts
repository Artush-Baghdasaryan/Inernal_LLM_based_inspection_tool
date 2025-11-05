export function detectLanguageFromFile(
    fileName: string,
    content: string,
): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const extensionMap: Record<string, string> = {
        ts: 'typescript',
        tsx: 'typescript',
        js: 'javascript',
        jsx: 'javascript',
        mjs: 'javascript',
        cjs: 'javascript',
        py: 'python',
        pyw: 'python',
        java: 'java',
        kt: 'kotlin',
        kts: 'kotlin',
        cpp: 'cpp',
        cc: 'cpp',
        cxx: 'cpp',
        'c++': 'cpp',
        cs: 'csharp',
        go: 'go',
        rs: 'rust',
        html: 'html',
        htm: 'html',
        css: 'css',
        json: 'json',
        yaml: 'yaml',
        yml: 'yaml',
    };

    if (extension && extensionMap[extension]) {
        return extensionMap[extension];
    }

    const contentLanguage = detectLanguageFromContent(content);
    if (contentLanguage !== 'plaintext') {
        return contentLanguage;
    }

    return 'plaintext';
}

export function detectLanguageFromContent(content: string): string {
    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
        return 'plaintext';
    }

    if (isJson(trimmedContent)) {
        return 'json';
    }

    if (isYaml(trimmedContent)) {
        return 'yaml';
    }

    if (isHtml(trimmedContent)) {
        return 'html';
    }

    if (isCss(trimmedContent)) {
        return 'css';
    }

    const detectedTsJs = detectTypeScriptOrJavaScript(trimmedContent);
    if (detectedTsJs !== 'plaintext') {
        return detectedTsJs;
    }

    if (isPython(trimmedContent)) {
        return 'python';
    }

    if (isJava(trimmedContent)) {
        return 'java';
    }

    if (isKotlin(trimmedContent)) {
        return 'kotlin';
    }

    if (isCpp(trimmedContent)) {
        return 'cpp';
    }

    if (isCSharp(trimmedContent)) {
        return 'csharp';
    }

    if (isGo(trimmedContent)) {
        return 'go';
    }

    if (isRust(trimmedContent)) {
        return 'rust';
    }

    return 'plaintext';
}

function isJson(content: string): boolean {
    if (content.startsWith('{') || content.startsWith('[')) {
        try {
            JSON.parse(content);
            return true;
        } catch {
            return false;
        }
    }
    return false;
}

function isYaml(content: string): boolean {
    if (
        content.includes(':') &&
        (content.includes('\n') || content.includes('  '))
    ) {
        const yamlIndicators = ['---', 'version:', 'name:', 'description:'];
        return yamlIndicators.some((indicator) => content.includes(indicator));
    }
    return false;
}

function isHtml(content: string): boolean {
    return (
        content.includes('<!DOCTYPE html') ||
        (content.includes('<html') && content.includes('</html>'))
    );
}

function isCss(content: string): boolean {
    if (
        content.includes('{') &&
        content.includes('}') &&
        content.includes(':') &&
        content.includes(';')
    ) {
        const cssPattern = /[a-zA-Z-]+\s*:\s*[^;]+;/;
        return cssPattern.test(content);
    }
    return false;
}

function detectTypeScriptOrJavaScript(content: string): string {
    const tsJsPatterns = {
        typescript: [
            /:\s*\w+\s*[=:]/,
            /interface\s+\w+/,
            /type\s+\w+\s*=/,
            /<.*>/,
        ],
        javascript: [
            /function\s+\w+\s*\(/,
            /const\s+\w+\s*=/,
            /let\s+\w+\s*=/,
            /var\s+\w+\s*=/,
        ],
    };

    const tsMatches = tsJsPatterns.typescript.filter((pattern) =>
        pattern.test(content),
    ).length;
    const jsMatches = tsJsPatterns.javascript.filter((pattern) =>
        pattern.test(content),
    ).length;

    if (tsMatches > jsMatches && tsMatches > 0) {
        return 'typescript';
    } else if (jsMatches > 0) {
        return 'javascript';
    }

    return 'plaintext';
}

function isPython(content: string): boolean {
    return (
        content.includes('def ') ||
        content.includes('import ') ||
        content.includes('print(')
    );
}

function isJava(content: string): boolean {
    return (
        content.includes('public class') ||
        content.includes('package ') ||
        content.includes('public static void main')
    );
}

function isCpp(content: string): boolean {
    return content.includes('#include') || content.includes('std::');
}

function isCSharp(content: string): boolean {
    return (
        content.includes('using System') ||
        content.includes('namespace ') ||
        content.includes('public class')
    );
}

function isGo(content: string): boolean {
    return (
        content.includes('package main') ||
        content.includes('func ') ||
        content.includes('import "fmt"')
    );
}

function isKotlin(content: string): boolean {
    return (
        content.includes('fun ') ||
        content.includes('package ') ||
        content.includes('import ') ||
        content.includes('val ') ||
        content.includes('var ')
    );
}

function isRust(content: string): boolean {
    return (
        (content.includes('fn ') || content.includes('use ')) &&
        content.includes('let ') &&
        content.includes('println!')
    );
}
