import { cn } from "@/src/lib/utils";
import { Icon } from "@/src/shared/ui/icon";
import { Text } from "@/src/shared/ui/text";
import { usePathname, useRouter } from "expo-router";
import {
  ArrowLeftRight,
  Home,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import { Platform, Pressable, StyleSheet, View } from "react-native";

const TABS = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Início",
    icon: Home,
  },
  {
    key: "transactions",
    href: "/transactions",
    label: "Transações",
    icon: ArrowLeftRight,
  },
  {
    key: "account",
    href: "/account",
    label: "Conta",
    icon: UserRound,
  },
] as const satisfies ReadonlyArray<{
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
}>;

function getActiveTab(pathname: string) {
  if (pathname.startsWith("/transactions")) return "transactions";
  if (pathname.startsWith("/account")) return "account";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return null;
}

const ACTIVE_COLOR = "#007F5F";
const MUTED_COLOR = "#ADADAD";

export function AppBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  const handleNavigate = (href: (typeof TABS)[number]["href"]) => {
    if (pathname === href) return;
    router.replace(href);
  };

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Navegação principal"
      className="flex-row items-center rounded-[28px] bg-gray-100 px-2 py-3"
      style={styles.bar}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => handleNavigate(tab.href)}
            className={cn(
              "min-h-12 flex-1 flex-col items-center justify-center rounded-2xl px-2",
              Platform.select({
                web: "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
              }),
            )}
          >
            <Icon
              as={tab.icon}
              size={22}
              color={isActive ? ACTIVE_COLOR : MUTED_COLOR}
              fill={isActive ? ACTIVE_COLOR : "transparent"}
              className={isActive ? "text-brand-600" : "text-gray-500"}
            />
            <Text
              variant="muted"
              className={cn(
                "mt-1 text-[11px] font-medium",
                isActive ? "text-brand-600" : "text-gray-500",
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: "0 10px 32px rgba(0, 0, 0, 0.08)",
      },
    }),
  },
});
