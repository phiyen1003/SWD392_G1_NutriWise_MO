import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { REACT_APP_OPENAI_API_KEY } from '@env';
import { KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { ActivityIndicator } from 'react-native';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const flatListRef = useRef(null); // ✅ Tạo ref cho FlatList
  const userId = 1;

  const axiosInstance = axios.create({
    baseURL: 'https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Chat',
    headers: {
      Authorization: `Bearer ${REACT_APP_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  useEffect(() => {
    fetchUserSessions();
  }, []);

  // 🟢 Lấy danh sách session của user
const fetchUserSessions = async () => {
  if (loading || !hasMore) return;
  
  try {
    setLoading(true);
    const response = await axiosInstance.get(`/user/${userId}`, {
      params: {
        pageNumber: pageNumber,
      },
    });

    console.log('Response data:', response.data);

    if (response.data.length > 0) {
      setSessions((prev) => [...prev, ...response.data]); // Nối vào danh sách cũ
      setPageNumber((prev) => prev + 1); // Tăng số trang lên để load tiếp
    } else {
      setHasMore(false); // Hết dữ liệu thì ngừng cuộn
    }
  } catch (error) {
    console.error('Failed to load sessions:', error.message);
  } finally {
    setLoading(false);
  }
};

// 🟢 Xử lý khi cuộn đến cuối danh sách
const handleLoadMore = () => {
  if (hasMore) {
    fetchUserSessions();
  }
};
  

  // 🟢 Lấy tin nhắn từ session
  const fetchMessages = async (sessionId) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messages/${sessionId}`);
      if (response.data) {
        const formattedMessages = response.data.map((msg) => ({
          ...msg,
          isUser: msg.isUserMessage,
        }));
        setMessages(formattedMessages);

        // ✅ Đợi state cập nhật xong rồi cuộn xuống dưới cùng
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Tạo session mới
  const createSession = async () => {
    try {
      const response = await axiosInstance.post('/session', {
        userId,
        title: `New Session ${Math.max(...sessions.map(s => s.sessionId), 0) + 1}`, // ✅ Lấy ID cao nhất rồi +1
      });
  
      console.log('Create session response:', response.data);
  
      if (response.data && response.data.chatSessionId) {
        const newSession = {
          sessionId: response.data.chatSessionId,
          title: response.data.title || `New Session ${Math.max(...sessions.map(s => s.sessionId), 0) + 1}`, 
          createdDate: response.data.createdDate || new Date().toISOString(),
          lastUpdatedDate: response.data.lastUpdatedDate || new Date().toISOString(),
          messages: response.data.messages || [],
        };
  
        setSessions((prev) => [newSession, ...prev]); 
        await fetchUserSessions();
      } else {
        console.error('Invalid response data:', response.data);
      }
    } catch (error) {
      console.error('Failed to create session:', error.message);
      Alert.alert('Error', 'Failed to create session. Please try again.');
    }
  };
  



  // 🟢 Gửi tin nhắn
const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  try {
    let sessionId = selectedSessionId;
    if (!sessionId) {
      // Tạo session mới nếu chưa có
      const sessionResponse = await axiosInstance.post('/session', {
        userId,
        title: `New Session ${sessions.length + 1}`,
      });
      sessionId = sessionResponse.data.id;
      setSelectedSessionId(sessionId);
      setSessions((prev) => [...prev, sessionResponse.data]);
    }

    // Gửi tin nhắn của người dùng
    const messageResponse = await axiosInstance.post('/message', {
      chatSessionId: sessionId,
      content: newMessage.trim(),
    });

    if (messageResponse.data) {
      const { userMessage, aiResponse } = messageResponse.data;

      // ✅ Thêm tin nhắn của người dùng vào state
      setMessages((prev) => [
        ...prev,
        {
          messageId: userMessage.chatMessageId,
          sessionId: userMessage.chatSessionId,
          sentTime: userMessage.timestamp,
          content: userMessage.content,
          isUser: true,
        },
      ]);

      // ✅ Thêm phản hồi từ AI vào state
      if (aiResponse) {
        setMessages((prev) => [
          ...prev,
          {
            messageId: aiResponse.chatMessageId,
            sessionId: aiResponse.chatSessionId,
            sentTime: aiResponse.timestamp,
            content: aiResponse.content,
            isUser: false,
          },
        ]);
      }

      setNewMessage('');
    }
  } catch (error) {
    console.error('Failed to send message:', error.message);
  }
};

  // 🟢 Xoá session
const deleteSession = async (sessionId) => {
  try {
    await axiosInstance.delete(`/session/${sessionId}`);
    setSessions((prev) => prev.filter((s) => s.chatSessionId !== sessionId));
    setMessages([]);
    setSelectedSessionId(null);
    Alert.alert('Deleted', 'Session deleted successfully');
    await fetchUserSessions(); // 🔄 Load lại danh sách session
  } catch (error) {
    console.error('Failed to delete session:', error.message);
    Alert.alert('Error', 'Failed to delete session');
  }
};

const handleConfirmDelete = (sessionId) => {
  Alert.alert(
    'Confirm',
    'Are you sure you want to delete this session?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => deleteSession(sessionId),
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
};

return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* 🔹 Nút Back */}
        {selectedSessionId && (
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedSessionId(null)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          )}

        {/* 🔹 Nút Tạo Session Mới */}
        {!selectedSessionId && (
            <TouchableOpacity style={styles.newSessionButton} onPress={createSession}>
              <Text style={styles.newSessionButtonText}>+ New Session</Text>
            </TouchableOpacity>
          )}

        {/* 🔹 Danh sách session */}
        {!selectedSessionId && (
          <FlatList
            data={sessions || []}
            keyExtractor={(item) => item?.chatSessionId?.toString()}
            renderItem={({ item }) => (
              <View style={styles.sessionItem}>
                <TouchableOpacity
                  style={styles.sessionContent}
                  onPress={() => {
                    fetchMessages(item.chatSessionId);
                    setSelectedSessionId(item.chatSessionId);
                  }}
                >
                  <Text style={styles.sessionText}>
                    {`New Session ${item?.chatSessionId}`}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {new Date(item?.createdDate).toLocaleString()}
                  </Text>
                </TouchableOpacity>
                {/* 🗑️ Nút xoá */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleConfirmDelete(item.chatSessionId)}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    )}
    ListEmptyComponent={<Text>No sessions available</Text>}
  // ✅ Xử lý khi cuộn đến cuối danh sách
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.1} // Khi cuộn đến 10% cuối thì gọi API tiếp
  ListFooterComponent={
    loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
  }
/>
)}

        {/* 🔹 Khung chat */}
        {selectedSessionId && (
          <FlatList
            ref={flatListRef} // ✅ Tham chiếu để cuộn xuống dưới cùng
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <Text
                  style={item.isUser ? styles.userText : styles.aiText}
                >
                  {item.content}
                </Text>
              </View>
            )}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            } // ✅ Cuộn khi có tin nhắn mới
          />
        )}

        {/* 🔹 Ô nhập tin nhắn */}
        {selectedSessionId && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fafafa' },

  backButton: { position: 'absolute', top: 10, left: 10, zIndex: 10 },

  // ✅ Đổi tên từ newConversationButton thành newSessionButton
  newSessionButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  newSessionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // ✅ Đổi tên từ conversationItem thành sessionItem
  sessionItem: {
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginVertical: 4,
  },
  sessionText: { fontSize: 16 },

  messageContainer: {
    padding: 10,
    marginVertical: 4,
    maxWidth: '70%', // Đảm bảo tin nhắn không tràn màn hình
    borderRadius: 12,
  },

  deleteButton: {
    padding: 8,
    backgroundColor: '#ffdddd',
    borderRadius: 8,
    marginLeft: 8,
  },

  deleteText: {
    color: '#ff0000',
    fontSize: 18,
  },

  sessionDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },

  // Tin nhắn của người dùng (nằm bên phải)
  userMessage: {
    backgroundColor: '#DCF8C6', // Màu xanh nhạt (WhatsApp-like)
    alignSelf: 'flex-end', // Đẩy về bên phải
    borderColor: '#34B7F1',
    borderWidth: 1,
    borderRadius: 16, // Bo góc mềm mại hơn
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Tin nhắn của AI (nằm bên trái)
  aiMessage: {
    backgroundColor: '#EAEAEA', // Màu xám nhạt
    alignSelf: 'flex-start', // Đẩy về bên trái
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  userText: {
    color: '#000',
    fontSize: 16,
  },

  aiText: {
    color: '#000',
    fontSize: 16,
  },

  inputContainer: { flexDirection: 'row', padding: 10 },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  sendButton: { padding: 10, backgroundColor: '#4CAF50', borderRadius: 20, marginLeft: 10 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ChatScreen;
