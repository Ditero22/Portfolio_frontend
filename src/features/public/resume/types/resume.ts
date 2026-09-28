export interface PublicResume {
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ResumeVersion extends PublicResume {
  id: string;
  mimeType: string;
  isActive: boolean;
}
