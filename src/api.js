import axios from "axios";

// Determine base URL based on environment
export const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"  // For local development
    : "https://noble-api-gateway-production.up.railway.app/api";

// Remove the old API_TOKEN - we'll use JWT tokens now
// export const API_TOKEN = import.meta.env.VITE_API_TOKEN || "NOBLEIMESSAGE";

// Token management functions
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

export function removeAuthToken() {
  localStorage.removeItem('authToken');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

// User management functions
export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

console.log("🐞 API Configuration:", {
  API_BASE,
  MODE: import.meta.env.MODE,
  isAuthenticated: isAuthenticated()
});

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 second timeout
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🐞 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('🐞 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and auth handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`🐞 API Response: ${response.config.url}`, {
      status: response.status,
      dataLength: response.data?.length || response.data?.messages?.length || 'N/A',
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('🐞 API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    // If 401 Unauthorized, clear auth and redirect to login
    if (error.response?.status === 401) {
      removeAuthToken();
      clearCurrentUser();
      // You might want to redirect to login here
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * register - Register a new user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} User data and token
 */
export async function register(email, password) {
  try {
    console.log('🐞 Registering user:', email);
    const response = await apiClient.post('/auth/register', { email, password });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
      setCurrentUser(response.data.user);
    }
    
    console.log('✅ Registration successful');
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
}

/**
 * login - Login an existing user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} User data and token
 */
export async function login(email, password) {
  try {
    console.log('🐞 Logging in user:', email);
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
      setCurrentUser(response.data.user);
    }
    
    console.log('✅ Login successful');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

/**
 * logout - Logout the current user
 */
export function logout() {
  removeAuthToken();
  clearCurrentUser();
  console.log('✅ Logged out successfully');
}

/**
 * fetchConversations - retrieves all iMessage conversation IDs & names
 */
export async function fetchConversations() {
  try {
    console.log('🐞 Fetching conversations...');
    const response = await apiClient.get('/conversations');
    console.log('✅ Conversations fetched successfully:', response.data?.length || 0, 'conversations');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch conversations:', error);
    throw error;
  }
}

/**
 * fetchMessages - retrieves messages for a given conversation
 * @param {number|string} chatId
 * @returns {Object} { messages: Array, hash: string, changed: boolean }
 */
export async function fetchMessages(chatId) {
  try {
    console.log(`🐞 Fetching messages for chat ${chatId}...`);
    const response = await apiClient.get(`/conversations/${chatId}/messages`);
    
    const data = response.data;
    const messages = data.messages || [];
    
    console.log(`✅ Messages fetched for chat ${chatId}:`, {
      count: messages.length,
      changed: data.changed,
      hash: data.hash
    });
    
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch messages for chat ${chatId}:`, error);
    throw error;
  }
}

/**
 * sendMessage - sends a message via your API Gateway
 * @param {string} to - Phone number for individual messages
 * @param {string} message - The text to send
 * @param {number} chatId - Optional chat ID for group messages
 * @returns {Promise} Response with status
 */
export async function sendMessage(to, message, chatId = null) {
  try {
    console.log('🐞 Sending message:', { 
      to, 
      message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      chatId,
      timestamp: new Date().toISOString()
    });
    
    // Validate inputs
    if (!message || message.trim() === '') {
      throw new Error('Message content is required');
    }
    
    if (!to && !chatId) {
      throw new Error('Recipient or chat ID is required');
    }
    
    // Prepare request payload
    const payload = {
      message: message.trim()
    };
    
    if (chatId) {
      // Group message - ensure chatId is a number
      payload.chat_id = parseInt(chatId);
      console.log('📱 Sending group message to chat ID:', payload.chat_id);
    } else {
      // Individual message - ensure to is a string
      payload.to = String(to).trim();
      console.log('📱 Sending individual message to:', payload.to);
    }
    
    console.log('📤 Final payload:', JSON.stringify(payload));
    
    const response = await apiClient.post('/send', payload);
    
    console.log('✅ Send response received:', {
      status: response.data?.status,
      success: response.data?.success,
      method: response.data?.method,
      message: response.data?.message
    });
    
    // Check if message was sent successfully
    if (response.data && (response.data.success === true || response.data.status === 'sent')) {
      console.log('✅ Message sent successfully');
      return response.data;
    } else {
      console.warn('⚠️ Message send returned non-success status:', response.data);
      // Still return the response data for the frontend to handle
      return response.data;
    }
  } catch (error) {
    console.error('❌ Send message error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });
    
    // Extract meaningful error message
    let errorMessage = 'Failed to send message';
    
    if (error.response) {
      errorMessage = error.response.data?.error || 
                    error.response.data?.message || 
                    `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response from server. Check your connection.';
    } else {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * fetchNotes - get all notes for a conversation
 * @param {number|string} chatId
 */
export async function fetchNotes(chatId) {
  try {
    console.log(`🐞 Fetching notes for chat ${chatId}...`);
    const response = await apiClient.get(`/conversations/${chatId}/notes`);
    
    console.log(`✅ Notes fetched for chat ${chatId}:`, {
      count: response.data?.length || 0,
      threadNotes: response.data?.filter(n => n.is_thread_note).length || 0,
      messageNotes: response.data?.filter(n => n.message_id).length || 0
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch notes for chat ${chatId}:`, error);
    throw error;
  }
}

/**
 * createNote - create a new note for a conversation
 * @param {number|string} chatId
 * @param {string} content
 * @param {number|string|null} messageId - optional, for message-specific notes
 * @param {string} color - optional, hex color for the note
 * @param {boolean} isThreadNote - whether this is a thread-level note
 * @param {string|null} parentNoteId - for reply threads
 * @param {string} author - note author name
 */
export async function createNote(chatId, content, messageId = null, color = '#f59e0b', isThreadNote = false, parentNoteId = null, author = 'User') {
  try {
    console.log('🐞 Creating note:', { 
      chatId, 
      content: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
      messageId,
      author
    });
    
    if (!content || !content.trim()) {
      throw new Error('Note content is required');
    }
    
    const response = await apiClient.post(`/conversations/${chatId}/notes`, {
      content: content.trim(),
      message_id: messageId,
      color: color,
      is_thread_note: isThreadNote,
      parent_note_id: parentNoteId,
      author: author
    });
    
    console.log('✅ Note created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Create note error:', error);
    throw error;
  }
}

/**
 * updateNote - update an existing note
 * @param {string} noteId
 * @param {string} content
 * @param {string} color - optional, hex color for the note
 */
export async function updateNote(noteId, content, color = null) {
  try {
    console.log('🐞 Updating note:', { 
      noteId, 
      content: content.substring(0, 50) + (content.length > 50 ? "..." : "")
    });
    
    if (!content || !content.trim()) {
      throw new Error('Note content is required');
    }
    
    const payload = { content: content.trim() };
    if (color) payload.color = color;
    
    const response = await apiClient.put(`/notes/${noteId}`, payload);
    
    console.log('✅ Note updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Update note error:', error);
    throw error;
  }
}

/**
 * deleteNote - delete a note
 * @param {string} noteId
 */
export async function deleteNote(noteId) {
  try {
    console.log('🐞 Deleting note:', noteId);
    
    const response = await apiClient.delete(`/notes/${noteId}`);
    
    console.log('✅ Note deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Delete note error:', error);
    throw error;
  }
}

/**
 * fetchMessageNotes - get all notes for a specific message
 * @param {number|string} messageId
 */
export async function fetchMessageNotes(messageId) {
  try {
    const response = await apiClient.get(`/notes/message/${messageId}`);
    return response.data || [];
  } catch (error) {
    console.error(`❌ Failed to fetch notes for message ${messageId}:`, error);
    // Return empty array on error to prevent UI issues
    return [];
  }
}

/**
 * testConnection - test if the API is reachable
 */
export async function testConnection() {
  try {
    console.log('🐞 Testing API connection...');
    const response = await apiClient.get('/health');
    console.log('✅ API connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    throw error;
  }
}