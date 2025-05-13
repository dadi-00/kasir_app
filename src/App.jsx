import React, { useState } from "react";
import menu from "./menuData"; // Sesuaikan dengan file data menu yang kamu miliki
import Swal from "sweetalert2";

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function App() {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("makanan");
  const [qtyMap, setQtyMap] = useState(() => Object.fromEntries(menu.map((item) => [item.id, 1])));

  // useEffect(() => {
  //   const storedCart = localStorage.getItem("cart");
  //   if (storedCart) setCart(JSON.parse(storedCart));
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("cart", JSON.stringify(cart));
  // }, [cart]);

  const addToCart = (item, quantity) => {
    if (quantity < 1) return;
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const incrementCartItem = (id) => {
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decrementCartItem = (id) => {
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 } : item)));
  };

  const resetCart = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Keranjang akan direset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, reset!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setCart([]);
        setQtyMap(Object.fromEntries(menu.map((item) => [item.id, 1])));
        Swal.fire("Direset!", "Keranjang telah direset.", "success");
      }
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const filteredMenu = menu.filter((item) => item.category === activeTab);

  const handleCheckout = () => {
    Swal.fire({
      title: "Checkout",
      text: `Total belanja: ${formatRupiah(total)}\nTerima kasih!`,
      icon: "success",
      confirmButtonText: "Tutup",
    }).then(() => {
      setCart([]);
      setQtyMap(Object.fromEntries(menu.map((item) => [item.id, 1])));
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="top-0 bg-white z-50 px-4 sm:px-6 py-4 shadow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: "Pacifico, cursive" }}>
            Waroeng Rasbani
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Cart */}
        <div className="md:col-span-1 border p-4 rounded-lg bg-white shadow max-h-[80vh] overflow-y-auto sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Keranjang</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Keranjang kosong</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {cart.map((item) => (
                <li key={item.id} className="bg-gray-100 px-3 py-2 rounded">
                  <div className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <button className="text-red-500 hover:underline text-xs" onClick={() => removeFromCart(item.id)}>
                      Hapus
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => decrementCartItem(item.id)} className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-400">
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => incrementCartItem(item.id)} className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-400">
                        +
                      </button>
                    </div>
                    <div className="font-medium">{formatRupiah(item.price * item.quantity)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="text-right font-bold text-lg mt-4">Total: {formatRupiah(total)}</div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={resetCart} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm">
              Reset
            </button>
            <button onClick={handleCheckout} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 text-sm">
              Checkout
            </button>
          </div>
        </div>

        {/* Menu + Tabs */}
        <div className="md:col-span-2">
          {/* Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => setActiveTab("makanan")} className={`px-4 py-2 rounded ${activeTab === "makanan" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              Makanan
            </button>
            <button onClick={() => setActiveTab("minuman")} className={`px-4 py-2 rounded ${activeTab === "minuman" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              Minuman
            </button>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenu.map((item) => (
              <MenuItem key={item.id} item={item} onAdd={addToCart} qty={qtyMap[item.id]} setQty={(newQty) => setQtyMap((prev) => ({ ...prev, [item.id]: newQty }))} />
            ))}
          </div>
        </div>
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
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-400">
            -
          </button>
          <input
            type="number"
            min="1"
            className="w-12 text-center border px-2 py-1 rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />

          <button onClick={() => setQty(qty + 1)} className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-400">
            +
          </button>
          <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600" onClick={() => onAdd(item, qty)}>
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
