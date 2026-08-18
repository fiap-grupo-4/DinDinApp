import { useAuthState } from "@/src/features/auth/providers/AuthProvider";
import { User } from "@domain/auth/entities/User";
import { getProfile } from "@domain/auth/use-cases/authUseCases";
import { useAuthRepository } from "@features/auth/providers/AuthRepositoryProvider";
import { useEffect, useState } from "react";

function toFallbackProfile(
  uid: string,
  email: string,
  displayName: string | null,
): User {
  return {
    uid,
    email,
    fullName: displayName?.trim() || "",
    birthday: "",
    createdAt: "",
  };
}

export function useCurrentUserProfile() {
  const { user } = useAuthState();
  const repository = useAuthRepository();
  const uid = user?.uid;
  const email = user?.email ?? "";
  const displayName = user?.displayName ?? null;

  const [profile, setProfile] = useState<User | null>(
    uid ? toFallbackProfile(uid, email, displayName) : null,
  );

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }

    const fallback = toFallbackProfile(uid, email, displayName);
    let isCancelled = false;

    setProfile(fallback);

    getProfile(repository, uid)
      .then((data) => {
        if (isCancelled) return;

        if (!data) {
          setProfile(fallback);
          return;
        }

        setProfile({
          ...data,
          email: data.email || fallback.email,
          fullName: data.fullName || fallback.fullName,
        });
      })
      .catch(() => {
        if (isCancelled) return;
        setProfile(fallback);
      });

    return () => {
      isCancelled = true;
    };
  }, [repository, uid, email, displayName]);

  return { profile };
}
