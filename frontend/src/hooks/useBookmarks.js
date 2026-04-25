import { useState, useEffect } from 'react';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('cyberpulse_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('cyberpulse_bookmarks');
        setBookmarks(saved ? JSON.parse(saved) : []);
      } catch {}
    };

    window.addEventListener('bookmarks_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('bookmarks_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const isBookmarked = prev.includes(id);
      const newBookmarks = isBookmarked ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem('cyberpulse_bookmarks', JSON.stringify(newBookmarks));
      window.dispatchEvent(new Event('bookmarks_updated'));
      return newBookmarks;
    });
  };

  return { bookmarks, toggleBookmark };
}
