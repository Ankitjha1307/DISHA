import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import type { Role } from "../models/common";
import { User, type UserDocument } from "../models/User";
import { ApiError } from "../utils/ApiError";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type UserWithId = UserDocument & { _id: Types.ObjectId };

export function toPublicUser(user: UserWithId): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function registerCitizen(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();

  if (await User.exists({ email })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await User.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: "citizen",
    });

    return toPublicUser(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, "An account with this email already exists");
    }

    throw error;
  }
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({
    email: input.email.trim().toLowerCase(),
  }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  return toPublicUser(user);
}

export async function findPublicUserById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id);

  return user ? toPublicUser(user) : null;
}
