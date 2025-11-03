import { CodeLanguage } from './code-attachment.model';

export interface CodeAttachmentMetadata {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  codeLanguage: CodeLanguage;
}

