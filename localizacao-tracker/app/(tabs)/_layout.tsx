import { Tabs } from 'expo-router';
import React from 'react';
import { Home } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { trackerColors } from '@/constants/trackerTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: trackerColors.primaryLight,
        tabBarInactiveTintColor: trackerColors.textSubtle,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
