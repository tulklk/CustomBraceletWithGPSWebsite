"use client"

import { useState } from "react"
import { Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatWindow } from "./ChatWindow"
import { useChat } from "@/store/useChat"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export function ChatWidget() {
  const { isOpen, setOpen } = useChat()

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Pulse ring animation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <Button
              size="lg"
              className="rounded-full h-16 w-16 shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary via-primary to-pink-600 hover:from-primary/90 hover:via-primary/90 hover:to-pink-600/90 transition-all duration-300 border-2 border-white/20"
              onClick={() => setOpen(true)}
              aria-label="Mở chat hỗ trợ AI"
            >
              {/* Gradient overlay animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Bot icon with animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Bot className="h-7 w-7 relative z-10" />
              </motion.div>
              
              {/* AI Badge with sparkle */}
              <Badge className="absolute -top-1 -right-1 h-6 px-2 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-bold">AI</span>
              </Badge>
              
              {/* Online indicator dot */}
              <motion.div
                className="absolute bottom-1 right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && <ChatWindow />}
      </AnimatePresence>
    </>
  )
}

