export interface ExcuseResponse {
  excuse: string;
  absurdityLevel: number;
}

export interface JellyTheme {
  primary: string;
  secondary: string;
  accent: string;
}

export enum AbsurdityLevel {
  LOW = 10,
  MEDIUM = 50,
  HIGH = 100
}