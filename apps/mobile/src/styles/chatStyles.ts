import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.headline,
    fontSize: 20,
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  messageList: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: '#8C8C8C',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  aiBubble: {
    backgroundColor: theme.colors.primaryContainer,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: theme.colors.onSurface,
  },
  aiText: {
    color: theme.colors.onPrimaryContainer,
  },
  searchContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.secondary,
  },
  searchLoader: {
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: theme.colors.onSurface,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4A4A4A',
  },
});
