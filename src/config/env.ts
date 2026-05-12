type AppEnv = {
  appName: string;
  apiUrl: string;
  userAvatarUrl: string;
  enableMocks: boolean;
};

const requiredEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required frontend environment variable: ${key}`);
  }
  return value.trim();
};

const parseBoolean = (key: string): boolean => {
  const value = requiredEnv(key).toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${key} must be either "true" or "false"`);
};

const apiUrl = requiredEnv('VITE_API_URL').replace(/\/+$/, '');

if (!/^https?:\/\//.test(apiUrl)) {
  throw new Error('VITE_API_URL must start with http:// or https://');
}

export const appEnv: AppEnv = {
  appName: requiredEnv('VITE_APP_NAME'),
  apiUrl,
  userAvatarUrl: requiredEnv('VITE_USER_AVATAR_URL'),
  enableMocks: parseBoolean('VITE_ENABLE_MOCKS'),
};
