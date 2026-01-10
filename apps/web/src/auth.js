/**
 * WARNING: This file connects this app to Anythings's internal auth system. Do
 * not attempt to edit it. Modifying it will have no effect on your project as it is controlled by our system.
 * Do not import @auth/create or @auth/create anywhere else or it may break. This is an internal package.
 */
import CreateAuth from "@auth/create"
import Credentials from "@auth/core/providers/credentials"
import MongoDBAdapter from "../__create/mongodb-adapter"
import clientPromise from "./app/api/utils/mongodb"
import { hash, verify } from 'argon2'

const adapter = MongoDBAdapter(clientPromise);

export const { auth } = CreateAuth({
  providers: [Credentials({
  id: 'credentials-signin',
  name: 'Credentials Sign in',
  credentials: {
    email: {
      label: 'Email',
      type: 'email',
    },
    password: {
      label: 'Password',
      type: 'password',
    },
  },
  authorize: async (credentials) => {
    const { email, password } = credentials;
    if (!email || !password) {
      return null;
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return null;
    }

    // logic to verify if user exists
    const user = await adapter.getUserByEmail(email);
    if (!user) {
      return null;
    }
    const matchingAccount = user.accounts.find(
      (account) => account.provider === 'credentials'
    );
    const accountPassword = matchingAccount?.password;
    if (!accountPassword) {
      return null;
    }

    const isValid = await verify(accountPassword, password);
    if (!isValid) {
      return null;
    }

    // return user object with the their profile data
    return user;
  },
}),
  Credentials({
  id: 'credentials-signup',
  name: 'Credentials Sign up',
  credentials: {
    email: {
      label: 'Email',
      type: 'email',
    },
    password: {
      label: 'Password',
      type: 'password',
    },
    name: { label: 'Name', type: 'text', required: false },
    image: { label: 'Image', type: 'text', required: false },
  },
  authorize: async (credentials) => {
    const { email, password } = credentials;
    if (!email || !password) {
      return null;
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return null;
    }

    // logic to verify if user exists
    const user = await adapter.getUserByEmail(email);
    if (!user) {
      const newUser = await adapter.createUser({
        id: crypto.randomUUID(),
        emailVerified: null,
        email,
        name:
          typeof credentials.name === 'string' &&
          credentials.name.trim().length > 0
            ? credentials.name
            : undefined,
        image:
          typeof credentials.image === 'string'
            ? credentials.image
            : undefined,
      });
      await adapter.linkAccount({
        extraData: {
          password: await hash(password),
        },
        type: 'credentials',
        userId: newUser.id,
        providerAccountId: newUser.id,
        provider: 'credentials',
      });
      return newUser;
    }
    return null;
  },
})],
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
  },
})