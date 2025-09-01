// Simple in-memory mocks for features without backend integration
export type Role = 'USUARIO' | 'ADVOGADO'

// Payments
let paidProposals = new Set<number>()
export async function payProposal(proposalId: number) {
  await delay(600)
  paidProposals.add(proposalId)
  return { status: 'paid', transactionId: `TX-${proposalId}-${Date.now()}` }
}
export function isProposalPaid(id: number) {
  return paidProposals.has(id)
}

// Finance
export async function getFinancialStats(role: Role) {
  await delay(250)
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const seed = role === 'ADVOGADO' ? 1.3 : 0.7
  const values = months.map((_, i) => Math.round((Math.sin(i/2)+1.2)*1000*seed))
  return { months, values }
}

// Payments: checkout processing (mock)
export type PaymentMethod = 'cartao' | 'boleto'
export async function processPayment(input: { method: PaymentMethod; amount: number; card?: { number:string; name:string; exp:string; cvc:string } }) {
  await delay(800)
  if (input.method === 'cartao') {
    // very naive validations (mock)
    if (!input.card || input.card.number.replace(/\s+/g,'').length < 12) {
      throw new Error('Cartão inválido (mock)')
    }
    return {
      status: 'paid' as const,
      method: 'cartao' as const,
      transactionId: `TX-${Date.now()}`,
      authorized: true,
    }
  } else {
    const code = Array.from({length:48},()=>Math.floor(Math.random()*10)).join('')
    const due = new Date(Date.now()+5*24*3600*1000).toISOString()
    return {
      status: 'pending' as const,
      method: 'boleto' as const,
      transactionId: `BL-${Date.now()}`,
      boleto: { code, dueDate: due },
    }
  }
}

// Profiles + Reviews
type Review = { id: number; author: string; rating: number; comment: string; createdAt: string }
type Profile = { id: string; name: string; oab?: string; rating: number; reviews: Review[] }
const profiles = new Map<string, Profile>([
  ['1', { id: '1', name: 'Dra. Ana Silva', oab: 'OAB-SP 123456', rating: 4.6, reviews: [] }],
  ['2', { id: '2', name: 'Dr. João Souza', oab: 'OAB-RJ 654321', rating: 4.3, reviews: [] }],
])
let reviewId = 1
export async function getLawyerProfile(id: string) {
  await delay(150)
  const p = profiles.get(id) || { id, name: `Profissional ${id}`, rating: 0, reviews: [] }
  profiles.set(id, p)
  return p
}
export async function addReview(profileId: string, author: string, rating: number, comment: string) {
  await delay(200)
  const p = await getLawyerProfile(profileId)
  const r: Review = { id: reviewId++, author, rating, comment, createdAt: new Date().toISOString() }
  p.reviews.unshift(r)
  // Recompute simple average
  const avg = p.reviews.reduce((a,b)=>a+b.rating,0)/p.reviews.length
  p.rating = Math.round(avg*10)/10
  return r
}

// Chat
type ChatMessage = { id: string; author: string; text: string; at: number }
type Subscriber = (msg: ChatMessage) => void
class ChatRoom {
  messages: ChatMessage[] = []
  subs = new Set<Subscriber>()
  send(author: string, text: string) {
    const msg: ChatMessage = { id: `${Date.now()}-${Math.random()}`, author, text, at: Date.now() }
    this.messages.push(msg)
    this.subs.forEach(fn => fn(msg))
    return msg
  }
  subscribe(fn: Subscriber) {
    this.subs.add(fn)
    return () => this.subs.delete(fn)
  }
}
const rooms = new Map<string, ChatRoom>()
function getRoom(id: string) {
  let r = rooms.get(id)
  if (!r) { r = new ChatRoom(); rooms.set(id, r) }
  return r
}
export function useMockChat(roomId: string) {
  const room = getRoom(roomId)
  return {
    history: room.messages,
    send: (author: string, text: string) => room.send(author, text),
    subscribe: (fn: Subscriber) => room.subscribe(fn),
  }
}

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)) }
