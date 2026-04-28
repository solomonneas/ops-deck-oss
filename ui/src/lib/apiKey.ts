export function getApiKey(): string {
  const envKey = import.meta.env.VITE_OPSDECK_API_KEY;
  if (typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  if (typeof window !== 'undefined') {
    const storedKey = window.localStorage.getItem('opsdeck_api_key');
    if (storedKey && storedKey.trim()) {
      return storedKey.trim();
    }
  }

  return '';
}
