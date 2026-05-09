import { Transition } from '@headlessui/react';
import { useMemo } from 'react';
import numeral from 'numeral';
import { useStore } from '../../../store/StoreContext';
import './SavedListings.css';

interface Props {
  show: boolean;
}

export default function SavedListings({ show }: Props) {
  const { state } = useStore();
  const savedListings = useMemo(
    () => state.listings.filter((l) => state.saved.includes(l.id)),
    [state.listings, state.saved]
  );

  return (
    <Transition
      show={show}
      enter="sl-enter"
      enterFrom="sl-enter-from"
      enterTo="sl-enter-to"
      leave="sl-leave"
      leaveFrom="sl-leave-from"
      leaveTo="sl-leave-to"
    >
      <div className="saved-panel">
        <h3 className="saved-panel__title">Saved Listings ({savedListings.length})</h3>
        {savedListings.length === 0 ? (
          <p className="saved-panel__empty">No saved listings yet.</p>
        ) : (
          <ul className="saved-panel__list">
            {savedListings.map((l) => (
              <li key={l.id} className="saved-panel__item">
                <span className="saved-panel__item-title">{l.title}</span>
                <span className="saved-panel__item-location">{l.location}</span>
                <span className="saved-panel__item-price">{numeral(l.price).format('$0,0')}/night</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Transition>
  );
}
