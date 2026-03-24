export interface User {
  username: string;
  password: string;
  balance: number;
  coins: number;
  badges: Badge[];
  isOwner: boolean;
  createdAt: string;
  profilePic?: string;
}

export type BadgeType = 'warrior' | 'elite' | 'master' | 'grandmaster' | 'mythical' | 'owner';

export interface Badge {
  type: BadgeType;
  giftedAt: string;
  giftedBy: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  coinPrice: number;
  stock: number;
  image: string;
  category: string;
  discount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  username: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  username: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  paymentMethod: 'bank' | 'ewallet' | 'coin';
  paymentProof?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface Settings {
  ownerUsername: string;
  ownerPassword: string;
  discordLink: string;
  bankAccounts: BankAccount[];
  ewallets: EWallet[];
  globalDiscount: number;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface EWallet {
  name: string;
  number: string;
  accountName: string;
}

export interface TopUpRequest {
  id: string;
  username: string;
  amount: number;
  type: 'balance' | 'coin';
  paymentMethod: 'bank' | 'ewallet';
  paymentProof?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
