import { useState, useEffect } from 'react';
import { LanguageData } from '@/data/languages';
import { languageService } from '@/services/languageService';

interface UseLanguagesResult {
  languages: LanguageData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLanguages = (): UseLanguagesResult => {
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await languageService.fetchLanguages();
      setLanguages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load languages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  return {
    languages,
    isLoading,
    error,
    refetch: fetchLanguages
  };
};