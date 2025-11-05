import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SvgIcons } from '../../shared/svg-icons';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    public readonly logoIcon: SafeHtml;
    public readonly settingsIcon: SafeHtml;

    constructor(private readonly sanitizer: DomSanitizer) {
        this.logoIcon = this.sanitizer.bypassSecurityTrustHtml(SvgIcons.logo());
        this.settingsIcon = this.sanitizer.bypassSecurityTrustHtml(
            SvgIcons.settings(24, 24),
        );
    }

    public onSettingsClick(): void {
        console.log('Settings clicked');
    }
}
