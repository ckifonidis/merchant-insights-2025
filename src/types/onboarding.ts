/**
 * Onboarding Types - New user signup functionality
 */

// API Request Headers (consistent with existing patterns)
export interface OnboardingRequestHeader {
  ID: string;
  application: string;
}

// Get Email API Types
export interface GetEmailRequest {
  header: OnboardingRequestHeader;
  payload: {
    userID: string;
  };
}

export interface GetEmailResponse {
  payload: {
    companyDetails: {
      emailAddress: string;
    };
  };
  exception: any;
  messages: any[];
  executionTime: number;
}

// Submit Signup Form API Types
export interface SubmitSignupFormRequest {
  header: OnboardingRequestHeader;
  payload: {
    userID: string;
    merchantEmail: string;
    otherBankMIDs: string[];
    extraData?: any;
  };
}

export interface SubmitSignupFormResponse {
  payload: {};
  exception: any;
  messages: any[];
  executionTime: number;
}

// Check Submission Status API Types
export interface CheckSubmissionRequest {
  header: OnboardingRequestHeader;
  payload: {
    userID: string;
  };
}

export interface CheckSubmissionResponse {
  payload: {
    submittedBySameUserId: boolean;
    submittedByOtherUserId: boolean;
  };
  exception: any;
  messages: any[];
  executionTime: number;
}

// Form Data Types
export interface SignupFormData {
  email: string;
  otherBankMIDs: string[];
}

// Simplified Signup Step State Machine
export type SignupStep = 
  | 'idle'       // No signup initiated
  | 'form'       // Showing signup form
  | 'submitted'; // Successfully submitted

// Submission Status Helper Type
export interface SubmissionStatus {
  submittedBySameUserId: boolean;
  submittedByOtherUserId: boolean;
  canProceed: boolean; // Computed field: can user proceed with signup
}

// Service Interface
export interface OnboardingServiceParams {
  userID: string;
  merchantEmail: string;
  otherBankMIDs: string[];
  extraData?: any;
}

// Component Props Interfaces
export interface SignupFormContainerProps {
  userID: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface PresentationalSignupFormProps {
  email: string;
  otherBankMIDs: string[];
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  onEmailChange: (email: string) => void;
  onMerchantIDsChange: (ids: string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// Form Validation Types
export interface SignupFormValidation {
  email: {
    isValid: boolean;
    error?: string;
  };
  otherBankMIDs: {
    isValid: boolean;
    error?: string;
  };
  isFormValid: boolean;
}