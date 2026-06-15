import { useState, useEffect, useCallback } from 'react';

export default function useCourseFilters() {
  // Helper to parse query parameters
  const getParamsFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('search') || '',
      subject: params.get('subject') || 'All',
      block: params.get('block') || 'All',
      level: params.get('level') || 'All',
      sortBy: params.get('sortBy') || 'popular'
    };
  }, []);

  const initialParams = getParamsFromUrl();

  const [search, setSearch] = useState(initialParams.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialParams.search);
  const [subject, setSubject] = useState(initialParams.subject);
  const [block, setBlock] = useState(initialParams.block);
  const [level, setLevel] = useState(initialParams.level);
  const [sortBy, setSortBy] = useState(initialParams.sortBy);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Sync to URL query parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (subject !== 'All') params.set('subject', subject);
    if (block !== 'All') params.set('block', block);
    if (level !== 'All') params.set('level', level);
    if (sortBy !== 'popular') params.set('sortBy', sortBy);

    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    
    // Use replaceState to keep history clean and avoid bloating browser history stacks
    window.history.replaceState(null, '', newUrl);
  }, [debouncedSearch, subject, block, level, sortBy]);

  // Listen for browser navigation changes (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const current = getParamsFromUrl();
      setSearch(current.search);
      setDebouncedSearch(current.search);
      setSubject(current.subject);
      setBlock(current.block);
      setLevel(current.level);
      setSortBy(current.sortBy);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getParamsFromUrl]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setSubject('All');
    setBlock('All');
    setLevel('All');
    setSortBy('popular');
  }, []);

  return {
    search,
    setSearch,
    debouncedSearch,
    subject,
    setSubject,
    block,
    setBlock,
    level,
    setLevel,
    sortBy,
    setSortBy,
    clearFilters
  };
}
