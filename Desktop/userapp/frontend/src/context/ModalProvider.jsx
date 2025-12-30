import { createContext, useContext, useMemo, useState } from "react";

const ModalContext = createContext();

export default function ModalProvider({ children }) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isAutoPayoutModalOpen, setIsAutoPayoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEnterAmountModalOpen, setIsEnterAmountModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCartSuccessModalOpen, setIsCartSuccessModalOpen] = useState(false);
  const [cartSuccessItem, setCartSuccessItem] = useState(null);
  const [isCartAddedBottomBarVisible, setIsCartAddedBottomBarVisible] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const value = useMemo(
    () => ({
      isCustomModalOpen,
      setIsCustomModalOpen,
      isAutoPayoutModalOpen,
      setIsAutoPayoutModalOpen,
      isWithdrawModalOpen,
      setIsWithdrawModalOpen,
      isEnterAmountModalOpen,
      setIsEnterAmountModalOpen,
      isSuccessModalOpen,
      setIsSuccessModalOpen,
      isCartSuccessModalOpen,
      setIsCartSuccessModalOpen,
      cartSuccessItem,
      setCartSuccessItem,
      isCartAddedBottomBarVisible,
      setIsCartAddedBottomBarVisible,
      cartItemCount,
      setCartItemCount,
    }),
    [
      isCustomModalOpen,
      isAutoPayoutModalOpen,
      isWithdrawModalOpen,
      isEnterAmountModalOpen,
      isSuccessModalOpen,
      isCartSuccessModalOpen,
      cartSuccessItem,
      isCartAddedBottomBarVisible,
      cartItemCount,
    ]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
