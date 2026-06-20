import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';

interface MarkdownRendererProps {
  text: string;
  isUser: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, isUser }) => {
  const textColor = theme.colors.onSurface;

  // Split by line to parse line-by-line formatting like lists and headers
  const lines = text.split('\n');

  const parseInlineStyles = (lineText: string) => {
    // Parse bold text like: **bold**
    // Match anything between ** and **
    const parts = lineText.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text
            key={index}
            style={[
              styles.boldText,
              { color: textColor, fontFamily: theme.fonts.semibold }
            ]}
          >
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 1. Headers (e.g. ### Header or ## Header or # Header)
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const headerText = match[2];
            const fontSize = level === 1 ? 20 : level === 2 ? 18 : 16;
            
            return (
              <Text
                key={index}
                style={[
                  styles.headerText,
                  {
                    fontSize,
                    color: textColor,
                    fontFamily: theme.fonts.headline,
                    marginTop: index > 0 ? 12 : 2,
                    marginBottom: 6,
                  },
                ]}
              >
                {parseInlineStyles(headerText)}
              </Text>
            );
          }
        }

        // 2. Unordered lists (e.g., - item or * item)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color: textColor }]}>•</Text>
              <Text style={[styles.bulletText, { color: textColor, fontFamily: theme.fonts.body }]}>
                {parseInlineStyles(content)}
              </Text>
            </View>
          );
        }

        // 3. Ordered lists (e.g., 1. item)
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          const num = orderedMatch[1];
          const content = orderedMatch[2];
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={[styles.bulletNumber, { color: textColor, fontFamily: theme.fonts.semibold }]}>
                {num}.
              </Text>
              <Text style={[styles.bulletText, { color: textColor, fontFamily: theme.fonts.body }]}>
                {parseInlineStyles(content)}
              </Text>
            </View>
          );
        }

        // 4. Regular text (or empty line representing a paragraph break)
        if (trimmed === '') {
          // If it's an empty line and not the last line, render a spacing view
          if (index < lines.length - 1) {
            return <View key={index} style={styles.paragraphSpacer} />;
          }
          return null;
        }

        return (
          <Text
            key={index}
            style={[
              styles.bodyText,
              { color: textColor, fontFamily: theme.fonts.body },
            ]}
          >
            {parseInlineStyles(line)}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boldText: {
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
  headerText: {
    fontWeight: 'bold',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: 8,
  },
  bulletNumber: {
    fontSize: 14,
    lineHeight: 20,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  paragraphSpacer: {
    height: 8,
  },
});
