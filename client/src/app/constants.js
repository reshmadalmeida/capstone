// User Roles - Use lowercase for consistency
export const ROLES = {
  UNDERWRITER: 'underwriter',
  ADMIN: 'admin',
  CLAIMS_ADJUSTER: 'claims_adjuster',
  REINSURANCE_MANAGER: 'reinsurance_manager'
};

export const ROLE_NAMES = {
  underwriter: 'Underwriter',
  admin: 'Administrator',
  claims_adjuster: 'Claims Adjuster',
  reinsurance_manager: 'Reinsurance Manager'
};

export const ROLE_MODULES = {
  underwriter: ['dashboard', 'policies'],
  admin: ['dashboard', 'admin', 'users', 'roles', 'policies', 'claims', 'reinsurance'],
  claims_adjuster: ['dashboard', 'claims'],
  reinsurance_manager: ['dashboard', 'reinsurance', 'policies']
};

export const STEPS = ['General', 'Coverage', 'Review'];
export const INSURANCE_TYPE = ['HEALTH', 'LIFE', 'MOTOR', 'PROPERTY'];

// Policy Statuses
export const POLICY_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDERWRITING_REVIEW: 'UNDERWRITING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE'
}
export const DRAWER_WIDTH = 240;
export const MAIN_WIDTH = 40;