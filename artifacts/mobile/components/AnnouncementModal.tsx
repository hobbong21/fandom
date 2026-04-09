import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface AnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AnnouncementModal({ visible, onClose }: AnnouncementModalProps) {
  const colors = useColors();
  const { t } = useLanguage();
  const styles = makeStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.iconRow}>
            <View style={styles.iconWrap}>
              <Feather name="bell" size={26} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>{t.announcementTitle}</Text>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.content}>{t.announcementContent}</Text>
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{t.announcementClose}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
      maxHeight: "75%",
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 20,
    },
    iconRow: {
      alignItems: "center",
      marginBottom: 14,
    },
    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 16,
    },
    contentScroll: {
      marginBottom: 24,
    },
    content: {
      fontSize: 15,
      color: colors.mutedForeground,
      lineHeight: 24,
    },
    closeBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
    },
    closeBtnText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
    },
  });
