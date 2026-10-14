'use client';

import React from 'react';
import WelcomeScreen from '../../WelcomeScreen';
import { useCustomer, useCustomerStore } from '../../../context/CustomerContext';

export const Screen1WelcomeRoyal: React.FC = () => {
  const { tableNumber, seatNumber, guestName, setGuestName, setCurrentScreen } = useCustomer();

  const handleExplore = (info: { guestName: string; tableNumber: string; seatNumber: string | number }) => {
    if (info.guestName && info.guestName.trim()) {
      setGuestName(info.guestName.trim());
    }
    useCustomerStore.getState().setCurrentScreen(2);
    setCurrentScreen(2);
  };

  return (
    <WelcomeScreen
      tableNumber={tableNumber || "02"}
      seatNumber={seatNumber || "01"}
      initialGuestName={guestName || ""}
      onExploreMenu={handleExplore}
    />
  );
};
