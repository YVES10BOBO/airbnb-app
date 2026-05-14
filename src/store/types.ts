import type { Listing } from '../features/listings/types';

export interface State {
  listings: Listing[];
  loading: boolean;
  filter: string;
  saved: string[];
}

export type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'UPSERT_LISTING'; payload: Listing }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SAVED'; payload: string[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'RESET' };
