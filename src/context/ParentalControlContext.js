import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ParentalControlContext = createContext();

export const useParentalControl = () => {
  const context = useContext(ParentalControlContext);
  if (!context) {
    throw new Error('useParentalControl must be used within ParentalControlProvider');
  }
  return context;
};

export const ParentalControlProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState(null);
  const [dailyTimeLimit, setDailyTimeLimit] = useState(null); // in minutes
  const [usageToday, setUsageToday] = useState(0); // in minutes
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        await loadSettings();
        await loadDailyUsage();
      } catch (error) {
        console.error('Error initializing parental controls:', error);
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, []);

  useEffect(() => {
    if (dailyTimeLimit && usageToday >= dailyTimeLimit) {
      setIsLocked(true);
    }
  }, [usageToday, dailyTimeLimit]);

  const loadSettings = async () => {
    try {
      const savedPin = await SecureStore.getItemAsync('parental_pin');
      const savedTimeLimit = await AsyncStorage.getItem('daily_time_limit');
      
      if (savedPin) {
        setPin(savedPin);
        setIsLocked(true);
      }
      
      if (savedTimeLimit) {
        setDailyTimeLimit(parseInt(savedTimeLimit));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Don't block app if settings fail to load
    }
  };

  const loadDailyUsage = async () => {
    try {
      const today = new Date().toDateString();
      const savedUsage = await AsyncStorage.getItem(`usage_${today}`);
      if (savedUsage) {
        setUsageToday(parseInt(savedUsage));
      }
    } catch (error) {
      console.error('Error loading daily usage:', error);
      // Don't block app if usage fails to load
    }
  };

  const saveDailyUsage = async (minutes) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`usage_${today}`, minutes.toString());
      setUsageToday(minutes);
    } catch (error) {
      console.error('Error saving daily usage:', error);
    }
  };

  const setParentalPin = async (newPin) => {
    try {
      await SecureStore.setItemAsync('parental_pin', newPin);
      setPin(newPin);
      setIsLocked(true);
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw error;
    }
  };

  const verifyPin = async (inputPin) => {
    return inputPin === pin;
  };

  const unlock = () => {
    setIsLocked(false);
  };

  const lock = () => {
    setIsLocked(true);
  };

  const setTimeLimit = async (minutes) => {
    try {
      await AsyncStorage.setItem('daily_time_limit', minutes.toString());
      setDailyTimeLimit(minutes);
    } catch (error) {
      console.error('Error setting time limit:', error);
      throw error;
    }
  };

  const startSession = () => {
    setSessionStartTime(Date.now());
  };

  const endSession = () => {
    if (sessionStartTime) {
      const minutesUsed = Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
      const newUsage = usageToday + minutesUsed;
      saveDailyUsage(newUsage);
      setSessionStartTime(null);
    }
  };

  const resetDailyUsage = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.removeItem(`usage_${today}`);
      setUsageToday(0);
    } catch (error) {
      console.error('Error resetting daily usage:', error);
    }
  };

  const value = {
    isLocked,
    pin,
    dailyTimeLimit,
    usageToday,
    setParentalPin,
    verifyPin,
    unlock,
    lock,
    setTimeLimit,
    startSession,
    endSession,
    resetDailyUsage,
    isReady,
  };

  // Always render children - don't block the app
  // Settings will load in the background
  return (
    <ParentalControlContext.Provider value={value}>
      {children}
    </ParentalControlContext.Provider>
  );
};

