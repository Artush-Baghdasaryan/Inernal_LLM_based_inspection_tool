import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CodeAttachment } from '../models/code-attachments/code-attachment.model';
import { CodeAttachmentMetadata } from '../models/code-attachments/code-attachment-metadata.model';
import { SaveCodeAttachmentRequest } from '../models/code-attachments/save-code-attachment-request.model';
import { FormPromptResult } from '../models/code-attachments/form-prompt-result.model';
import { FixCodeRequest } from '../models/code-attachments/fix-code-request.model';
import { FixCodeResult } from '../models/code-attachments/fix-code-result.model';
import { Analysis } from '../models/analysis/analysis.model';
import { AnalyseCodeRequest } from '../models/analysis/analyse-code-request.model';
import { appConfig } from '../config/app.config';

@Injectable({
    providedIn: 'root',
})
export class CodeAttachmentsService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = appConfig.apiUrl;

    public getMetadataByUserId(
        userId: string,
    ): Observable<CodeAttachmentMetadata[]> {
        return this.http.get<CodeAttachmentMetadata[]>(
            `${this.apiUrl}/codeattachments/metadata/${userId}`,
        );
    }

    public getById(id: string): Observable<CodeAttachment> {
        return this.http.get<CodeAttachment>(
            `${this.apiUrl}/codeattachments/${id}`,
        );
    }

    public create(
        request: SaveCodeAttachmentRequest,
    ): Observable<CodeAttachment> {
        return this.http.post<CodeAttachment>(
            `${this.apiUrl}/codeattachments`,
            request,
        );
    }

    public update(
        id: string,
        request: SaveCodeAttachmentRequest,
    ): Observable<CodeAttachment> {
        return this.http.put<CodeAttachment>(
            `${this.apiUrl}/codeattachments/${id}`,
            request,
        );
    }

    public delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/codeattachments/${id}`);
    }

    public formPrompt(id: string, userId: string): Observable<FormPromptResult> {
        return this.http.get<FormPromptResult>(
            `${this.apiUrl}/codeattachments/${id}/form-prompt?userId=${userId}`,
        );
    }

    public analyse(
        id: string,
        userId: string,
        request: AnalyseCodeRequest,
    ): Observable<Analysis> {
        return this.http.post<Analysis>(
            `${this.apiUrl}/codeattachments/${id}/analyse?userId=${userId}`,
            request,
        );
    }

    public getAnalysisByAttachmentId(
        attachmentId: string,
    ): Observable<Analysis | null> {
        return this.http.get<Analysis | null>(
            `${this.apiUrl}/analysis/attachment/${attachmentId}`,
        );
    }

    public fixCode(request: FixCodeRequest): Observable<FixCodeResult> {
        return this.http.post<FixCodeResult>(
            `${this.apiUrl}/codeattachments/fix-code`,
            request,
        );
    }

    public markIssuesAsFixed(
        attachmentId: string,
        issueIndices: number[],
    ): Observable<void> {
        return this.http.post<void>(
            `${this.apiUrl}/codeattachments/mark-issues-as-fixed`,
            {
                attachmentId,
                issueIndices,
            },
        );
    }
}