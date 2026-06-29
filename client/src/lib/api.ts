const API_BASE_URL = '/api';

export const api = {
  // Auth
  getGoogleConfig: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/google-config`);
    return res.json();
  },

  saveGoogleConfig: async (config: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/google-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  testGoogleConfig: async (config: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/test-google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  loginWithGoogle: async (code: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return res.json();
  },

  login: async (tenantDomain: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantDomain, email, password })
    });
    return res.json();
  },

  // CMS
  getWebsiteState: async (id: 'draft' | 'live') => {
    const res = await fetch(`${API_BASE_URL}/cms/${id}`);
    return res.json();
  },
  
  updateWebsiteState: async (id: 'draft' | 'live', state: any) => {
    const res = await fetch(`${API_BASE_URL}/cms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    return res.json();
  },

  // Businesses (Tenants)
  getBusinesses: async () => {
    const res = await fetch(`${API_BASE_URL}/businesses`);
    return res.json();
  },
  
  createBusiness: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Jobs
  getJobs: async (tenantDomain: string) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${tenantDomain}`);
    return res.json();
  },

  // Chatbot
  sendChatMessage: async (data: { message: string, history: any[], currentPage: string }) => {
    const res = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // We intentionally don't throw here if !res.ok so the component can read res.json() to get the explicit error message.
    return {
      status: res.status,
      ok: res.ok,
      data: await res.json()
    };
  }
};
