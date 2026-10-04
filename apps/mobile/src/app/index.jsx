import { Redirect } from "expo-router";
import { useAuth } from "../utils/auth/useAuth";
import { hasCompleteProfile } from "../utils/auth/profile";
export default function Index() {
  const { auth } = useAuth();
  return <Redirect href={!auth ? "/signup" : hasCompleteProfile(auth.profile) ? "/(tabs)/discover" : "/complete-profile"} />;
}
