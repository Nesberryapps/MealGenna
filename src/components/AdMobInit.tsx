"use client"; // <--- This magic line makes hooks work

import { useEffect } from 'react';
import { initializeAdMob } from '@/services/admob';

export default function AdMobInit() {
  useEffect(() => {
    initializeAdMob();
  }, []);

  return null; // This component renders nothing, it just runs the logic
}