export interface MachineStatus {
  id: number;
  machine_id: number;
  imei: string;
  fan_on: boolean;
  powder_motor_on: boolean;
  powder_on: boolean;
  powder_off: boolean;
  pump_in_on: boolean;
  pump_out_on: boolean;
  main_speed_rpm: number;
  machine_cycles: number;
  run_test_set: boolean;
  run_test_set_g?: number;
  processing_time: string;
  remaining_time: string;
  min: number;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: number;
  name: string;
  status: MachineStatus | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
  // Password is write-only, not returned in GET
  password?: string;
}

export interface Device {
  id: number;
  imei: string;
  info: string;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionRequest {
  user_id: number;
  machine_id: number;
}

export interface LoginResponse {
  token: string;
}
