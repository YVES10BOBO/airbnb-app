import { useState } from 'react';
import {
  FaSearch, FaPaperPlane, FaSmile, FaPaperclip,
  FaPhone, FaVideo, FaInfoCircle, FaEllipsisV,
  FaBell, FaUserFriends, FaAddressBook, FaCommentDots,
  FaPen, FaChevronRight, FaChevronDown, FaChevronUp,
  FaCalendarCheck, FaStar, FaTag,
} from 'react-icons/fa';
import './MessagesPage.css';

const CONVERSATIONS = [
  { id: 1, name: 'Emma Johnson',   avatar: 'EJ', color: '#7c3aed', lastMsg: 'Hi! Is the beach villa still available for June 12?',     time: '2m',   unread: 2, listing: 'Luxury Beach Villa',  online: true,  lastSeen: 'Active now' },
  { id: 2, name: 'Marcus Lee',     avatar: 'ML', color: '#0284c7', lastMsg: 'Thank you for the great stay! Left a 5-star review.',     time: '1h',   unread: 0, listing: 'Cozy Mountain Cabin', online: false, lastSeen: 'Last seen 1h ago' },
  { id: 3, name: 'Sophia Patel',   avatar: 'SP', color: '#FF4A2A', lastMsg: 'Can we arrange an early check-in at 11am?',               time: '3h',   unread: 1, listing: 'Modern Downtown Apt', online: true,  lastSeen: 'Active now' },
  { id: 4, name: 'David Kim',      avatar: 'DK', color: '#16a34a', lastMsg: 'Booking confirmed. See you on July 15!',                  time: 'Tue',  unread: 0, listing: 'Alpine Ski Chalet',   online: false, lastSeen: 'Last seen 2d ago' },
  { id: 5, name: 'Laila Osman',    avatar: 'LO', color: '#d97706', lastMsg: 'The photos look amazing. Is breakfast included?',         time: 'Mon',  unread: 0, listing: 'Seaside Cottage',     online: false, lastSeen: 'Last seen 3d ago' },
  { id: 6, name: 'Chris Burton',   avatar: 'CB', color: '#9333ea', lastMsg: 'We loved every moment — highly recommend this place!',   time: '1/22', unread: 0, listing: 'Vineyard Cottage',    online: false, lastSeen: 'Last seen 5d ago' },
];

const NOTIFICATIONS = [
  { id: 1, icon: <FaCalendarCheck />, iconColor: '#16a34a', iconBg: '#dcfce7', title: 'New Booking',          body: 'Emma Johnson booked Luxury Beach Villa for Jun 12–18.',  time: '2m ago',   read: false },
  { id: 2, icon: <FaStar />,          iconColor: '#d97706', iconBg: '#fef9c3', title: 'New Review',           body: 'Marcus Lee left a 5-star review on Cozy Mountain Cabin.', time: '1h ago',   read: false },
  { id: 3, icon: <FaCommentDots />,   iconColor: '#0284c7', iconBg: '#e0f2fe', title: 'New Message',          body: 'Sophia Patel asked about early check-in.',                time: '3h ago',   read: false },
  { id: 4, icon: <FaTag />,           iconColor: '#7c3aed', iconBg: '#f3e8ff', title: 'Booking Reminder',     body: 'David Kim arrives tomorrow — July 15 at Alpine Ski Chalet.', time: 'Yesterday', read: true },
  { id: 5, icon: <FaStar />,          iconColor: '#d97706', iconBg: '#fef9c3', title: 'Review Reminder',      body: 'Don\'t forget to review Laila Osman\'s stay.',            time: '2d ago',   read: true },
];

const THREADS: Record<number, { id: number; from: 'me' | 'them'; text: string; time: string }[]> = {
  1: [
    { id: 1, from: 'them', text: 'Hi! Is the beach villa still available for June 12?', time: '10:32 AM' },
    { id: 2, from: 'me',   text: 'Yes it is! June 12–18 is fully open. Shall I hold it for you?', time: '10:35 AM' },
    { id: 3, from: 'them', text: 'That would be perfect! What is the check-in time?', time: '10:36 AM' },
    { id: 4, from: 'them', text: 'Also, is there parking available at the property?', time: '10:37 AM' },
  ],
  2: [
    { id: 1, from: 'them', text: 'Just checked out. What an incredible place!', time: '9:10 AM' },
    { id: 2, from: 'me',   text: 'So glad you enjoyed it! Hope to host you again.', time: '9:45 AM' },
    { id: 3, from: 'them', text: 'Thank you for the great stay! Left a 5-star review.', time: '10:00 AM' },
  ],
  3: [{ id: 1, from: 'them', text: 'Can we arrange an early check-in at 11am?', time: '7:22 AM' }],
  4: [
    { id: 1, from: 'me',   text: 'Your booking is confirmed. Everything is ready!', time: 'Tue' },
    { id: 2, from: 'them', text: 'Booking confirmed. See you on July 15!', time: 'Tue' },
  ],
  5: [{ id: 1, from: 'them', text: 'The photos look amazing. Is breakfast included?', time: 'Mon' }],
  6: [{ id: 1, from: 'them', text: 'We loved every moment — highly recommend this place!', time: '1/22' }],
};

const COLORS = ['#FF4A2A','#ff7043','#fbbf24','#84cc16','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f43f5e','#a78bfa'];

const onlineCount = CONVERSATIONS.filter(c => c.online).length;
const unreadCount = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);
const notifUnread = NOTIFICATIONS.filter(n => !n.read).length;

const TABS = [
  { id: 'chats',    icon: <FaCommentDots />, label: 'Chats',    badge: unreadCount },
  { id: 'online',   icon: <FaUserFriends />, label: 'Online',   badge: onlineCount },
  { id: 'contacts', icon: <FaAddressBook />, label: 'Contacts', badge: 0 },
  { id: 'notifs',   icon: <FaBell />,        label: 'Notifs',   badge: notifUnread },
];

const TAB_SECTION_LABEL: Record<string, string> = {
  chats:    'RECENT CHATS',
  online:   'ONLINE NOW',
  contacts: 'ALL CONTACTS',
  notifs:   'NOTIFICATIONS',
};

export default function MessagesPage() {
  const [activeId, setActiveId]             = useState(1);
  const [search, setSearch]                 = useState('');
  const [input, setInput]                   = useState('');
  const [activeTab, setActiveTab]           = useState('chats');
  const [infoOpen, setInfoOpen]             = useState<Record<string, boolean>>({});
  const [chatColor, setChatColor]           = useState('#FF4A2A');
  const [autoBot, setAutoBot]               = useState(false);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  const active = CONVERSATIONS.find((c) => c.id === activeId)!;

  const filteredBySearch = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.listing.toLowerCase().includes(search.toLowerCase())
  );

  const displayList =
    activeTab === 'online'
      ? filteredBySearch.filter((c) => c.online)
      : filteredBySearch;

  const filteredMsgs = chatSearchQuery.trim()
    ? (THREADS[activeId] ?? []).filter((m) =>
        m.text.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : (THREADS[activeId] ?? []);

  function toggleInfo(key: string) {
    setInfoOpen((s) => ({ ...s, [key]: !s[key] }));
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setInput('');
  }

  const showConvoList = activeTab !== 'notifs';

  return (
    <div className="msg-page">
      <div className="msg-page__header">
        <h1 className="msg-page__title">Messages</h1>
        <p className="msg-page__sub">Communicate with your guests and hosts.</p>
      </div>

      <div className="msg-layout">

        {/* ── Left: conversation list ── */}
        <aside className="msg-left">
          {/* Search — only for chats/online/contacts */}
          {activeTab !== 'notifs' && (
            <div className="msg-left__search-row">
              <div className="msg-left__search">
                <FaSearch className="msg-left__search-icon" />
                <input
                  className="msg-left__search-input"
                  placeholder={activeTab === 'contacts' ? 'Search contacts…' : 'Search people or listing…'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="msg-left__compose"><FaPen /></button>
            </div>
          )}

          {/* Tabs */}
          <div className="msg-left__tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`msg-left__tab ${activeTab === t.id ? 'msg-left__tab--active' : ''}`}
                onClick={() => { setActiveTab(t.id); setSearch(''); }}
              >
                <span className="msg-left__tab-icon">
                  {t.icon}
                  {t.badge > 0 && <span className="msg-left__tab-badge">{t.badge}</span>}
                </span>
                <span className="msg-left__tab-label">{t.label}</span>
              </button>
            ))}
          </div>

          <p className="msg-left__section-title">{TAB_SECTION_LABEL[activeTab]}</p>

          {/* Notification list */}
          {!showConvoList && (
            <div className="msg-notif-list">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`msg-notif ${n.read ? '' : 'msg-notif--unread'}`}>
                  <div className="msg-notif__icon" style={{ background: n.iconBg, color: n.iconColor }}>
                    {n.icon}
                  </div>
                  <div className="msg-notif__body">
                    <p className="msg-notif__title">{n.title}</p>
                    <p className="msg-notif__text">{n.body}</p>
                    <span className="msg-notif__time">{n.time}</span>
                  </div>
                  {!n.read && <span className="msg-notif__dot" />}
                </div>
              ))}
            </div>
          )}

          {/* Conversation / Contact list */}
          {showConvoList && (
            <div className="msg-convo-list">
              {displayList.length === 0 ? (
                <p className="msg-left__empty">
                  {activeTab === 'online' ? 'No one is online right now.' : 'No results found.'}
                </p>
              ) : (
                displayList.map((c) => (
                  <div
                    key={c.id}
                    className={`msg-convo ${activeId === c.id ? 'msg-convo--active' : ''}`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <div className="msg-convo__avatar-wrap">
                      <div className="msg-convo__avatar" style={{ background: c.color }}>{c.avatar}</div>
                      {c.online && <span className="msg-convo__online-dot" />}
                      {c.unread > 0 && activeTab !== 'contacts' && (
                        <span className="msg-convo__badge">{c.unread}</span>
                      )}
                    </div>
                    <div className="msg-convo__body">
                      <div className="msg-convo__top">
                        <span className="msg-convo__name">{c.name}</span>
                        {activeTab !== 'contacts' && (
                          <span className="msg-convo__time">{c.time}</span>
                        )}
                      </div>
                      {activeTab === 'contacts' ? (
                        <p className="msg-convo__last">{c.listing}</p>
                      ) : (
                        <p className="msg-convo__last">{c.lastMsg}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </aside>

        {/* ── Center: chat window ── */}
        <div className="msg-chat">
          {/* Chat header */}
          <div className="msg-chat__header">
            <div className="msg-chat__header-left">
              <div className="msg-chat__avatar" style={{ background: active.color }}>{active.avatar}</div>
              <div>
                <p className="msg-chat__name">{active.name}</p>
                <p className="msg-chat__status" style={{ color: active.online ? '#16a34a' : '#aaa' }}>
                  {active.lastSeen}
                </p>
              </div>
            </div>
            <div className="msg-chat__header-actions">
              <button className="msg-chat__action-btn"><FaPhone /></button>
              <button className="msg-chat__action-btn"><FaVideo /></button>
              <button className="msg-chat__action-btn"><FaInfoCircle /></button>
              <button
                className={`msg-chat__action-btn ${chatSearchOpen ? 'msg-chat__action-btn--active' : ''}`}
                onClick={() => { setChatSearchOpen(v => !v); setChatSearchQuery(''); }}
                title="Search in conversation"
              >
                <FaSearch />
              </button>
              <button className="msg-chat__action-btn"><FaEllipsisV /></button>
            </div>
          </div>

          {/* Sliding search bar — searches within the open conversation */}
          <div className={`msg-chat__search-bar ${chatSearchOpen ? 'msg-chat__search-bar--open' : ''}`}>
            <button className="msg-chat__search-nav" onClick={() => {}}><FaChevronUp /></button>
            <button className="msg-chat__search-nav" onClick={() => {}}><FaChevronDown /></button>
            <div className="msg-chat__search-inner">
              <FaSearch className="msg-chat__search-icon" />
              <input
                className="msg-chat__search-input"
                placeholder="Search in this conversation…"
                value={chatSearchQuery}
                onChange={e => setChatSearchQuery(e.target.value)}
                autoFocus={chatSearchOpen}
              />
            </div>
            <button
              className="msg-chat__search-cancel"
              onClick={() => { setChatSearchOpen(false); setChatSearchQuery(''); }}
            >
              Cancel
            </button>
          </div>

          {/* Messages */}
          <div className="msg-chat__messages">
            <div className="msg-chat__pattern" />
            {filteredMsgs.length === 0 ? (
              <div className="msg-chat__empty">
                <div className="msg-chat__empty-icon">✉️</div>
                <p className="msg-chat__empty-title">
                  {chatSearchQuery ? 'No messages match your search.' : 'This chat is empty.'}
                </p>
                <p className="msg-chat__empty-sub">
                  {chatSearchQuery ? 'Try different keywords.' : 'Be the first one to start it.'}
                </p>
              </div>
            ) : (
              filteredMsgs.map((m) => (
                <div key={m.id} className={`msg-bubble-wrap msg-bubble-wrap--${m.from}`}>
                  {m.from === 'them' && (
                    <div className="msg-bubble__avatar" style={{ background: active.color }}>{active.avatar}</div>
                  )}
                  <div className={`msg-bubble msg-bubble--${m.from}`} style={m.from === 'me' ? { background: chatColor } : {}}>
                    <p className="msg-bubble__text" style={m.from === 'me' ? { color: '#fff' } : {}}>{m.text}</p>
                    <span className="msg-bubble__time" style={m.from === 'me' ? { color: 'rgba(255,255,255,0.65)' } : {}}>{m.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form className="msg-chat__input-bar" onSubmit={handleSend}>
            <button type="button" className="msg-chat__input-btn"><FaSmile /></button>
            <input
              className="msg-chat__input"
              placeholder="Type a message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button" className="msg-chat__input-btn"><FaPaperclip /></button>
            <button type="submit" className="msg-chat__send" style={{ background: chatColor }}>
              <FaPaperPlane />
            </button>
          </form>
        </div>

        {/* ── Right: info panel ── */}
        <aside className="msg-info">
          <div className="msg-info__profile">
            <div className="msg-info__avatar" style={{ background: active.color }}>{active.avatar}</div>
            <p className="msg-info__name">{active.name}</p>
            <p className="msg-info__listing">{active.listing}</p>
          </div>

          {/* Auto bot toggle */}
          <div className="msg-info__section msg-info__section--row">
            <div>
              <p className="msg-info__section-title">Auto bot</p>
              <p className="msg-info__section-desc">Everyone in this conversation will see this.</p>
            </div>
            <div className={`sp-switch ${autoBot ? 'sp-switch--on' : ''}`} onClick={() => setAutoBot(v => !v)}>
              <div className="sp-switch__knob" />
            </div>
          </div>

          {/* Accordion items */}
          {[
            { key: 'details', label: 'User Details' },
            { key: 'editname', label: 'Edit name' },
          ].map((item) => (
            <div key={item.key} className="msg-info__accordion" onClick={() => toggleInfo(item.key)}>
              <span className="msg-info__accordion-label">{item.label}</span>
              {infoOpen[item.key] ? <FaChevronDown className="msg-info__accordion-icon" /> : <FaChevronRight className="msg-info__accordion-icon" />}
            </div>
          ))}

          {/* Color picker */}
          <div className="msg-info__section">
            <div className="msg-info__accordion msg-info__accordion--no-border" onClick={() => toggleInfo('color')}>
              <span className="msg-info__accordion-label">Change color</span>
              {infoOpen['color'] ? <FaChevronDown className="msg-info__accordion-icon" /> : <FaChevronRight className="msg-info__accordion-icon" />}
            </div>
            {infoOpen['color'] && (
              <>
                <p className="msg-info__section-desc">Pick a color for this conversation</p>
                <div className="msg-info__colors">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={`msg-info__color-btn ${chatColor === c ? 'msg-info__color-btn--active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setChatColor(c)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications accordion */}
          <div className="msg-info__accordion" onClick={() => toggleInfo('notifs')}>
            <span className="msg-info__accordion-label"><FaBell className="msg-info__accordion-bell" /> Notifications</span>
            {infoOpen['notifs'] ? <FaChevronDown className="msg-info__accordion-icon" /> : <FaChevronRight className="msg-info__accordion-icon" />}
          </div>
        </aside>
      </div>
    </div>
  );
}
