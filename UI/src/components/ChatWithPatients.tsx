import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { CheckCheck, Clock, Search, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { authAPI, patientsAPI, chatAPI } from "../services/api";
import { useTranslation } from "react-i18next";

// --- Types ---
type Doctor = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  specialization?: string | null;
};

type PatientListItem = {
  id: string; // This is the Patient Profile ID
  userId: string; // This is the User Login ID
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedPatientRef = useRef<PatientListItem | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || localStorage.getItem("token")
      : null;

  // Sync Ref for Socket Event Listeners
  useEffect(() => {
    selectedPatientRef.current = selectedPatient;
  }, [selectedPatient]);

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const shouldAutoScrollRef = useRef(false);

  // Scroll ONLY when a new message is added live, not when switching patients
  useEffect(() => {
    if (!selectedPatient) return;

    // Only scroll when new messages are added live
    if (shouldAutoScrollRef.current) {
      scrollToBottomSmooth();
    }
  }, [messages]);

  // 1. Fetch Doctor Profile
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data.success) {
          setDoctor(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching doctor profile", err);
      }
    };
    fetchDoctor();
  }, []);

  // 2. Fetch Patients List
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

        mapped.sort((a, b) => {
          const tA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const tB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return tB - tA;
        });

        setPatients(mapped);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    if (doctor) fetchPatients();
  }, [doctor]);

  // 3. SOCKET CONNECTION & HANDLERS
  useEffect(() => {
    if (!token || !doctor) return;

    const API_URL = import.meta.env.VITE_API_URL || "";
    // Adjust based on your actual URL structure
    const baseSocketUrl = API_URL.replace("/api", "");

    const socket = io(baseSocketUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // 🔥 CRITICAL: Join the Doctor's specific room so backend io.to(doctorID) works
      socket.emit("joinRoom", doctor.id);
    });

    // --- MAIN MESSAGE HANDLER ---
    const handleIncoming = (msg: ChatMessage) => {
      // Robust Type Conversion to String to prevent ID mismatches
      const docId = String(doctor.id);
      const msgSenderId = String(msg.senderId);
      const msgPatientId = String(msg.patientId);

      // Prevent processing our own messages if they echo back
      if (msgSenderId === docId) return;

      const currentPatient = selectedPatientRef.current;

      // Check if this message belongs to the CURRENTLY OPEN chat
      const isForCurrentChat =
        currentPatient &&
        (msgPatientId === String(currentPatient.id) ||
          msgSenderId === String(currentPatient.userId));

      // [A] Update Chat Window (only if relevant)
      if (isForCurrentChat) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Mark as read immediately
        if (!msg.isRead) {
          socket.emit("messageRead", {
            messageIds: [msg.id],
            senderId: msg.senderId,
          });
          chatAPI.markAsRead(msg.id).catch(console.error);
        }
      }

      // [B] Update Sidebar List (The Fix for "Showing Everywhere")
      setPatients((prev) => {
        const updatedPatients = prev.map((p) => {
          // 🔥 STRICT CHECK: Does this message belong to THIS specific patient in the loop?
          const isMatch =
            String(p.userId) === msgSenderId || String(p.id) === msgPatientId;

          if (isMatch) {
            return {
              ...p,
              lastMessage: msg.message,
              lastMessageTime: msg.createdAt,
              // Only increase unread count if we aren't currently looking at this chat
              unreadCount: isForCurrentChat ? 0 : (p.unreadCount || 0) + 1,
            };
          }
          // If no match, return patient exactly as is (do not update lastMessage)
          return p;
        });

        // Re-sort to bring latest message to top
        return updatedPatients.sort((a, b) => {
          const tA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const tB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return tB - tA;
        });
      });
    };

    // --- READ RECEIPT HANDLER ---
    const handleMessageRead = (data: { messageIds: string[] }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    };

    socket.on("newMessage", handleIncoming);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("newMessage", handleIncoming);
      socket.off("messageRead", handleMessageRead);
      socket.disconnect();
    };
  }, [doctor, token]);

  const fetchConversation = async (patient: PatientListItem) => {
    if (!doctor) return;

    shouldAutoScrollRef.current = false; // ⛔ disable smooth scroll (instant load)
    setLoadingMessages(true);

    try {
      const res = await chatAPI.getConversation(patient.userId);
      const msgs: ChatMessage[] = res.data.data ?? [];
      setMessages(msgs);

      // Jump instantly to bottom WITH NO animation
      setTimeout(() => {
        scrollToBottomInstant();
      }, 0);

      // Handle unread messages
      const unreadIds = msgs
        .filter((m) => !m.isRead && m.senderId !== doctor.id)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        socketRef.current?.emit("messageRead", {
          messageIds: unreadIds,
          senderId: patient.userId,
        });
        unreadIds.forEach((id) => chatAPI.markAsRead(id));
      }

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

  const sendMessage = async () => {
    if (!newMessage.trim() || !doctor || !selectedPatient) return;

    shouldAutoScrollRef.current = true; // ENABLE smooth scroll

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

    setPatients((prev) => {
      const updated = prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              lastMessage: tempMessage.message,
              lastMessageTime: tempMessage.createdAt,
            }
          : p
      );
      return updated.sort((a, b) => {
        const tA = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const tB = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;
        return tB - tA;
      });
    });

    if (socketRef.current?.connected) {
      socketRef.current.emit("sendMessage", {
        receiverId: String(selectedPatient.userId),
        patientId: String(selectedPatient.id),
        message: tempMessage.message,
      });
    }

    try {
      const res = await chatAPI.sendMessage({
        receiverId: selectedPatient.userId,
        patientId: selectedPatient.id,
        message: tempMessage.message,
      });
      const savedMessage = res.data.data;
      if (savedMessage) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? savedMessage : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  // --- Rendering Helpers ---
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

  const messageGroups = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex space-x-4">
      {/* Sidebar */}
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
          {filteredPatients.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">
              No patients found
            </div>
          ) : (
            filteredPatients.map((patient) => (
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
                    {patient.name.substring(0, 2).toUpperCase()}
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
                  <div className="flex items-center justify-between mt-0.5 w-full">
                    {patient.lastMessage ? (
                      <>
                        {/* LEFT SIDE: Prevents widening */}
                        <span className="text-[11px] text-muted-foreground truncate block max-w-[120px]">
                          {patient.lastMessage}
                        </span>

                        {/* RIGHT SIDE: Timestamp */}
                        {patient.lastMessageTime && (
                          <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                            {formatTime(patient.lastMessageTime)}
                          </span>
                        )}
                      </>
                    ) : (
                      // Keep height consistent — but do NOT affect width
                      <div className="h-3 w-full" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Main Chat */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b flex items-center justify-between">
          {selectedPatient ? (
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedPatient.avatar || undefined} />
                <AvatarFallback>
                  {selectedPatient.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg">{selectedPatient.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {t("chat.patient")}
                </span>
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
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedPatient && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              {t("chat.selectPatientToChat")}
            </div>
          )}
          {selectedPatient &&
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
                                <div className="flex items-center space-x-1 ml-2">
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
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
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
            <Button
              onClick={sendMessage}
              disabled={!selectedPatient || !newMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
