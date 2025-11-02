import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';
import { SvgIcons } from '../../shared/svg-icons';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CodeEditorComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  public showIssuesModal = signal<boolean>(false);
  public readonly closeIcon: SafeHtml;

  constructor(private readonly sanitizer: DomSanitizer) {
    this.closeIcon = this.sanitizer.bypassSecurityTrustHtml(SvgIcons.close(24, 24));
  }

  public onIssuesClick(): void {
    this.showIssuesModal.set(true);
  }

  public closeIssuesModal(): void {
    this.showIssuesModal.set(false);
  }
}
