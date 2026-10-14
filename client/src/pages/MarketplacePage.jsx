import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  X, 
  Tag, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Sparkles,
  BookOpen,
  Laptop,
  PenTool,
  Compass,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MarketplacePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  // Selected item for contact modal
  const [contactItem, setContactItem] = useState(null);

  // Post Listing modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    price: 0,
    isFreeOrLost: false,
    contactInfo: '',
    imageUrl: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const categories = ['All', 'Books', 'Electronics', 'Stationery', 'Lost & Found', 'Other'];

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      
      const res = await api.get('/marketplace', { params });
      if (res.data?.success) {
        setListings(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: formData.isFreeOrLost ? 0 : parseFloat(formData.price) || 0,
        isFreeOrLost: Boolean(formData.isFreeOrLost),
        contactInfo: formData.contactInfo.trim(),
        imageUrl: formData.imageUrl.trim() || null,
      };

      const res = await api.post('/marketplace', payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'Books',
          price: 0,
          isFreeOrLost: false,
          contactInfo: '',
          imageUrl: '',
        });
        setToastMessage('Listing posted successfully to campus marketplace!');
        setTimeout(() => setToastMessage(null), 4000);
        fetchListings();
      }
    } catch (err) {
      console.error('Create listing error:', err);
      setCreateError(err.response?.data?.message || 'Failed to post listing. Please check required fields.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Books':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'Electronics':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Stationery':
        return <PenTool className="w-4 h-4 text-purple-600" />;
      case 'Lost & Found':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Hero Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-sm border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Peer-to-Peer Campus Marketplace
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                Student Marketplace & Lost-Found
              </h1>
              <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                Buy and sell course textbooks, lab calculators, drawing kits, and electronics directly between campus peers, or report and claim misplaced belongings.
              </p>
            </div>

            <div>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setShowCreateModal(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Post an Item
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, textbooks, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </form>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-sm text-slate-500 font-medium">Scanning campus marketplace items...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {search || selectedCategory !== 'All'
                ? 'Try adjusting your search criteria or checking other categories.'
                : 'No items are currently listed. Have textbooks or stationery to pass along? Post a listing!'}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                fetchListings();
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image / Thumbnail */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <ShoppingBag className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">{item.category}</span>
                    </div>
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-slate-800 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm ${
                        item.is_free_or_lost || item.category === 'Lost & Found'
                          ? 'bg-amber-500 text-slate-950'
                          : parseFloat(item.price) === 0
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {item.is_free_or_lost || item.category === 'Lost & Found'
                        ? 'FREE / CLAIM'
                        : parseFloat(item.price) === 0
                        ? 'FREE'
                        : `$${parseFloat(item.price).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">Listed by <strong className="text-slate-700">{item.seller_name}</strong></span>
                      <span className="capitalize text-emerald-600 font-semibold">{item.status || 'available'}</span>
                    </div>

                    <button
                      onClick={() => setContactItem(item)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Contact Seller / Finder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Modal */}
        {contactItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Contact Seller</h3>
                  <p className="text-xs text-slate-500">Item: {contactItem.title}</p>
                </div>
                <button
                  onClick={() => setContactItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Seller Details</div>
                  <div className="text-sm font-bold text-slate-800">{contactItem.seller_name}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{contactItem.seller_email}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Contact Instructions / Phone</div>
                  <p className="text-sm font-medium text-emerald-900 break-words">
                    {contactItem.contact_info}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${contactItem.seller_email}?subject=Interested in ${encodeURIComponent(contactItem.title)} on CollabCampus`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email Directly
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post Item Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Post Item</h3>
                    <p className="text-xs text-slate-500">List an item or report Lost & Found</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering Mathematics Volume 2 (Like New)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setFormData({
                          ...formData,
                          category: newCat,
                          isFreeOrLost: newCat === 'Lost & Found' ? true : formData.isFreeOrLost,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={formData.isFreeOrLost}
                      value={formData.isFreeOrLost ? 0 : formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFreeOrLost"
                    checked={formData.isFreeOrLost}
                    onChange={(e) => setFormData({ ...formData, isFreeOrLost: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="isFreeOrLost" className="text-xs font-medium text-slate-700 cursor-pointer">
                    This is a Free Giveaway item or Lost & Found report
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Information / Pick-up Instructions *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WhatsApp: +1-234-567-8900 or Room 402, Block B"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Condition *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe item condition, edition, accessories included..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
                  >
                    {createLoading ? 'Posting...' : 'Post Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
