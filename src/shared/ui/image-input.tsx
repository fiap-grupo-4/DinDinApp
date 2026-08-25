import { Icon } from "@/src/shared/ui/icon";
import { Text } from "@/src/shared/ui/text";
import { cn } from "@/src/lib/utils";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X } from "lucide-react-native";
import { Alert, Image, Pressable, View } from "react-native";

type ImageInputProps = {
  value?: string;
  onChange: (uri: string | undefined) => void;
  disabled?: boolean;
  className?: string;
};

export function ImageInput({
  value,
  onChange,
  disabled,
  className,
}: ImageInputProps) {
  async function handlePick() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso às suas fotos para anexar um comprovante.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      onChange(result.assets[0].uri);
    }
  }

  if (value) {
    return (
      <View className={cn("relative self-start", className)}>
        <Image
          source={{ uri: value }}
          className="h-32 w-32 rounded-md"
          resizeMode="cover"
        />
        {!disabled && (
          <Pressable
            onPress={() => onChange(undefined)}
            hitSlop={8}
            accessibilityLabel="Remover imagem"
            className="bg-destructive absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full"
          >
            <Icon as={X} size={14} className="text-white" />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePick}
      disabled={disabled}
      className={cn(
        "border-input bg-background h-32 w-32 items-center justify-center gap-1 self-start rounded-md border border-dashed",
        disabled && "opacity-50",
        className,
      )}
    >
      <Icon as={ImagePlus} size={22} className="text-muted-foreground" />
      <Text variant="muted" className="text-center text-xs">
        Adicionar{"\n"}comprovante
      </Text>
    </Pressable>
  );
}

export default ImageInput;
