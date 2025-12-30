import { useEffect } from 'react';
import { useModal } from '../context/ModalProvider';
import fetchCart from '../data/getdata/getCart';

export const useCartManager = () => {
  const { setIsCartBottomBarVisible, setCartItemCount, cartItemCount } = useModal();

  const updateCartCount = async () => {
    try {
      const { arr } = await fetchCart();
      const totalItems = arr.reduce((total, category) => 
        total + category.items.reduce((catTotal, item) => catTotal + item.quantity, 0), 0
      );
      
      // Update bottom bar state
      setCartItemCount(totalItems);
      if (totalItems > 0) {
        setIsCartBottomBarVisible(true);
      } else {
        setIsCartBottomBarVisible(false);
      }
      
      return totalItems;
    } catch (error) {
      setCartItemCount(0);
      setIsCartBottomBarVisible(false);
      return 0;
    }
  };

  // Initialize cart state on mount
  useEffect(() => {
    updateCartCount();
  }, []);

  return {
    updateCartCount,
    cartItemCount,
  };
};