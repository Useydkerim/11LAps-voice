'use client';

import React, { useEffect, useState, useRef } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import ConversationHistory from "./ConversationHistory";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const N8N_WEBHOOK_URL = "https://poligoninteractive.app.n8n.cloud/webhook/data";

export default function VoiceChatClient() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const conversationStartTime = useRef<Date | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message: { message: string; source: string }) => {
      console.log("Received message:", message);
      const newMessage = {
        text: message.message,
        isUser: message.source === "user",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error: string | Error) => {
      setErrorMessage(typeof error === "string" ? error : error.message);
      console.error("Error:", error);
    },
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (error) {
        setErrorMessage("Microphone access denied");
        console.error("Error accessing microphone:", error);
      }
    };

    requestMicPermission();
  }, []);

  const sendToN8N = async () => {
    try {
      const conversationData = {
        conversation: {
          id: conversationStartTime.current?.getTime() || Date.now(),
          startTime: conversationStartTime.current?.toISOString(),
          endTime: new Date().toISOString(),
          duration: conversationStartTime.current 
            ? (new Date().getTime() - conversationStartTime.current.getTime()) / 1000 
            : 0,
          messages: messages.map(msg => ({
            text: msg.text,
            isUser: msg.isUser,
            timestamp: msg.timestamp.toISOString()
          }))
        }
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        console.error('Failed to send data to n8n');
      } else {
        console.log('Successfully sent conversation data to n8n:', conversationData);
      }
    } catch (error) {
      console.error('Error sending data to n8n:', error);
    }
  };

  const handleStartConversation = async () => {
    try {
      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      });
      console.log("Started conversation:", conversationId);
      setMessages([]);
      conversationStartTime.current = new Date();
    } catch (error) {
      setErrorMessage("Failed to start conversation");
      console.error("Error starting conversation:", error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
      if (messages.length > 0) {
        await sendToN8N();
      }
      conversationStartTime.current = null;
    } catch (error) {
      setErrorMessage("Failed to end conversation");
      console.error("Error ending conversation:", error);
    }
  };

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      setErrorMessage("Failed to change volume");
      console.error("Error changing volume:", error);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Voice Chat
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                disabled={status !== "connected"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              {status === "connected" ? (
                <Button
                  variant="destructive"
                  onClick={handleEndConversation}
                  className="w-full"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  End Conversation
                </Button>
              ) : (
                <Button
                  onClick={handleStartConversation}
                  disabled={!hasPermission}
                  className="w-full"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Start Conversation
                </Button>
              )}
            </div>

            <div className="text-center text-sm">
              {status === "connected" && (
                <p className="text-green-600">
                  {isSpeaking ? "Agent is speaking..." : "Listening..."}
                </p>
              )}
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {!hasPermission && (
                <p className="text-yellow-600">
                  Please allow microphone access to use voice chat
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {messages.length > 0 && <ConversationHistory messages={messages} />}
    </>
  );
} 