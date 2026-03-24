import { useState, useRef } from 'react';
import { 
  X, Settings, Package, Users, ShoppingCart, 
  CreditCard, Percent, Link, Key, Plus, Trash2, Edit, 
  CheckCircle, XCircle, Clock, Award, Wallet,
  Image, Save, TrendingUp, BarChart3
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BadgeType, Product } from '../types';
import Badge from './Badge';

interface OwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'topup' | 'users' | 'settings';

export default function OwnerPanel({ isOpen, onClose }: OwnerPanelProps) {
  const { 
    products, addProduct, updateProduct, deleteProduct,
    orders, updateOrderStatus,
    users, giftBadge, removeBadge, updateUserBalance, updateUserCoins,
    topUpRequests, updateTopUpStatus,
    settings, updateSettings
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: 0, coinPrice: 0, stock: 0, image: '', category: '', discount: 0
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [badgeToGift, setBadgeToGift] = useState<BadgeType>('warrior');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setTempImage(imageData);
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, image: imageData });
        } else {
          setNewProduct({ ...newProduct, image: imageData });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    addProduct(newProduct);
    setNewProduct({ name: '', description: '', price: 0, coinPrice: 0, stock: 0, image: '', category: '', discount: 0 });
    setTempImage('');
    setShowProductForm(false);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
    setTempImage('');
  };

  // Statistics
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
  const totalUsers = users.filter(u => !u.isOwner).length;

  const tabs: { id: TabType; label: string; icon: typeof Settings }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'topup', label: 'Top Up', icon: Wallet },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  const badgeTypes: BadgeType[] = ['warrior', 'elite', 'master', 'grandmaster', 'mythical'];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl shadow-red-500/10 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/50 border-r border-gray-700/50 p-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="text-red-400" size={24} />
              Owner Panel
            </h2>
          </div>
          
          <nav className="flex-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600/30 to-orange-600/30 text-white border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
                {tab.id === 'orders' && pendingOrders > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          <button
            onClick={onClose}
            className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium rounded-xl transition-colors border border-gray-700 flex items-center justify-center gap-2"
          >
            <X size={18} />
            Tutup Panel
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Dashboard</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/20">
                  <TrendingUp className="text-green-400 mb-2" size={24} />
                  <p className="text-gray-400 text-sm">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-white">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/20">
                  <ShoppingCart className="text-blue-400 mb-2" size={24} />
                  <p className="text-gray-400 text-sm">Total Pesanan</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-4 border border-yellow-500/20">
                  <Clock className="text-yellow-400 mb-2" size={24} />
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white">{pendingOrders}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/20">
                  <Users className="text-purple-400 mb-2" size={24} />
                  <p className="text-gray-400 text-sm">Total Pengguna</p>
                  <p className="text-2xl font-bold text-white">{totalUsers}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4">Pesanan Terbaru</h4>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{order.productName}</p>
                        <p className="text-gray-400 text-sm">{order.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold">Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Kelola Produk</h3>
                <button
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium rounded-xl transition-all duration-300"
                >
                  <Plus size={18} />
                  Tambah Produk
                </button>
              </div>

              {/* Product Form */}
              {(showProductForm || editingProduct) && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-4">
                    {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nama Produk"
                      value={editingProduct?.name || newProduct.name}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, name: e.target.value })
                        : setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      placeholder="Kategori"
                      value={editingProduct?.category || newProduct.category}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, category: e.target.value })
                        : setNewProduct({ ...newProduct, category: e.target.value })
                      }
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Harga (IDR)"
                      value={editingProduct?.price || newProduct.price || ''}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                        : setNewProduct({ ...newProduct, price: Number(e.target.value) })
                      }
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Harga (Coins)"
                      value={editingProduct?.coinPrice || newProduct.coinPrice || ''}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, coinPrice: Number(e.target.value) })
                        : setNewProduct({ ...newProduct, coinPrice: Number(e.target.value) })
                      }
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Stok"
                      value={editingProduct?.stock || newProduct.stock || ''}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                        : setNewProduct({ ...newProduct, stock: Number(e.target.value) })
                      }
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Diskon (%)"
                      value={editingProduct?.discount || newProduct.discount || ''}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, discount: Number(e.target.value) })
                        : setNewProduct({ ...newProduct, discount: Number(e.target.value) })
                      }
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <textarea
                      placeholder="Deskripsi"
                      value={editingProduct?.description || newProduct.description}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({ ...editingProduct, description: e.target.value })
                        : setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      className="col-span-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                      rows={3}
                    />
                    
                    {/* Image Upload */}
                    <div className="col-span-2">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      <div className="flex gap-4 items-start">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                        >
                          <Image size={18} />
                          Upload Gambar
                        </button>
                        {(tempImage || editingProduct?.image || newProduct.image) && (
                          <img 
                            src={tempImage || editingProduct?.image || newProduct.image} 
                            alt="Preview" 
                            className="w-20 h-20 object-cover rounded-xl border border-gray-700"
                          />
                        )}
                        <input
                          type="text"
                          placeholder="Atau masukkan URL gambar"
                          value={editingProduct?.image || newProduct.image}
                          onChange={(e) => editingProduct 
                            ? setEditingProduct({ ...editingProduct, image: e.target.value })
                            : setNewProduct({ ...newProduct, image: e.target.value })
                          }
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium rounded-xl transition-all duration-300"
                    >
                      <Save size={18} />
                      {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                    </button>
                    <button
                      onClick={() => { setEditingProduct(null); setShowProductForm(false); setTempImage(''); }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Product List */}
              <div className="grid grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex gap-4">
                    <img 
                      src={product.image || 'https://via.placeholder.com/100'} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{product.name}</h4>
                      <p className="text-gray-400 text-sm">{product.category}</p>
                      <p className="text-red-400 font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
                      <p className="text-gray-500 text-sm">Stok: {product.stock}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setShowProductForm(false); }}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Log Pesanan</h3>
              
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">Belum ada pesanan</div>
                ) : (
                  orders
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(order => (
                      <div key={order.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-white font-semibold">{order.productName}</p>
                            <p className="text-gray-400 text-sm">Pembeli: {order.username}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(order.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-400 font-bold">
                              {order.paymentMethod === 'coin' 
                                ? `${order.totalPrice} Coins`
                                : `Rp ${order.totalPrice.toLocaleString('id-ID')}`
                              }
                            </p>
                            <p className="text-gray-400 text-sm">Qty: {order.quantity}</p>
                          </div>
                        </div>
                        
                        {order.paymentProof && (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm mb-2">Bukti Transfer:</p>
                            <img 
                              src={order.paymentProof} 
                              alt="Bukti" 
                              className="max-w-xs rounded-lg border border-gray-700"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Dibayar</option>
                            <option value="processing">Diproses</option>
                            <option value="shipped">Dikirim</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Top Up Requests */}
          {activeTab === 'topup' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Permintaan Top Up</h3>
              
              <div className="space-y-4">
                {topUpRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">Belum ada permintaan top up</div>
                ) : (
                  topUpRequests
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(request => (
                      <div key={request.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-white font-semibold">{request.username}</p>
                            <p className="text-gray-400 text-sm">
                              Top Up {request.type === 'balance' ? 'Saldo' : 'Coins'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(request.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${request.type === 'balance' ? 'text-green-400' : 'text-yellow-400'}`}>
                              {request.type === 'balance' 
                                ? `Rp ${request.amount.toLocaleString('id-ID')}`
                                : `${request.amount} Coins`
                              }
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                        
                        {request.paymentProof && (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm mb-2">Bukti Transfer:</p>
                            <img 
                              src={request.paymentProof} 
                              alt="Bukti" 
                              className="max-w-xs rounded-lg border border-gray-700"
                            />
                          </div>
                        )}
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateTopUpStatus(request.id, 'approved')}
                              className="flex items-center gap-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => updateTopUpStatus(request.id, 'rejected')}
                              className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Kelola Pengguna</h3>
              
              <div className="space-y-4">
                {users.filter(u => !u.isOwner).map(user => (
                  <div key={user.username} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">{user.username}</span>
                            {user.badges.map((badge, i) => (
                              <Badge key={i} type={badge.type} size="sm" />
                            ))}
                          </div>
                          <p className="text-gray-400 text-sm">
                            Saldo: Rp {user.balance.toLocaleString('id-ID')} • Coins: {user.coins}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(selectedUser === user.username ? null : user.username)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Settings size={16} className="text-gray-400" />
                      </button>
                    </div>
                    
                    {selectedUser === user.username && (
                      <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                        {/* Badge Management */}
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Gift Badge:</p>
                          <div className="flex gap-2 flex-wrap">
                            <select
                              value={badgeToGift}
                              onChange={(e) => setBadgeToGift(e.target.value as BadgeType)}
                              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                            >
                              {badgeTypes.map(b => (
                                <option key={b} value={b}>{b.toUpperCase()}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => giftBadge(user.username, badgeToGift)}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm rounded-lg"
                            >
                              <Award size={16} />
                              Gift
                            </button>
                          </div>
                          {user.badges.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {user.badges.map((badge, i) => (
                                <button
                                  key={i}
                                  onClick={() => removeBadge(user.username, badge.type)}
                                  className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30"
                                >
                                  <XCircle size={12} />
                                  Remove {badge.type}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Balance/Coins Adjustment */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm mb-2">Tambah Saldo:</p>
                            <div className="flex gap-2">
                              {[10000, 50000, 100000].map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => updateUserBalance(user.username, amt)}
                                  className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30"
                                >
                                  +{(amt/1000)}k
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm mb-2">Tambah Coins:</p>
                            <div className="flex gap-2">
                              {[100, 500, 1000].map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => updateUserCoins(user.username, amt)}
                                  className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30"
                                >
                                  +{amt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Pengaturan</h3>
              
              {/* Owner Account */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="text-red-400" size={20} />
                  Akun Owner
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Username</label>
                    <input
                      type="text"
                      value={settings.ownerUsername}
                      onChange={(e) => updateSettings({ ownerUsername: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Password</label>
                    <input
                      type="password"
                      value={settings.ownerPassword}
                      onChange={(e) => updateSettings({ ownerPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Discord Link */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Link className="text-blue-400" size={20} />
                  Link Discord
                </h4>
                <input
                  type="text"
                  value={settings.discordLink}
                  onChange={(e) => updateSettings({ discordLink: e.target.value })}
                  placeholder="https://discord.gg/..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Global Discount */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Percent className="text-green-400" size={20} />
                  Diskon Global
                </h4>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={settings.globalDiscount}
                    onChange={(e) => updateSettings({ globalDiscount: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                  <span className="text-gray-400">%</span>
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="text-blue-400" size={20} />
                  Rekening Bank
                </h4>
                <div className="space-y-3">
                  {settings.bankAccounts.map((account, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={account.bankName}
                        onChange={(e) => {
                          const newAccounts = [...settings.bankAccounts];
                          newAccounts[index] = { ...account, bankName: e.target.value };
                          updateSettings({ bankAccounts: newAccounts });
                        }}
                        placeholder="Nama Bank"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={account.accountNumber}
                        onChange={(e) => {
                          const newAccounts = [...settings.bankAccounts];
                          newAccounts[index] = { ...account, accountNumber: e.target.value };
                          updateSettings({ bankAccounts: newAccounts });
                        }}
                        placeholder="No. Rekening"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={account.accountName}
                        onChange={(e) => {
                          const newAccounts = [...settings.bankAccounts];
                          newAccounts[index] = { ...account, accountName: e.target.value };
                          updateSettings({ bankAccounts: newAccounts });
                        }}
                        placeholder="Nama Pemilik"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => {
                          const newAccounts = settings.bankAccounts.filter((_, i) => i !== index);
                          updateSettings({ bankAccounts: newAccounts });
                        }}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      updateSettings({ 
                        bankAccounts: [...settings.bankAccounts, { bankName: '', accountNumber: '', accountName: '' }]
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Tambah Rekening
                  </button>
                </div>
              </div>

              {/* E-Wallets */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="text-green-400" size={20} />
                  E-Wallet
                </h4>
                <div className="space-y-3">
                  {settings.ewallets.map((ewallet, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={ewallet.name}
                        onChange={(e) => {
                          const newEwallets = [...settings.ewallets];
                          newEwallets[index] = { ...ewallet, name: e.target.value };
                          updateSettings({ ewallets: newEwallets });
                        }}
                        placeholder="Nama E-Wallet"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={ewallet.number}
                        onChange={(e) => {
                          const newEwallets = [...settings.ewallets];
                          newEwallets[index] = { ...ewallet, number: e.target.value };
                          updateSettings({ ewallets: newEwallets });
                        }}
                        placeholder="Nomor"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={ewallet.accountName}
                        onChange={(e) => {
                          const newEwallets = [...settings.ewallets];
                          newEwallets[index] = { ...ewallet, accountName: e.target.value };
                          updateSettings({ ewallets: newEwallets });
                        }}
                        placeholder="Nama Pemilik"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => {
                          const newEwallets = settings.ewallets.filter((_, i) => i !== index);
                          updateSettings({ ewallets: newEwallets });
                        }}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      updateSettings({ 
                        ewallets: [...settings.ewallets, { name: '', number: '', accountName: '' }]
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Tambah E-Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
