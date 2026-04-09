import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnnouncementModal } from "@/components/AnnouncementModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FandomProvider } from "@/context/FandomContext";
import { LanguageProvider } from "@/context/LanguageContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => setShowAnnouncement(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (isLoading) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" redirect />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="fandom/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="login" redirect />
          </>
        )}
      </Stack>

      {!isAuthenticated && <Redirect href="/login" />}

      <AnnouncementModal
        visible={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <FandomProvider>
                    <RootLayoutNav />
                  </FandomProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
