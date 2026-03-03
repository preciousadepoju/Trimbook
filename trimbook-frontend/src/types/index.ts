export interface WorkingHours {
  startTime?: string;
  endTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  role: 'client' | 'barber' | 'admin' | 'user';
  portfolioImages?: string[];
  workingHours?: WorkingHours;
}
