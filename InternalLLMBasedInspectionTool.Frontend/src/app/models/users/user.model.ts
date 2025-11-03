import { PromptSettings } from './prompt-settings.model';

export interface User {
  id: string;
  nickname: string;
  promptSettings: PromptSettings;
}

