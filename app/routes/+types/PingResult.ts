export interface PingResult {
  id: string;
  monitorId: string;
  status: "UP" | "DOWN" | string;
  statusCode: number | null;
  responseTime: number;
  timestamp: string;
}
