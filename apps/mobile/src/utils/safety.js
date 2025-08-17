// utils/safety.js
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Alert, Linking } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Emergency contacts database
export const EMERGENCY_SERVICES = {
  police: { name: "South African Police", number: "10111" },
  ambulance: { name: "Ambulance", number: "10177" },
  fire: { name: "Fire Department", number: "10177" },
  crimeStop: { name: "Crime Stop", number: "0860010111" },
  genderViolence: { name: "Gender-Based Violence", number: "0800150150" },
  suicideHelpline: { name: "Suicide Helpline", number: "0800567567" }
};

// Safety status system
export const SAFETY_STATUS = {
  SAFE: { text: "I'm safe", color: "#4CAF50", icon: "shield-check" },
  CHECK_IN: { text: "Check on me", color: "#FFC107", icon: "clock-alert" },
  UNSAFE: { text: "I need help", color: "#F44336", icon: "alert-circle" }
};

// Generate emergency message with location
export const generateEmergencyMessage = async (contacts) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return "I need help! My location is unavailable";
    
    const location = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync(location.coords);
    
    const firstAddress = address[0];
    const addressString = [
      firstAddress.street,
      firstAddress.city,
      firstAddress.region,
      firstAddress.postalCode
    ].filter(Boolean).join(', ');
    
    return `EMERGENCY! I need help at: ${addressString || 'Location unknown'}. 
Coordinates: ${location.coords.latitude},${location.coords.longitude}
Sent via MeetupSA App at ${new Date().toLocaleTimeString()}`;
  } catch {
    return "URGENT: I need immediate assistance! Sent via MeetupSA App";
  }
};

// Send emergency alerts
export const sendEmergencyAlert = async (contacts, status) => {
  try {
    const message = await generateEmergencyMessage(contacts);
    const isAvailable = await SMS.isAvailableAsync();
    
    if (isAvailable) {
      const recipients = contacts.map(c => c.phone);
      await SMS.sendSMSAsync(recipients, `${status.text}: ${message}`);
      return true;
    } else {
      // Fallback to calling
      for (const contact of contacts) {
        await Linking.openURL(`tel:${contact.phone}`);
      }
      return true;
    }
  } catch (error) {
    console.error("Emergency alert failed:", error);
    return false;
  }
};

// Safety check-in system
export const scheduleSafetyCheck = (duration, callback) => {
  return setTimeout(() => {
    Alert.alert(
      "Safety Check",
      "Are you safe? The app hasn't detected activity in a while.",
      [
        { text: "I'm Safe", onPress: () => callback(true) },
        { text: "I Need Help", onPress: () => callback(false) }
      ],
      { cancelable: false }
    );
  }, duration * 60 * 1000);
};

// Fake call feature
export const initiateFakeCall = () => {
  const callTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
  return {
    id: uuidv4(),
    name: "Fake Call",
    time: callTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    number: "083" + Math.floor(1000000 + Math.random() * 9000000)
  };
};