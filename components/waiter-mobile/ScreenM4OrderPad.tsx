'use client';

import React from 'react';
import { Screen2Menu } from '../customer/Screen2Menu';

interface Props {
  tableNum: string;
  seatNum?: number;
  waiterName: string;
  onBack: () => void;
  onKOTFired: () => void;
}

export function ScreenM4OrderPad({
  tableNum,
  seatNum,
  waiterName,
  onBack,
  onKOTFired,
}: Props) {
  return (
    <Screen2Menu
      isWaiterMode={true}
      tableNum={tableNum}
      seatNum={seatNum}
      waiterName={waiterName}
      onBack={onBack}
      onKOTFired={onKOTFired}
    />
  );
}
