import { useState } from 'react';
import { Star, Send, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Badge from './Badge';

interface ReviewSectionProps {
  productId?: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { reviews, addReview, deleteReview, currentUser, isOwner, users, products } = useStore();
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', productId: productId || '' });
  const [showForm, setShowForm] = useState(false);

  const displayedReviews = productId 
    ? reviews.filter(r => r.productId === productId)
    : reviews;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newReview.comment.trim() || !newReview.productId) return;
    
    addReview({
      username: currentUser.username,
      productId: newReview.productId,
      rating: newReview.rating,
      comment: newReview.comment.trim()
    });
    
    setNewReview({ rating: 5, comment: '', productId: productId || '' });
    setShowForm(false);
  };

  const getUserBadges = (username: string) => {
    const user = users.find(u => u.username === username);
    return user?.badges || [];
  };

  const getProductName = (prodId: string) => {
    const product = products.find(p => p.id === prodId);
    return product?.name || 'Produk tidak ditemukan';
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/30 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-2xl blur -z-10" />
      
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Ulasan Pelanggan ({displayedReviews.length})
          </h3>
          {currentUser && !currentUser.isOwner && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-medium rounded-lg transition-all duration-300"
            >
              {showForm ? 'Batal' : 'Tulis Ulasan'}
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && currentUser && (
        <form onSubmit={handleSubmit} className="p-6 border-b border-gray-700/50 bg-gray-800/30">
          {!productId && (
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Pilih Produk</label>
              <select
                value={newReview.productId}
                onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">-- Pilih Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="p-1"
                >
                  <Star 
                    size={28} 
                    className={star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} 
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Komentar</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Bagikan pengalaman Anda..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              required
            />
          </div>
          
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-medium rounded-xl transition-all duration-300"
          >
            <Send size={18} />
            Kirim Ulasan
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="p-6">
        {displayedReviews.length === 0 ? (
          <div className="text-center py-8">
            <Star size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada ulasan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedReviews
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(review => (
                <div key={review.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{review.username}</span>
                          {getUserBadges(review.username).slice(0, 2).map((badge, i) => (
                            <Badge key={i} type={badge.type} size="sm" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} 
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 text-xs">
                            {new Date(review.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  {!productId && (
                    <p className="text-red-400 text-sm mb-2">
                      Produk: {getProductName(review.productId)}
                    </p>
                  )}
                  
                  <p className="text-gray-300">{review.comment}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
