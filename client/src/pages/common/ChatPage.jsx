import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, User, Check, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlConvId = searchParams.get('convId');

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(urlConvId ? parseInt(urlConvId, 10) : null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        if (urlConvId) {
          const match = res.data.find((c) => c.id.toString() === urlConvId);
          if (match) {
            setActiveConvId(match.id);
          } else if (res.data.length > 0 && !activeConvId) {
            setActiveConvId(res.data[0].id);
          }
        } else if (res.data.length > 0 && !activeConvId) {
          setActiveConvId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlConvId && conversations.length > 0) {
      const match = conversations.find((c) => c.id.toString() === urlConvId);
      if (match) setActiveConvId(match.id);
    }
  }, [urlConvId, conversations]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [urlConvId]);

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.get(`/messages/conversations/${convId}`);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const interval = setInterval(() => fetchMessages(activeConvId), 4000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    setSending(true);
    const contentToSend = newMessage.trim();
    setNewMessage('');

    try {
      const res = await api.post(`/messages/conversations/${activeConvId}/messages`, {
        content: contentToSend
      });

      if (res.success) {
        fetchMessages(activeConvId);
        fetchConversations();
      }
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>Direct Inquiries & Messages</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Collaborate in real time with event hosts and verified studio professionals.
        </p>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
        
        {/* Left Conversation List */}
        <div style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-page)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-card)' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Conversations ({conversations.length})</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 16px', fontSize: '0.85rem' }}>
                No active conversations yet. Messages are created when booking inquiries are sent.
              </p>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border)',
                      background: isActive ? 'var(--color-surface-card)' : 'transparent',
                      borderLeft: isActive ? '4px solid var(--color-primary-dark)' : '4px solid transparent'
                    }}
                  >
                    <img
                      src={c.partner_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80'}
                      alt={c.partner_name}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {c.partner_name}
                        </h4>
                        {c.unread_count > 0 && (
                          <span style={{ background: 'var(--color-primary-dark)', color: '#FFFFFF', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 600, margin: '2px 0' }}>
                        {c.event_title || 'Event Inquiry'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {c.last_message || 'Start the conversation...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface-card)' }}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={activeConv.partner_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80'}
                    alt={activeConv.partner_name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{activeConv.partner_name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                      Associated with: "{activeConv.event_title || 'Event Inquiry'}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: 'auto' }}>
                    No messages in this conversation yet. Send a greeting below!
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '65%'
                        }}
                      >
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: '16px',
                          background: isMe ? 'var(--grad-button-primary)' : 'var(--color-primary-light)',
                          color: isMe ? '#FFFFFF' : 'var(--color-text-title)',
                          borderBottomRightRadius: isMe ? '4px' : '16px',
                          borderBottomLeftRadius: isMe ? '16px' : '4px',
                          boxShadow: isMe ? '0 4px 12px rgba(98, 64, 160, 0.15)' : 'none'
                        }}>
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.4, margin: 0, wordBreak: 'break-word' }}>
                            {m.content}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '4px',
                          display: 'block',
                          textAlign: isMe ? 'right' : 'left'
                        }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" disabled={sending || !newMessage.trim()} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                  <Send size={16} /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              Select a conversation to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
