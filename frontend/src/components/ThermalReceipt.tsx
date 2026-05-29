import React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ThermalReceiptProps {
  orderId: string;
  tableNumber?: string;
  orderType: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  orderId,
  tableNumber,
  orderType,
  items,
  totalAmount,
  paymentMethod,
  customerName,
  customerPhone,
  customerAddress,
  createdAt,
}) => {
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div id={`receipt-${orderId}`} className="hidden print:block w-[80mm] p-2 bg-white text-black font-mono text-sm leading-tight mx-auto">
      {/* Header */}
      <div className="text-center mb-4 border-b border-black border-dashed pb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest">THE DIVINE</h1>
        <p className="text-xs mt-1">Luxury Kitchen & Restaurant</p>
        <p className="text-xs">Runisaidpur, Sitamarhi, Bihar</p>
        <p className="text-xs">Ph: +91 99999 99999</p>
      </div>

      {/* Order Info */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Date: {formattedDate}</span>
          <span>Time: {formattedTime}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Order: #{orderId.slice(-6)}</span>
          <span className="font-bold uppercase">{orderType.replace('_', ' ')}</span>
        </div>
        {tableNumber && (
          <div className="mt-1 font-bold text-sm">Table: {tableNumber}</div>
        )}
      </div>

      {/* Customer Info (For Delivery) */}
      {orderType === 'delivery' && (customerName || customerPhone) && (
        <div className="mb-4 border-t border-b border-black border-dashed py-2 text-xs">
          <p className="font-bold">Deliver To:</p>
          <p>{customerName}</p>
          <p>{customerPhone}</p>
          <p>{customerAddress}</p>
        </div>
      )}

      {/* Items Table */}
      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b border-black border-dashed">
            <th className="text-left py-1 w-12">Qty</th>
            <th className="text-left py-1">Item</th>
            <th className="text-right py-1">Amt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 align-top">{item.quantity}x</td>
              <td className="py-1 pr-2 align-top break-words">{item.name}</td>
              <td className="py-1 text-right align-top">₹{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-black border-dashed pt-2 mb-6 space-y-1">
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>₹{totalAmount}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Payment:</span>
          <span className="uppercase">{paymentMethod || 'CASH'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs space-y-1 mt-8 mb-4">
        <p className="font-bold italic">Thank you for visiting!</p>
        <p>Please visit again</p>
        <p className="text-[10px] mt-4">Powered by Antigravity POS</p>
      </div>
      
      {/* Gap for tear off */}
      <div className="h-10"></div>
    </div>
  );
};

export default ThermalReceipt;
