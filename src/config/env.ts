type AppEnv = {
  appName: string;
  apiUrl: string;
  userAvatarUrl: string;
  enableMocks: boolean;
};

const envValue = (key: string, fallback: string): string => {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }
  return value.trim();
};

const parseBoolean = (key: string): boolean => {
  const value = envValue(key, 'false').toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${key} must be either "true" or "false"`);
};

const apiUrl = envValue('VITE_API_URL', 'http://localhost:8000').replace(/\/+$/, '');

if (!/^https?:\/\//.test(apiUrl)) {
  throw new Error('VITE_API_URL must start with http:// or https://');
}

export const appEnv: AppEnv = {
  appName: envValue('VITE_APP_NAME', 'ArchiMind AI'),
  apiUrl,
  userAvatarUrl: envValue('VITE_USER_AVATAR_URL', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  enableMocks: parseBoolean('VITE_ENABLE_MOCKS'),
};
