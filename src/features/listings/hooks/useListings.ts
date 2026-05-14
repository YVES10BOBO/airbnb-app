import { useEffect } from 'react';
import { useStore } from '../../../store/StoreContext';
import { listingsService } from '../../../api';
import { mapApiListingToListing } from '../utils/mapApiListing';

async function fetchListings() {
  try {
    return await listingsService.getAll({ limit: 100 });
  } catch {
    // First attempt failed (likely Neon DB cold start). Wait 4s and retry once.
    await new Promise((r) => setTimeout(r, 4000));
    return listingsService.getAll({ limit: 100 });
  }
}

export function useListings(): void {
  const { dispatch } = useStore();

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'SET_LOADING', payload: true });

    fetchListings()
      .then(({ data }) => {
        if (!cancelled) dispatch({ type: 'SET_LISTINGS', payload: data.map(mapApiListingToListing) });
      })
      .catch((err) => {
        console.warn('Failed to load listings from API.', err);
        // Do not clear existing listings on error — keep whatever was loaded before.
      })
      .finally(() => { if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false }); });

    return () => { cancelled = true; };
  }, [dispatch]);
}
