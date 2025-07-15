// Shared type for sessionDetail, moved from dynamic route file
export type sessionDetail = {
  id: number,
  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: any, // Replace 'any' with the correct type if available
  createdOn: string,
};
