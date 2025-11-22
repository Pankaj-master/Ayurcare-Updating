import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Image, 
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Clock
} from 'lucide-react';
import { Textarea } from './ui/textarea';

const mockMessages = [
  {
    id: 1,
    sender: 'doctor',
    content: 'Hello! How are you feeling today? I noticed you completed your morning meal plan. Great job!',
    timestamp: '2024-01-22T09:00:00Z',
    read: true,
    type: 'text'
  },
  {
    id: 2,
    sender: 'patient',
    content: 'Thank you! I feel much better. The herbal tea you recommended really helps with digestion.',
    timestamp: '2024-01-22T09:15:00Z',
    read: true,
    type: 'text'
  },
  {
    id: 3,
    sender: 'doctor',
    content: 'That\'s wonderful to hear! Ginger and fennel are excellent for digestive fire. Are you experiencing any issues with the new lunch menu?',
    timestamp: '2024-01-22T09:20:00Z',
    read: true,
    type: 'text'
  },
  {
    id: 4,
    sender: 'patient',
    content: 'The quinoa bowl is delicious! But I have a question about portion sizes. Should I eat the full portion or adjust based on hunger?',
    timestamp: '2024-01-22T11:30:00Z',
    read: true,
    type: 'text'
  },
  {
    id: 5,
    sender: 'doctor',
    content: 'Great question! Listen to your body - eat until you feel 80% full. Your digestive fire is improving, so you might need slightly smaller portions now.',
    timestamp: '2024-01-22T11:45:00Z',
    read: true,
    type: 'text'
  },
  {
    id: 6,
    sender: 'doctor',
    content: 'I\'ve updated your meal plan with some seasonal adjustments. Please check your dashboard when you have a moment.',
    timestamp: '2024-01-22T14:20:00Z',
    read: false,
    type: 'notification'
  }
];

const doctorInfo = {
  name: 'Dr. Anjali Mehta',
  specialization: 'Ayurvedic Nutrition Specialist',
  avatar: null,
  status: 'online',
  lastSeen: 'Active now'
};

export function ChatWithDoctor() {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: messages.length + 1,
      sender: 'patient',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate doctor typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const doctorResponse = {
        id: messages.length + 2,
        sender: 'doctor',
        content: 'Thank you for your message. I\'ll review this and get back to you shortly with recommendations.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      };
      setMessages(prev => [...prev, doctorResponse]);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-foreground">Chat with Doctor</h1>
          <p className="text-muted-foreground">Direct communication with your Ayurvedic specialist</p>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={doctorInfo.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doctorInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg">{doctorInfo.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${doctorInfo.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-muted-foreground">{doctorInfo.lastSeen}</span>
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
                {dayMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${message.sender === 'patient' ? 'order-2' : 'order-1'}`}>
                      {message.sender === 'doctor' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={doctorInfo.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              Dr
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{doctorInfo.name}</span>
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'patient' 
                          ? 'bg-primary text-primary-foreground' 
                          : message.type === 'notification'
                          ? 'bg-accent text-accent-foreground border'
                          : 'bg-muted'
                      }`}>
                        {message.type === 'notification' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">System Notification</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.sender === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.sender === 'patient' && (
                            <div className="flex items-center space-x-1">
                              {message.read ? (
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
                ))}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={doctorInfo.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    Dr
                  </AvatarFallback>
                </Avatar>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
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
              <Image className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
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
            <span>{doctorInfo.status === 'online' ? 'Doctor is online' : 'Doctor will respond soon'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}