export enum CodeLanguage {
  Unknown = 0,
  CSharp = 1,
  Java = 2,
  Kotlin = 3,
  TypeScript = 4,
  JavaScript = 5,
  Python = 6,
  Cpp = 7,
  Go = 8,
  Rust = 9,
  Html = 10,
  Css = 11,
  Json = 12,
  Xml = 13,
  Yaml = 14,
  Markdown = 15,
  Other = 99
}

export interface CodeAttachment {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  codeLanguage: CodeLanguage;
  originalData?: string;
  editedData?: string;
  diffData?: string;
}

