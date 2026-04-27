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

type Mode = "splash" | "login" | "register";

const FEATURES = [
  { emoji: "🎤", title: "아티스트와 직접 대화", desc: "메시지·음성·라이브" },
  { emoji: "🌺", title: "꽃밭 등급 응원", desc: "응원이 쌓일수록 가까이" },
  { emoji: "🎫", title: "공연·굿즈 우선구매", desc: "특공대만의 혜택" },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const isWeb = Platform.OS === "web";

  const [mode, setMode] = useState<Mode>(isWeb ? "login" : "splash");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles = makeStyles(colors);

  const isDark = colors.background === "#09090b" || colors.background.startsWith("#0");

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
    if (err) { setError(err); return; }
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
    setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
  };

  /* ── SPLASH SCREEN ── */
  if (mode === "splash") {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#0a0010" : "#faf7ff" }}>
        {/* Decorative circles */}
        <View style={{
          position: "absolute", top: -80, right: -60,
          width: 280, height: 280, borderRadius: 140,
          backgroundColor: colors.primary + "18",
        }} />
        <View style={{
          position: "absolute", bottom: 120, left: -80,
          width: 220, height: 220, borderRadius: 110,
          backgroundColor: "#ec4899" + "12",
        }} />

        {/* Lang toggle */}
        <Pressable
          style={{ position: "absolute", top: insets.top + 12, right: 20, zIndex: 10,
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.08)",
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
          }}
          onPress={toggleLanguage}
        >
          <Feather name="globe" size={13} color={colors.primary} />
          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
            {language === "ko" ? "EN" : "한국어"}
          </Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40, paddingHorizontal: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View style={{
              width: 90, height: 90, borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: "center", justifyContent: "center",
              marginBottom: 20,
              shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
            }}>
              <Text style={{ fontSize: 42 }}>🌹</Text>
            </View>
            <Text style={{
              fontSize: 42, fontWeight: "900", color: colors.primary,
              letterSpacing: -1.5, marginBottom: 6,
            }}>
              {t.appName}
            </Text>
            <View style={{
              backgroundColor: colors.primary + "15", borderRadius: 20,
              paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
            }}>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600", letterSpacing: 0.3 }}>
                {language === "ko" ? "스타를 사랑하는 팬들의 연결 공간" : "A space where fans who love stars connect"}
              </Text>
            </View>
            <Text style={{
              fontSize: 22, fontWeight: "700",
              color: colors.foreground,
              textAlign: "center",
              lineHeight: 32,
              letterSpacing: -0.4,
            }}>
              {language === "ko"
                ? "내가 사랑하는 가수와\n가장 가까이서 만나는 시간"
                : "Closer to the artists\nyou love"}
            </Text>
          </View>

          {/* Feature bullets */}
          <View style={{ gap: 14, marginBottom: 44 }}>
            {FEATURES.map((f) => (
              <View key={f.title} style={{
                flexDirection: "row", alignItems: "center", gap: 16,
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                borderRadius: 18, padding: 16,
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.1)",
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 8, elevation: 2,
              }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 16,
                  backgroundColor: colors.primary + "18",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 22 }}>{f.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>
                    {f.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#6d28d9" : colors.primary,
              borderRadius: 18, paddingVertical: 18, alignItems: "center",
              marginBottom: 16,
              shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
            })}
            onPress={() => switchMode("register")}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#ffffff", letterSpacing: 0.2 }}>
              {language === "ko" ? "시작하기" : "Get Started"}
            </Text>
          </Pressable>

          <Pressable
            style={{ alignItems: "center", paddingVertical: 12 }}
            onPress={() => switchMode("login")}
          >
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
              {language === "ko" ? "이미 계정이 있으신가요? " : "Already have an account? "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                {language === "ko" ? "로그인" : "Sign In"}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  /* ── LOGIN / REGISTER FORM ── */
  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0a0010" : "#faf7ff" }]}>
      {/* Decorative top circle */}
      <View style={{
        position: "absolute", top: -60, right: -40,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: colors.primary + "14",
      }} />

      {/* Language toggle */}
      <Pressable
        style={[styles.langBtn, { top: isWeb ? 20 : insets.top + 8 }]}
        onPress={toggleLanguage}
      >
        <Feather name="globe" size={14} color={colors.primary} />
        <Text style={styles.langBtnText}>{language === "ko" ? "EN" : "한국어"}</Text>
      </Pressable>

      {/* Back to splash (mobile only) */}
      {!isWeb && (
        <Pressable
          style={{ position: "absolute", top: insets.top + 10, left: 20, zIndex: 10,
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
          }}
          onPress={() => switchMode("splash")}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: isWeb ? 80 : insets.top + 70, paddingBottom: isWeb ? 34 : insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary,
              shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
            }]}>
              <Text style={styles.logoEmoji}>🌹</Text>
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>{t.appName}</Text>
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
              style={({ pressed }) => [styles.submitBtn,
                pressed && { opacity: 0.88 },
                loading && { opacity: 0.7 },
              ]}
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
    container: { flex: 1 },
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
    langBtnText: { fontSize: 13, fontWeight: "600" as const, color: colors.primary },
    scroll: { paddingHorizontal: 28, flexGrow: 1 },
    logoArea: { alignItems: "center", marginBottom: 28 },
    logoCircle: {
      width: 76, height: 76, borderRadius: 24,
      alignItems: "center", justifyContent: "center", marginBottom: 14,
    },
    logoEmoji: { fontSize: 36 },
    appName: {
      fontSize: 34, fontWeight: "900" as const,
      letterSpacing: -1, marginBottom: 10,
    },
    welcomeText: {
      fontSize: 20, fontWeight: "700" as const,
      color: colors.foreground, textAlign: "center", lineHeight: 28, marginBottom: 6,
    },
    subtitle: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    modeToggle: {
      flexDirection: "row", backgroundColor: colors.muted,
      borderRadius: 14, padding: 4, marginBottom: 24,
    },
    modeBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
    modeBtnActive: {
      backgroundColor: colors.background,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    modeBtnText: { fontSize: 15, fontWeight: "500" as const, color: colors.mutedForeground },
    modeBtnTextActive: { fontWeight: "700" as const, color: colors.foreground },
    form: { gap: 12, marginBottom: 20 },
    inputWrap: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.muted, borderRadius: 14,
      paddingHorizontal: 14, paddingVertical: 4, gap: 10,
    },
    inputIcon: { width: 22 },
    input: { flex: 1, fontSize: 15, paddingVertical: 12 },
    eyeBtn: { padding: 4 },
    errorBox: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.destructive + "18",
      borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    },
    errorText: { fontSize: 13, color: colors.destructive, flex: 1 },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16, paddingVertical: 16,
      alignItems: "center", marginTop: 4,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    submitBtnText: { fontSize: 16, fontWeight: "800" as const, color: colors.primaryForeground },
    switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
    switchText: { fontSize: 14, color: colors.mutedForeground },
    switchLink: { fontSize: 14, fontWeight: "700" as const, color: colors.primary },
  });
