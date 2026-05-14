import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../../store/StoreContext';
import { useAuth } from '../../auth/hooks/useAuth';
import { favoritesService } from '../../../api';

export function useFavorites() {
  const { state, dispatch } = useStore();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const userId = user.id;
    favoritesService.getAll(userId)
      .then((favs) => dispatch({ type: 'SET_SAVED', payload: favs.map((f) => f.listingId) }))
      .catch(() => {});
  }, [isAuthenticated, user?.id]);

  async function toggle(id: string, title: string) {
    if (!user?.id) {
      toast.error('Please log in to save listings.');
      return;
    }
    const userId = user.id;
    const alreadySaved = state.saved.includes(id);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
    try {
      if (alreadySaved) {
        await favoritesService.remove(userId, id);
        toast(`Removed from saved: ${title}`);
      } else {
        await favoritesService.add(userId, id);
        toast.success(`Saved: ${title}`);
      }
    } catch {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
      toast.error('Failed to update saved listings.');
    }
  }

  return {
    saved: state.saved,
    count: state.saved.length,
    isSaved: (id: string) => state.saved.includes(id),
    toggle,
  };
}
