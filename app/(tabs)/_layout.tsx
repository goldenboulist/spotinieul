import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { MiniPlayer } from '@/components/mini-player';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppColors, useThemeColor } from '@/hooks/use-theme-color';
import { Fontisto, Ionicons, Octicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colors = useAppColors();
  const themeColor = useThemeColor();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeColor,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.icon + '40',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="task"
          options={{
            title: 'Task',
            tabBarIcon: ({ color }) => <Octicons size={28} name="tasklist" color={color} />,
          }}
        />
        <Tabs.Screen
          name="flashcards"
          options={{
            title: 'Flashcards',
            tabBarIcon: ({ color }) => <Fontisto size={22} name="pingdom" color={color} />,
          }}
        />
        <Tabs.Screen
          name="parameters"
          options={{
            title: 'Parameters',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="settings" color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
