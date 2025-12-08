import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  MessageCircle,
  Send,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Clock,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { patientsAPI, chatAPI, authAPI } from "../services/api";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId?: string | null;
  patientId?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type Doctor = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  specialization?: string | null;
  role: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export function ChatWithDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || localStorage.getItem("token")
      : null;

  // --- Helpers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};
    msgs.forEach((m) => {
      const d = formatDate(m.createdAt);
      if (!groups[d]) groups[d] = [];
      groups[d].push(m);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // --- Load User, Doctor & Conversation ---
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Get Current User
        const userRes = await authAPI.getMe();
        if (userRes.data?.success) {
            setCurrentUser(userRes.data.data);
        }

        // 2. Get Assigned Doctor
        const docRes = await patientsAPI.getDoctor();
        if (!docRes.data?.success || !docRes.data.data) {
          console.error("No doctor assigned to this patient");
          return;
        }

        const doc: Doctor = docRes.data.data;
        setDoctor(doc);

        // 3. Load Conversation
        setLoadingMessages(true);
        // Note: Check your API definition. Usually patient gets conversation by simply calling endpoint
        // without passing ID, or passing doctorId depending on backend.
        const convRes = await chatAPI.getConversation(doc.id); 
        const msgs: ChatMessage[] = convRes.data?.data ?? [];
        setMessages(msgs);

        // 4. REST API Bulk Read (mark unread as read)
        const unreadIds = msgs
            .filter((m) => !m.isRead && m.senderId === doc.id)
            .map((m) => m.id);

        if (unreadIds.length > 0) {
            unreadIds.forEach(id => chatAPI.markAsRead(id));
        }

      } catch (err) {
        console.error("Error loading chat data", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    initData();
  }, []);

  // --- Socket setup ---
  useEffect(() => {
    if (!doctor || !token || !currentUser) return;

    const baseSocketUrl = (import.meta.env.VITE_API_URL || "").replace("/api", "");
    const socket = io(baseSocketUrl, { auth: { token } });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Patient socket connected:", socket.id);
      
      // 🔄 CHANGE 1: Join My OWN Room, NOT the Doctor's Room.
      // The backend sends messages to io.to(receiverId). I am the receiver.
      socket.emit("joinRoom", currentUser.id);
      
      // Emit read receipts for existing unread messages
      const unreadIds = messages
        .filter((m) => !m.isRead && m.senderId === doctor.id)
        .map((m) => m.id);
      
      if (unreadIds.length > 0) {
        socket.emit("messageRead", { messageIds: unreadIds, senderId: currentUser.id });
      }
    });

    // --- HANDLE INCOMING MESSAGES ---
    const handleIncoming = (msg: ChatMessage) => {
      // 🔄 CHANGE 2: Strict String Conversions
      const myId = String(currentUser.id);
      const docId = String(doctor.id);
      const senderId = String(msg.senderId);
      const receiverId = msg.receiverId ? String(msg.receiverId) : null;

      // 1. Ignore echoes (messages I sent)
      if (senderId === myId) return;

      // 🔄 CHANGE 3: Strict Privacy Check
      // Accept if it is FROM the doctor AND sent TO me (or my patient ID)
      const isFromDoctor = senderId === docId;
      const isToMe = receiverId === myId || String(msg.patientId) === myId;

      if (!isFromDoctor || !isToMe) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Mark as read immediately
      if (!msg.isRead) {
        socket.emit("messageRead", { messageIds: [msg.id], senderId: senderId });
        chatAPI.markAsRead(msg.id).catch(console.error);
      }
    };

    // --- HANDLE READ RECEIPTS ---
    const handleMessageRead = (data: { messageIds: string[], userId: string }) => {
        setMessages((prev) => 
            prev.map((msg) => 
                data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
            )
        );
    };

    socket.on("newMessage", handleIncoming);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("connect");
      socket.off("newMessage", handleIncoming);
      socket.off("messageRead", handleMessageRead);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [doctor, token, currentUser]); // Removed 'messages' from dep array to prevent loop re-connections

  // --- Send message ---
  const sendMessage = async () => {
    if (!doctor || !currentUser || !newMessage.trim()) return;

    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: doctor.id,
      patientId: currentUser.id,
      message: newMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, temp]);
    setNewMessage("");

    const socket = socketRef.current;
    if (socket && socket.connected) {
        // 🔄 CHANGE 4: Ensure IDs are strings when emitting
        socket.emit("sendMessage", {
          receiverId: String(doctor.id),
          patientId: String(currentUser.id),
          message: temp.message,
        });
    }

    try {
      const res = await chatAPI.sendMessage({
        receiverId: doctor.id,
        message: temp.message,
      });
      const saved: ChatMessage | undefined = res.data?.data;
      if (saved) {
        setMessages((prev) =>
          prev.map((m) => (m.id === temp.id ? saved : m))
        );
      }
    } catch (err) {
      console.error("Error sending message via REST", err);
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    }
  };

  // ... (Rest of the JSX rendering remains exactly the same)
  if (!doctor || !currentUser) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Chat with Doctor</h1>
          <p className="text-muted-foreground">
            Direct communication with your Ayurvedic specialist
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={doctor.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doctor.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "Dr"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg">{doctor.name}</h3>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    {doctor.specialization || "Ayurvedic Specialist"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Doctor will respond as soon as possible
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages && messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Loading messages...
            </p>
          )}

          {Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {dayMessages.map((message) => {
                  const isDoctor = message.senderId === doctor.id;
                  const isPatient = !isDoctor;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isPatient ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md ${
                          isPatient ? "order-2" : "order-1"
                        }`}
                      >
                        {isDoctor && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={doctor.avatar ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                Dr
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {doctor.name}
                            </span>
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-lg ${
                            isPatient
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>

                          <div
                            className={`flex items-center justify-between mt-2 text-xs ${
                              isPatient
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>{formatTime(message.createdAt)}</span>
                            {isPatient && (
                              <div className="flex items-center space-x-1">
                                {message.isRead ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* If no messages */}
          {!loadingMessages && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 text-center text-sm text-muted-foreground">
              <MessageCircle className="w-6 h-6 mb-2" />
              <p>No messages yet. Say hello to your doctor!</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
            <Button variant="outline" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ImageIcon className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                className="resize-none"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={newMessage.trim() === ""}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Doctor will respond soon</span>
          </div>
        </div>
      </Card>
    </div>
  );
}