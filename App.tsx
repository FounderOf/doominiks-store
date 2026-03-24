import { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import LoadingScreen from './components/LoadingScreen';
import ProductCard from './components/ProductCard';
import PaymentModal from './components/PaymentModal';
import ProfilePanel from './components/ProfilePanel';
import ChatPanel from './components/ChatPanel';
import OwnerPanel from './components/OwnerPanel';
import ReviewSection from './components/ReviewSection';
import AuthModal from './components/AuthModal';
import TopUpModal from './components/TopUpModal';
import Badge from './components/Badge';
import { Product } from './types';
import { 
  Store, User, MessageCircle, Settings, Star, 
  ShoppingBag, Wallet, Coins, Search, Menu, X, 
  ChevronDown, ExternalLink, Sparkles
} from 'lucide-react';

function MainApp() {
  const { currentUser, isOwner, products, settings } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showOwner, setShowOwner] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentType, setPaymentType] = useState<'idr' | 'coin'>('idr');
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'products' | 'reviews'>('products');

  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuy = (product: Product, qty: number, method: 'idr' | 'coin') => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    setSelectedProduct(product);
    setQuantity(qty);
    setPaymentType(method);
  };

  const handlePaymentSuccess = () => {
    setSelectedProduct(null);
    setShowProfile(true);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Store className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  DOOMINIKS
                </h1>
                <p className="text-[10px] text-gray-500 tracking-[0.3em] -mt-1">STORE</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveSection('products')}
                className={`text-sm font-medium transition-colors ${activeSection === 'products' ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
              >
                Produk
              </button>
              <button 
                onClick={() => setActiveSection('reviews')}
                className={`text-sm font-medium transition-colors ${activeSection === 'reviews' ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
              >
                Ulasan
              </button>
              <a 
                href={settings.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Discord
                <ExternalLink size={14} />
              </a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {/* Balance Display */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                    <Wallet className="text-green-400" size={16} />
                    <span className="text-white text-sm font-medium">
                      Rp {currentUser.balance.toLocaleString('id-ID')}
                    </span>
                    <span className="text-gray-600">|</span>
                    <Coins className="text-yellow-400" size={16} />
                    <span className="text-white text-sm font-medium">
                      {currentUser.coins}
                    </span>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors relative"
                  >
                    <MessageCircle className="text-gray-400" size={20} />
                  </button>

                  {/* Profile Button */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-white text-sm">{currentUser.username}</span>
                    {currentUser.badges.length > 0 && (
                      <Badge type={currentUser.badges[0].type} size="sm" />
                    )}
                  </button>

                  {/* Owner Panel Button */}
                  {isOwner && (
                    <button
                      onClick={() => setShowOwner(true)}
                      className="p-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 rounded-lg transition-all shadow-lg shadow-red-500/30"
                    >
                      <Settings className="text-white" size={20} />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-500/30"
                >
                  <User size={18} />
                  <span>Masuk</span>
                </button>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={20} className="text-gray-400" /> : <Menu size={20} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setActiveSection('products'); setMobileMenuOpen(false); }}
                  className={`px-4 py-2 text-left rounded-lg ${activeSection === 'products' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'}`}
                >
                  Produk
                </button>
                <button 
                  onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }}
                  className={`px-4 py-2 text-left rounded-lg ${activeSection === 'reviews' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'}`}
                >
                  Ulasan
                </button>
                <a 
                  href={settings.discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-gray-400 flex items-center gap-2"
                >
                  Discord <ExternalLink size={14} />
                </a>
                {currentUser && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                    <Wallet className="text-green-400" size={16} />
                    <span className="text-white text-sm">Rp {currentUser.balance.toLocaleString('id-ID')}</span>
                    <span className="text-gray-600">|</span>
                    <Coins className="text-yellow-400" size={16} />
                    <span className="text-white text-sm">{currentUser.coins}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm mb-6">
              <Sparkles size={16} />
              Toko Game #1 Indonesia
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Top Up Game
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"> Tercepat</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Dapatkan diamond, UC, voucher dan item game favoritmu dengan harga terbaik. Proses instan 24/7!
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-gray-500 text-sm">Transaksi</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">5K+</p>
                <p className="text-gray-500 text-sm">Pelanggan</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">4.9</p>
                <p className="text-gray-500 text-sm flex items-center gap-1 justify-center">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" /> Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        {activeSection === 'products' && (
          <>
            {/* Search & Filter */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none w-full md:w-48 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Semua Kategori' : cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                </div>

                {/* Top Up Button */}
                {currentUser && (
                  <button
                    onClick={() => setShowTopUp(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/20"
                  >
                    <Wallet size={18} />
                    Top Up
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onBuy={handleBuy}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag size={64} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Tidak ada produk ditemukan</p>
                <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            )}
          </>
        )}

        {activeSection === 'reviews' && (
          <div className="max-w-4xl mx-auto">
            <ReviewSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Store className="text-white" size={18} />
              </div>
              <span className="text-gray-400 text-sm">© 2024 DOOMINIKS STORE. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href={settings.discordLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                Discord
              </a>
              <span className="text-gray-700">|</span>
              <span className="text-gray-400 text-sm">Support 24/7</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      {currentUser && !showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-110 transition-transform z-40"
        >
          <MessageCircle className="text-white" size={24} />
        </button>
      )}

      {/* Modals */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <ChatPanel isOpen={showChat} onClose={() => setShowChat(false)} receiverId={settings.ownerUsername} />
      <OwnerPanel isOpen={showOwner} onClose={() => setShowOwner(false)} />
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      
      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          quantity={quantity}
          paymentType={paymentType}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
