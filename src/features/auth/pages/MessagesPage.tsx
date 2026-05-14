import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaSearch, FaPaperPlane, FaSmile, FaPaperclip,
  FaInfoCircle, FaEllipsisV,
  FaBell, FaAddressBook, FaCommentDots,
  FaPen, FaChevronRight, FaChevronDown,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { messagesService } from '../../../api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../../../shared/components/Spinner';
import type { ApiConversation, ApiChatMessage } from '../../../api/types';
import './MessagesPage.css';

dayjs.extend(relativeTime);

const AVATAR_COLORS = [
  '#7c3aed', '#0284c7', '#FF4A2A', '#16a34a',
  '#d97706', '#9333ea', '#0891b2', '#be185d',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const TABS = [
  { id: 'chats',    icon: <FaCommentDots />, label: 'Chats' },
  { id: 'contacts', icon: <FaAddressBook />, label: 'Contacts' },
  { id: 'notifs',   icon: <FaBell />,        label: 'Activity' },
];

export default function MessagesPage() {
  const { user } = useAuth();

  const [conversations, setConversations]   = useState<ApiConversation[]>([]);
  const [activeId, setActiveId]             = useState<string | null>(null);
  const [messages, setMessages]             = useState<ApiChatMessage[]>([]);
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [input, setInput]                   = useState('');
  const [sending, setSending]               = useState(false);
  const [search, setSearch]                 = useState('');
  const [activeTab, setActiveTab]           = useState('chats');
  const [infoOpen, setInfoOpen]             = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch {
      // silently keep stale list
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const data = await messagesService.getMessages(convId);
      setMessages(data);
      // mark conversation as read locally
      setConversations((prev) =>
        prev.map((c) => c.id === convId ? { ...c, unreadCount: 0 } : c)
      );
    } catch {
      // keep stale
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!user) { setLoadingConvs(false); return; }
    fetchConversations().finally(() => setLoadingConvs(false));
  }, [user, fetchConversations]);

  // When active conversation changes: load messages + set up polling
  useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchMessages(activeId);
      fetchConversations();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeId, fetchMessages, fetchConversations]);

  // Scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !input.trim() || sending) return;
    setSending(true);
    const body = input.trim();
    setInput('');
    // Optimistic: add locally
    const optimistic: ApiChatMessage = {
      id: `opt-${Date.now()}`,
      conversationId: activeId,
      senderId: user!.id ?? '',
      body,
      read: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user!.id ?? '',
        name: user!.name,
        username: user!.username ?? '',
        avatar: user!.avatar,
        role: user!.role as ApiChatMessage['sender']['role'],
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const sent = await messagesService.sendMessage(activeId, body);
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? sent : m));
      fetchConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(body);
    } finally {
      setSending(false);
    }
  }

  function toggleInfo(key: string) {
    setInfoOpen((s) => ({ ...s, [key]: !s[key] }));
  }

  const unreadTotal = conversations.reduce((s, c) => s + c.unreadCount, 0);

  const filtered = conversations.filter((c) =>
    c.other.name.toLowerCase().includes(search.toLowerCase()) ||
    c.other.username.toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = conversations.find((c) => c.id === activeId);

  const chatColor = '#FF4A2A';

  return (
    <div className="msg-page">
      <div className="msg-page__header">
        <h1 className="msg-page__title">Messages</h1>
        <p className="msg-page__sub">Communicate with your guests and hosts.</p>
      </div>

      <div className="msg-layout">

        {/* ── Left: conversation list ── */}
        <aside className="msg-left">
          {activeTab !== 'notifs' && (
            <div className="msg-left__search-row">
              <div className="msg-left__search">
                <FaSearch className="msg-left__search-icon" />
                <input
                  className="msg-left__search-input"
                  placeholder="Search conversations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="msg-left__compose" title="New message" disabled><FaPen /></button>
            </div>
          )}

          <div className="msg-left__tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`msg-left__tab ${activeTab === t.id ? 'msg-left__tab--active' : ''}`}
                onClick={() => { setActiveTab(t.id); setSearch(''); }}
              >
                <span className="msg-left__tab-icon">
                  {t.icon}
                  {t.id === 'chats' && unreadTotal > 0 && (
                    <span className="msg-left__tab-badge">{unreadTotal}</span>
                  )}
                </span>
                <span className="msg-left__tab-label">{t.label}</span>
              </button>
            ))}
          </div>

          <p className="msg-left__section-title">
            {activeTab === 'chats' ? 'RECENT CHATS' : activeTab === 'contacts' ? 'ALL CONTACTS' : 'ACTIVITY'}
          </p>

          {activeTab === 'notifs' ? (
            <div className="msg-notif-list">
              <div className="msg-notif msg-notif--unread">
                <div className="msg-notif__icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  <FaCommentDots />
                </div>
                <div className="msg-notif__body">
                  <p className="msg-notif__title">Real-time activity</p>
                  <p className="msg-notif__text">
                    New bookings, reviews, and messages will appear here. Check your Notifications page for booking alerts.
                  </p>
                  <span className="msg-notif__time">Always</span>
                </div>
              </div>
              {conversations.filter((c) => c.unreadCount > 0).map((c) => (
                <div
                  key={c.id}
                  className="msg-notif msg-notif--unread"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setActiveId(c.id); setActiveTab('chats'); }}
                >
                  <div className="msg-notif__icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                    <FaCommentDots />
                  </div>
                  <div className="msg-notif__body">
                    <p className="msg-notif__title">New message from {c.other.name}</p>
                    <p className="msg-notif__text">{c.lastMessage?.body ?? ''}</p>
                    <span className="msg-notif__time">{dayjs(c.updatedAt).fromNow()}</span>
                  </div>
                  <span className="msg-notif__dot" />
                </div>
              ))}
            </div>
          ) : (
            <div className="msg-convo-list">
              {loadingConvs ? (
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                  <Spinner />
                </div>
              ) : filtered.length === 0 ? (
                <p className="msg-left__empty">
                  {search ? 'No results found.' : 'No conversations yet. Start a chat from a listing page!'}
                </p>
              ) : (
                filtered.map((c) => {
                  const color = avatarColor(c.other.id);
                  const init  = initials(c.other.name);
                  return (
                    <div
                      key={c.id}
                      className={`msg-convo ${activeId === c.id ? 'msg-convo--active' : ''}`}
                      onClick={() => setActiveId(c.id)}
                    >
                      <div className="msg-convo__avatar-wrap">
                        {c.other.avatar ? (
                          <img
                            src={c.other.avatar}
                            alt={c.other.name}
                            className="msg-convo__avatar"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="msg-convo__avatar" style={{ background: color }}>{init}</div>
                        )}
                        {c.unreadCount > 0 && (
                          <span className="msg-convo__badge">{c.unreadCount}</span>
                        )}
                      </div>
                      <div className="msg-convo__body">
                        <div className="msg-convo__top">
                          <span className="msg-convo__name">{c.other.name}</span>
                          <span className="msg-convo__time">{dayjs(c.updatedAt).fromNow()}</span>
                        </div>
                        <p className="msg-convo__last">
                          {activeTab === 'contacts'
                            ? `@${c.other.username}`
                            : (c.lastMessage?.body ?? 'No messages yet')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </aside>

        {/* ── Center: chat window ── */}
        <div className="msg-chat">
          {!activeConv ? (
            <div className="msg-chat__messages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="msg-chat__empty">
                <div className="msg-chat__empty-icon"><FaCommentDots /></div>
                <p className="msg-chat__empty-title">Select a conversation</p>
                <p className="msg-chat__empty-sub">Choose a chat from the left to start messaging.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="msg-chat__header">
                <div className="msg-chat__header-left">
                  {activeConv.other.avatar ? (
                    <img
                      src={activeConv.other.avatar}
                      alt={activeConv.other.name}
                      className="msg-chat__avatar"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="msg-chat__avatar"
                      style={{ background: avatarColor(activeConv.other.id) }}
                    >
                      {initials(activeConv.other.name)}
                    </div>
                  )}
                  <div>
                    <p className="msg-chat__name">{activeConv.other.name}</p>
                    <p className="msg-chat__status" style={{ color: '#aaa' }}>
                      @{activeConv.other.username} · {activeConv.other.role.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="msg-chat__header-actions">
                  <button className="msg-chat__action-btn"><FaInfoCircle /></button>
                  <button className="msg-chat__action-btn"><FaEllipsisV /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="msg-chat__messages">
                <div className="msg-chat__pattern" />
                {loadingMsgs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                    <Spinner />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="msg-chat__empty">
                    <div className="msg-chat__empty-icon"><FaPaperPlane /></div>
                    <p className="msg-chat__empty-title">This chat is empty.</p>
                    <p className="msg-chat__empty-sub">Be the first one to say hello!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`msg-bubble-wrap msg-bubble-wrap--${isMe ? 'me' : 'them'}`}>
                        {!isMe && (
                          activeConv.other.avatar ? (
                            <img
                              src={activeConv.other.avatar}
                              alt={activeConv.other.name}
                              className="msg-bubble__avatar"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="msg-bubble__avatar"
                              style={{ background: avatarColor(activeConv.other.id) }}
                            >
                              {initials(activeConv.other.name)}
                            </div>
                          )
                        )}
                        <div
                          className={`msg-bubble msg-bubble--${isMe ? 'me' : 'them'}`}
                          style={isMe ? { background: chatColor } : {}}
                        >
                          <p className="msg-bubble__text" style={isMe ? { color: '#fff' } : {}}>
                            {m.body}
                          </p>
                          <span
                            className="msg-bubble__time"
                            style={isMe ? { color: 'rgba(255,255,255,0.65)' } : {}}
                          >
                            {dayjs(m.createdAt).format('h:mm A')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="msg-chat__input-bar" onSubmit={handleSend}>
                <button type="button" className="msg-chat__input-btn"><FaSmile /></button>
                <input
                  className="msg-chat__input"
                  placeholder="Type a message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <button type="button" className="msg-chat__input-btn"><FaPaperclip /></button>
                <button
                  type="submit"
                  className="msg-chat__send"
                  style={{ background: chatColor }}
                  disabled={sending || !input.trim()}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Right: info panel ── */}
        <aside className="msg-info">
          {activeConv ? (
            <>
              <div className="msg-info__profile">
                {activeConv.other.avatar ? (
                  <img
                    src={activeConv.other.avatar}
                    alt={activeConv.other.name}
                    className="msg-info__avatar"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <div
                    className="msg-info__avatar"
                    style={{ background: avatarColor(activeConv.other.id) }}
                  >
                    {initials(activeConv.other.name)}
                  </div>
                )}
                <p className="msg-info__name">{activeConv.other.name}</p>
                <p className="msg-info__listing">@{activeConv.other.username}</p>
              </div>

              {[
                { key: 'details', label: 'User Details' },
              ].map((item) => (
                <div key={item.key} className="msg-info__accordion" onClick={() => toggleInfo(item.key)}>
                  <span className="msg-info__accordion-label">{item.label}</span>
                  {infoOpen[item.key]
                    ? <FaChevronDown className="msg-info__accordion-icon" />
                    : <FaChevronRight className="msg-info__accordion-icon" />}
                </div>
              ))}

              {infoOpen['details'] && (
                <div style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#555', lineHeight: 1.6 }}>
                  <p><strong>Role:</strong> {activeConv.other.role}</p>
                </div>
              )}

              <div className="msg-info__accordion" onClick={() => toggleInfo('notifs')}>
                <span className="msg-info__accordion-label">
                  <FaBell className="msg-info__accordion-bell" /> Notifications
                </span>
                {infoOpen['notifs']
                  ? <FaChevronDown className="msg-info__accordion-icon" />
                  : <FaChevronRight className="msg-info__accordion-icon" />}
              </div>
            </>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
              Select a conversation to see details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
