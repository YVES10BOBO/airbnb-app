import { FaArrowUp, FaArrowDown, FaCreditCard, FaPlus } from 'react-icons/fa';
import './WalletPage.css';

const TRANSACTIONS = [
  { id: 1, type: 'credit',  label: 'Booking refund — Beach Villa',     amount: 450,  date: 'May 10, 2026', status: 'completed' },
  { id: 2, type: 'debit',   label: 'Booking payment — Mountain Cabin', amount: 925,  date: 'May 08, 2026', status: 'completed' },
  { id: 3, type: 'credit',  label: 'Cashback reward',                  amount: 25,   date: 'May 05, 2026', status: 'completed' },
  { id: 4, type: 'debit',   label: 'Booking payment — City Loft',      amount: 340,  date: 'Apr 28, 2026', status: 'pending' },
  { id: 5, type: 'credit',  label: 'Top-up via Visa •••• 4242',       amount: 1000, date: 'Apr 20, 2026', status: 'completed' },
  { id: 6, type: 'debit',   label: 'Booking payment — Vineyard Stay',  amount: 720,  date: 'Apr 15, 2026', status: 'completed' },
];

export default function WalletPage() {
  return (
    <div className="wallet-page">
      <div className="wallet-page__header">
        <h1 className="wallet-page__title">Wallet</h1>
        <p className="wallet-page__sub">Manage your balance and transactions.</p>
      </div>

      {/* Balance card */}
      <div className="wallet-balance-card">
        <div className="wallet-balance-card__left">
          <p className="wallet-balance-card__label">Total Balance</p>
          <h2 className="wallet-balance-card__amount">$1,285.00</h2>
          <p className="wallet-balance-card__note">Available to spend or withdraw</p>
          <div className="wallet-balance-card__actions">
            <button className="wallet-action-btn wallet-action-btn--primary">
              <FaPlus /> Add Funds
            </button>
            <button className="wallet-action-btn wallet-action-btn--outline">
              <FaArrowUp /> Withdraw
            </button>
          </div>
        </div>
        <div className="wallet-balance-card__right">
          <div className="wallet-balance-card__circles">
            <div className="wallet-circle wallet-circle--1" />
            <div className="wallet-circle wallet-circle--2" />
            <div className="wallet-circle wallet-circle--3" />
            <FaCreditCard className="wallet-balance-card__icon" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="wallet-stats">
        <div className="wallet-stat">
          <div className="wallet-stat__icon wallet-stat__icon--green"><FaArrowDown /></div>
          <div>
            <p className="wallet-stat__val">$1,475.00</p>
            <p className="wallet-stat__label">Total Income</p>
          </div>
        </div>
        <div className="wallet-stat">
          <div className="wallet-stat__icon wallet-stat__icon--red"><FaArrowUp /></div>
          <div>
            <p className="wallet-stat__val">$1,985.00</p>
            <p className="wallet-stat__label">Total Spent</p>
          </div>
        </div>
        <div className="wallet-stat">
          <div className="wallet-stat__icon wallet-stat__icon--orange"><FaCreditCard /></div>
          <div>
            <p className="wallet-stat__val">6</p>
            <p className="wallet-stat__label">Transactions</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="wallet-txns">
        <div className="wallet-txns__head">
          <h2 className="wallet-txns__title">Transaction History</h2>
        </div>
        <div className="wallet-txns__list">
          {TRANSACTIONS.map((t) => (
            <div key={t.id} className="wallet-txn">
              <div className={`wallet-txn__icon wallet-txn__icon--${t.type}`}>
                {t.type === 'credit' ? <FaArrowDown /> : <FaArrowUp />}
              </div>
              <div className="wallet-txn__info">
                <p className="wallet-txn__label">{t.label}</p>
                <p className="wallet-txn__date">{t.date}</p>
              </div>
              <div className="wallet-txn__right">
                <span className={`wallet-txn__amount wallet-txn__amount--${t.type}`}>
                  {t.type === 'credit' ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
                <span className={`wallet-txn__status wallet-txn__status--${t.status}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
