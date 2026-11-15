'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  ExternalLink,
  Shield,
  LogOut,
} from 'lucide-react';
import { Order } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isAdmin } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xs text-gray-500">Loading your customer profile...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-800">Shipped</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-purple-100 text-purple-800">Processing</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-amber-100 text-amber-800">Confirmed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 text-gray-800">Pending</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.isVerified && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  +91 {user.phone.replace(/^\+91/, '')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-amber-500 text-white font-bold text-xs uppercase rounded-xl hover:bg-amber-600 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-600" />
            My Orders & Tracking ({orders.length})
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800"
          >
            Browse More Greeting Cards &rarr;
          </Link>
        </div>

        {loadingOrders ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 text-xs text-gray-400">
            Loading order history...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-rose-100 space-y-3">
            <Package className="w-10 h-10 text-rose-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">You haven&apos;t placed any orders yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Find handcrafted greeting cards and customized favor printables from LTS Party Creations!
            </p>
            <Link
              href="/products"
              className="inline-block mt-2 px-5 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400">Order Ref: </span>
                    <span className="font-mono font-bold text-gray-900">{o.orderNumber}</span>
                    <span className="text-gray-300 mx-2">&bull;</span>
                    <span className="text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(o.status)}
                    <span className="font-bold text-sm text-gray-900">₹{o.totalAmount}</span>
                  </div>
                </div>

                {/* Tracking info if dispatched */}
                {o.trackingNumber && (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Consignment Tracking: <b>{o.trackingNumber}</b>
                      </span>
                    </div>
                    {o.trackingUrl && (
                      <a
                        href={o.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                      >
                        Track Shipment
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3">
                  {o.items?.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-xl bg-gray-100 shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        {item.variation && (
                          <p className="text-[11px] text-gray-500">Option: {item.variation}</p>
                        )}
                        {item.personalization && (
                          <p className="text-[10px] text-rose-600 italic">
                            Personalization: &quot;{item.personalization}&quot;
                          </p>
                        )}
                        <p className="text-gray-500 mt-1">
                          Qty: {item.quantity} &times; ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer link to view full invoice */}
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/orders/${o.orderNumber}`}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    View Order Details & Invoice &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
