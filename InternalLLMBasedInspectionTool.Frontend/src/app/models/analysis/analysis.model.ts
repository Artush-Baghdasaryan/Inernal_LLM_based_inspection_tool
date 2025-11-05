import { Issue } from './issue.model';

export interface Analysis {
    id: string;
    attachmentId: string;
    issues: Issue[];
}

