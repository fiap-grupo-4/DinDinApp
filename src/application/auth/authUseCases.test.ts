import { CreateUserRequest } from "@domain/auth/entities/User";
import { ValidationError } from "@domain/shared/errors";
import { FakeAuthRepository } from "@/src/test/fakes/FakeAuthRepository";
import { beforeEach, describe, expect, it } from "vitest";
import {
  forgotPassword,
  getProfile,
  register,
  signIn,
  signOut,
} from "./authUseCases";

let repo: FakeAuthRepository;

const request: CreateUserRequest = {
  fullName: "Maria",
  email: "maria@x.com",
  birthday: "2000-01-01",
  password: "123456",
  confirmPassword: "123456",
};

beforeEach(() => {
  repo = new FakeAuthRepository();
});

describe("signIn", () => {
  it("repassa e-mail trimado", async () => {
    await signIn(repo, "  a@b.com ", "pw");
    expect(repo.calls.signIn).toEqual([{ email: "a@b.com", password: "pw" }]);
  });

  it.each([
    ["", "pw"],
    ["   ", "pw"],
    ["a@b.com", ""],
  ])("rejeita %j / %j", async (email, password) => {
    await expect(signIn(repo, email, password)).rejects.toThrow(
      "Informe e-mail e senha.",
    );
    expect(repo.calls.signIn).toHaveLength(0);
  });
});

describe("register", () => {
  it("repassa quando as senhas coincidem", async () => {
    await register(repo, request);
    expect(repo.calls.register).toHaveLength(1);
  });

  it("aceita sem confirmPassword", async () => {
    await register(repo, { ...request, confirmPassword: undefined });
    expect(repo.calls.register).toHaveLength(1);
  });

  it("rejeita senhas diferentes", async () => {
    await expect(
      register(repo, { ...request, confirmPassword: "outra" }),
    ).rejects.toThrow("As senhas não coincidem.");
    expect(repo.calls.register).toHaveLength(0);
  });
});

describe("forgotPassword", () => {
  it("repassa o e-mail", async () => {
    await forgotPassword(repo, "a@b.com");
    expect(repo.calls.forgotPassword).toEqual(["a@b.com"]);
  });

  it("rejeita e-mail vazio", async () => {
    await expect(forgotPassword(repo, "  ")).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(repo.calls.forgotPassword).toHaveLength(0);
  });
});

describe("signOut / getProfile", () => {
  it("repassam ao repositório", async () => {
    await signOut(repo);
    await getProfile(repo, "u1");
    expect(repo.calls.signOut).toBe(1);
    expect(repo.calls.getProfile).toEqual(["u1"]);
  });
});
