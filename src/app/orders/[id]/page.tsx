import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 0; // Dynamic

interface PageProps {
  params: { id: string };
}

export default async function OrderInvoicePage({ params }: PageProps) {
  const { id } = params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  let addressObj: any = {};
  try {
    addressObj = JSON.parse(order.shippingAddress);
  } catch {
    addressObj = { street: order.shippingAddress };
  }

  const steps = [
    { label: 'Order Placed', completed: true },
    {
      label: 'Confirmed',
      completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
    },
    {
      label: 'Processing / Crafting',
      completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
    },
    {
      label: 'Dispatched & Shipped',
      completed: ['SHIPPED', 'DELIVERED'].includes(order.status),
    },
    { label: 'Delivered', completed: order.status === 'DELIVERED' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/account"
          className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <span className="text-xs text-gray-400">Order Invoice #{order.orderNumber}</span>
      </div>

      {/* Tracking Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Live Order Status
            </span>
            <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 block">Total Amount</span>
            <span className="text-2xl font-black text-rose-950">₹{order.totalAmount}</span>
            <span className="block text-[11px] font-bold text-emerald-600 uppercase">
              Payment: {order.paymentStatus} ({order.paymentMethod})
            </span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-4">
          <div className="grid grid-cols-5 gap-2 relative">
            {steps.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s.completed
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                    s.completed ? 'text-gray-900 font-bold' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Consignment Tracking Info */}
        {order.trackingNumber && (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Dispatched via Nationwide Courier
              </p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Consignment Tracking AWB: <b>{order.trackingNumber}</b>
              </p>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"
              >
                Track Live Shipment
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-rose-100 shadow-sm space-y-8 print:p-0 print:border-none">
        {/* Printable Invoice Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-2xl font-bold text-rose-950">ITSPRTYCREATIONS</h2>
            <p className="text-xs text-amber-700 font-medium">LTS Party Creations Studio</p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
              42 Celebration Boulevard, Jubilee Hills, Hyderabad, India
              <br />
              support@itsprtycreations.com | +91 98765 43210
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="text-gray-400">Tax Invoice / Receipt</p>
            <p className="font-mono font-bold text-sm text-gray-900 mt-0.5">{order.orderNumber}</p>
            <p className="text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Shipping info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-semibold text-gray-800">{order.customerName}</p>
            <p className="text-gray-500">{order.customerEmail}</p>
            <p className="text-gray-500">+91 {order.customerPhone.replace(/^\+91/, '')}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider mb-2">Shipping Destination</h3>
            <p className="text-gray-700">{addressObj.street || order.shippingAddress}</p>
            {addressObj.apartment && <p className="text-gray-700">{addressObj.apartment}</p>}
            <p className="text-gray-700">
              {addressObj.city ? `${addressObj.city}, ${addressObj.state} - ${addressObj.postalCode}` : ''}
            </p>
            <p className="text-gray-500">{addressObj.country || 'India'}</p>
          </div>
        </div>

        {/* Purchased Items Table */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-4">
            Items Ordered
          </h3>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    {item.variation && <p className="text-[11px] text-gray-500">Option: {item.variation}</p>}
                    {item.personalization && (
                      <p className="text-[10px] text-rose-600 italic">Personalization: &quot;{item.personalization}&quot;</p>
                    )}
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity} &times; ₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-gray-100 max-w-xs ml-auto space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">₹{order.subtotal}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Promotional Discount</span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping & Handling</span>
            <span>{order.shippingAmount === 0 ? <b className="text-emerald-600">FREE</b> : `₹${order.shippingAmount}`}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Paid</span>
            <span className="text-rose-700">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
