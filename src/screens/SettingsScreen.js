import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { colors } from '../theme/colors';
import { useParentalControl } from '../context/ParentalControlContext';

export default function SettingsScreen({ navigation }) {
  const {
    pin,
    dailyTimeLimit,
    usageToday,
    setParentalPin,
    verifyPin,
    setTimeLimit,
    resetDailyUsage,
    lock,
    isLocked,
    unlock,
  } = useParentalControl();

  const [pinLocked, setPinLocked] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [timeLimitHours, setTimeLimitHours] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [unlockPin, setUnlockPin] = useState('');

  // Auto-unlock when 4 digits are entered
  useEffect(() => {
    if (isLocked && unlockPin.length === 4) {
      const verifyAndUnlock = async () => {
        const isValid = await verifyPin(unlockPin);
        if (isValid) {
          unlock();
          setUnlockPin('');
          Alert.alert('Success', 'App unlocked');
        } else {
          Alert.alert('Incorrect PIN', 'Please try again');
          setUnlockPin('');
        }
      };
      verifyAndUnlock();
    }
  }, [unlockPin, isLocked, verifyPin, unlock]);

  useEffect(() => {
    if (dailyTimeLimit) {
      const hours = Math.floor(dailyTimeLimit / 60);
      const mins = dailyTimeLimit % 60;
      setTimeLimitHours(hours.toString());
      setTimeLimitMinutes(mins.toString());
    }
  }, [dailyTimeLimit]);

  const handleSetPin = async () => {
    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    try {
      await setParentalPin(newPin);
      Alert.alert('Success', 'PIN lock enabled');
      setNewPin('');
      setConfirmPin('');
      setPinLocked(true);
      lock();
    } catch (error) {
      Alert.alert('Error', 'Failed to set PIN');
    }
  };

  const handleChangePin = () => {
    navigation.navigate('PinLock', {
      onSuccess: () => {
        setNewPin('');
        setConfirmPin('');
        setPinLocked(false);
      },
    });
  };

  const handleSetTimeLimit = async () => {
    const hours = parseInt(timeLimitHours) || 0;
    const mins = parseInt(timeLimitMinutes) || 0;
    const totalMinutes = hours * 60 + mins;
    
    if (totalMinutes === 0) {
      Alert.alert('Error', 'Please enter a valid time limit');
      return;
    }

    try {
      await setTimeLimit(totalMinutes);
      Alert.alert('Success', `Daily time limit set to ${hours}h ${mins}m`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set time limit');
    }
  };

  const handleRemoveTimeLimit = () => {
    navigation.navigate('PinLock', {
      onSuccess: async () => {
        // PIN verified successfully, now remove the time limit
        await setTimeLimit(null);
        setTimeLimitHours('');
        setTimeLimitMinutes('');
        Alert.alert('Success', 'Time limit removed');
      },
      action: 'removeTimeLimit',
    });
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const handleUnlock = async () => {
    if (unlockPin.length !== 4) {
      return;
    }

    console.log('🔐 SettingsScreen: Verifying PIN for unlock...');
    const isValid = await verifyPin(unlockPin);
    console.log('🔐 SettingsScreen: PIN verification result:', isValid);
    
    if (isValid) {
      console.log('🔐 SettingsScreen: PIN valid, unlocking app...');
      unlock();
      setUnlockPin('');
      Alert.alert('Success', 'App unlocked');
    } else {
      console.log('🔐 SettingsScreen: PIN incorrect');
      Alert.alert('Incorrect PIN', 'Please try again');
      setUnlockPin('');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      {/* App Locked Section */}
      {isLocked && (
        <View style={styles.section}>
          <View style={[styles.settingCard, styles.lockedCard]}>
            <Text style={styles.lockedTitle}>🔒 App is Locked</Text>
            <Text style={styles.lockedDescription}>
              Daily time limit reached. Enter PIN to unlock.
            </Text>
            <View style={styles.unlockContainer}>
              <TextInput
                style={styles.unlockPinInput}
                placeholder="Enter PIN to unlock"
                value={unlockPin}
                onChangeText={setUnlockPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                autoFocus
              />
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={handleUnlock}
              >
                <Text style={styles.unlockButtonText}>Unlock</Text>
              </TouchableOpacity>
            </View>
            {unlockPin.length === 4 && (
              <TouchableOpacity
                style={styles.autoUnlockButton}
                onPress={handleUnlock}
              >
                <Text style={styles.autoUnlockButtonText}>Unlock Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Parental Controls Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parental Controls</Text>

        {/* PIN Lock */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>PIN Lock</Text>
            <Text style={styles.settingDescription}>
              {pin ? 'PIN lock is enabled' : 'Protect settings with a 4-digit PIN'}
            </Text>
          </View>
          {pin ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePin}
            >
              <Text style={styles.actionButtonText}>Change PIN</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pinInputContainer}>
              <TextInput
                style={styles.pinInput}
                placeholder="4-digit PIN"
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              <TextInput
                style={styles.pinInput}
                placeholder="Confirm PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.setPinButton}
                onPress={handleSetPin}
              >
                <Text style={styles.setPinButtonText}>Set PIN</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Time Limit */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Time Limit</Text>
            <Text style={styles.settingDescription}>
              {dailyTimeLimit
                ? `Current limit: ${formatTime(dailyTimeLimit)} | Used today: ${formatTime(usageToday)}`
                : 'Set a daily usage limit for the app'}
            </Text>
          </View>
          <View style={styles.timeLimitContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="Hours"
              value={timeLimitHours}
              onChangeText={setTimeLimitHours}
              keyboardType="numeric"
            />
            <Text style={styles.timeSeparator}>:</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="Minutes"
              value={timeLimitMinutes}
              onChangeText={setTimeLimitMinutes}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.setTimeButton}
              onPress={handleSetTimeLimit}
            >
              <Text style={styles.setTimeButtonText}>Set</Text>
            </TouchableOpacity>
          </View>
          {dailyTimeLimit && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveTimeLimit}
            >
              <Text style={styles.removeButtonText}>Remove Time Limit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              Alert.alert(
                'Reset Daily Usage',
                'Reset today\'s usage counter?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    onPress: async () => {
                      await resetDailyUsage();
                      Alert.alert('Success', 'Daily usage reset');
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.resetButtonText}>Reset Today's Usage</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingCard}>
          <Text style={styles.appName}>Kids Learning App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A safe and educational app for kids to learn and play
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 15,
  },
  settingCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingInfo: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  pinInputContainer: {
    gap: 10,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: colors.backgroundLight,
  },
  setPinButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  setPinButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  timeLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.backgroundLight,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 20,
    marginHorizontal: 10,
    color: colors.textDark,
  },
  setTimeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  setTimeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  lockedCard: {
    backgroundColor: colors.error + '15',
    borderWidth: 2,
    borderColor: colors.error,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  lockedDescription: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  unlockContainer: {
    gap: 10,
  },
  unlockPinInput: {
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  unlockButton: {
    backgroundColor: colors.error,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  autoUnlockButton: {
    marginTop: 10,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  autoUnlockButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});


