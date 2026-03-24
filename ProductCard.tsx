import { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Coins, Star, Package, Minus, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product, quantity: number, method: 'idr' | 'coin') => void;
}

export default function ProductCard({ product, onBuy }: ProductCardProps) {
  const { settings, reviews } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [showOptions, setShowOptions] = useState(false);

  const productReviews = reviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length > 0 
    ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length 
    : 0;

  const totalDiscount = product.discount + settings.globalDiscount;
  const discountedPrice = product.price * (1 - totalDiscount / 100);
  const discountedCoinPrice = product.coinPrice * (1 - totalDiscount / 100);

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-red-900/30 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      {/* Discount badge */}
      {totalDiscount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-red-500/30">
          -{totalDiscount}%
        </div>
      )}

      {/* Stock indicator */}
      {product.stock <= 10 && product.stock > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded-full">
          Stok: {product.stock}
        </div>
      )}
      {product.stock === 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          Habis
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <span className="text-red-400 text-xs font-semibold tracking-wider uppercase">{product.category}</span>
        
        {/* Title */}
        <h3 className="text-white font-bold text-lg mt-1 mb-2 line-clamp-1">{product.name}</h3>
        
        {/* Description */}
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
              />
            ))}
          </div>
          <span className="text-gray-400 text-xs">({productReviews.length} ulasan)</span>
        </div>

        {/* Price */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl">
              Rp {discountedPrice.toLocaleString('id-ID')}
            </span>
            {totalDiscount > 0 && (
              <span className="text-gray-500 text-sm line-through">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <Coins size={14} />
            <span>{Math.floor(discountedCoinPrice)} Coins</span>
          </div>
        </div>

        {/* Quantity selector */}
        {showOptions && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Jumlah:</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-white font-bold w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { onBuy(product, quantity, 'idr'); setShowOptions(false); setQuantity(1); }}
                disabled={product.stock < quantity}
                className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <ShoppingCart size={14} />
                IDR
              </button>
              <button
                onClick={() => { onBuy(product, quantity, 'coin'); setShowOptions(false); setQuantity(1); }}
                disabled={product.stock < quantity}
                className="flex-1 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Coins size={14} />
                Coins
              </button>
            </div>
          </div>
        )}

        {/* Buy button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={product.stock === 0}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
        >
          {product.stock === 0 ? (
            <>
              <Package size={18} />
              Stok Habis
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              {showOptions ? 'Tutup' : 'Beli Sekarang'}
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
