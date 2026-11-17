                        Admin
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-rose-100 py-1.5 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 font-bold"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-rose-50"
                      >
                        <Package className="w-4 h-4 text-rose-600" />
                        My Orders & Account
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center justify-between border-t border-rose-100/70 py-2.5 text-xs font-medium text-gray-700">
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-rose-600 transition-colors font-semibold">
                Home
              </Link>
              <Link href="/products" className="hover:text-rose-600 transition-colors">
                All Greetings
              </Link>

              <Link href="/products?featured=true" className="hover:text-rose-600 transition-colors">
                Featured Items
              </Link>
              <Link href="/products?bestseller=true" className="hover:text-rose-600 transition-colors">
                Best Sellers
              </Link>
            </div>


          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-rose-100 bg-white p-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </form>

            <div className="space-y-2 text-sm font-medium">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">Home</Link>
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">All Items</Link>
              <Link href="/products?featured=true" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">Featured Items</Link>
              <Link href="/products?bestseller=true" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-gray-800 hover:text-rose-600">Best Sellers</Link>
            </div>
          </div>
        )}
      </header>

      {/* Customer Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};
