import { useState, useRef } from 'react';
import { X, CreditCard, Smartphone, Upload, CheckCircle, Copy, Coins, Wallet } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface TopUpModalProps {
  onClose: () => void;
}

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { settings, currentUser, createTopUpRequest, uploadTopUpProof } = useStore();
  const [step, setStep] = useState<'type' | 'amount' | 'method' | 'payment' | 'proof' | 'success'>('type');
  const [topUpType, setTopUpType] = useState<'balance' | 'coin'>('balance');
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet'>('bank');
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const balanceAmounts = [10000, 25000, 50000, 100000, 250000, 500000];
  const coinAmounts = [100, 250, 500, 1000, 2500, 5000];
  const coinPrice = 100; // 1 coin = 100 IDR

  const handleSelectType = (type: 'balance' | 'coin') => {
    setTopUpType(type);
    setStep('amount');
  };

  const handleSelectAmount = (amt: number) => {
    setAmount(amt);
    setStep('method');
  };

  const handleSelectMethod = (method: 'bank' | 'ewallet') => {
    setPaymentMethod(method);
    setSelectedAccount(0);
    setStep('payment');
  };

  const handleProceedToProof = () => {
    if (!currentUser) return;
    const id = createTopUpRequest({
      username: currentUser.username,
      amount,
      type: topUpType,
      paymentMethod
    });
    setRequestId(id);
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
    if (requestId && proofImage) {
      uploadTopUpProof(requestId, proofImage);
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
  const totalPayment = topUpType === 'balance' ? amount : amount * coinPrice;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-900/50 w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-700/50 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {step === 'type' && 'Pilih Jenis Top Up'}
              {step === 'amount' && `Top Up ${topUpType === 'balance' ? 'Saldo' : 'Coins'}`}
              {step === 'method' && 'Metode Pembayaran'}
              {step === 'payment' && 'Detail Pembayaran'}
              {step === 'proof' && 'Upload Bukti Transfer'}
              {step === 'success' && 'Berhasil!'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-4">
              <button
                onClick={() => handleSelectType('balance')}
                className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="text-green-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Top Up Saldo (IDR)</p>
                  <p className="text-gray-400 text-sm">Tambah saldo untuk belanja</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectType('coin')}
                className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-yellow-500/50 rounded-xl transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Coins className="text-yellow-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Top Up Coins</p>
                  <p className="text-gray-400 text-sm">1 Coin = Rp 100</p>
                </div>
              </button>
            </div>
          )}

          {step === 'amount' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(topUpType === 'balance' ? balanceAmounts : coinAmounts).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleSelectAmount(amt)}
                    className="p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all duration-300 text-center"
                  >
                    <p className={`font-bold text-lg ${topUpType === 'balance' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {topUpType === 'balance' ? `Rp ${amt.toLocaleString('id-ID')}` : `${amt} Coins`}
                    </p>
                    {topUpType === 'coin' && (
                      <p className="text-gray-400 text-sm">Rp {(amt * coinPrice).toLocaleString('id-ID')}</p>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Atau masukkan nominal:</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder={topUpType === 'balance' ? 'Nominal IDR' : 'Jumlah Coins'}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => amount > 0 && setStep('method')}
                    disabled={amount <= 0}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {topUpType === 'balance' ? 'Top Up Saldo' : 'Top Up Coins'}
                  </span>
                  <span className={`font-bold ${topUpType === 'balance' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {topUpType === 'balance' ? `Rp ${amount.toLocaleString('id-ID')}` : `${amount} Coins`}
                  </span>
                </div>
                {topUpType === 'coin' && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Total Pembayaran</span>
                    <span className="text-white font-bold">Rp {totalPayment.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

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
                  ⚠️ Transfer sesuai nominal: <strong>Rp {totalPayment.toLocaleString('id-ID')}</strong>
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
              <p className="text-gray-400 mb-6">Top up Anda sedang diverifikasi. Saldo akan ditambahkan setelah admin memverifikasi pembayaran.</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl transition-all duration-300"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
