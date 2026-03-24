import { useState } from 'react';
import { X, User, Wallet, Coins, Award, Package, Clock, CheckCircle, XCircle, Truck, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Badge from './Badge';
import TopUpModal from './TopUpModal';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { currentUser, orders, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [showTopUp, setShowTopUp] = useState(false);

  if (!isOpen || !currentUser) return null;

  const userOrders = orders.filter(o => o.username === currentUser.username);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Menunggu Pembayaran' },
      paid: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle, label: 'Dibayar' },
      processing: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Settings, label: 'Diproses' },
      shipped: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Truck, label: 'Dikirim' },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Selesai' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Dibatalkan' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 w-full max-w-2xl overflow-hidden shadow-2xl shadow-red-500/10 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-900/30 to-orange-900/30 p-6 border-b border-gray-700/50 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {currentUser.username}
                    {currentUser.badges.map((badge, i) => (
                      <Badge key={i} type={badge.type} size="sm" />
                    ))}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Member sejak {new Date(currentUser.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'text-red-400 border-b-2 border-red-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User size={16} className="inline mr-2" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'orders' 
                  ? 'text-red-400 border-b-2 border-red-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package size={16} className="inline mr-2" />
              Pesanan ({userOrders.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Wallet className="text-green-400" size={20} />
                      </div>
                      <span className="text-gray-400 text-sm">Saldo</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      Rp {currentUser.balance.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-4 border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Coins className="text-yellow-400" size={20} />
                      </div>
                      <span className="text-gray-400 text-sm">Coins</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {currentUser.coins.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Top Up Button */}
                <button
                  onClick={() => setShowTopUp(true)}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20"
                >
                  Top Up Saldo / Coins
                </button>

                {/* Badges */}
                {currentUser.badges.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Award className="text-yellow-400" size={18} />
                      Badge Koleksi
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.badges.map((badge, i) => (
                        <Badge key={i} type={badge.type} size="md" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Logout */}
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-red-400 font-medium rounded-xl transition-colors border border-gray-700"
                >
                  Keluar
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Belum ada pesanan</p>
                  </div>
                ) : (
                  userOrders
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(order => (
                      <div key={order.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{order.productName}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">
                            {order.quantity}x • {order.paymentMethod === 'coin' ? 'Coins' : order.paymentMethod.toUpperCase()}
                          </span>
                          <span className="text-red-400 font-bold">
                            {order.paymentMethod === 'coin' 
                              ? `${order.totalPrice} Coins`
                              : `Rp ${order.totalPrice.toLocaleString('id-ID')}`
                            }
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </>
  );
}
