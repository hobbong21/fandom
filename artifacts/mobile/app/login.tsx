import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

type Mode = "login" | "register";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const isWeb = Platform.OS === "web";

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles = makeStyles(colors);

  const validate = (): string => {
    if (mode === "register" && !name.trim()) return t.nameRequired;
    if (!email.trim()) return t.emailRequired;
    if (!password) return t.passwordRequired;
    if (password.length < 6) return t.passwordShort;
    if (mode === "register" && password !== confirmPassword) return t.passwordMismatch;
    return "";
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (e.message === "invalid_credentials") setError(t.loginError);
      else if (e.message === "email_taken") {
        setError(language === "ko" ? "이미 사용 중인 이메일입니다" : "Email already in use");
      } else setError(t.loginError);
    }
    setLoading(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Language toggle */}
      <Pressable
        style={[styles.langBtn, { top: isWeb ? 20 : insets.top + 8 }]}
        onPress={toggleLanguage}
      >
        <Feather name="globe" size={14} color={colors.primary} />
        <Text style={styles.langBtnText}>{language === "ko" ? "EN" : "한국어"}</Text>
      </Pressable>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: isWeb ? 80 : insets.top + 60, paddingBottom: isWeb ? 34 : insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoEmoji}>🎤</Text>
            </View>
            <Text style={styles.appName}>{t.appName}</Text>
            <Text style={styles.welcomeText}>{t.loginWelcome}</Text>
            <Text style={styles.subtitle}>{t.loginSubtitle}</Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeBtn, mode === "login" && styles.modeBtnActive]}
              onPress={() => switchMode("login")}
            >
              <Text style={[styles.modeBtnText, mode === "login" && styles.modeBtnTextActive]}>
                {t.loginBtn}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === "register" && styles.modeBtnActive]}
              onPress={() => switchMode("register")}
            >
              <Text style={[styles.modeBtnText, mode === "register" && styles.modeBtnTextActive]}>
                {t.registerBtn}
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === "register" && (
              <View style={styles.inputWrap}>
                <Feather name="user" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={t.nameLabel}
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={t.emailLabel}
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputWrap}>
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={t.passwordLabel}
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType={mode === "register" ? "next" : "done"}
                onSubmitEditing={mode === "login" ? handleSubmit : undefined}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {mode === "register" && (
              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={t.confirmPasswordLabel}
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            )}

            {error.length > 0 && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.88 }, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? "..." : mode === "login" ? t.loginBtn : t.registerBtn}
              </Text>
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === "login" ? t.noAccount : t.hasAccount}{" "}
            </Text>
            <Pressable onPress={() => switchMode(mode === "login" ? "register" : "login")}>
              <Text style={styles.switchLink}>
                {mode === "login" ? t.signUpLink : t.signInLink}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    langBtn: {
      position: "absolute",
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      zIndex: 10,
      backgroundColor: colors.secondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    langBtnText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.primary,
    },
    scroll: {
      paddingHorizontal: 28,
      flexGrow: 1,
    },
    logoArea: {
      alignItems: "center",
      marginBottom: 32,
    },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    logoEmoji: {
      fontSize: 36,
    },
    appName: {
      fontSize: 32,
      fontWeight: "800" as const,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 10,
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "center",
      lineHeight: 30,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    modeToggle: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 4,
      marginBottom: 24,
    },
    modeBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 10,
    },
    modeBtnActive: {
      backgroundColor: colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    modeBtnText: {
      fontSize: 15,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
    },
    modeBtnTextActive: {
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    form: {
      gap: 12,
      marginBottom: 20,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 4,
      gap: 10,
    },
    inputIcon: {
      width: 22,
    },
    input: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 12,
    },
    eyeBtn: {
      padding: 4,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.destructive + "18",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    errorText: {
      fontSize: 13,
      color: colors.destructive,
      flex: 1,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
    },
    submitBtnText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    switchText: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    switchLink: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.primary,
    },
  });
