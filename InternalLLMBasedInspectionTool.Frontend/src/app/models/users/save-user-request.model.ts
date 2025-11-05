import { PromptSettings } from './prompt-settings.model';

export interface SaveUserRequest {
    nickname: string;
    promptSettings: PromptSettings;
}
