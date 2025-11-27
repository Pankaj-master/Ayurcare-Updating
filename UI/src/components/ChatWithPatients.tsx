import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Clock,
  Search,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { authAPI, patientsAPI, chatAPI } from "../services/api";
import { useTranslation } from "react-i18next"; 

const API_URL = import.meta.env.VITE_API_URL; // "http://localhost:5000/api"

type Doctor = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  specialization?: string | null;
};

type PatientListItem = {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId?: string | null;
  patientId?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function ChatWithPatients() {
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientListItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const token = localStorage.getItem("token");

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch doctor profile
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data.success) {
          const user = res.data.data;
          setDoctor({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            specialization: user.specialization,
          });
        }
      } catch (err) {
        console.error("Error fetching doctor profile", err);
      }
    };

    fetchDoctor();
  }, []);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientsAPI.getByDoctor();
        const patientData = res.data.data || [];

        const mapped: PatientListItem[] = patientData.map((p: any) => ({
          id: p.patientId ?? p.id,
          userId: p.userId,
          name: p.name || p.user?.name || "Patient",
          avatar: p.avatar || p.user?.avatar || null,
          unreadCount: p.unreadCount ?? 0,
          lastMessage: p.lastMessage ?? "",
          lastMessageTime: p.lastMessageTime ?? "",
        }));

        setPatients(mapped);
      } catch (err) {
        console.error("Error fetching doctor's patients:", err);
      }
    };

    if (doctor) fetchPatients();
  }, [doctor]);

  // SOCKET.IO SETUP — FIXED
  useEffect(() => {
    if (!token || !doctor) return;

    const baseSocketUrl = API_URL.replace("/api", "");
    const socket = io(baseSocketUrl, { auth: { token } });

    socketRef.current = socket;

    // FIX 1: Correct socket event name
    socket.on("newMessage", (msg: ChatMessage) => {
      // FIX 2: Correct message filtering
      const isForDoctor =
        msg.receiverId === doctor.id || msg.senderId === doctor.id;

      if (!isForDoctor) return;

      const belongsToSelected =
        selectedPatient &&
        (msg.patientId === selectedPatient.id ||
          msg.senderId === selectedPatient.userId ||
          msg.receiverId === selectedPatient.userId);

      if (belongsToSelected) {
        setMessages((prev) => [...prev, msg]);

        if (!msg.isRead && msg.receiverId === doctor.id) {
          markMessageAsRead(msg.id);
        }
      } else {
        if (msg.patientId) {
          setPatients((prev) =>
            prev.map((p) =>
              p.id === msg.patientId
                ? { ...p, unreadCount: p.unreadCount + 1 }
                : p
            )
          );
        }
      }
    });

    return () => socket.disconnect();
  }, [doctor, token, selectedPatient]);

  // FETCH CONVERSATION — FIXED joinRoom
  const fetchConversation = async (patient: PatientListItem) => {
    if (!doctor) return;
    setLoadingMessages(true);

    // FIX 3: Join correct room for real-time chat
    socketRef.current?.emit("joinRoom", patient.userId);

    try {
      const res = await chatAPI.getConversation(patient.userId);

      const msgs: ChatMessage[] = res.data.data ?? [];
      setMessages(msgs);

      msgs.forEach((m) => {
        if (!m.isRead && m.receiverId === doctor.id) {
          markMessageAsRead(m.id);
        }
      });

      setPatients((prev) =>
        prev.map((p) => (p.id === patient.id ? { ...p, unreadCount: 0 } : p))
      );
    } catch (err) {
      console.error("Error fetching conversation", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectPatient = (patient: PatientListItem) => {
    setSelectedPatient(patient);
    fetchConversation(patient);
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await chatAPI.markAsRead(messageId);
    } catch (err) {
      console.error("Error marking message as read", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !doctor || !selectedPatient) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: doctor.id,
      receiverId: selectedPatient.userId,
      patientId: selectedPatient.id,
      message: newMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await chatAPI.sendMessage({
        receiverId: selectedPatient.userId,
        patientId: selectedPatient.id,
        message: tempMessage.message,
      });

      const savedMessage = res.data.data;

      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? savedMessage : m))
      );

    } catch (err) {
      console.error("Error sending message", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};
    msgs.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
  <div className="h-[calc(100vh-8rem)] flex space-x-4">
      
      {/* Sidebar: Patient List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("chat.patients")}
            <Badge variant="outline">{patients.length}</Badge>
          </CardTitle>

          <div className="mt-2 flex items-center space-x-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder={t("chat.searchPatient")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredPatients.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">
              {t("chat.noPatientsFound")}
            </div>
          )}

          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              className={`w-full flex items-center space-x-3 p-2 rounded-md text-left hover:bg-accent transition ${
                selectedPatient?.id === patient.id ? "bg-accent" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={patient.avatar || undefined} />
                <AvatarFallback>
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {patient.name}
                  </span>

                  {patient.unreadCount > 0 && (
                    <Badge className="text-[10px] px-1.5 py-0.5 rounded-full">
                      {patient.unreadCount}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[11px] text-muted-foreground truncate">
                    {patient.lastMessage || t("chat.noMessagesYet")}
                  </span>

                  {patient.lastMessageTime && (
                    <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                      {formatTime(patient.lastMessageTime)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Main Chat Panel */}
      <Card className="flex-1 flex flex-col">

        {/* Header */}
        <CardHeader className="border-b flex items-center justify-between">
          {selectedPatient ? (
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedPatient.avatar || undefined} />
                <AvatarFallback>
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg">{selectedPatient.name}</h3>

                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{t("chat.patient")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg">{t("chat.selectPatientTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("chat.selectPatientSubtitle")}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={!selectedPatient}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!selectedPatient}>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!selectedPatient}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedPatient && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              {t("chat.selectPatientToChat")}
            </div>
          )}

          {selectedPatient && loadingMessages && (
            <div className="text-xs text-muted-foreground text-center py-4">
              {t("chat.loadingMessages")}
            </div>
          )}

          {selectedPatient &&
            !loadingMessages &&
            Object.entries(messageGroups).map(([date, dayMessages]) => (
              <div key={date}>
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    {date}
                  </div>
                </div>

                <div className="space-y-4">
                  {dayMessages.map((message) => {
                    const isDoctorSender =
                      doctor && message.senderId === doctor.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isDoctorSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            isDoctorSender ? "order-2" : "order-1"
                          }`}
                        >
                          {!isDoctorSender && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage
                                  src={selectedPatient.avatar || undefined}
                                />
                                <AvatarFallback className="text-xs">
                                  PT
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {selectedPatient.name}
                              </span>
                            </div>
                          )}

                          <div
                            className={`p-3 rounded-lg ${
                              isDoctorSender
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>

                            <div
                              className={`flex items-center justify-between mt-2 text-xs ${
                                isDoctorSender
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span>{formatTime(message.createdAt)}</span>

                              {isDoctorSender && (
                                <div className="flex items-center space-x-1">
                                  {message.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-blue-400" />
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

          {/* Typing Indicator */}
          {selectedPatient && isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={selectedPatient.avatar || undefined} />
                  <AvatarFallback className="text-xs">PT</AvatarFallback>
                </Avatar>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder={
                  selectedPatient
                    ? t("chat.typeMessage")
                    : t("chat.selectPatientToStart")
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (selectedPatient) sendMessage();
                  }
                }}
                rows={1}
                className="resize-none"
                disabled={!selectedPatient}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!selectedPatient || newMessage.trim() === ""}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{t("chat.enterToSend")}</span>
            <span>
              {doctor
                ? `${doctor.name} (${t("chat.doctor")})`
                : t("chat.loadingDoctor")}
            </span>
          </div>
        </div>
      </Card>
    </div>
);

}
