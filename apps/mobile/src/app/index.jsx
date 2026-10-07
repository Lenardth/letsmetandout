import { Redirect } from "expo-router";
import { useAuth } from "../utils/auth/useAuth";
import { hasCompleteProfile } from "../utils/auth/profile";
import { useExperience } from "../utils/experience";
export default function Index() {
  const { auth } = useAuth();
  const { mode, ready } = useExperience();
  if (!ready) return null;
  return <Redirect href={!auth ? "/signup" : !mode ? "/choose-experience" : !hasCompleteProfile(auth.profile) ? "/complete-profile" : mode === "provider" ? "/(tabs)/provider" : "/(tabs)/stores"} />;
}
