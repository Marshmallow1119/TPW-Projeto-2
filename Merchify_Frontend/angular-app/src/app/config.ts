interface AppConfig {
    baseUrl: string;
  }
  
  const LOCAL_CONFIG: AppConfig = {
    baseUrl: 'http://localhost:8000/ws',
  };
  
  const MACHINE_CONFIG: AppConfig = {
    baseUrl: 'http://192.168.1.100:8000/ws',
  };
  
  export const CONFIG: AppConfig = determineEnvironment();
  
  function determineEnvironment(): AppConfig {
    if (typeof window !== 'undefined' && window.location.hostname) {
      const hostname = window.location.hostname;
  
      // Check for localhost or 127.0.0.1
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return LOCAL_CONFIG;
      }
  
      // Check for specific machine configuration
      if (hostname === '192.168.1.100') {
        return MACHINE_CONFIG;
      }
    }
  
    // Default to LOCAL_CONFIG
    return LOCAL_CONFIG;
  }
  
  