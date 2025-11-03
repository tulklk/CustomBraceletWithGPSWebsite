"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Paperclip, Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChat } from "@/store/useChat"
import { QUICK_CHAT_CHIPS } from "@/lib/constants"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

dayjs.extend(relativeTime)
dayjs.locale("vi")

export function ChatWindow() {
  const { messages, addMessage, setOpen, getAutoResponse } = useChat()
  const [input, setInput] = useState("")
  const [ticketOpen, setTicketOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage(
        "assistant",
        "Xin chào! 👋 Tôi là trợ lý AI của ARTEMIS.\n\n✨ Tôi có thể giúp bạn:\n• Tư vấn sản phẩm và tính năng\n• Hướng dẫn thiết kế vòng tay\n• Giải đáp thắc mắc về bảo hành\n• Hỗ trợ đặt hàng\n\nBạn cần tôi giúp gì không? 😊"
      )
    }
  }, [messages.length, addMessage])

  const handleSend = () => {
    if (!input.trim()) return

    addMessage("user", input)
    const response = getAutoResponse(input)

    setTimeout(() => {
      addMessage("assistant", response)
    }, 500)

    setInput("")
  }

  const handleChipClick = (chip: string) => {
    addMessage("user", chip)
    const response = getAutoResponse(chip)
    setTimeout(() => {
      addMessage("assistant", response)
    }, 500)
  }

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const content = formData.get("content")

    toast({
      title: "Ticket đã được tạo (Mock)",
      description: `Chúng tôi sẽ phản hồi qua ${email} trong 24h`,
    })
    setTicketOpen(false)
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px]"
    >
      <Card className="flex flex-col h-[600px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-primary via-primary to-pink-600 text-primary-foreground rounded-t-lg relative overflow-hidden">
          {/* Gradient overlay animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          <div className="flex items-center gap-3 relative z-10">
            {/* AI Bot Avatar */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <Bot className="h-5 w-5" />
              </div>
              {/* Online indicator */}
              <motion.div
                className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Trợ lý AI ARTEMIS</h3>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-1.5 py-0">
                  <Sparkles className="h-2.5 w-2.5" />
                </Badge>
              </div>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                Online • Trả lời tức thì
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="text-primary-foreground hover:bg-white/20 relative z-10"
            aria-label="Đóng chat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* AI Avatar for assistant messages */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {dayjs(msg.timestamp).fromNow()}
                </p>
              </div>
              
              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold">
                    U
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {QUICK_CHAT_CHIPS.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </Badge>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              aria-label="Nhập tin nhắn"
            />
            <Button onClick={handleSend} size="icon" aria-label="Gửi tin nhắn">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Paperclip className="h-3 w-3 mr-2" />
                Tạo ticket hỗ trợ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo ticket hỗ trợ</DialogTitle>
                <DialogDescription>
                  Nhân viên sẽ phản hồi qua email trong 24h
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-email">Email của bạn</Label>
                  <Input
                    id="ticket-email"
                    name="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-content">Nội dung</Label>
                  <Textarea
                    id="ticket-content"
                    name="content"
                    required
                    placeholder="Mô tả vấn đề bạn gặp phải..."
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Gửi ticket
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </motion.div>
  )
}

