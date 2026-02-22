export interface Notification {
  id: number;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
