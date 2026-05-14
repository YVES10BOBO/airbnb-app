import { FaImage } from 'react-icons/fa';
import './ListingCover.css';

type Props = {
  /** Primary image URL from API; omit or empty → neutral placeholder (no stock photo). */
  url?: string | null;
  /** Used when `url` is set (accessibility). */
  alt: string;
  /** Applied to `<img>` or the placeholder wrapper so layout matches your card styles. */
  className?: string;
};

export default function ListingCover({ url, alt, className = '' }: Props) {
  if (url && url.trim()) {
    return <img src={url} alt={alt} className={className} loading="lazy" />;
  }
  return (
    <div
      className={`listing-cover-placeholder ${className}`.trim()}
      role="img"
      aria-label=""
    >
      <FaImage aria-hidden />
    </div>
  );
}
