import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { formatDate, formatCurrency } from '@navi/shared';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navi Mobile App</Text>
      <Text style={styles.text}>Welcome to Navi AI Personal Assistant</Text>
      <Text style={styles.small}>
        Today: {formatDate(new Date())} | Initial Balance: {formatCurrency(150000)}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  small: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
