export interface User {
  uid: string;
  fullName: string;
  email: string;
  birthday: string;
  createdAt: string;
}

export interface CreateUserRequest extends Omit<User, "uid" | "createdAt"> {
  password: string;
  confirmPassword?: string;
}
