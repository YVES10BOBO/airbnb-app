interface Props {
  count: number;
}

export default function SavedBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <span className="saved-badge">
      {count} {count === 1 ? 'saved' : 'saved'}
    </span>
  );
}
