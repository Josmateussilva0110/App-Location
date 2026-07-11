import { View, Text } from "react-native";
import { Loader } from "lucide-react-native";

import { trackerColors, trackerLayout } from "@/constants/trackerTheme";

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={trackerLayout.container}>
      <View style={trackerLayout.loadingContainer}>
        <Loader size={40} color={trackerColors.primary} />
        {message ? (
          <Text style={trackerLayout.loadingText}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
}
