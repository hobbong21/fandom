import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface ArtistAvatarProps {
  avatarUrl?: string;
  emoji: string;
  size: number;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
}

export function ArtistAvatar({
  avatarUrl,
  emoji,
  size,
  borderColor,
  borderWidth = 0,
  backgroundColor = "rgba(255,255,255,0.2)",
}: ArtistAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const radius = size / 2;
  const showImage = !!avatarUrl && !imgError;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor,
        borderWidth,
        borderColor,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <Text style={{ fontSize: size * 0.44 }}>{emoji}</Text>
      )}
    </View>
  );
}
