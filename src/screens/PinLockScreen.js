import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useParentalControl } from '../context/ParentalControlContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PinLockScreen({ route, navigation }) {
  const { verifyPin, unlock, setParentalPin } = useParentalControl();
  const { onSuccess } = route.params || {};
  const [pin, setPin] = useState('');
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handlePinPress = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleVerify = async () => {
    if (pin.length !== 4) {
      return;
    }

    const isValid = await verifyPin(pin);
    if (isValid) {
      if (onSuccess) {
        // Changing PIN flow
        setIsSettingNewPin(true);
        setPin('');
      } else {
        unlock();
        navigation.goBack();
      }
    } else {
      Alert.alert('Incorrect PIN', 'Please try again');
      setPin('');
    }
  };

  const handleSetNewPin = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      await setParentalPin(newPin);
      Alert.alert('Success', 'PIN changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            if (onSuccess) onSuccess();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change PIN');
    }
  };

  React.useEffect(() => {
    if (pin.length === 4 && !isSettingNewPin) {
      handleVerify();
    }
  }, [pin]);

  if (isSettingNewPin) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Set New PIN</Text>
            <Text style={styles.subtitle}>Enter a new 4-digit PIN</Text>

            <View style={styles.pinContainer}>
              <TextInput
                style={styles.pinInput}
                placeholder="New PIN"
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                autoFocus
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
            </View>

            <TouchableOpacity
              style={styles.setButton}
              onPress={handleSetNewPin}
            >
              <Text style={styles.setButtonText}>Set New PIN</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>🔒 Enter PIN</Text>
          <Text style={styles.subtitle}>
            {onSuccess ? 'Verify PIN to continue' : 'Enter your PIN to unlock'}
          </Text>

          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  pin.length > index && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>

          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.keypadButton}
                onPress={() => handlePinPress(digit.toString())}
              >
                <Text style={styles.keypadButtonText}>{digit}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.keypadButton} />
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handlePinPress('0')}
            >
              <Text style={styles.keypadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={handleDelete}
            >
              <Text style={styles.keypadButtonText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 40,
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: 50,
    gap: 15,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.white,
  },
  pinContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  pinInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 15,
    padding: 20,
    fontSize: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: colors.white,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
    gap: 15,
  },
  keypadButton: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  setButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  setButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});


