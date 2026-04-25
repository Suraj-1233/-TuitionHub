export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  name: string;
  email: string;
  isApproved: boolean;
  timezone?: string;
}

export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT' | 'SUPER_ADMIN' | 'ORG_ADMIN';
  studentClass?: string;
  board?: string;
  subject?: string;
  qualification?: string;
  bio?: string;
  fees?: number;
  timingFrom?: string;
  timingTo?: string;
  availableDays?: string;
  city?: string;
  country?: string;
  profilePhoto?: string;
  timezone?: string;
  currency?: string;
  isActive: boolean;
  isApproved: boolean;
}

export interface Batch {
  id: number;
  name: string;
  description?: string;
  subject: string;
  targetClass: string;
  maxStudents: number;
  currentStudents: number;
  monthlyFees: number;
  timingFrom: string;
  timingTo: string;
  days: string;
  liveClassLink?: string;
  liveClassPlatform?: string;
  proposedTiming?: string;
  proposedByRole?: string;
  isTimeChangeProposed?: boolean;
  teacher: {
    id: number;
    name: string;
    subject: string;
    profilePhoto?: string;
    fees?: number;
    timingFrom?: string;
    timingTo?: string;
    isApproved: boolean;
  };
  isActive: boolean;
  timezone?: string;
  students?: User[];
}

export interface Payment {
  id: number;
  studentName: string;
  batchName: string;
  amount: number;
  forMonth: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
}

export interface BatchJoinRequest {
  id: number;
  student: User;
  batch: Batch;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export interface AssignmentRequest {
  id: number;
  student: User;
  subjects: string;
  preferredTimings: string;
  notes?: string;
  status: 'PENDING' | 'ASSIGNED' | 'REJECTED';
  requestedAt: string;
}
