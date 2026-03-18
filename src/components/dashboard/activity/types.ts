
export interface ActivityItem {
  id: number;
  type: 'new_user' | 'consultation' | 'recharge' | 'user_online';
  user: string;
  time: string;
  timestamp: number;
  amount?: number;
}
