import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_ID = 'recharge-daily-reminder';

// How notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule (or reschedule) the daily reminder.
 * @param time  '20:00' style 24-hour string
 */
export async function scheduleDailyReminder(time: string): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  // Cancel any existing reminder before creating a new one
  await cancelDailyReminder();

  const [hour, minute] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: 'Your tiny reset is waiting.',
      body: "One real thing is enough. Ember is here whenever you're ready.",
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => {
    // Notification may not exist yet — that's fine
  });
}
