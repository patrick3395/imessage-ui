import React, { useState, useEffect, useRef, Component } from "react";
//import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Phone, Video, Edit3, Archive, Settings, MoreVertical, Check, CheckCheck, Plus, Send, Paperclip, Smile, ArrowLeft, Info, Users, MessageSquare, X, ChevronDown, Edit2, Trash2, LogOut, User } from "lucide-react";
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage, 
  fetchNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  fetchMessageNotes, 
  testConnection,
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser
} from "./api";


// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
// Auth Component
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <MessageCircle size={48} style={{ color: '#3b82f6', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            {isLogin ? 'Sign in to continue to Messages' : 'Sign up to get started'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#475569',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#475569',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#64748b'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              color: '#3b82f6',
              fontWeight: '600',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function MessagingAppCore() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [readChats, setReadChats] = useState(() => {
    const saved = localStorage.getItem('readChats');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [messageNotes, setMessageNotes] = useState({});
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedMessageForNote, setSelectedMessageForNote] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  
  // New states for improvements
  const [currentUser, setCurrentUser] = useState(() => {
    const user = getCurrentUser();
    return user?.email || localStorage.getItem('imessage_user_name') || 'Me';
  });
  const [activeTab, setActiveTab] = useState('open');
  const [doneConversations, setDoneConversations] = useState(() => {
    const saved = localStorage.getItem('done_conversations');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [buckets, setBuckets] = useState(() => {
    const saved = localStorage.getItem('conversation_buckets');
    return saved ? JSON.parse(saved) : [
      { id: 'open', name: 'Open', color: '#3b82f6' },
      { id: 'done', name: 'Done', color: '#10b981' }
    ];
  });
  const [conversationBuckets, setConversationBuckets] = useState(() => {
    const saved = localStorage.getItem('conversation_bucket_assignments');
    return saved ? JSON.parse(saved) : {};
  });
  const [showAddBucket, setShowAddBucket] = useState(false);
  
  // Message tracking
  const [messageHash, setMessageHash] = useState({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const noteInputRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Check authentication on mount
  useEffect(() => {
    if (isLoggedIn) {
      testAPIConnection();
    }
  }, [isLoggedIn]);

  // Test API connection
  const testAPIConnection = async () => {
    try {
      await testConnection();
      setConnectionError(false);
    } catch (error) {
      console.error("API connection failed:", error);
      setConnectionError(true);
    }
  };

  // Handle login
  const handleLogin = () => {
    setIsLoggedIn(true);
    const user = getCurrentUser();
    if (user?.email) {
      setCurrentUser(user.email);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setConversations([]);
    setMessages([]);
    setSelectedChat(null);
  };

  // Add CSS animations to head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .temp-message {
        animation: fadeIn 0.3s ease-out;
      }
      
      .message-note {
        animation: fadeIn 0.2s ease-out;
        transition: all 0.2s ease;
      }
      
      .message-note:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Update user name function
  const updateUserName = (newName) => {
    setCurrentUser(newName);
    localStorage.setItem('imessage_user_name', newName);
  };

  // Toggle conversation status
  const toggleConversationStatus = (chatId) => {
    setDoneConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      localStorage.setItem('done_conversations', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Fetch conversations on component mount
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadConversations = async () => {
      try {
        const convos = await fetchConversations();
        console.log("Loaded conversations:", convos);
        setConversations(convos);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };
    
    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Enhanced loadMessages function that only updates when needed
  const loadMessages = async (chatId, forceUpdate = false) => {
    if (isLoadingMessages && !forceUpdate) return;
    
    try {
      setIsLoadingMessages(true);
      console.log(`🔄 Loading messages for chat ${chatId}...`);
      
      const result = await fetchMessages(chatId);
      const msgs = result.messages || [];
      const newHash = result.hash;
      const hasChanged = result.changed;
      
      console.log("📊 Server returned", msgs.length, "messages");
      console.log("📊 Last message from server:", msgs[msgs.length - 1]);
      console.log("📊 Changed?", hasChanged, "Hash:", newHash);
      
      // Only update state if messages have changed
      if (hasChanged || forceUpdate || messageHash[chatId] !== newHash) {
        console.log("📝 Messages changed, updating UI");
        console.log("New messages count:", msgs.length);
        console.log("Last 3 messages:", msgs.slice(-3).map(m => ({
          id: m.id,
          body: m.body?.substring(0, 30),
          fromMe: m.fromMe
        })));
        
        // CHECK IF YOUR NEW MESSAGE IS IN THE msgs ARRAY
        console.log("🔍 All message IDs:", msgs.map(m => m.id));
        console.log("🔍 Messages from me:", msgs.filter(m => m.fromMe).length);
        
        // Keep temporary messages that don't have a matching real message yet
        const tempMessages = messages.filter(msg => {
          if (msg.id && msg.id.toString().startsWith('temp-')) {
            const tempBody = msg.body.toLowerCase().trim();
            console.log(`🔍 Checking temp message: "${tempBody}"`);
            
            // Check if this temp message now exists as a real message
            const realExists = msgs.some(realMsg => {
              if (realMsg.fromMe && realMsg.body) {
                const realBody = realMsg.body.toLowerCase().trim();
                const matches = realBody === tempBody;
                if (matches) {
                  console.log(`✅ Found real message for temp: "${tempBody}"`);
                }
                return matches;
              }
              return false;
            });
            
            const shouldKeep = !realExists;
            console.log(`${shouldKeep ? '📌 Keeping' : '🗑️ Removing'} temp message: "${tempBody}"`);
            return shouldKeep;
          }
          return false;
        });
        
        console.log(`📌 Keeping ${tempMessages.length} temporary messages`);
        
        // Combine server messages with remaining temp messages
        const allMessages = [...msgs, ...tempMessages].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setMessages(allMessages);
        setMessageHash(prev => ({ ...prev, [chatId]: newHash }));
        
        // Only load notes if messages changed
        if (hasChanged) {
          await loadMessageNotes(msgs);
        }
      } else {
        console.log("✅ Messages unchanged, skipping update");
        console.log("Current message count:", messages.length);
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load notes for messages
  const loadMessageNotes = async (messages) => {
    try {
      const notesPromises = messages.map(async (msg) => {
        try {
          const msgNotes = await fetchMessageNotes(msg.id);
          return { messageId: msg.id, notes: msgNotes || [] };
        } catch (error) {
          return { messageId: msg.id, notes: [] };
        }
      });
      
      const notesResults = await Promise.all(notesPromises);
      
      const notesMap = {};
      notesResults.forEach(result => {
        if (result.notes.length > 0) {
          notesMap[result.messageId] = result.notes;
        }
      });
      
      setMessageNotes(notesMap);
    } catch (error) {
      console.error("Failed to load message notes:", error);
    }
  };

  // Load notes for the selected chat
  const loadNotes = async (chatId) => {
    try {
      const chatNotes = await fetchNotes(chatId);
      setNotes(chatNotes || []);
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    }
  };

  // Real-time message checking with optimized polling
  useEffect(() => {
    if (selectedChat && isLoggedIn) {
      // Initial load
      isInitialLoadRef.current = true;
      loadMessages(selectedChat, true);
      loadNotes(selectedChat);
      
      // Mark this chat as read
      setReadChats(prev => {
        const newSet = new Set([...prev, selectedChat]);
        localStorage.setItem('readChats', JSON.stringify([...newSet]));
        return newSet;
      });
      
      // Set up polling for real-time updates
      const messageInterval = setInterval(() => {
        loadMessages(selectedChat);
      }, 10000); // Poll every 10 seconds instead of 2
      
      return () => clearInterval(messageInterval);
    }
  }, [selectedChat, isLoggedIn]);

  // Scroll to bottom only when new messages arrive or on initial load
  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoadRef.current) {
        scrollToBottom();
        isInitialLoadRef.current = false;
      } else if (messages.length > prevMessageCountRef.current) {
        scrollToBottom();
      }
      
      prevMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Reset initial load flag when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    prevMessageCountRef.current = 0;
  }, [selectedChat]);
  // Debug messages state
  useEffect(() => {
    console.log("Messages state updated:", messages.length, "messages");
    if (messages.length > 0) {
      console.log("Last message in state:", messages[messages.length - 1]);
    }
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Handle note creation with author
  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    
    try {
      const isThreadNote = !selectedMessageForNote;
      const newNote = await createNote(
        selectedChat,
        newNoteContent,
        selectedMessageForNote,
        '#f59e0b',
        isThreadNote,
        null,
        currentUser
      );
      
      if (selectedMessageForNote) {
        setMessageNotes(prev => ({
          ...prev,
          [selectedMessageForNote]: [...(prev[selectedMessageForNote] || []), newNote]
        }));
      } else {
        setNotes(prev => [...prev, newNote]);
      }
      
      setNewNoteContent("");
      setSelectedMessageForNote(null);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note");
    }
  };

  // Handle note update
  const handleUpdateNote = async (noteId, newContent) => {
    if (!newContent.trim()) return;
    
    try {
      const updatedNote = await updateNote(noteId, newContent);
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      
      setMessageNotes(prev => {
        const newMessageNotes = { ...prev };
        for (const msgId in newMessageNotes) {
          newMessageNotes[msgId] = newMessageNotes[msgId].map(note =>
            note.id === noteId ? updatedNote : note
          );
        }
        return newMessageNotes;
      });
      
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("Failed to update note");
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId, messageId = null) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    try {
      await deleteNote(noteId);
      
      if (messageId) {
        setMessageNotes(prev => ({
          ...prev,
          [messageId]: (prev[messageId] || []).filter(note => note.id !== noteId)
        }));
      } else {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note");
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    console.log("Send button clicked");
    console.log("New message:", newMessage);
    console.log("Selected chat:", selectedChat);
    
    if (newMessage.trim() && selectedChat) {
      const messageToSend = newMessage.trim();
      setNewMessage("");

      const tempMessage = {
        id: `temp-${Date.now()}`,
        body: messageToSend,
        timestamp: new Date().toISOString(),
        fromMe: true,
        from: null,
        chat_id: selectedChat,
        is_read: true,
        has_attachments: false,
        isSending: true
      };
      
      // Add to messages immediately
      setMessages(prev => [...prev, tempMessage]);
      
      try {
        const selectedConvo = conversations.find(c => c.chat_id === selectedChat);
        console.log("Selected conversation:", selectedConvo);
        
        let response;
        
        if (selectedConvo?.is_group) {
          console.log("Sending group message to chat_id:", selectedChat);
          response = await sendMessage(null, messageToSend, selectedChat);
        } else {
          let recipient = selectedConvo?.chat_identifier;
          console.log("Sending to recipient:", recipient);
          
          if (!recipient) {
            throw new Error("No recipient found");
          }
          
          response = await sendMessage(recipient, messageToSend);
        }
        
        console.log("Send response:", response);
        
        if (response && (response.status === 'sent' || response.success === true)) {
          console.log("✅ Message sent, waiting for it to appear...");
          
          // Force refresh messages after a delay
          // Force refresh messages after a delay
          setTimeout(() => {
            if (selectedChat) {
              loadMessages(selectedChat, true);
            }
          }, 1000);

          setTimeout(() => {
            if (selectedChat) {
              loadMessages(selectedChat, true);
            }
          }, 2500);

          setTimeout(() => {
            if (selectedChat) {
              loadMessages(selectedChat, true);
            }
          }, 5000);

          // Scroll after message loads
          setTimeout(() => {
            if (messagesEndRef.current) {
              scrollToBottom();
            }
          }, 2000);
          
          // Refresh conversations
          setTimeout(async () => {
            try {
              const convos = await fetchConversations();
              setConversations(convos);
            } catch (error) {
              console.error("Failed to refresh conversations:", error);
            }
          }, 3000);
          
        } else {
          setNewMessage(messageToSend);
          throw new Error(response?.message || 'Message not sent');
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        setNewMessage(messageToSend);
        
        const errorMessage = error.response?.data?.error || error.message || 'Failed to send message';
        showNotification(`Failed: ${errorMessage}`, 'error');
      }
    }
  };

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#3b82f6' : '#ef4444'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations with tabs
  const filteredConversations = conversations
    .filter(convo => {
      if (activeTab === 'open') {
        return !doneConversations.has(convo.chat_id);
      } else {
        return doneConversations.has(convo.chat_id);
      }
    })
    .filter(convo =>
      (convo.name || `Chat ${convo.chat_id}`).toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getInitials = (name) => {
    if (!name) return "?";
    if (name.startsWith('+') || /^\d/.test(name)) return "📱";
    if (name.includes('@')) return name.substring(0, 2).toUpperCase();
    
    const words = name.split(' ').filter(w => w.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  };

  const getDisplayName = (convo) => {
    if (!convo) return "Unknown";
    
    if (convo.is_group && convo.name && !convo.name.startsWith('chat')) {
      return convo.name;
    }
    
    if (convo.is_group && convo.participants) {
      const participantList = convo.participants.map(p => {
        if (p.contact_name) return p.contact_name;
        if (p.phone) return formatPhoneNumber(p.phone);
        return p;
      }).join(', ');
      return participantList || convo.name || `Group ${convo.chat_id}`;
    }
    
    if (!convo.is_group) {
      if (convo.contact_name && !convo.contact_name.startsWith('+') && !/^\d/.test(convo.contact_name)) {
        return convo.contact_name;
      }
      if (convo.contact_name) {
        return formatPhoneNumber(convo.contact_name);
      }
    }
    
    if (convo.name) {
      if (convo.name.startsWith('+') || /^\d/.test(convo.name)) {
        return formatPhoneNumber(convo.name);
      }
      return convo.name;
    }
    
    return `Chat ${convo.chat_id}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatarGradient = (chatId) => {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600'
    ];
    return gradients[parseInt(chatId) % gradients.length];
  };

  const getLastMessagePreview = (message) => {
    if (!message) return "No messages yet";
    if (message.length > 50) return message.substring(0, 50) + "...";
    return message;
  };

  const selectedConversation = conversations.find(c => c.chat_id === selectedChat);

  // Show auth screen if not logged in
  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Show connection error if API is down
  if (connectionError) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <MessageCircle size={64} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#475569', margin: '0 0 8px' }}>
            Connection Error
          </h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', margin: '0 0 16px' }}>
            Unable to connect to the messaging server
          </p>
          <button
            onClick={() => {
              setConnectionError(false);
              testAPIConnection();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ marginLeft: '32px', width: '420px', height: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Messages</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '10px', 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                title="Logout"
              >
                <LogOut size={22} color="#475569" />
              </button>
              <button style={{ 
                padding: '10px', 
                backgroundColor: 'transparent', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                <Plus size={22} color="#475569" />
              </button>
              <button style={{ 
                padding: '10px', 
                backgroundColor: 'transparent', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                <MoreVertical size={22} color="#475569" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                backgroundColor: searchFocused ? '#ffffff' : '#f1f5f9',
                border: searchFocused ? '2px solid #3b82f6' : '2px solid transparent',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* User Profile Section */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px'
          }}>
            <User size={16} color="#64748b" />
            <span style={{ fontSize: '14px', color: '#64748b' }}>Logged in as:</span>
            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{currentUser}</span>
          </div>
        </div>

        {/* Conversations List with Tabs */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            padding: '0 16px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <button
              onClick={() => setActiveTab('open')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'open' ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === 'open' ? '#3b82f6' : '#64748b',
                fontSize: '14px',
                fontWeight: activeTab === 'open' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              Open
              {conversations.filter(c => !doneConversations.has(c.chat_id)).length > 0 && (
                <span style={{
                  marginLeft: '8px',
                  backgroundColor: activeTab === 'open' ? '#3b82f6' : '#e2e8f0',
                  color: activeTab === 'open' ? 'white' : '#64748b',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {conversations.filter(c => !doneConversations.has(c.chat_id)).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('done')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'done' ? '3px solid #10b981' : '3px solid transparent',
                color: activeTab === 'done' ? '#10b981' : '#64748b',
                fontSize: '14px',
                fontWeight: activeTab === 'done' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Done
              {doneConversations.size > 0 && (
                <span style={{
                  marginLeft: '8px',
                  backgroundColor: activeTab === 'done' ? '#10b981' : '#e2e8f0',
                  color: activeTab === 'done' ? 'white' : '#64748b',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {doneConversations.size}
                </span>
              )}
            </button>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, padding: '16px' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                  <MessageCircle size={64} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#475569', margin: '0 0 8px' }}>
                    {activeTab === 'open' ? 'No open conversations' : 'No completed conversations'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                    {activeTab === 'open' ? 'Start a conversation' : 'Mark conversations as done to see them here'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredConversations.map((convo) => (
                  <div
                    key={convo.chat_id}
                    style={{
                      position: 'relative',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: selectedChat === convo.chat_id ? '2px solid #3b82f6' : '2px solid transparent',
                      boxShadow: selectedChat === convo.chat_id 
                        ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChat !== convo.chat_id) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChat !== convo.chat_id) {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Mark as Done/Open button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleConversationStatus(convo.chat_id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        backgroundColor: doneConversations.has(convo.chat_id) ? '#10b981' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        zIndex: 5,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                      }}
                    >
                      {doneConversations.has(convo.chat_id) ? 'Reopen' : 'Mark Done'}
                    </button>

                    <div
                      onClick={() => setSelectedChat(convo.chat_id)}
                      style={{ padding: '16px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', marginRight: '16px' }}>
                          <div className={getAvatarGradient(convo.chat_id)} style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            {convo.is_group ? <Users size={28} /> : getInitials(getDisplayName(convo))}
                          </div>
                          {!convo.is_group && convo.is_imessage !== null && (
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              width: '14px',
                              height: '14px',
                              backgroundColor: convo.is_imessage === true ? '#3b82f6' : '#10b981',
                              borderRadius: '50%',
                              border: '3px solid #ffffff',
                              boxShadow: '0 2px 4px rgba (0, 0, 0, 0.1)'
                            }}></div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h3 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#0f172a',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {getDisplayName(convo)}
                              {convo.is_group && (
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: '#64748b', 
                                  fontWeight: '400',
                                  marginLeft: '8px'
                                }}>
                                  Group
                                </span>
                              )}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '12px' }}>
                              <span style={{
                                fontSize: '12px',
                                color: convo.unreadCount > 0 ? '#3b82f6' : '#94a3b8',
                                fontWeight: convo.unreadCount > 0 ? '600' : '400'
                              }}>
                                {formatTimestamp(convo.lastMessageTime)}
                              </span>
                              {convo.lastMessageSent && (
                                <div style={{ marginTop: '4px' }}>
                                  {convo.lastMessageRead ? (
                                    <CheckCheck size={16} color="#3b82f6" />
                                  ) : (
                                    <Check size={16} color="#94a3b8" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{
                              fontSize: '14px',
                              color: '#64748b',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              paddingRight: '8px'
                            }}>
                              {getLastMessagePreview(convo.lastMessage)}
                            </p>
                            {(convo.unreadCount > 0 && !readChats.has(convo.chat_id)) && (
                              <span style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderRadius: '12px',
                                padding: '2px 8px',
                                minWidth: '24px',
                                textAlign: 'center',
                                display: 'inline-block'
                              }}>
                                {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          backgroundColor: '#ffffff',
          display: 'flex',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)'
        }}>
          <button style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
            <Phone size={22} color="#64748b" />
            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Calls</span>
          </button>
          <button style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#eff6ff',
            border: 'none',
            borderTop: '3px solid #3b82f6',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <MessageCircle size={22} color="#3b82f6" />
            <span style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>Messages</span>
          </button>
        </div>
      </div>

      {/* Conversation View */}
      {selectedChat ? (
        <div style={{ flex: 1, display: 'flex', backgroundColor: '#ffffff' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Conversation Header */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={getAvatarGradient(selectedChat)} style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginRight: '12px'
                }}>
                  {selectedConversation?.is_group ? <Users size={20} /> : getInitials(getDisplayName(selectedConversation))}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                    {selectedConversation && getDisplayName(selectedConversation)}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    {selectedConversation?.is_group 
                      ? 'Group chat' 
                      : (selectedConversation?.is_imessage === true ? 'iMessage' : 'SMS')
                    }
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Toggle Notes Panel */}
                <button 
                  onClick={() => setShowNotesPanel(!showNotesPanel)}
                  style={{ 
                    padding: '8px',
                    backgroundColor: showNotesPanel ? '#3b82f6' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!showNotesPanel) e.target.style.backgroundColor = '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    if (!showNotesPanel) e.target.style.backgroundColor = 'transparent'
                  }}>
                  <MessageSquare size={20} color={showNotesPanel ? '#ffffff' : '#475569'} />
                  {notes.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#f59e0b',
                      borderRadius: '50%'
                    }}></span>
                  )}
                </button>
                <button style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <Phone size={20} color="#475569" />
                </button>
                <button style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <Video size={20} color="#475569" />
                </button>
                <button style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <Info size={20} color="#475569" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '24px',
              backgroundColor: '#fafbfc'
            }}>

              {console.log("About to render", messages.length, "messages")}
              {messages.length === 0 && <div>No messages to display</div>}                
              {messages.map((message, index) => {
                console.log("Rendering message:", message.id, message.body?.substring(0, 20));
                const showSenderInfo = selectedConversation?.is_group && !message.fromMe && message.from;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showSenderName = showSenderInfo && (!prevMessage || prevMessage.from !== message.from || prevMessage.fromMe);
                const hasNotes = messageNotes[message.id] && messageNotes[message.id].length > 0;
                
                return (
                  <div 
                    key={message.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: message.fromMe ? 'flex-end' : 'flex-start',
                      marginBottom: '16px',
                      position: 'relative'
                    }}
                    onMouseEnter={() => setHoveredMessage(message.id)}
                    onMouseLeave={() => setHoveredMessage(null)}
                  >
                    <div style={{ maxWidth: '70%' }}>
                      {/* Sender info for group messages */}
                      {showSenderName && (
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '4px',
                          marginLeft: '4px',
                          fontWeight: '500'
                        }}>
                          {message.fromName || formatPhoneNumber(message.from)}
                        </div>
                      )}
                      
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: message.fromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          backgroundColor: message.fromMe 
                            ? (selectedConversation?.is_group ? '#f59e0b' : '#3b82f6')
                            : '#e2e8f0',
                          color: message.fromMe ? '#ffffff' : '#0f172a',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}>
                          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>
                            {message.body || 'No message content'}
                          </p>
                          {message.isSending && (
                            <div style={{
                              fontSize: '10px',
                              color: message.fromMe ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                              marginTop: '4px'
                            }}>
                              Sending...
                            </div>
                          )}
                        </div>
                        
                          {/* Comment indicator */}
                        {hasNotes && (
                          <button
                            onClick={() => setSelectedMessageForNote(message.id)}
                            style={{
                              position: 'absolute',
                              bottom: '-20px',
                              left: message.fromMe ? 'auto' : '12px',
                              right: message.fromMe ? '12px' : 'auto',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: '#fef3c7',
                              border: '1px solid #fbbf24',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#92400e',
                              fontWeight: '500'
                            }}
                          >
                            <MessageSquare size={12} />
                            {messageNotes[message.id].length} {messageNotes[message.id].length === 1 ? 'comment' : 'comments'}
                          </button>
                        )}
                        
                        {/* Add comment button */}
                        {hoveredMessage === message.id && !messageNotes[message.id]?.length && (
                          <button
                            onClick={() => setSelectedMessageForNote(message.id)}
                            style={{
                              position: 'absolute',
                              bottom: '-20px',
                              left: message.fromMe ? 'auto' : '12px',
                              right: message.fromMe ? '12px' : 'auto',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#64748b',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                            }}
                          >
                            <MessageSquare size={12} />
                            Comment
                          </button>
                        )}
                      </div>
                      
                      {/* Message notes with author */}
                      {hasNotes && (
                        <div style={{
                          marginTop: '12px',
                          marginLeft: message.fromMe ? 'auto' : '8px',
                          marginRight: message.fromMe ? '8px' : 'auto',
                          maxWidth: '90%'
                        }}>
                          {messageNotes[message.id].map(note => (
                            <div key={note.id} className="message-note" style={{
                              backgroundColor: '#fef3c7',
                              border: '1px solid #fbbf24',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              marginBottom: '4px',
                              fontSize: '13px',
                              color: '#92400e',
                              position: 'relative',
                              paddingRight: editingNote === note.id ? '8px' : '60px'
                            }}>
                              {/* Author name */}
                              <div style={{
                                fontSize: '11px',
                                color: '#d97706',
                                fontWeight: '600',
                                marginBottom: '4px'
                              }}>
                                {note.author || 'You'}
                              </div>
                              
                              {editingNote === note.id ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    type="text"
                                    defaultValue={note.content}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateNote(note.id, e.target.value);
                                      }
                                    }}
                                    style={{
                                      flex: 1,
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      outline: 'none',
                                      fontSize: '13px',
                                      color: '#92400e'
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => setEditingNote(null)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '2px'
                                    }}
                                  >
                                    <X size={14} color="#92400e" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div>{note.content}</div>
                                  
                                  {/* Timestamp */}
                                  <div style={{
                                    fontSize: '10px',
                                    color: '#b45309',
                                    marginTop: '2px',
                                    opacity: 0.7
                                  }}>
                                    {new Date(note.created_at).toLocaleString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  
                                  <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    display: 'flex',
                                    gap: '4px'
                                  }}>
                                    <button
                                      onClick={() => setEditingNote(note.id)}
                                      style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.opacity = 1}
                                      onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                    >
                                      <Edit2 size={12} color="#92400e" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(note.id, message.id)}
                                      style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.opacity = 1}
                                      onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                    >
                                      <Trash2 size={12} color="#92400e" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <div style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        marginTop: '2px',
                        marginLeft: message.fromMe ? 'auto' : '4px',
                        marginRight: message.fromMe ? '4px' : 'auto',
                        textAlign: message.fromMe ? 'right' : 'left',
                        opacity: 0.6
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Note input area */}
            {selectedMessageForNote && (
              <div style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#fef3c7'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#92400e', fontWeight: '500' }}>
                    Add comment to message:
                  </span>
                  <input
                    ref={noteInputRef}
                    type="text"
                    placeholder="Type your comment..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateNote();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #fbbf24',
                      borderRadius: '20px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleCreateNote}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f59e0b',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send size={16} color="white" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMessageForNote(null);
                      setNewNoteContent("");
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} color="#92400e" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <Paperclip size={20} color="#64748b" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#f1f5f9',
                    border: '2px solid transparent',
                    borderRadius: '24px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.borderColor = 'transparent';
                  }}
                />
                <button style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <Smile size={20} color="#64748b" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  style={{
                    padding: '10px',
                    backgroundColor: newMessage.trim() ? '#3b82f6' : '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: newMessage.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} color={newMessage.trim() ? '#ffffff' : '#94a3b8'} />
                </button>
              </div>
            </div>
          </div>

          {/* Notes Panel */}
          {showNotesPanel && (
            <div style={{
              width: '320px',
              backgroundColor: '#f8fafc',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MessageSquare size={18} />
                  Thread Notes
                </h3>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px'
              }}>
                {/* Thread-level notes */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '12px'
                  }}>
                    General Notes
                  </h4>
                  
                  {/* Add new thread note */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <textarea
                      placeholder="Add a note about this conversation..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newNoteContent.trim()) {
                          handleCreateNote();
                        }
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: newNoteContent.trim() ? '#f59e0b' : '#e2e8f0',
                        color: newNoteContent.trim() ? 'white' : '#94a3b8',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: newNoteContent.trim() ? 'pointer' : 'default',
                        transition: 'all 0.2s'
                      }}
                      disabled={!newNoteContent.trim()}
                    >
                      Add Note
                    </button>
                  </div>

                  {/* List thread notes */}
                  {notes.filter(note => note.is_thread_note || !note.message_id).map(note => (
                    <div key={note.id} style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      position: 'relative'
                    }}>
                      {/* Author name */}
                      <div style={{
                        fontSize: '11px',
                        color: '#3b82f6',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {note.author || 'You'}
                      </div>
                      
                      {editingNote === note.id ? (
                        <div>
                          <textarea
                            defaultValue={note.content}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleUpdateNote(note.id, e.target.value);
                              }
                            }}
                            style={{
                              width: '100%',
                              minHeight: '60px',
                              padding: '8px',
                              border: '1px solid #3b82f6',
                              borderRadius: '6px',
                              fontSize: '13px',
                              resize: 'vertical',
                              outline: 'none'
                            }}
                            autoFocus
                          />
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                const textarea = e.target.parentElement.previousSibling;
                                handleUpdateNote(note.id, textarea.value);
                              }}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNote(null)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#e2e8f0',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#0f172a',
                            lineHeight: '1.5'
                          }}>
                            {note.content}
                          </p>
                          <div style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            marginTop: '8px'
                          }}>
                            {new Date(note.created_at).toLocaleString()}
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            display: 'flex',
                            gap: '4px'
                          }}>
                            <button
                              onClick={() => setEditingNote(note.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Edit2 size={14} color="#94a3b8" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Trash2 size={14} color="#94a3b8" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message-specific notes summary */}
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '12px'
                  }}>
                    Message Comments ({Object.values(messageNotes).flat().length})
                  </h4>
                  
                  {Object.values(messageNotes).flat().length === 0 ? (
                    <p style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      No message comments yet. Hover over a message and click + to add one.
                    </p>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Comments are shown inline with messages
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Empty state when no chat is selected
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <MessageCircle size={80} style={{ color: '#e2e8f0', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#475569', margin: '0 0 8px' }}>
              Select a conversation
            </h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
export default function MessagingApp() {
  return (
    <ErrorBoundary>
      <MessagingAppCore />
    </ErrorBoundary>
  );
  }