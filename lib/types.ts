export type CategoryId = 'tout' | 'concert' | 'anniversaire' | 'piquenique' | 'gala' | 'miss' | 'chill' | 'sortie' | 'festival' | 'soiree' | 'conference' | 'formation' | 'atelier' | 'foire' | 'ceremonie' | 'sport' | 'cinema' | 'humour' | 'networking' | 'solidarite' | 'religieux' | 'campus' | 'gastronomie' | 'mode' | 'excursion' | 'lancement' | 'traditionnel' | 'vodun' | 'bapteme' | 'dot' | 'funerailles' | 'reveillon' | 'marche' | 'caravane' | 'autres';
export interface VEvent {
  id: string; title: string; category: Exclude<CategoryId, 'tout'>; image: string; inviteToken?: string;
  dateLabel: string; day: string; time: string; lieu: string; ville: string;
  price: number; priceLabel: string; participants: number; capacity: number;
  commissionPerTicket?: number; whatsappPhone?: string; facebookUrl?: string;
  organizer: string; organizerAvatar: string; description: string; tags: string[];
  rating: number; featured?: boolean; isMine?: boolean; visibility: 'public' | 'prive'; ambiance: string[];
}
export interface Category { id: CategoryId; label: string; icon: string; color: string; grad: [string, string]; }
