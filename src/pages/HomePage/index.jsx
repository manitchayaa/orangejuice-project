import React, { useState,useEffect } from 'react';
// import './OrangeShop.css';
const HomePage = () => {
  const [count, setCount] = useState(1);
  const pricePerUnit = 35;

  const handleOrder = () => {
    alert(`กำลังไปที่หน้าชำระเงินสำหรับน้ำส้ม ${count} ขวด`);
  };
  
  return (
    <div className="bg-amber-500 text-white p-4 rounded-lg">
      <header className="header">
        <h1>สดจากสวน 🍊</h1>
        <p>น้ำส้มคั้นสด 100% ไม่ใส่น้ำตาล</p>
      </header>

      <main className="product-card">
        <img 
          src="https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=400" 
          alt="Orange Juice" 
          className="product-image"
        />
        <p style={{fontWeight: 'bold', color: '#f97316'}}>ขวดละ {pricePerUnit} บาท</p>

        <div className="counter-group">
          <button 
            className="btn-circle btn-minus"
            onClick={() => setCount(Math.max(1, count - 1))}
          >
            -
          </button>
          
          <span className="quantity-text">{count}</span>
          
          <button 
            className="btn-circle btn-plus"
            onClick={() => setCount(count + 1)}
          >
            +
          </button>
        </div>
      </main>

      <footer className="footer-card">
        <div className="price-summary">
          <span className="total-label">ยอดรวม</span>
          <span className="total-amount">{count * pricePerUnit}.-</span>
        </div>
        
        <button className="order-button" onClick={handleOrder}>
          สั่งซื้อเลย 🛒
        </button>
      </footer>
    </div>
  );
};

export default HomePage;