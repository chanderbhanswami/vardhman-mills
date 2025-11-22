'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductTable from '@/components/tables/ProductTable';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  variants: {
    price: number;
    stock: number;
  }[];
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalSearch, setIsLocalSearch] = useState(true);
  const [searchTimeoutRef, setSearchTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const fetchProducts = useCallback(async (page = 1, search = '') => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);

      const response = await fetch(
        `/api/products/admin?page=${page}&search=${encodeURIComponent(search)}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const fetchedProducts = data.products || [];
        setProducts(fetchedProducts);
        // Only update allProducts when not searching (initial load or reset)
        if (!search) {
          setAllProducts(fetchedProducts);
        }
        setPagination({
          page: data.page || 1,
          pages: data.totalPages || 1,
          total: data.total || 0,
        });
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setPagination({
        page: 1,
        pages: 1,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // fetchProducts is stable due to useCallback

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      if (!session?.accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/products/admin/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchProducts(pagination.page);
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleAdd = () => {
    router.push('/dashboard/products/create');
  };

  // Local filtering function
  const filterProductsLocally = (query: string) => {
    if (!query.trim()) {
      setProducts(allProducts);
      return allProducts;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allProducts.filter(product => {
      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      const category = product.category.name.toLowerCase();
      
      return name.includes(lowerQuery) || 
             description.includes(lowerQuery) || 
             category.includes(lowerQuery);
    });
    
    setProducts(filtered);
    return filtered;
  };

  const handlePageChange = (page: number) => {
    if (isLocalSearch && searchQuery) {
      // For local search, don't change page
      return;
    }
    fetchProducts(page, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    if (!query.trim()) {
      // Reset to show all products when search is cleared
      setProducts(allProducts);
      setIsLocalSearch(true);
      return;
    }

    // Always start with local filtering for immediate feedback
    setIsLocalSearch(true);
    filterProductsLocally(query);
    
    // For queries longer than 1 character, trigger server search faster
    if (query.length > 1) {
      // Set timeout for server search with faster timing
      const timeoutId = setTimeout(() => {
        setIsLocalSearch(false);
        fetchProducts(1, query);
        setSearchTimeoutRef(null);
      }, 500);
      setSearchTimeoutRef(timeoutId);
    }
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', field, direction);
    // Implement sorting logic
  };

  const handleResetSearch = () => {
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    // Reset all search-related state to show all products
    setSearchQuery('');
    setProducts(allProducts);
    setIsLocalSearch(true);
  };

  return (
    <div className="page-container">
      <ProductTable
        products={products}
        loading={loading}
        onDelete={handleDeleteProduct}
        onAdd={handleAdd}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSort={handleSort}
        searchQuery={searchQuery}
        onResetSearch={handleResetSearch}
      />
    </div>
  );
}
