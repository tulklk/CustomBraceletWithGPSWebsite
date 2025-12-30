"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Bot, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChat } from "@/store/useChat"
import { QUICK_CHAT_CHIPS } from "@/lib/constants"
import { sendChatMessage } from "@/lib/api/chat"
import { ChatProductCard } from "./ChatProductCard"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

dayjs.extend(relativeTime)
dayjs.locale("vi")

// Helper function to format AI message text
function formatMessageText(text: string) {
  // Split by lines to handle paragraphs
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let keyIndex = 0
  
  lines.forEach((line, index) => {
    // Handle empty lines (paragraph breaks) - only add one break
    if (line.trim() === '') {
      if (index > 0 && lines[index - 1].trim() !== '') {
        elements.push(<div key={`break-${keyIndex++}`} className="h-2" />)
      }
      return
    }
    
    // Handle bullet points (•, -, *)
    if (/^[\s]*[•\-\*]\s/.test(line)) {
      const content = line.replace(/^[\s]*[•\-\*]\s/, '')
      elements.push(
        <div key={keyIndex++} className="flex items-start gap-2.5 my-1.5">
          <span className="text-primary dark:text-pink-400 mt-0.5 flex-shrink-0 font-semibold">•</span>
          <span className="flex-1 leading-relaxed">{formatInlineText(content)}</span>
        </div>
      )
      return
    }
    
    // Handle lines that are entirely bold (likely headings)
    if (/^\*\*.*\*\*$/.test(line.trim())) {
      const headingText = line.trim().replace(/\*\*/g, '')
      elements.push(
        <div key={keyIndex++} className="my-2.5">
          <strong className="font-semibold text-base text-foreground">{headingText}</strong>
        </div>
      )
      return
    }
    
    // Regular text line
    elements.push(
      <div key={keyIndex++} className="my-1.5 leading-relaxed">
        {formatInlineText(line)}
      </div>
    )
  })
  
  return elements
}

// Helper to format inline text (bold, etc.)
function formatInlineText(text: string) {
  // Handle bold text (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2)
      return (
        <strong key={index} className="font-semibold text-foreground">
          {boldText}
        </strong>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function ChatWindow() {
  const { messages, addMessage, setOpen, sessionId, setSessionId, clearMessages } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    
    // Add user message
    addMessage("user", userMessage)
    setIsLoading(true)

    try {
      const response = await sendChatMessage(userMessage, sessionId)
      
      // Update session ID if new
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId)
      }

      // Add AI response with suggested products
      addMessage("assistant", response.message, response.suggestedProducts)
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage(
        "assistant",
        "Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau. 😔"
      )
      toast({
        title: "Lỗi kết nối",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleChipClick = async (chip: string) => {
    if (isLoading) return
    
    addMessage("user", chip)
    setIsLoading(true)

    try {
      const response = await sendChatMessage(chip, sessionId)
      
      // Update session ID if new
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId)
      }

      addMessage("assistant", response.message, response.suggestedProducts)
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage(
        "assistant",
        "Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau. 😔"
      )
    } finally {
      setIsLoading(false)
    }
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
              </div>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                Online • Trả lời tức thì
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 relative z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                clearMessages()
              }}
              className="text-primary-foreground hover:bg-white/20"
              aria-label="Xóa lịch sử chat"
              title="Xóa lịch sử"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-primary-foreground hover:bg-white/20"
              aria-label="Đóng chat"
              title="Đóng chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
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
                className={`max-w-[85%] rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm px-4 py-3"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-sm px-5 py-4 shadow-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <>
                    <div className="text-sm text-gray-800 dark:text-gray-100">
                      {formatMessageText(msg.content)}
                    </div>
                    
                    {/* Suggested Products */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300 opacity-90">
                          Sản phẩm gợi ý:
                        </p>
                        {msg.suggestedProducts.map((product) => (
                          <ChatProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                )}
                <p className={`text-xs mt-2 ${
                  msg.role === "user" 
                    ? "opacity-80" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
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
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2 rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
              ref={inputRef}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
              aria-label="Nhập tin nhắn"
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              aria-label="Gửi tin nhắn"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

