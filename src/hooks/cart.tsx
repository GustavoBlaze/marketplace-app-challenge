import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (data !== null) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const updatedProducts = products.map(item => {
        if (item.id === product.id) {
          item.quantity += 1;
        }

        return item;
      });

      const productFound = products.find(item => item.id === product.id);

      if (!productFound) {
        updatedProducts.push({ ...product, quantity: 1 });
      }

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updatedProducts = products.map(item => {
        if (item.id === id) {
          item.quantity += 1;
        }

        return item;
      });

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedProducts = products
        .map(item => {
          if (item.id === id && item.quantity > 1) {
            item.quantity -= 1;
          } else if (item.id === id && item.quantity <= 1) {
            return null;
          }

          return item;
        })
        .filter(item => item);

      setProducts(updatedProducts as Product[]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
