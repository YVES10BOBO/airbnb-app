import type { State, Action } from './types';

export const initialState: State = {
  listings: [],
  loading: false,
  filter: '',
  saved: [],
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload };
    case 'UPSERT_LISTING': {
      const idx = state.listings.findIndex((l) => l.id === action.payload.id);
      if (idx >= 0) {
        const next = [...state.listings];
        next[idx] = action.payload;
        return { ...state, listings: next };
      }
      return { ...state, listings: [...state.listings, action.payload] };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SAVED':
      return { ...state, saved: action.payload };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter((id) => id !== action.payload)
          : [...state.saved, action.payload],
      };
    case 'RESET':
      return { ...state, filter: '', saved: [] };
  }
}
