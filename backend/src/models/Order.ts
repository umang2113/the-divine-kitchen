import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  quantity: number;
  priceAtTime: number;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  status: 'received' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  deliveryAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true },
  priceAtTime: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    orderType: { type: String, enum: ['dine_in', 'takeaway', 'delivery'], default: 'delivery' },
    tableNumber: { type: String },
    status: { type: String, enum: ['received', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed'], default: 'received' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMethod: { type: String },
    deliveryAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
