import { useEffect, useRef, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useStore } from '../../../store/StoreContext';

export default function SearchBar() {
  const { dispatch } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const debouncedDispatch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch({ type: 'SET_FILTER', payload: value });
      }, 300),
    [dispatch]
  );

  useEffect(() => {
    return () => { debouncedDispatch.cancel(); };
  }, [debouncedDispatch]);

  return (
    <div className="search-bar">
      <span className="search-bar__icon">🔍</span>
      <input
        ref={inputRef}
        className="search-bar__input"
        placeholder="Search listings..."
        onChange={(e) => debouncedDispatch(e.target.value)}
      />
    </div>
  );
}
