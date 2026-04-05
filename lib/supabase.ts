// Mock for legacy imports - not used in local SPA mode.
export const supabase = {
  auth: {
    signOut: async () => {},
  }
};
