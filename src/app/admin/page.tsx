'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  DollarSign,
  Truck,
  Save,
} from 'lucide-react';
import { Product, Order, User } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'dynamic-greeting' | 'products' | 'orders' | 'customers' | 'settings'
  >('overview');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products
  const [products, setProducts] = useState<Product[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');

  // Alerts
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Dynamic Greeting Form States
  const [newTitle, setNewTitle] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('399');
  const [newSellingPrice, setNewSellingPrice] = useState('249');
  const [newDescription, setNewDescription] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);

// Product Image Management
const [imageSource, setImageSource] = useState<'url'>('url');
const [imageLimit, setImageLimit] = useState(6);
  const [newStock, setNewStock] = useState('100');
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newIsBestSeller, setNewIsBestSeller] = useState(false);
  const [submittingGreeting, setSubmittingGreeting] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Website Settings State
  const [websiteSettings, setWebsiteSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Order Details / Edit Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [orderStatusInput, setOrderStatusInput] = useState('');

  // Protect Admin route
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const loadAllData = async () => {
    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Products
      const prodRes = await fetch('/api/products?includeUnpublished=true');
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.products);

      // Products are automatically assigned to the single All Items category by the API.

      // 4. Orders
      const ordRes = await fetch('/api/orders');
      const ordData = await ordRes.json();
      if (ordData.success) setOrders(ordData.orders);

      // 5. Customers
      const custRes = await fetch('/api/admin/customers');
      const custData = await custRes.json();
      if (custData.success) setCustomers(custData.customers);

      // 6. Settings
      const setRes = await fetch('/api/admin/settings');
      const setData = await setRes.json();
      if (setData.success) setWebsiteSettings(setData.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const notify = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // ADD DYNAMIC GREETING CARD (Core Requirement)
  const handleAddDynamicGreeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImageUrls = newImageUrls.map((url) => url.trim()).filter(Boolean);
    if (validImageUrls.length === 0) {
  notify('Please add at least one product image.', true);
  return;
}

if (validImageUrls.length > imageLimit || validImageUrls.length > 6) {
  notify(`Maximum ${imageLimit} images are allowed.`, true);
  return;
}
    setSubmittingGreeting(true);

    try {
      const payload = {
        title: newTitle,
        originalPrice: Number(newOriginalPrice),
        sellingPrice: Number(newSellingPrice),
        description: newDescription,
        details: newDetails || 'Authentic LTS Party Creations celebration greeting.',
        stock: Number(newStock),
        isFeatured: newIsFeatured,
        isBestSeller: newIsBestSeller,
        isPublished: true,
        images: validImageUrls,
        variations: [
          { name: 'Format', value: 'Instant Canva Template Download', priceAdjustment: 0 },
          { name: 'Format', value: 'Luxury 350 GSM Printed Cardstock', priceAdjustment: 350 },
        ],
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create greeting');
      }

      notify(`🎉 "${newTitle}" published successfully! It is now live on the customer website.`);
      setNewTitle('');
      setNewDescription('');
      setNewDetails('');

      setNewImageUrls([]);

      setImageSource('url');
      setImageLimit(6);

      loadAllData();
      setActiveTab('products');
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setSubmittingGreeting(false);
    }
  };

  // UPDATE PRODUCT (Price, Description, Stock, Publish)
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingProduct.title,
          description: editingProduct.description,
          originalPrice: editingProduct.originalPrice,
          sellingPrice: editingProduct.sellingPrice,
          stock: editingProduct.stock,
            isPublished: editingProduct.isPublished,
          isFeatured: editingProduct.isFeatured,
          isBestSeller: editingProduct.isBestSeller,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update product');

      notify(`Updated "${editingProduct.title}". Changes reflect across the storefront!`);
      setEditingProduct(null);
      loadAllData();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      notify(`Deleted "${title}".`);
      loadAllData();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  // UPDATE ORDER STATUS & TRACKING
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: orderStatusInput,
          trackingNumber: trackingNumberInput || null,
          trackingUrl: trackingNumberInput
            ? `https://www.delhivery.com/track/package/${trackingNumberInput}`
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      notify(`Order ${selectedOrder.orderNumber} updated to ${orderStatusInput}`);
      setSelectedOrder(null);
      loadAllData();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  // SAVE WEBSITE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteSettings),
      });
      if (res.ok) {
        notify('Website content and announcement settings saved!');
      }
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xs text-gray-500">Checking administrator authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20">
      {/* Admin Top Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white border-b border-amber-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
              LTS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-tight">ITSPRTYCREATIONS</span>
                <span className="px-2 py-0.5 text-[9px] bg-amber-400 text-stone-950 font-bold uppercase rounded-sm">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80">Logged in as {user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              View Customer Storefront ↗
            </Link>
            <button
              onClick={() => loadAllData()}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-stone-800/80 text-xs font-medium scrollbar-none">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'dynamic-greeting', label: '✨ Add Greeting Card', icon: Sparkles, highlight: true },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'settings', label: 'Website Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-bold bg-white/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                } ${tab.highlight && !isActive ? 'text-amber-400 font-semibold' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2 shadow-sm ${
              feedbackMsg.isError
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {feedbackMsg.isError ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackMsg.text}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Total Sales</span>
                <p className="text-2xl font-black text-rose-950 mt-1">₹{stats.totalSales}</p>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Paid Orders</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Total Orders</span>
                <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalOrders}</p>
                <span className="text-[10px] text-stone-500 mt-1 block">All Time</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Pending Orders</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingOrders}</p>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Needs Attention</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Completed</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedOrders}</p>
                <span className="text-[10px] text-stone-500 mt-1 block">Delivered</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Live Products</span>
                <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalProducts}</p>
                <span className="text-[10px] text-stone-500 mt-1 block">Greeting Cards</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Customers</span>
                <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalCustomers}</p>
                <span className="text-[10px] text-stone-500 mt-1 block">Registered</span>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Orders Table */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-serif font-bold text-base text-stone-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                {stats.recentOrders?.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">No orders placed yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px]">
                          <th className="py-2">Order Ref</th>
                          <th className="py-2">Customer</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {stats.recentOrders?.map((ord: Order) => (
                          <tr key={ord.id} className="hover:bg-stone-50">
                            <td className="py-2.5 font-mono font-semibold text-stone-800">
                              {ord.orderNumber}
                            </td>
                            <td className="py-2.5">
                              <p className="font-semibold text-stone-900">{ord.customerName}</p>
                              <p className="text-[10px] text-stone-400">{ord.customerPhone}</p>
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800">
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-2.5 font-bold text-stone-900">₹{ord.totalAmount}</td>
                            <td className="py-2.5">
                              <button
                                onClick={() => {
                                  setSelectedOrder(ord);
                                  setOrderStatusInput(ord.status);
                                  setTrackingNumberInput(ord.trackingNumber || '');
                                }}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Dynamic Greeting Quick Card */}
              <div className="lg:col-span-4 bg-gradient-to-br from-rose-900 to-amber-900 text-white p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Key Feature
                  </span>
                  <h3 className="font-serif font-bold text-xl mt-2">Dynamic Greeting Card Studio</h3>
                  <p className="text-xs text-rose-100 mt-2 leading-relaxed font-light">
                    Add new greeting cards anytime. Everything saved here is immediately written to the database and displayed on the customer website under All Items.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('dynamic-greeting')}
                  className="w-full py-3 bg-white text-rose-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-50 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Launch Add Greeting Studio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC GREETING CARD MANAGEMENT (MANDATORY REQUIREMENT) */}
        {activeTab === 'dynamic-greeting' && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                Instant Database Publishing
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                Add & Publish New Greeting Card
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Whenever you add a product here, it automatically appears on the customer website under All Items!
              </p>
            </div>

            <form onSubmit={handleAddDynamicGreeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Floral Birthday Keepsake & Envelope Suite"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-5">

  {/* IMAGE SECTION HEADER */}
  <div className="flex flex-wrap items-center justify-between gap-3">

    <div>
      <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
        Product Images *
      </label>

      <p className="text-[11px] text-stone-500 mt-1">
        Manage your product images professionally.
      </p>
    </div>

    <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
      {newImageUrls.filter((url) => Boolean(url?.trim())).length}/{imageLimit} Images
    </span>

  </div>


  {/* IMAGE SETTINGS */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

    {/* IMAGE COUNT DROPDOWN */}
    <div className="space-y-1.5">

      <label className="text-xs font-bold text-stone-700">
        Maximum Image Count
      </label>

      <select
        value={imageLimit}
        onChange={(e) => { const count = Number(e.target.value); setImageLimit(count); setNewImageUrls((current) => current.slice(0, count)); }}
        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-400"
      >
        {[1, 2, 3, 4, 5, 6].map((count) => (
          <option
            key={count}
            value={count}
            
          >
            {count} {count === 1 ? 'Image' : 'Images'}
          </option>
        ))}
      </select>

    </div>


    {/* IMAGE SOURCE DROPDOWN */}
    <div className="space-y-1.5">

      <label className="text-xs font-bold text-stone-700">
        Select Image Source
      </label>

      <select
        value={imageSource}
        onChange={() => setImageSource('url')}
        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-400"
      >
        <option value="url">Image URL Only</option>
      </select>

    </div>

  </div>


  {/* IMAGE URL INPUTS - one textbox for every selected image */}
  {imageSource === 'url' && (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-bold text-stone-800">Enter up to {imageLimit} product image URLs</p>
      {Array.from({ length: imageLimit }, (_, index) => (
        <div key={index} className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-600">Image URL {index + 1}{index === 0 ? ' (Main Image)' : ''}</label>
          <input
            type="url"
            placeholder="https://example.com/product-image.jpg"
            value={newImageUrls[index] || ''}
            onChange={(e) => setNewImageUrls((current) => {
              const updated = [...current];
              updated[index] = e.target.value;
              return updated;
            })}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-rose-400"
          />
          {newImageUrls[index]?.trim() && (
            <img src={newImageUrls[index]} alt={`Preview ${index + 1}`} className="mt-2 h-24 w-24 rounded-lg border object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.35'; }} />
          )}
        </div>
      ))}
    </div>
  )}

  {/* IMAGE INFORMATION */}
  <div className="rounded-xl bg-blue-50 p-3">

    <p className="text-[11px] leading-relaxed text-blue-800">
      <strong>Image Guidelines:</strong> The first image automatically
      becomes the main product image. All remaining images appear in
      the customer product gallery. Product images are loaded directly from the URLs you entered.
    </p>

  </div>

</div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Full Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of the greeting card, party favor wrapper, paper stock, envelope finish..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Craftsmanship & Dimension Details
                </label>
                <input
                  type="text"
                  placeholder="Size: 5x7 folded card. Paper: 350 GSM Textured Linen. Includes Gold Seal Envelope."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFeatured}
                    onChange={(e) => setNewIsFeatured(e.target.checked)}
                    className="text-rose-600 focus:ring-rose-500 rounded"
                  />
                  <span>Show in Featured Cards section</span>
                </label>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsBestSeller}
                    onChange={(e) => setNewIsBestSeller(e.target.checked)}
                    className="text-rose-600 focus:ring-rose-500 rounded"
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingGreeting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                {submittingGreeting ? 'Publishing to Storefront...' : 'Publish Greeting Card Now'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>

              <button
                onClick={() => setActiveTab('dynamic-greeting')}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Greeting
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter(
                        (p) =>
                          !productSearch ||
                          p.title.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/80">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.images?.[0]?.url || 'https://via.placeholder.com/60'}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-stone-900 line-clamp-1">{p.title}</p>
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5"
                              >
                                View Live <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-600">All Items</td>
                          <td className="py-3 px-4 font-bold text-stone-900">₹{p.sellingPrice}</td>
                          <td className="py-3 px-4">
                            {p.discountPercent > 0 ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                {p.discountPercent}% OFF
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-stone-600">{p.stock}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {p.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

{activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by order ref, customer name, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-400">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-stone-200 rounded-xl text-xs bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders
                      .filter((o) => {
                        if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
                        if (!orderSearch) return true;
                        const q = orderSearch.toLowerCase();
                        return (
                          o.orderNumber.toLowerCase().includes(q) ||
                          o.customerName.toLowerCase().includes(q) ||
                          o.customerPhone.includes(q) ||
                          o.customerEmail.toLowerCase().includes(q)
                        );
                      })
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-stone-50">
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            {o.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-stone-500">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-stone-900">{o.customerName}</p>
                            <p className="text-[10px] text-stone-400">
                              {o.customerPhone} &bull; {o.customerEmail}
                            </p>
                          </td>
                          <td className="py-3 px-4">{o.items?.length || 0} items</td>
                          <td className="py-3 px-4 font-bold text-stone-900">₹{o.totalAmount}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                o.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.paymentStatus} ({o.paymentMethod})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setOrderStatusInput(o.status);
                                setTrackingNumberInput(o.trackingNumber || '');
                              }}
                              className="px-2.5 py-1 bg-stone-900 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all text-xs"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search registered customers by name, phone, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
              <span className="text-xs text-stone-500">
                Total: <b>{customers.length}</b> registered customers
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Mobile Number</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customers
                      .filter((c) => {
                        if (!customerSearch) return true;
                        const q = customerSearch.toLowerCase();
                        return (
                          c.name?.toLowerCase().includes(q) ||
                          c.email?.toLowerCase().includes(q) ||
                          c.phone?.includes(q)
                        );
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50">
                          <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{c.name}</span>
                          </td>
                          <td className="py-3 px-4 text-stone-600">{c.phone || '-'}</td>
                          <td className="py-3 px-4 text-stone-600">{c.email}</td>
                          <td className="py-3 px-4 text-stone-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-800">{c.totalOrders}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">₹{c.totalSpent}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Storefront Content Settings</h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  value={websiteSettings.announcement_bar?.text || ''}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      announcement_bar: { ...websiteSettings.announcement_bar, text: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={websiteSettings.hero_banner?.title || ''}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      hero_banner: { ...websiteSettings.hero_banner, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={websiteSettings.hero_banner?.subtitle || ''}
                  onChange={(e) =>
                    setWebsiteSettings({
                      ...websiteSettings,
                      hero_banner: { ...websiteSettings.hero_banner, subtitle: e.target.value },
                    })
                  }
                  className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-rose-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.sellingPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sellingPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full p-2.5 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isPublished}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isPublished: e.target.checked })
                    }
                  />
                  <span>Published on Storefront</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                    }
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-rose-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER MANAGEMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-rose-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Manage Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">{selectedOrder.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Update Order Fulfillment Status
                </label>
                <select
                  value={orderStatusInput}
                  onChange={(e) => setOrderStatusInput(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING (Crafting / Printing)</option>
                  <option value="SHIPPED">SHIPPED (In Transit)</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Shipping Consignment / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DLHV89374928"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                <p className="font-bold">Order Items ({selectedOrder.items?.length}):</p>
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="flex justify-between text-stone-600 text-[11px]">
                    <span>
                      {it.quantity}&times; {it.title} {it.variation ? `(${it.variation})` : ''}
                    </span>
                    <span className="font-bold text-stone-900">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdateOrderStatus}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  Update Order Status
                </button>
                <Link
                  href={`/orders/${selectedOrder.orderNumber}`}
                  target="_blank"
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
