"use client";

import { useEffect, useRef, useState } from "react";
import { useMockChat } from "@/lib/mockApi";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  roomId: string;
  title?: string;
  buttonText?: string;
  size?: "sm" | "default";
}

export default function ChatButtonDialog({ roomId, title = "Chat", buttonText = "Chat", size = "default" }: Props) {
  const { user } = useAuth();
  const chat = useMockChat(roomId);
  const [messages, setMessages] = useState(() => [...chat.history]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = chat.subscribe((m) => setMessages((prev) => [...prev, m]));
    return unsub;
  }, [roomId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const onSend = () => {
    const author = user?.name || "Convidado";
    const content = text.trim();
    if (!content) return;
    chat.send(author, content);
    setText("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size}>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="h-72 overflow-y-auto border rounded p-3 space-y-2 bg-background">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium">{m.author}</span>
              <span className="text-muted-foreground"> • {new Date(m.at).toLocaleTimeString()}</span>
              <div>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite sua mensagem" onKeyDown={(e)=>{ if(e.key==='Enter') onSend(); }} />
          <Button onClick={onSend}>Enviar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

