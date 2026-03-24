import { useState, useRef } from 'react';
import { X, CreditCard, Smartphone, Upload, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface PaymentModalProps {
  product: Product;
  quantity: number;
  paymentType: 'idr' | 'coin';
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ product, quantity, paymentType, onClose, onSuccess }: PaymentModalProps) {
  const { settings, currentUser, createOrder, uploadPaymentProof, purchaseWithCoins } = useStore();
  const [step, setStep] = useState<'method' | 'payment' | 'proof' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet'>('bank');
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDiscount = product.discount + settings.globalDiscount;
  const discountedPrice = product.price * (1 - totalDiscount / 100);
  const totalPrice = discountedPrice * quantity;
  const discountedCoinPrice = product.coinPrice * (1 - totalDiscount / 100);
  const totalCoins = Math.floor(discountedCoinPrice * quantity);

  const handleCoinPurchase = () => {
    if (purchaseWithCoins(product.id, quantity)) {
      setStep('success');
    }
  };

  const handleSelectMethod = (method: 'bank' | 'ewallet') => {
    setPaymentMethod(method);
    setSelectedAccount(0);
    setStep('payment');
  };

  const handleProceedToProof = () => {
    if (!currentUser) return;
    const id = createOrder({
      username: currentUser.username,
      productId: product.id,
      productName: product.name,
      quantity,
      totalPrice,
      paymentMethod
    });
    setOrderId(id);
    setStep('proof');
  };

  const handleUploadProof = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = () => {
    if (orderId && proofImage) {
      uploadPaymentProof(orderId, proofImage);
      setStep('success');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accounts = paymentMethod === 'bank' ? settings.bankAccounts : settings.ewallets;
  const selectedAccountData = accounts[selectedAccount];

  // For coin payment
  if (paymentType === 'coin') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Pembayaran dengan Coins</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step !== 'success' ? (
              <>
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Produk</span>
                    <span className="text-white font-medium">{product.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Jumlah</span>
                    <span className="text-white font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Total</span>
                    <span className="text-yellow-400 font-bold text-lg">{totalCoins} Coins</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-semibold">Saldo Coins Anda</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{currentUser?.coins || 0} Coins</p>
                </div>

                {(currentUser?.coins || 0) >= totalCoins ? (
                  <button
                    onClick={handleCoinPurchase}
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20"
                  >
                    Bayar Sekarang
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-red-400 mb-4">Coins tidak mencukupi!</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Top Up Coins
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-500" size={48} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pembayaran Berhasil!</h3>
                <p className="text-gray-400 mb-6">Pesanan Anda sedang diproses</p>
                <button
                  onClick={() => { onSuccess(); onClose(); }}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl transition-all duration-300"
                >
                  Lihat Pesanan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For IDR payment
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-700/50 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {step === 'method' && 'Pilih Metode Pembayaran'}
              {step === 'payment' && 'Detail Pembayaran'}
              {step === 'proof' && 'Upload Bukti Transfer'}
              {step === 'success' && 'Pembayaran Berhasil'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Order summary */}
        {step !== 'success' && (
          <div className="px-6 pt-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Produk</span>
                <span className="text-white font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Jumlah</span>
                <span className="text-white font-medium">{quantity}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Diskon</span>
                  <span className="text-green-400 font-medium">-{totalDiscount}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total</span>
                <span className="text-red-400 font-bold text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <div className="space-y-4">
              <button
                onClick={() => handleSelectMethod('bank')}
                className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-blue-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Transfer Bank</p>
                  <p className="text-gray-400 text-sm">BCA, BRI, BNI, Mandiri</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectMethod('ewallet')}
                className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="text-green-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">E-Wallet</p>
                  <p className="text-gray-400 text-sm">DANA, OVO, GoPay, ShopeePay</p>
                </div>
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              {/* Account selection */}
              <div className="space-y-2">
                {accounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAccount(index)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                      selectedAccount === index 
                        ? 'bg-red-500/20 border-red-500/50' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-white font-semibold text-left">
                      {paymentMethod === 'bank' ? (account as any).bankName : (account as any).name}
                    </p>
                    <p className="text-gray-400 text-sm text-left">
                      {paymentMethod === 'bank' ? (account as any).accountNumber : (account as any).number}
                    </p>
                  </button>
                ))}
              </div>

              {/* Selected account details */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Transfer ke:</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-lg">
                    {paymentMethod === 'bank' ? (selectedAccountData as any)?.accountNumber : (selectedAccountData as any)?.number}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentMethod === 'bank' ? (selectedAccountData as any)?.accountNumber : (selectedAccountData as any)?.number)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Copy size={16} className={copied ? 'text-green-400' : 'text-gray-400'} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  a.n. {paymentMethod === 'bank' ? (selectedAccountData as any)?.accountName : (selectedAccountData as any)?.accountName}
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Pastikan transfer sesuai nominal: <strong>Rp {totalPrice.toLocaleString('id-ID')}</strong>
                </p>
              </div>

              <button
                onClick={handleProceedToProof}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20"
              >
                Sudah Transfer
              </button>
            </div>
          )}

          {step === 'proof' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {proofImage ? (
                <div className="relative">
                  <img src={proofImage} alt="Bukti Transfer" className="w-full rounded-xl" />
                  <button
                    onClick={() => setProofImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleUploadProof}
                  className="w-full py-12 border-2 border-dashed border-gray-700 hover:border-red-500/50 rounded-xl transition-colors flex flex-col items-center justify-center gap-3"
                >
                  <Upload className="text-gray-400" size={48} />
                  <span className="text-gray-400">Klik untuk upload bukti transfer</span>
                </button>
              )}

              <button
                onClick={handleSubmitProof}
                disabled={!proofImage}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim Bukti Transfer
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bukti Terkirim!</h3>
              <p className="text-gray-400 mb-6">Pesanan Anda sedang diverifikasi. Kami akan segera memproses pesanan Anda.</p>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl transition-all duration-300"
              >
                Lihat Pesanan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
