import React from 'react';
import { supabase } from './supabase';

// USD donation account information is intentionally explicit so donors do not mistake it for a naira account.
const DONATION_ACCOUNT = {
  currency: 'USD (US Dollar)',
  accountName: 'HILLTOP PRAYER & EVANGELICAL MINISTRY',
  bank: 'ZENITH BANK',
  accountNumber: '5074529651',
};

export { DONATION_ACCOUNT };

// The remainder of this file is retained by the existing application implementation.
