import React, { useState } from "react";
import menu from "./menuData"; // Pastikan path file sesuai
import Swal from "sweetalert2";

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);

// Hitung total porsi (sum quantity)
const hitungTotalPorsi = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);

export default function App() {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("makanan");
  const [qtyMap, setQtyMap] = useState(() => Object.fromEntries(menu.map((item) => [item.id, 1])));
  const [showDetails, setShowDetails] = useState(false);

  const addToCart = (item, quantity) => {
    if (quantity < 1) return;
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((i) => i.id !== id));
  const incrementCartItem = (id) => setCart(cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  const decrementCartItem = (id) => setCart(cart.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i)));

  const resetCart = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Keranjang akan direset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, reset!",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        setCart([]);
        setQtyMap(Object.fromEntries(menu.map((item) => [item.id, 1])));
        setShowDetails(false);
        Swal.fire("Direset!", "Keranjang telah direset.", "success");
      }
    });
  };

  const totalHarga = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredMenu = menu.filter((item) => item.category === activeTab);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Keranjang kosong",
        text: "Silakan tambah menu terlebih dahulu.",
      });
      return;
    }

    Swal.fire({
      title: "Konfirmasi Checkout",
      text: `Total belanja: ${formatRupiah(totalHarga)}\nApakah Anda yakin ingin checkout?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, checkout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Berhasil!",
          text: "Terima kasih atas pembelian Anda.",
          icon: "success",
          confirmButtonText: "Tutup",
        }).then(() => {
          setCart([]);
          setQtyMap(Object.fromEntries(menu.map((item) => [item.id, 1])));
          setShowDetails(false);
        });
      }
    });
  };

  return (
    <div className="pb-40 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-50 w-full py-4 shadow text-center">
        <h1 className="text-3xl font-light" style={{ fontFamily: "Pacifico, cursive" }}>
          Waroeng Rasbani
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 mt-6">
        {["makanan", "minuman"].map((cat) => (
          <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-2 rounded ${activeTab === cat ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMenu.map((item) => (
          <MenuItem key={item.id} item={item} onAdd={addToCart} qty={qtyMap[item.id]} setQty={(n) => setQtyMap((prev) => ({ ...prev, [item.id]: n }))} />
        ))}
      </div>

      {/* Cart Fixed Bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t p-4 z-50">
        <div className="flex justify-between items-center">
          <span className="font-bold">Total: {formatRupiah(totalHarga)}</span>
          <div className="flex gap-2">
            {showDetails && (
              <>
                <button onClick={resetCart} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm">
                  Reset
                </button>
                <button onClick={handleCheckout} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 text-sm">
                  Checkout
                </button>
              </>
            )}
            <button onClick={() => setShowDetails((v) => !v)} className="relative bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
              {showDetails ? "Tutup Detail" : "Detail"}
              {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{hitungTotalPorsi(cart)}</span>}
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Tombol Tutup di pojok kanan atas */}
            <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-semibold text-lg" aria-label="Tutup detail keranjang">
              ✕
            </button>

            {/* Header Detail */}
            <div className="p-4 flex justify-center border-b">
              <h2 className="text-lg font-bold">Detail Keranjang</h2>
            </div>

            {/* List Item */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500">Keranjang kosong</p>
              ) : (
                <ul className="space-y-2">
                  {cart.map((item) => (
                    <li key={item.id} className="border p-3 rounded-lg bg-gray-50">
                      {/* Baris 1: Nama + kontrol jumlah (kiri), total harga (kanan) */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.name}</span>
                          <button onClick={() => decrementCartItem(item.id)} className="bg-gray-300 w-6 h-6 rounded hover:bg-gray-400">
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setCart((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i)));
                            }}
                            className="w-10 text-center border rounded"
                          />
                          <button onClick={() => incrementCartItem(item.id)} className="bg-gray-300 w-6 h-6 rounded hover:bg-gray-400">
                            +
                          </button>
                        </div>
                        <div className="font-semibold">{formatRupiah(item.price * item.quantity)}</div>
                      </div>

                      {/* Baris 2: harga per porsi (kiri), tombol hapus (kanan) */}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">{formatRupiah(item.price)} / porsi</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline">
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Footer detail mirip dengan footer utama */}
            <div className="border-t p-4 bg-white shadow-md flex justify-between items-center">
              <span className="font-semibold text-lg">Total: {formatRupiah(totalHarga)}</span>
              <div className="flex gap-2">
                <button onClick={resetCart} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm">
                  Reset
                </button>
                <button onClick={handleCheckout} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 text-sm">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ item, onAdd, qty, setQty }) {
  return (
    <div className="border p-4 rounded-lg flex items-center space-x-4 bg-white shadow">
      <img src={`/images/${item.image}`} alt={item.name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">{formatRupiah(item.price)}</p>
        <div className="flex items-center space-x-2 mt-2">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="bg-gray-300 w-6 h-6 rounded hover:bg-gray-400">
            -
          </button>
          <input type="number" min="1" className="w-12 text-center border px-2 py-1 rounded appearance-none" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          <button onClick={() => setQty(qty + 1)} className="bg-gray-300 w-6 h-6 rounded hover:bg-gray-400">
            +
          </button>
          <button onClick={() => onAdd(item, qty)} className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
