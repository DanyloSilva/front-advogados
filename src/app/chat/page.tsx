"use client";

import { useEffect, useRef, useState } from "react";
import { useMockChat } from "@/lib/mockApi";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { user } = useAuth();
  const chat = useMockChat("global");
  const [messages, setMessages] = useState(() => [...chat.history]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = chat.subscribe((m) => setMessages((prev) => [...prev, m]));
    return unsub;
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const onSend = () => {
    const author = user?.name || "Convidado";
    const content = text.trim();
    if (!content) return;
    chat.send(author, content);
    setText("");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Chat Direto (mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 overflow-y-auto border rounded p-3 space-y-2 bg-background">
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
        </CardContent>
      </Card>
    </div>
  );
}

