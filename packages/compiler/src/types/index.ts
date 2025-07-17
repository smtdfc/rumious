export interface CompilerOptions {
  environment: string;
}

export interface CompileResult {
  code: string;
  map: string;
}

export interface SourceMetadata {
  filename: string;
  type: 'module';
}
