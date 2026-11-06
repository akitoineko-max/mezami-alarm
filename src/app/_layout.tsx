import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlarmProvider } from '../store/AlarmContext';

export default function RootLayout() {
  return (
    <AlarmProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'めざみアラーム' }} />
        <Stack.Screen
          name="edit"
          options={{ presentation: 'modal', title: 'アラーム' }}
        />
      </Stack>
    </AlarmProvider>
  );
}
