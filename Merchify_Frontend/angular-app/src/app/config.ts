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
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return LOCAL_CONFIG;
      }
      return LOCAL_CONFIG;
    }
    return LOCAL_CONFIG;
  }
  