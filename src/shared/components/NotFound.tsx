import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1 className="not-found__code">404</h1>
      <p className="not-found__title">Page not found</p>
      <p className="not-found__sub">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn--active not-found__btn">
        Back to Home
      </Link>
    </div>
  );
}
