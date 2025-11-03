import { CodeLanguage } from './code-attachment.model';

export interface SaveCodeAttachmentRequest {
    userId: string;
    name: string;
    mimeType: string;
    codeLanguage: CodeLanguage;
    originalData: string;
    editedData: string;
    diffData: string;
}

