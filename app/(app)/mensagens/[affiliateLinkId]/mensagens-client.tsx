"use client";

import { useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MessageItem {
  id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
}

export function MensagensClient({
  affiliateLinkId,
  hasAffiliateUrl,
  initialMessages,
}: {
  affiliateLinkId: string;
  hasAffiliateUrl: boolean;
  initialMessages: MessageItem[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const res = await fetch("/api/messages/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliateLinkId }),
    });
    const body = await res.json();

    setGenerating(false);
    if (!res.ok) {
      setError(body.error ?? "Não foi possível gerar mensagens agora.");
      return;
    }

    setMessages((prev) => [...body.messages, ...prev]);
  }

  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleEdit(id: string, content: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
  }

  async function handleSave(id: string, content: string) {
    setSavingId(id);
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_edited: true } : m)));
    setSavingId(null);
  }

  if (!hasAffiliateUrl) {
    return (
      <Card>
        <CardContent className="text-sm text-muted">
          Esse produto ainda não tem um link de afiliado salvo. Volte em Produtos e complete o
          fluxo de &ldquo;Me afiliar&rdquo; primeiro.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Button variant="accent" onClick={handleGenerate} disabled={generating} className="mb-6">
        <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
        {generating
          ? "Gerando..."
          : messages.length === 0
          ? "Gerar mensagens"
          : "Gerar outras mensagens"}
      </Button>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent>
              <Textarea
                value={message.content}
                onChange={(e) => handleEdit(message.id, e.target.value)}
                onBlur={(e) => handleSave(message.id, e.target.value)}
                rows={5}
                className="mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {message.is_edited && <Badge variant="muted">editada</Badge>}
                  {savingId === message.id && <Badge variant="muted">salvando...</Badge>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(message.id, message.content)}
                >
                  {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === message.id ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
