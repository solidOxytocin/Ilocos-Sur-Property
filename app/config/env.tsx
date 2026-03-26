// src/config/env.ts
interface EnvConfig {
  useMock: boolean;
  apiUrl: string | null;
}

const ENV = {
  mock: { useMock: true, apiUrl: null },
  development: { useMock: false, apiUrl: "http://192.168.1.15:5000" },
  production: { useMock: false, apiUrl: "https://api.myapp.com" }
};

export default ENV.development as EnvConfig; // switch env here