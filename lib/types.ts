export type CategoryId = 'tout' | 'concert' | 'anniversaire' | 'piquenique' | 'gala' | 'miss' | 'shield' | 'sortie';
export interface VEvent {
  id: string; title: string; category: Exclude<CategoryId, 'tout'>; image: string;
  dateLabel: string; day: string; time: string; lieu: string; ville: string;
  price: number; priceLabel: string; participants: number; capacity: number;
  organizer: string; organizerAvatar: string; description: string; tags: string[];
  rating: number; featured?: boolean; isMine?: boolean; visibility: 'public' | 'prive'; ambiance: string[];
}
export interface Category { id: CategoryId; label: string; icon: string; color: string; grad: [string, string]; }