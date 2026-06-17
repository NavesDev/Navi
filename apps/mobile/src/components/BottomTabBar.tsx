import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export type TabType = 'chat' | 'finances' | 'routines' | 'settings';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  const tabs: { type: TabType; label: string; icon: string }[] = [
    { type: 'chat', label: 'Chat', icon: 'chat-bubble-outline' },
    { type: 'finances', label: 'Finanças', icon: 'account-balance-wallet' },
    { type: 'routines', label: 'Rotinas', icon: 'event-note' },
    { type: 'settings', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.type;
        return (
          <TouchableOpacity
            key={tab.type}
            style={styles.tabButton}
            onPress={() => onTabPress(tab.type)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={isActive ? theme.colors.primary : '#6E6E6E'}
              style={styles.icon}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: '#6E6E6E',
  },
  activeLabel: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },
});
