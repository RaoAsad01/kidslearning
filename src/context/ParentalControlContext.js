import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
  const [manuallyUnlocked, setManuallyUnlocked] = useState(false); // Track if user manually unlocked
  
  // Use refs to avoid stale closure values in interval
  const usageTodayRef = useRef(0);
  const sessionStartTimeRef = useRef(null);
  const dailyTimeLimitRef = useRef(null);
  const isLockedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    usageTodayRef.current = usageToday;
  }, [usageToday]);

  useEffect(() => {
    sessionStartTimeRef.current = sessionStartTime;
  }, [sessionStartTime]);

  useEffect(() => {
    dailyTimeLimitRef.current = dailyTimeLimit;
  }, [dailyTimeLimit]);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

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
    // If manually unlocked, don't auto-lock even if limit is reached
    if (manuallyUnlocked && isLocked) {
      console.log('🔓 User manually unlocked - keeping app unlocked');
      setIsLocked(false);
      return; // Don't check time limit if manually unlocked
    }
    
    // Lock app if time limit is reached and PIN is set
    // But don't auto-lock if user manually unlocked (they can continue until they close/reopen app)
    if (dailyTimeLimit && pin && usageToday >= dailyTimeLimit && !manuallyUnlocked && !isLocked) {
      console.log('🔒 Time limit reached! Usage:', usageToday, 'Limit:', dailyTimeLimit, 'Locking app...');
      setIsLocked(true);
    } else if (dailyTimeLimit && pin && usageToday < dailyTimeLimit && isLocked && !manuallyUnlocked) {
      // Unlock if usage is below limit (e.g., after reset)
      console.log('🔓 Usage below limit. Unlocking app...');
      setIsLocked(false);
    }
  }, [usageToday, dailyTimeLimit, pin, isLocked, manuallyUnlocked]);

  const loadSettings = async () => {
    try {
      const savedPin = await SecureStore.getItemAsync('parental_pin');
      const savedTimeLimit = await AsyncStorage.getItem('daily_time_limit');
      
      if (savedPin) {
        setPin(savedPin);
        console.log('🔐 PIN loaded from secure store');
        // Don't lock immediately - only lock if time limit is reached
      } else {
        console.log('🔐 No PIN found in secure store');
      }
      
      if (savedTimeLimit) {
        const limit = parseInt(savedTimeLimit);
        setDailyTimeLimit(limit);
        console.log('⏱️ Time limit loaded:', limit, 'minutes');
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
        const usage = parseInt(savedUsage);
        setUsageToday(usage);
        usageTodayRef.current = usage;
        console.log('📊 Loaded daily usage:', usage, 'minutes for', today);
      } else {
        console.log('📊 No previous usage found for today');
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
      usageTodayRef.current = minutes; // Update ref
    } catch (error) {
      console.error('Error saving daily usage:', error);
    }
  };

  const setParentalPin = async (newPin) => {
    try {
      await SecureStore.setItemAsync('parental_pin', newPin);
      setPin(newPin);
      // Only lock if time limit is already reached
      if (dailyTimeLimit && usageToday >= dailyTimeLimit) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw error;
    }
  };

  const verifyPin = async (inputPin) => {
    const isValid = inputPin === pin;
    console.log('🔐 Verifying PIN. Input:', inputPin, 'Stored:', pin ? '***' : 'null', 'Valid:', isValid);
    return isValid;
  };

  const unlock = () => {
    console.log('🔓 Unlocking app... Current state - isLocked:', isLocked, 'manuallyUnlocked:', manuallyUnlocked);
    // Use functional updates to ensure we get the latest state
    setManuallyUnlocked(true); // Mark as manually unlocked FIRST
    setIsLocked((prevLocked) => {
      console.log('🔓 setIsLocked called with prevLocked:', prevLocked);
      if (prevLocked) {
        console.log('🔓 Setting isLocked to FALSE');
        isLockedRef.current = false; // Update ref immediately
        return false;
      }
      return prevLocked;
    });
    console.log('🔓 Unlock called - should be unlocked now');
    // Also stop any active session tracking
    if (sessionStartTime) {
      setSessionStartTime(null);
      sessionStartTimeRef.current = null;
    }
  };

  const lock = () => {
    setIsLocked(true);
  };

  const setTimeLimit = async (minutes) => {
    try {
      if (minutes === null) {
        await AsyncStorage.removeItem('daily_time_limit');
        setDailyTimeLimit(null);
        dailyTimeLimitRef.current = null;
        // Unlock if time limit is removed
        if (isLocked && pin) {
          setIsLocked(false);
        }
      } else {
        await AsyncStorage.setItem('daily_time_limit', minutes.toString());
        setDailyTimeLimit(minutes);
        dailyTimeLimitRef.current = minutes;
        console.log('⏱️ Time limit set to:', minutes, 'minutes. Current usage:', usageToday);
        // Check if we should lock immediately
        if (pin && usageToday >= minutes) {
          console.log('🔒 Usage already exceeds limit. Locking immediately.');
          setIsLocked(true);
        } else if (pin && usageToday < minutes) {
          console.log('✅ Usage is below limit. App remains unlocked.');
          // Make sure we're not locked if usage is below limit
          if (isLocked) {
            setIsLocked(false);
          }
        }
      }
    } catch (error) {
      console.error('Error setting time limit:', error);
      throw error;
    }
  };

  const startSession = () => {
    // Don't start session if app is locked (unless manually unlocked)
    if (isLocked && !manuallyUnlocked) {
      console.log('⏱️ Cannot start session - app is locked');
      return;
    }
    // Don't restart if session already running
    if (sessionStartTime) {
      console.log('⏱️ Session already running');
      return;
    }
    const startTime = Date.now();
    console.log('⏱️ Starting session at:', new Date(startTime).toLocaleTimeString(), 'Current usage:', usageToday, 'Limit:', dailyTimeLimit);
    setSessionStartTime(startTime);
    sessionStartTimeRef.current = startTime;
    // Reset manually unlocked flag when starting new session (new day or app restart)
    if (manuallyUnlocked) {
      setManuallyUnlocked(false);
    }
  };

  const endSession = () => {
    if (sessionStartTime) {
      const endTime = Date.now();
      const secondsUsed = endTime - sessionStartTime;
      const minutesUsed = secondsUsed / (1000 * 60); // Use decimal for precision
      const newUsage = usageToday + minutesUsed;
      console.log('⏱️ Ending session. Minutes used:', minutesUsed.toFixed(2), 'New total usage:', newUsage.toFixed(2));
      saveDailyUsage(Math.floor(newUsage)); // Save as integer minutes
      setSessionStartTime(null);
    }
  };

  // Track app usage continuously with real-time checking
  useEffect(() => {
    // Don't track if locked (unless manually unlocked)
    if (!dailyTimeLimit || !pin || (isLocked && !manuallyUnlocked) || !sessionStartTime) {
      return;
    }

    console.log('⏱️ Starting time tracking. Limit:', dailyTimeLimit, 'Current usage:', usageToday);

    // Check more frequently (every 5 seconds) to catch limit quickly
    const interval = setInterval(() => {
      // Use refs to get current values (avoid stale closures)
      const currentSessionStart = sessionStartTimeRef.current;
      const currentUsage = usageTodayRef.current;
      const currentLimit = dailyTimeLimitRef.current;
      const currentlyLocked = isLockedRef.current;

      if (currentSessionStart && !currentlyLocked && currentLimit) {
        const currentTime = Date.now();
        const secondsUsed = (currentTime - currentSessionStart) / 1000;
        const minutesUsed = secondsUsed / 60; // Use decimal for precision
        const totalUsage = currentUsage + minutesUsed;
        
        console.log('⏱️ Time check - Usage today:', currentUsage.toFixed(2), 'Session:', minutesUsed.toFixed(2), 'Total:', totalUsage.toFixed(2), 'Limit:', currentLimit);
        
        // Check if limit reached (using >= for safety)
        // But don't lock if user manually unlocked (they can continue)
        if (totalUsage >= currentLimit && !manuallyUnlocked) {
          console.log('🔒 TIME LIMIT REACHED! Locking app now...');
          // Save final usage before locking
          const finalMinutes = Math.floor(secondsUsed / 60);
          const finalUsage = currentUsage + finalMinutes;
          saveDailyUsage(finalUsage);
          setIsLocked(true);
          setSessionStartTime(null);
        }
      }
    }, 5000); // Check every 5 seconds for faster response

    return () => {
      console.log('⏱️ Stopping time tracking interval');
      clearInterval(interval);
    };
  }, [sessionStartTime, usageToday, dailyTimeLimit, pin, isLocked]);

  const resetDailyUsage = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.removeItem(`usage_${today}`);
      setUsageToday(0);
      usageTodayRef.current = 0;
      console.log('📊 Daily usage reset to 0');
      // Unlock if locked due to time limit
      if (isLocked && dailyTimeLimit && pin) {
        setIsLocked(false);
      }
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

