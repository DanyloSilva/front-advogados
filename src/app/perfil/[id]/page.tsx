"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { addReview, getLawyerProfile } from "@/lib/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicProfilePage() {
  const params = useParams();
  const id = String(params?.id || '1')
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => { getLawyerProfile(id).then(setProfile) }, [id])

  const submit = async () => {
    if (!comment.trim()) return;
    await addReview(id, user?.name || 'Anônimo', rating, comment.trim())
    const updated = await getLawyerProfile(id)
    setProfile({ ...updated })
    setComment("")
    setRating(5)
  }

  if (!profile) return <div className="p-4">Carregando...</div>

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{profile.name} {profile.oab && <span className="text-sm text-muted-foreground">({profile.oab})</span>}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">Média: {profile.rating} / 5</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-center">
            <Input type="number" min={1} max={5} value={rating} onChange={(e)=>setRating(Number(e.target.value))} className="w-24" />
            <Textarea placeholder="Escreva um comentário" value={comment} onChange={(e)=>setComment(e.target.value)} />
            <Button onClick={submit}>Enviar</Button>
          </div>
          <div className="space-y-3">
            {profile.reviews?.length ? profile.reviews.map((r:any) => (
              <div key={r.id} className="border rounded p-2">
                <div className="text-sm font-medium">{r.author} • {r.rating}/5</div>
                <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="text-sm">{r.comment}</div>
              </div>
            )) : <div className="text-sm text-muted-foreground">Sem avaliações ainda.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

