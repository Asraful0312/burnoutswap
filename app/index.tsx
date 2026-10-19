import { Redirect } from 'expo-router';

import { useUserStore } from '@/store/userStore';

export default function IndexScreen() {
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  return <Redirect href={hasCompletedOnboarding ? '/(tabs)' : '/onboarding'} />;
}
