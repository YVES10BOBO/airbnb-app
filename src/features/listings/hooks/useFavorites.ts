import toast from 'react-hot-toast';
import { useStore } from '../../../store/StoreContext';

export function useFavorites() {
  const { state, dispatch } = useStore();

  function toggle(id: number, title: string) {
    const alreadySaved = state.saved.includes(id);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
    if (alreadySaved) {
      toast(`Removed: ${title}`, { icon: '💔' });
    } else {
      toast.success(`Saved: ${title}`);
    }
  }

  return {
    saved: state.saved,
    count: state.saved.length,
    isSaved: (id: number) => state.saved.includes(id),
    toggle,
  };
}
