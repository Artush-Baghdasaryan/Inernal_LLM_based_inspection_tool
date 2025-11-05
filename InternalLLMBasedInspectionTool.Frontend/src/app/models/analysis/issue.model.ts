export enum IssueLevel {
    Info = 0,
    Warning = 1,
    Error = 2,
}

export enum IssueSeverity {
    Low = 0,
    Medium = 1,
    High = 2,
}

export enum IssueCategory {
    Readability = 0,
    Performance = 1,
    Correctness = 2,
    Style = 3,
    Maintainability = 4,
    Security = 5,
}

export interface Issue {
    title: string;
    description: string;
    level: IssueLevel;
    severity: IssueSeverity;
    category: IssueCategory;
    confidence: number;
    startLine?: number;
    endLine?: number;
    codeHint?: string;
    isFixed?: boolean;
}

