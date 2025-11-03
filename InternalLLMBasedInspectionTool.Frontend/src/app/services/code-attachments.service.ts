import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CodeAttachment } from '../models/code-attachments/code-attachment.model';
import { CodeAttachmentMetadata } from '../models/code-attachments/code-attachment-metadata.model';
import { SaveCodeAttachmentRequest } from '../models/code-attachments/save-code-attachment-request.model';
import { appConfig } from '../config/app.config';

@Injectable({
    providedIn: 'root'
})
export class CodeAttachmentsService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = appConfig.apiUrl;

    public getMetadataByUserId(userId: string): Observable<CodeAttachmentMetadata[]> {
        return this.http.get<CodeAttachmentMetadata[]>(`${this.apiUrl}/codeattachments/metadata/${encodeURIComponent(userId)}`);
    }

    public getById(id: string): Observable<CodeAttachment> {
        return this.http.get<CodeAttachment>(`${this.apiUrl}/codeattachments/${encodeURIComponent(id)}`);
    }

    public create(request: SaveCodeAttachmentRequest): Observable<CodeAttachment> {
        return this.http.post<CodeAttachment>(`${this.apiUrl}/codeattachments`, request);
    }

    public update(id: string, request: SaveCodeAttachmentRequest): Observable<CodeAttachment> {
        return this.http.put<CodeAttachment>(`${this.apiUrl}/codeattachments/${encodeURIComponent(id)}`, request);
    }

    public delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/codeattachments/${encodeURIComponent(id)}`);
    }
}

