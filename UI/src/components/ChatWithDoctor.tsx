import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
} from 'lucide-react';
import { Textarea } from './ui/textarea';
import { patientsAPI, chatAPI } from '../services/api';

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

export function ChatWithDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- Helpers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // --- Load doctor + conversation ---
  useEffect(() => {
    const fetchDoctorAndMessages = async () => {
      try {
        // Patient → which doctor am I assigned to?
        const res = await patientsAPI.getDoctor();
        if (!res.data?.success || !res.data.data) {
          console.error('No doctor assigned to this patient');
          return;
        }

        const doc: Doctor = res.data.data;
        setDoctor(doc);

        // Now load the conversation with this doctor
        setLoadingMessages(true);
        const convRes = await chatAPI.getConversation(doc.id, {
          page: 1,
          limit: 100,
        });
        const msgs: ChatMessage[] = convRes.data?.data ?? [];
        setMessages(msgs);
      } catch (err) {
        console.error('Error loading doctor or conversation', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchDoctorAndMessages();
  }, []);

  // --- Send message ---
  const sendMessage = async () => {
    if (!doctor || !newMessage.trim()) return;

    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'me', // just for UI; actual ID will come from backend
      receiverId: doctor.id,
      patientId: undefined,
      message: newMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, temp]);
    setNewMessage('');

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
      console.error('Error sending message', err);
      // Optional: remove temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    }
  };

  if (!doctor) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading your doctor...</p>
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
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('') || 'Dr'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg">{doctor.name}</h3>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    {doctor.specialization || 'Ayurvedic Specialist'}
                  </span>
                  {/* You can later replace this with live status via socket */}
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
                        isPatient ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md ${
                          isPatient ? 'order-2' : 'order-1'
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
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>

                          <div
                            className={`flex items-center justify-between mt-2 text-xs ${
                              isPatient
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
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
                  if (e.key === 'Enter' && !e.shiftKey) {
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
              disabled={newMessage.trim() === ''}
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
