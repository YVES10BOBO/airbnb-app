import { memo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { format } from 'date-fns';
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import numeral from 'numeral';
import type { Listing } from '../types';
import styles from './ListingCard.module.css';

interface Props {
  listing: Listing;
  saved: boolean;
  onToggleSave: () => void;
  onClick?: () => void;
}

function ListingCard({ listing, saved, onToggleSave, onClick }: Props) {
  const { title, location, price, rating, superhost, available, availableFrom, img } = listing;
  const isLuxury = price > 300;

  return (
    <motion.div
      className={clsx(
        styles.card,
        saved && styles.cardSaved,
        isLuxury && styles.cardLuxury,
        !available && styles.cardBooked,
        superhost && styles.superhostCard
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.imageWrap}>
        <img src={img} alt={title} className={styles.image} />
        <button
          className={clsx(styles.heart, saved && styles.heartActive)}
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          {saved ? <FaHeart /> : <FaRegHeart />}
        </button>
        {superhost && <span className={styles.superhostBadge}>Superhost</span>}
        {isLuxury && <span className={styles.luxuryBadge}>Luxury</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.rating}>
            <FaStar className={styles.star} />
            <span>{numeral(rating).format('0.00')}</span>
          </div>
        </div>

        <div className={styles.location}>
          <FaMapMarkerAlt className={styles.pin} />
          <span>{location}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceAmount}>{numeral(price).format('$0,0')}</span>
            <span> / night</span>
          </div>
          <div className={clsx(styles.status, !available && styles.statusBooked)}>
            {available ? 'Available' : 'Booked'}
          </div>
        </div>

        <div className={styles.date}>
          Available from: {format(new Date(availableFrom), 'MMM dd, yyyy')}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ListingCard);
