import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';

const CONTEXT_LINES = 3;

type HunkString = string;

export async function calculateUnifiedDiff(
    original: string,
    edited: string,
): Promise<string[]> {
    if (!original && !edited) {
        return [];
    }

    if (original === edited) {
        return [];
    }

    const monaco = await loader.init();
    return computeHunksWithMonaco(
        original || '',
        edited || '',
        CONTEXT_LINES,
        monaco,
    );
}

async function computeHunksWithMonaco(
    original: string,
    edited: string,
    contextRadius: number,
    monaco: typeof Monaco,
): Promise<HunkString[]> {
    const origModel = monaco.editor.createModel(original, 'text/plain');
    const modModel = monaco.editor.createModel(edited, 'text/plain');

    try {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '800px';
        container.style.height = '600px';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);

        const diff = monaco.editor.createDiffEditor(container, {
            readOnly: true,
            ignoreTrimWhitespace: true,
        });

        diff.setModel({ original: origModel, modified: modModel });

        await new Promise<void>((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkReady = () => {
                try {
                    const changes = diff.getLineChanges();
                    if (changes !== undefined && changes !== null) {
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        resolve();
                    } else {
                        attempts++;
                        setTimeout(checkReady, 100);
                    }
                } catch {
                    if (attempts >= maxAttempts) {
                        resolve();
                    } else {
                        attempts++;
                        setTimeout(checkReady, 100);
                    }
                }
            };

            setTimeout(checkReady, 200);
        });

        const changes = diff.getLineChanges() ?? [];

        if (changes.length === 0) {
            diff.dispose();
            container.remove();
            return [];
        }

        const origLines = origModel.getLinesContent();
        const modLines = modModel.getLinesContent();

        const hunks: HunkString[] = changes.map((ch) => {
            const oldStart = Math.max(
                1,
                ch.originalStartLineNumber - contextRadius,
            );
            const oldEnd = Math.min(
                origLines.length,
                ch.originalEndLineNumber + contextRadius,
            );
            const oldCount = Math.max(0, oldEnd - oldStart + 1);

            const newStart = Math.max(
                1,
                ch.modifiedStartLineNumber - contextRadius,
            );
            const newEnd = Math.min(
                modLines.length,
                ch.modifiedEndLineNumber + contextRadius,
            );
            const newCount = Math.max(0, newEnd - newStart + 1);

            const header = `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`;
            const lines: string[] = [];
            lines.push(header);

            for (
                let ln = oldStart;
                ln <
                Math.min(oldStart + contextRadius, ch.originalStartLineNumber);
                ln++
            ) {
                lines.push(' ' + (origLines[ln - 1] ?? ''));
            }

            for (
                let ln = ch.originalStartLineNumber;
                ln <= ch.originalEndLineNumber;
                ln++
            ) {
                if (ln >= 1 && ln <= origLines.length) {
                    lines.push('-' + (origLines[ln - 1] ?? ''));
                }
            }

            for (
                let ln = ch.modifiedStartLineNumber;
                ln <= ch.modifiedEndLineNumber;
                ln++
            ) {
                if (ln >= 1 && ln <= modLines.length) {
                    lines.push('+' + (modLines[ln - 1] ?? ''));
                }
            }

            for (
                let ln = Math.max(
                    ch.originalEndLineNumber + 1,
                    oldEnd - contextRadius + 1,
                );
                ln <= oldEnd;
                ln++
            ) {
                lines.push(' ' + (origLines[ln - 1] ?? ''));
            }

            return lines.join('\n');
        });

        diff.dispose();
        container.remove();

        return hunks;
    } finally {
        origModel.dispose();
        modModel.dispose();
    }
}
