// Common types for the application
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface AppState {
  user: User | null;
  theme: Theme;
  language: string;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
