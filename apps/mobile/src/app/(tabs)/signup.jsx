import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { StatusBar } from "expo-status-bar";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building,
  Camera,
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Home,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Upload,
  User,
  UserCheck
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- IMPORTANT ---
// Ensure these files exist and the paths are correct for your project structure.
import apiClient from "../../utils/api"; // Your axios client configured with the backend URL
import { useTheme } from "../../utils/theme"; // Your custom theme hook

const { width: screenWidth } = Dimensions.get("window");

export default function SignupScreen({ navigation }) { // Assuming you use react-navigation
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirmPassword: "",
    address: "", 
    city: "", 
    province: "", 
    emergencyContact1: "", 
    emergencyContact2: "",
    emergencyRelation1: "", 
    emergencyRelation2: "", 
    idNumber: "", 
    idDocument: null,
    proofOfAddress: null, 
    selfiePhoto: null, 
    interests: [],
    safetyPreferences: { 
      locationSharing: true, 
      emergencyAlerts: true, 
      groupVerification: true, 
      backgroundCheck: false 
    },
    termsAccepted: false, 
    privacyAccepted: false, 
    safetyGuidelinesAccepted: false,
  });

  const [loaded, error] = useFonts({
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold,
  });

  const updateFormData = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateSafetyPreference = (field, value) => setFormData(prev => ({ 
    ...prev, 
    safetyPreferences: { ...prev.safetyPreferences, [field]: value } 
  }));

  const validateStep = (step) => {
    switch (step) {
      case 0: 
        return formData.firstName && formData.lastName && formData.email && 
               formData.phone && formData.password && formData.password === formData.confirmPassword;
      case 1: 
        return formData.address && formData.city && formData.province && 
               formData.emergencyContact1 && formData.emergencyRelation1;
      case 2: 
        return formData.idNumber; // Simplified for now
      case 3: 
        return formData.interests.length > 0;
      case 4: 
        return formData.termsAccepted && formData.privacyAccepted && 
               formData.safetyGuidelinesAccepted;
      default: 
        return false;
    }
  };

  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: false });

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        scrollToTop();
      }
    } else {
      Alert.alert("Incomplete Information", "Please fill all required fields correctly.");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleSignup = async () => {
    if (!validateStep(currentStep)) {
      Alert.alert("Incomplete Information", "Please agree to the terms to complete registration.");
      return;
    }
    setIsLoading(true);
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phone,
      password: formData.password,
    };
    try {
      const response = await apiClient.post('/auth/register', userData);
      Alert.alert(
        "Account Created!", 
        response.data.message || "Please check your email to verify your account.",
        [{ text: "Go to Login", onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "An unexpected error occurred.";
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const interests = [
    { id: "coffee", title: "Coffee & Cafés", icon: "☕" },
    { id: "food", title: "Food & Dining", icon: "🍽️" },
    { id: "outdoor", title: "Outdoor Activities", icon: "🏔️" },
    { id: "fitness", title: "Fitness & Sports", icon: "💪" },
    { id: "culture", title: "Arts & Culture", icon: "🎨" },
    { id: "music", title: "Music & Events", icon: "🎵" },
    { id: "travel", title: "Travel & Tourism", icon: "✈️" },
    { id: "tech", title: "Technology", icon: "💻" },
    { id: "books", title: "Books & Reading", icon: "📚" },
    { id: "photography", title: "Photography", icon: "📸" },
  ];

  const steps = [
    { id: 0, title: "Basic Information", icon: User },
    { id: 1, title: "Location & Safety", icon: Shield },
    { id: 2, title: "Verification", icon: UserCheck },
    { id: 3, title: "Interests", icon: Heart },
    { id: 4, title: "Final Steps", icon: CheckCircle },
  ];

  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ];

  const renderStepIndicator = () => (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "center", 
      alignItems: "center", 
      paddingHorizontal: 20, 
      marginBottom: 30 
    }}>
      {steps.map((step, index) => (
        <View key={step.id} style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: index <= currentStep ? colors.primary : colors.surfaceElevated, 
            justifyContent: "center", 
            alignItems: "center" 
          }}>
            {index < currentStep ? (
              <CheckCircle size={20} color="#FFFFFF" />
            ) : (
              <step.icon size={20} color={index === currentStep ? "#FFFFFF" : colors.textSecondary} />
            )}
          </View>
          {index < steps.length - 1 && (
            <View style={{ 
              width: 30, 
              height: 2, 
              backgroundColor: index < currentStep ? colors.primary : colors.border, 
              marginHorizontal: 8 
            }} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderLocationSafety();
      case 2: return renderVerification();
      case 3: return renderInterests();
      case 4: return renderAgreement();
      default: return null;
    }
  };

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 20, 
        paddingHorizontal: 20, 
        paddingBottom: 20 
      }}>
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 20 
        }}>
          <TouchableOpacity 
            onPress={prevStep} 
            disabled={currentStep === 0} 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: currentStep === 0 ? colors.surfaceElevated : colors.primary, 
              justifyContent: "center", 
              alignItems: "center" 
            }}
          >
            <ArrowLeft size={20} color={currentStep === 0 ? colors.textSecondary : "#FFFFFF"} />
          </TouchableOpacity>
          
          <View style={{ alignItems: "center" }}>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 16, 
              color: colors.text 
            }}>
              Step {currentStep + 1} of {steps.length}
            </Text>
            <Text style={{ 
              fontFamily: "Inter_400Regular", 
              fontSize: 12, 
              color: colors.textSecondary 
            }}>
              {steps[currentStep].title}
            </Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
        {renderStepIndicator()}
      </View>

      {/* Content */}
      <ScrollView 
        ref={scrollRef} 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} 
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={{ 
        position: "absolute", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: colors.background, 
        paddingHorizontal: 20, 
        paddingTop: 20, 
        paddingBottom: insets.bottom + 10, 
        borderTopWidth: 1, 
        borderTopColor: colors.border 
      }}>
        <TouchableOpacity 
          onPress={currentStep === steps.length - 1 ? handleSignup : nextStep} 
          disabled={!validateStep(currentStep) || isLoading} 
          style={{ 
            backgroundColor: validateStep(currentStep) ? colors.primary : colors.border, 
            borderRadius: 12, 
            paddingVertical: 16, 
            alignItems: "center", 
            flexDirection: "row", 
            justifyContent: "center", 
            gap: 8, 
            opacity: isLoading ? 0.7 : 1 
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 16, 
                color: "#FFFFFF" 
              }}>
                {currentStep === steps.length - 1 ? "Create Account" : "Continue"}
              </Text>
              {currentStep < steps.length - 1 && (
                <ArrowRight size={20} color="#FFFFFF" />
              )}
            </>
          )}
        </TouchableOpacity>
        
        {/* Login Link */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')} 
          style={{ marginTop: 16, paddingBottom: 10 }}
        >
          <Text style={{ 
            fontFamily: "Inter_500Medium", 
            fontSize: 14, 
            color: colors.textSecondary, 
            textAlign: "center" 
          }}>
            Already have an account?{" "}
            <Text style={{ 
              color: colors.primary, 
              fontFamily: "Inter_700Bold" 
            }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // --- RENDER FUNCTIONS FOR EACH STEP ---

  function renderBasicInfo() {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ 
          fontFamily: "Inter_700Bold", 
          fontSize: 28, 
          color: colors.text, 
          textAlign: "center", 
          marginBottom: 8 
        }}>
          Welcome to SafeMeet
        </Text>
        <Text style={{ 
          fontFamily: "Inter_400Regular", 
          fontSize: 16, 
          color: colors.textSecondary, 
          textAlign: "center", 
          marginBottom: 30 
        }}>
          South Africa's safest social meetup platform
        </Text>
        
        <View style={{ gap: 16 }}>
          {/* First Name & Last Name Row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: colors.text, 
                marginBottom: 8 
              }}>
                First Name *
              </Text>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                backgroundColor: colors.surfaceElevated, 
                borderRadius: 12, 
                paddingHorizontal: 16 
              }}>
                <User size={20} color={colors.textSecondary} />
                <TextInput 
                  value={formData.firstName} 
                  onChangeText={(value) => updateFormData("firstName", value)} 
                  placeholder="First name" 
                  placeholderTextColor={colors.textTertiary} 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 16, 
                    paddingHorizontal: 12, 
                    fontFamily: "Inter_500Medium", 
                    fontSize: 16, 
                    color: colors.text 
                  }} 
                />
              </View>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: colors.text, 
                marginBottom: 8 
              }}>
                Last Name *
              </Text>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                backgroundColor: colors.surfaceElevated, 
                borderRadius: 12, 
                paddingHorizontal: 16 
              }}>
                <User size={20} color={colors.textSecondary} />
                <TextInput 
                  value={formData.lastName} 
                  onChangeText={(value) => updateFormData("lastName", value)} 
                  placeholder="Last name" 
                  placeholderTextColor={colors.textTertiary} 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 16, 
                    paddingHorizontal: 12, 
                    fontFamily: "Inter_500Medium", 
                    fontSize: 16, 
                    color: colors.text 
                  }} 
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 14, 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Email Address *
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: colors.surfaceElevated, 
              borderRadius: 12, 
              paddingHorizontal: 16 
            }}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput 
                value={formData.email} 
                onChangeText={(value) => updateFormData("email", value)} 
                placeholder="your.email@example.com" 
                placeholderTextColor={colors.textTertiary} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                style={{ 
                  flex: 1, 
                  paddingVertical: 16, 
                  paddingHorizontal: 12, 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: colors.text 
                }} 
              />
            </View>
          </View>

          {/* Phone */}
          <View>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 14, 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Phone Number *
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: colors.surfaceElevated, 
              borderRadius: 12, 
              paddingHorizontal: 16 
            }}>
              <Phone size={20} color={colors.textSecondary} />
              <TextInput 
                value={formData.phone} 
                onChangeText={(value) => updateFormData("phone", value)} 
                placeholder="+27 82 123 4567" 
                placeholderTextColor={colors.textTertiary} 
                keyboardType="phone-pad" 
                style={{ 
                  flex: 1, 
                  paddingVertical: 16, 
                  paddingHorizontal: 12, 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: colors.text 
                }} 
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 14, 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Password *
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: colors.surfaceElevated, 
              borderRadius: 12, 
              paddingHorizontal: 16 
            }}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput 
                value={formData.password} 
                onChangeText={(value) => updateFormData("password", value)} 
                placeholder="Create a strong password" 
                placeholderTextColor={colors.textTertiary} 
                secureTextEntry={!showPassword} 
                style={{ 
                  flex: 1, 
                  paddingVertical: 16, 
                  paddingHorizontal: 12, 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: colors.text 
                }} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 14, 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Confirm Password *
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: colors.surfaceElevated, 
              borderRadius: 12, 
              paddingHorizontal: 16 
            }}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput 
                value={formData.confirmPassword} 
                onChangeText={(value) => updateFormData("confirmPassword", value)} 
                placeholder="Confirm your password" 
                placeholderTextColor={colors.textTertiary} 
                secureTextEntry={!showConfirmPassword} 
                style={{ 
                  flex: 1, 
                  paddingVertical: 16, 
                  paddingHorizontal: 12, 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: colors.text 
                }} 
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <Text style={{ 
                fontFamily: "Inter_400Regular", 
                fontSize: 12, 
                color: colors.error, 
                marginTop: 4 
              }}>
                Passwords do not match
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  function renderLocationSafety() {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ 
          fontFamily: "Inter_700Bold", 
          fontSize: 28, 
          color: colors.text, 
          textAlign: "center", 
          marginBottom: 8 
        }}>
          Location & Safety
        </Text>
        <Text style={{ 
          fontFamily: "Inter_400Regular", 
          fontSize: 16, 
          color: colors.textSecondary, 
          textAlign: "center", 
          marginBottom: 30 
        }}>
          Help us keep you safe during meetups
        </Text>
        
        <View style={{ gap: 16 }}>
          {/* Address */}
          <View>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 14, 
              color: colors.text, 
              marginBottom: 8 
            }}>
              Home Address *
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: colors.surfaceElevated, 
              borderRadius: 12, 
              paddingHorizontal: 16 
            }}>
              <Home size={20} color={colors.textSecondary} />
              <TextInput 
                value={formData.address} 
                onChangeText={(value) => updateFormData("address", value)} 
                placeholder="123 Main Street, Suburb" 
                placeholderTextColor={colors.textTertiary} 
                style={{ 
                  flex: 1, 
                  paddingVertical: 16, 
                  paddingHorizontal: 12, 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: colors.text 
                }} 
              />
            </View>
          </View>

          {/* City & Province Row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: colors.text, 
                marginBottom: 8 
              }}>
                City *
              </Text>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                backgroundColor: colors.surfaceElevated, 
                borderRadius: 12, 
                paddingHorizontal: 16 
              }}>
                <Building size={20} color={colors.textSecondary} />
                <TextInput 
                  value={formData.city} 
                  onChangeText={(value) => updateFormData("city", value)} 
                  placeholder="Cape Town" 
                  placeholderTextColor={colors.textTertiary} 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 16, 
                    paddingHorizontal: 12, 
                    fontFamily: "Inter_500Medium", 
                    fontSize: 16, 
                    color: colors.text 
                  }} 
                />
              </View>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: colors.text, 
                marginBottom: 8 
              }}>
                Province *
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert(
                    "Select Province",
                    "",
                    provinces.map(province => ({
                      text: province,
                      onPress: () => updateFormData("province", province)
                    }))
                  );
                }}
                style={{ 
                  backgroundColor: colors.surfaceElevated, 
                  borderRadius: 12, 
                  paddingHorizontal: 16, 
                  paddingVertical: 16 
                }}
              >
                <Text style={{ 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: formData.province ? colors.text : colors.textTertiary 
                }}>
                  {formData.province || "Select Province"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Emergency Contacts Section */}
          <View style={{ 
            backgroundColor: colors.warning + "20", 
            borderRadius: 12, 
            padding: 16, 
            borderLeftWidth: 4, 
            borderLeftColor: colors.warning 
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Shield size={20} color={colors.warning} />
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 16, 
                color: colors.warning, 
                marginLeft: 8 
              }}>
                Emergency Contacts
              </Text>
            </View>
            <Text style={{ 
              fontFamily: "Inter_400Regular", 
              fontSize: 14, 
              color: colors.textSecondary, 
              marginBottom: 16 
            }}>
              These contacts will be notified in case of emergency.
            </Text>
            
            <View style={{ gap: 12 }}>
              {/* Emergency Contact 1 */}
              <View>
                <Text style={{ 
                  fontFamily: "Inter_600SemiBold", 
                  fontSize: 14, 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Emergency Contact 1 *
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 2 }}>
                    <View style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      backgroundColor: colors.background, 
                      borderRadius: 8, 
                      paddingHorizontal: 12 
                    }}>
                      <Phone size={16} color={colors.textSecondary} />
                      <TextInput 
                        value={formData.emergencyContact1} 
                        onChangeText={(value) => updateFormData("emergencyContact1", value)} 
                        placeholder="+27 82 123 4567" 
                        placeholderTextColor={colors.textTertiary} 
                        keyboardType="phone-pad" 
                        style={{ 
                          flex: 1, 
                          paddingVertical: 12, 
                          paddingHorizontal: 8, 
                          fontFamily: "Inter_500Medium", 
                          fontSize: 14, 
                          color: colors.text 
                        }} 
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput 
                      value={formData.emergencyRelation1} 
                      onChangeText={(value) => updateFormData("emergencyRelation1", value)} 
                      placeholder="Relation" 
                      placeholderTextColor={colors.textTertiary} 
                      style={{ 
                        backgroundColor: colors.background, 
                        borderRadius: 8, 
                        paddingVertical: 12, 
                        paddingHorizontal: 12, 
                        fontFamily: "Inter_500Medium", 
                        fontSize: 14, 
                        color: colors.text 
                      }} 
                    />
                  </View>
                </View>
              </View>

              {/* Emergency Contact 2 */}
              <View>
                <Text style={{ 
                  fontFamily: "Inter_600SemiBold", 
                  fontSize: 14, 
                  color: colors.text, 
                  marginBottom: 8 
                }}>
                  Emergency Contact 2 (Optional)
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 2 }}>
                    <View style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      backgroundColor: colors.background, 
                      borderRadius: 8, 
                      paddingHorizontal: 12 
                    }}>
                      <Phone size={16} color={colors.textSecondary} />
                      <TextInput 
                        value={formData.emergencyContact2} 
                        onChangeText={(value) => updateFormData("emergencyContact2", value)} 
                        placeholder="+27 82 123 4567" 
                        placeholderTextColor={colors.textTertiary} 
                        keyboardType="phone-pad" 
                        style={{ 
                          flex: 1, 
                          paddingVertical: 12, 
                          paddingHorizontal: 8, 
                          fontFamily: "Inter_500Medium", 
                          fontSize: 14, 
                          color: colors.text 
                        }} 
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput 
                      value={formData.emergencyRelation2} 
                      onChangeText={(value) => updateFormData("emergencyRelation2", value)} 
                      placeholder="Relation" 
                      placeholderTextColor={colors.textTertiary} 
                      style={{ 
                        backgroundColor: colors.background, 
                        borderRadius: 8, 
                        paddingVertical: 12, 
                        paddingHorizontal: 12, 
                        fontFamily: "Inter_500Medium", 
                        fontSize: 14, 
                        color: colors.text 
                      }} 
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  function renderVerification() {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ 
          fontFamily: "Inter_700Bold", 
          fontSize: 28, 
          color: colors.text, 
          textAlign: "center", 
          marginBottom: 8 
        }}>
          Identity Verification
        </Text>
        <Text style={{ 
          fontFamily: "Inter_400Regular", 
          fontSize: 16, 
          color: colors.textSecondary, 
          textAlign: "center", 
          marginBottom: 30 
        }}>
          Verify your identity to build trust in our community
        </Text>
        
        <View style={{ gap: 20 }}>
          {/* ID Number */}
          <View>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 14, 
              color: colors.text, 
              marginBottom: 8 
            }}>
              South African ID Number *
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              backgroundColor: colors.surfaceElevated, 
              borderRadius: 12, 
              paddingHorizontal: 16 
            }}>
              <CreditCard size={20} color={colors.textSecondary} />
              <TextInput 
                value={formData.idNumber} 
                onChangeText={(value) => updateFormData("idNumber", value)} 
                placeholder="0000000000000" 
                placeholderTextColor={colors.textTertiary} 
                keyboardType="numeric" 
                maxLength={13} 
                style={{ 
                  flex: 1, 
                  paddingVertical: 16, 
                  paddingHorizontal: 12, 
                  fontFamily: "Inter_500Medium", 
                  fontSize: 16, 
                  color: colors.text 
                }} 
              />
            </View>
          </View>

          {/* Document Upload Section */}
          <View style={{ 
            backgroundColor: colors.surface, 
            borderRadius: 16, 
            padding: 20, 
            gap: 16 
          }}>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 16, 
              color: colors.text 
            }}>
              Document Upload
            </Text>
            
            {/* ID Document Upload */}
            <TouchableOpacity 
              onPress={() => {
                Alert.alert("Upload ID Document", "This feature will be implemented with camera/gallery access.");
                updateFormData("idDocument", "mock_id_document.jpg");
              }}
              style={{ 
                backgroundColor: colors.surfaceElevated, 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 2, 
                borderColor: formData.idDocument ? colors.success : colors.border, 
                borderStyle: "dashed", 
                alignItems: 'center', 
                gap: 8 
              }}
            >
              {formData.idDocument ? (
                <CheckCircle size={32} color={colors.success} />
              ) : (
                <Upload size={32} color={colors.textSecondary} />
              )}
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: formData.idDocument ? colors.success : colors.text 
              }}>
                {formData.idDocument ? "ID Document Uploaded" : "Upload ID Document"}
              </Text>
              <Text style={{ 
                fontFamily: "Inter_400Regular", 
                fontSize: 12, 
                color: colors.textSecondary, 
                textAlign: "center" 
              }}>
                Clear photo of your SA ID (front and back)
              </Text>
            </TouchableOpacity>

            {/* Proof of Address Upload */}
            <TouchableOpacity 
              onPress={() => {
                Alert.alert("Upload Proof of Address", "This feature will be implemented with camera/gallery access.");
                updateFormData("proofOfAddress", "mock_proof_address.jpg");
              }}
              style={{ 
                backgroundColor: colors.surfaceElevated, 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 2, 
                borderColor: formData.proofOfAddress ? colors.success : colors.border, 
                borderStyle: "dashed", 
                alignItems: 'center', 
                gap: 8 
              }}
            >
              {formData.proofOfAddress ? (
                <CheckCircle size={32} color={colors.success} />
              ) : (
                <FileText size={32} color={colors.textSecondary} />
              )}
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: formData.proofOfAddress ? colors.success : colors.text 
              }}>
                {formData.proofOfAddress ? "Proof of Address Uploaded" : "Upload Proof of Address"}
              </Text>
              <Text style={{ 
                fontFamily: "Inter_400Regular", 
                fontSize: 12, 
                color: colors.textSecondary, 
                textAlign: "center" 
              }}>
                Recent utility bill or bank statement
              </Text>
            </TouchableOpacity>

            {/* Selfie Photo */}
            <TouchableOpacity 
              onPress={() => {
                Alert.alert("Take Selfie Photo", "This feature will be implemented with camera access.");
                updateFormData("selfiePhoto", "mock_selfie.jpg");
              }}
              style={{ 
                backgroundColor: colors.surfaceElevated, 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 2, 
                borderColor: formData.selfiePhoto ? colors.success : colors.border, 
                borderStyle: "dashed", 
                alignItems: 'center', 
                gap: 8 
              }}
            >
              {formData.selfiePhoto ? (
                <CheckCircle size={32} color={colors.success} />
              ) : (
                <Camera size={32} color={colors.textSecondary} />
              )}
              <Text style={{ 
                fontFamily: "Inter_600SemiBold", 
                fontSize: 14, 
                color: formData.selfiePhoto ? colors.success : colors.text 
              }}>
                {formData.selfiePhoto ? "Selfie Photo Taken" : "Take Selfie Photo"}
              </Text>
              <Text style={{ 
                fontFamily: "Inter_400Regular", 
                fontSize: 12, 
                color: colors.textSecondary, 
                textAlign: "center" 
              }}>
                Clear selfie for identity verification
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function renderInterests() {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ 
          fontFamily: "Inter_700Bold", 
          fontSize: 28, 
          color: colors.text, 
          textAlign: "center", 
          marginBottom: 8 
        }}>
          Your Interests
        </Text>
        <Text style={{ 
          fontFamily: "Inter_400Regular", 
          fontSize: 16, 
          color: colors.textSecondary, 
          textAlign: "center", 
          marginBottom: 30 
        }}>
          Select activities you enjoy to find like-minded people
        </Text>
        
        <View style={{ 
          flexDirection: "row", 
          flexWrap: "wrap", 
          gap: 12, 
          justifyContent: 'center' 
        }}>
          {interests.map((interest) => {
            const isSelected = formData.interests.includes(interest.id);
            return (
              <TouchableOpacity 
                key={interest.id} 
                onPress={() => {
                  const newInterests = isSelected 
                    ? formData.interests.filter(id => id !== interest.id) 
                    : [...formData.interests, interest.id];
                  updateFormData("interests", newInterests);
                }} 
                style={{ 
                  backgroundColor: isSelected ? colors.primary : colors.surfaceElevated, 
                  borderRadius: 20, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  flexDirection: "row", 
                  alignItems: "center", 
                  gap: 8, 
                  borderWidth: 2, 
                  borderColor: isSelected ? colors.primary : "transparent" 
                }}
              >
                <Text style={{ fontSize: 16 }}>{interest.icon}</Text>
                <Text style={{ 
                  fontFamily: "Inter_600SemiBold", 
                  fontSize: 14, 
                  color: isSelected ? "#FFFFFF" : colors.text 
                }}>
                  {interest.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  function renderAgreement() {
    const safetyPrefs = [
      { 
        key: "locationSharing", 
        title: "Location Sharing", 
        description: "Share location with contacts during meetups", 
        icon: MapPin 
      },
      { 
        key: "emergencyAlerts", 
        title: "Emergency Alerts", 
        description: "Send and receive emergency alerts", 
        icon: AlertTriangle 
      },
      { 
        key: "groupVerification", 
        title: "Group Verification", 
        description: "Only join groups with verified hosts", 
        icon: UserCheck 
      },
      { 
        key: "backgroundCheck", 
        title: "Background Check", 
        description: "Optional enhanced background verification", 
        icon: Shield 
      },
    ];

    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ 
          fontFamily: "Inter_700Bold", 
          fontSize: 28, 
          color: colors.text, 
          textAlign: "center", 
          marginBottom: 8 
        }}>
          Almost Done!
        </Text>
        <Text style={{ 
          fontFamily: "Inter_400Regular", 
          fontSize: 16, 
          color: colors.textSecondary, 
          textAlign: "center", 
          marginBottom: 30 
        }}>
          Review preferences and agree to our terms
        </Text>
        
        <View style={{ gap: 20 }}>
          {/* Safety Preferences */}
          <View style={{ 
            backgroundColor: colors.surface, 
            borderRadius: 16, 
            padding: 20, 
            gap: 16 
          }}>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 16, 
              color: colors.text 
            }}>
              Safety Preferences
            </Text>
            
            {safetyPrefs.map((pref) => (
              <View 
                key={pref.key} 
                style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  paddingVertical: 8 
                }}
              >
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  flex: 1, 
                  gap: 12 
                }}>
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: colors.surfaceElevated, 
                    justifyContent: "center", 
                    alignItems: "center" 
                  }}>
                    <pref.icon size={20} color={colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontFamily: "Inter_600SemiBold", 
                      fontSize: 14, 
                      color: colors.text, 
                      marginBottom: 2 
                    }}>
                      {pref.title}
                    </Text>
                    <Text style={{ 
                      fontFamily: "Inter_400Regular", 
                      fontSize: 12, 
                      color: colors.textSecondary 
                    }}>
                      {pref.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={formData.safetyPreferences[pref.key]}
                  onValueChange={(value) => updateSafetyPreference(pref.key, value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={formData.safetyPreferences[pref.key] ? "#FFFFFF" : colors.textSecondary}
                />
              </View>
            ))}
          </View>

          {/* Terms and Agreements */}
          <View style={{ gap: 16 }}>
            <Text style={{ 
              fontFamily: "Inter_600SemiBold", 
              fontSize: 16, 
              color: colors.text 
            }}>
              Terms & Agreements
            </Text>
            
            {/* Terms of Service */}
            <TouchableOpacity 
              onPress={() => updateFormData("termsAccepted", !formData.termsAccepted)}
              style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                gap: 12 
              }}
            >
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 6, 
                borderWidth: 2, 
                borderColor: formData.termsAccepted ? colors.primary : colors.border, 
                backgroundColor: formData.termsAccepted ? colors.primary : "transparent", 
                justifyContent: "center", 
                alignItems: "center" 
              }}>
                {formData.termsAccepted && (
                  <CheckCircle size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={{ 
                fontFamily: "Inter_500Medium", 
                fontSize: 14, 
                color: colors.text, 
                flex: 1 
              }}>
                I agree to the{" "}
                <Text style={{ color: colors.primary, textDecorationLine: "underline" }}>
                  Terms of Service
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity 
              onPress={() => updateFormData("privacyAccepted", !formData.privacyAccepted)}
              style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                gap: 12 
              }}
            >
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 6, 
                borderWidth: 2, 
                borderColor: formData.privacyAccepted ? colors.primary : colors.border, 
                backgroundColor: formData.privacyAccepted ? colors.primary : "transparent", 
                justifyContent: "center", 
                alignItems: "center" 
              }}>
                {formData.privacyAccepted && (
                  <CheckCircle size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={{ 
                fontFamily: "Inter_500Medium", 
                fontSize: 14, 
                color: colors.text, 
                flex: 1 
              }}>
                I agree to the{" "}
                <Text style={{ color: colors.primary, textDecorationLine: "underline" }}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Safety Guidelines */}
            <TouchableOpacity 
              onPress={() => updateFormData("safetyGuidelinesAccepted", !formData.safetyGuidelinesAccepted)}
              style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                gap: 12 
              }}
            >
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 6, 
                borderWidth: 2, 
                borderColor: formData.safetyGuidelinesAccepted ? colors.primary : colors.border, 
                backgroundColor: formData.safetyGuidelinesAccepted ? colors.primary : "transparent", 
                justifyContent: "center", 
                alignItems: "center" 
              }}>
                {formData.safetyGuidelinesAccepted && (
                  <CheckCircle size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={{ 
                fontFamily: "Inter_500Medium", 
                fontSize: 14, 
                color: colors.text, 
                flex: 1 
              }}>
                I have read and agree to the{" "}
                <Text style={{ color: colors.primary, textDecorationLine: "underline" }}>
                  Safety Guidelines
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
