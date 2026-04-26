import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import React, { Component, ComponentType, PropsWithChildren, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type ErrorFallbackProps = { error: Error; resetError: () => void };

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch {
      resetError();
    }
  };

  const monoFont = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {__DEV__ && (
        <Pressable
          onPress={() => setShowDetails(true)}
          style={[styles.detailBtn, { top: insets.top + 16, backgroundColor: colors.card }]}
        >
          <Feather name="alert-circle" size={20} color={colors.foreground} />
        </Pressable>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>오류가 발생했습니다</Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          앱을 재시작하면 계속 이용할 수 있습니다.
        </Text>
        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>재시작</Text>
        </Pressable>
      </View>

      {__DEV__ && (
        <Modal visible={showDetails} animationType="slide" transparent onRequestClose={() => setShowDetails(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>오류 상세</Text>
                <Pressable onPress={() => setShowDetails(false)} style={styles.closeBtn}>
                  <Feather name="x" size={24} color={colors.foreground} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}>
                <View style={[styles.errorBox, { backgroundColor: colors.card }]}>
                  <Text style={[styles.errorText, { color: colors.foreground, fontFamily: monoFont }]} selectable>
                    {`Error: ${error.message}\n\n${error.stack ?? ""}`}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

type ErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, stackTrace: string) => void;
}>;

type State = { error: Error | null };

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static defaultProps = { FallbackComponent: ErrorFallback };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    this.props.onError?.(error, info.componentStack);
  }

  resetError = () => this.setState({ error: null });

  render() {
    const { FallbackComponent = ErrorFallback } = this.props;
    return this.state.error
      ? <FallbackComponent error={this.state.error} resetError={this.resetError} />
      : this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  detailBtn: {
    position: "absolute", right: 16, width: 44, height: 44,
    borderRadius: 8, alignItems: "center", justifyContent: "center", zIndex: 10,
  },
  content: { alignItems: "center", gap: 16, maxWidth: 600, width: "100%" },
  title: { fontSize: 22, fontWeight: "700" as const, textAlign: "center" },
  message: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  button: {
    paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, minWidth: 160,
  },
  buttonText: { fontWeight: "600" as const, fontSize: 16, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { width: "100%", height: "90%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "600" as const },
  closeBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  modalScroll: { flex: 1 },
  errorBox: { borderRadius: 8, padding: 14 },
  errorText: { fontSize: 12, lineHeight: 18 },
});
