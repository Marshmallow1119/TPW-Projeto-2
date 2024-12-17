interface AppConfig {
  baseUrl: string;
}

const LOCAL_CONFIG: AppConfig = {
  baseUrl: 'http://localhost:8000/ws',
};

const MACHINE_CONFIG: AppConfig = {
  baseUrl: 'http://192.168.1.100:8000/ws',
};

const PYTHONANYWHERE_CONFIG: AppConfig = {
  baseUrl: 'https://alof.pythonanywhere.com/ws',
};

const VERCEL_CONFIG: AppConfig = {
  baseUrl: 'https://alof.pythonanywhere.com/ws', // API running on PythonAnywhere
};

export const CONFIG: AppConfig = determineEnvironment();

function determineEnvironment(): AppConfig {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname;
    console.log('Hostname:', hostname);

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('Using local config');
      return LOCAL_CONFIG;
    }

    if (hostname === '192.168.1.100') {
      console.log('Using machine config');
      return MACHINE_CONFIG;
    }

    if (hostname === 'alof.pythonanywhere.com') {
      console.log('Using PythonAnywhere config');
      return PYTHONANYWHERE_CONFIG;
    }

    // Detect Vercel-hosted domains
    if (hostname.includes('vercel.app')) {
      console.log('Using Vercel config');
      return VERCEL_CONFIG;
    }
  }

  console.log('Using PythonAnywhere config by default');
  return PYTHONANYWHERE_CONFIG; // Fallback configuration
}
