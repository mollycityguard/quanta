export interface Monitor {
  id: string;
  url: string;
  name: string;
  interval: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface MonitorCreateData {
  url: string;
  name: string;
  interval?: number;
  isActive?: boolean;
}

export interface MonitorUpdateData {
  url?: string;
  name?: string;
  interval?: number;
  isActive?: boolean;
}
