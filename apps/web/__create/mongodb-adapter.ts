import type {
  AdapterUser,
  VerificationToken,
  Adapter,
  AdapterSession,
} from '@auth/core/adapters';
import type { ProviderType } from '@auth/core/providers';
import { ObjectId, type Db, type MongoClient } from 'mongodb';

interface MongoDBUser extends AdapterUser {
  accounts: {
    provider: string;
    providerAccountId: string;
    password?: string;
  }[];
}

interface MongoDBAdapter extends Adapter {
  createUser(data: AdapterUser): Promise<AdapterUser>;
  getUser(userId: string): Promise<AdapterUser | null>;
  getUserByEmail(email: string): Promise<MongoDBUser | null>;
  getUserByAccount(data: {
    provider: string;
    providerAccountId: string;
  }): Promise<AdapterUser | null>;
  linkAccount(data: {
    userId: string;
    provider: string;
    providerAccountId: string;
    type: ProviderType;
    access_token?: string | null;
    expires_at?: number | null;
    refresh_token?: string | null;
    id_token?: string | null;
    scope?: string | null;
    session_state?: string | null;
    token_type?: string | null;
    extraData?: Record<string, unknown>;
  }): Promise<void>;
}

// Helper to convert MongoDB _id to id for Auth.js compatibility
function formatDoc<T extends { _id?: ObjectId; id?: string }>(
  doc: T | null
): (Omit<T, '_id'> & { id: string }) | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id?.toHexString() ?? (doc.id as string),
  } as Omit<T, '_id'> & { id: string };
}

// Helper to convert string id to ObjectId
function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    // If invalid ObjectId, use the string as-is (for custom IDs)
    return new ObjectId();
  }
}

export default function MongoDBAdapter(
  clientPromise: Promise<MongoClient>,
  options: { databaseName?: string } = {}
): MongoDBAdapter {
  const getDb = async (): Promise<Db> => {
    const client = await clientPromise;
    // If databaseName is provided, use it; otherwise use database from connection string
    return options.databaseName 
      ? client.db(options.databaseName)
      : client.db(); // Uses database from connection string
  };

  return {
    async createVerificationToken(
      verificationToken: VerificationToken
    ): Promise<VerificationToken> {
      const db = await getDb();
      await db.collection('verification_tokens').insertOne({
        identifier: verificationToken.identifier,
        expires: verificationToken.expires,
        token: verificationToken.token,
      });
      return verificationToken;
    },

    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const db = await getDb();
      const result = await db
        .collection<VerificationToken>('verification_tokens')
        .findOneAndDelete({ identifier, token });
      if (!result) return null;
      return {
        identifier: result.identifier,
        expires: result.expires,
        token: result.token,
      };
    },

    async createUser(user: Omit<AdapterUser, 'id'>) {
      const db = await getDb();
      const result = await db.collection('users').insertOne({
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return {
        id: result.insertedId.toHexString(),
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image,
      };
    },

    async getUser(id: string) {
      const db = await getDb();
      try {
        const user = await db.collection('users').findOne({ _id: toObjectId(id) });
        return formatDoc(user) as AdapterUser | null;
      } catch {
        return null;
      }
    },

    async getUserByEmail(email: string) {
      const db = await getDb();
      const dbName = db.databaseName;
      try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[mongodb-adapter] User not found: ${email} in database: ${dbName}`);
          }
          return null;
        }

        const accounts = await db
          .collection('accounts')
          .find({ userId: user._id.toHexString() })
          .toArray();

        return {
          ...(formatDoc(user) as AdapterUser),
          accounts: accounts.map((acc) => ({
            provider: acc.provider,
            providerAccountId: acc.providerAccountId,
            password: acc.password,
          })),
        };
      } catch (error) {
        console.error(`[mongodb-adapter] Error getting user by email ${email} in database ${dbName}:`, error);
        throw error;
      }
    },

    async getUserByAccount({
      providerAccountId,
      provider,
    }): Promise<AdapterUser | null> {
      const db = await getDb();
      const account = await db
        .collection('accounts')
        .findOne({ provider, providerAccountId });
      if (!account) return null;

      const user = await db
        .collection('users')
        .findOne({ _id: toObjectId(account.userId) });
      return formatDoc(user) as AdapterUser | null;
    },

    async updateUser(user: Partial<AdapterUser>): Promise<AdapterUser> {
      const db = await getDb();
      const { id, ...updateData } = user;
      if (!id) throw new Error('User id is required for update');

      await db.collection('users').updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        }
      );

      const updatedUser = await db
        .collection('users')
        .findOne({ _id: toObjectId(id) });
      return formatDoc(updatedUser) as AdapterUser;
    },

    async linkAccount(account) {
      const db = await getDb();
      await db.collection('accounts').insertOne({
        userId: account.userId,
        provider: account.provider,
        type: account.type,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        expires_at: account.expires_at,
        refresh_token: account.refresh_token,
        id_token: account.id_token,
        scope: account.scope,
        session_state: account.session_state,
        token_type: account.token_type,
        password: account.extraData?.password,
        createdAt: new Date(),
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      const db = await getDb();
      const result = await db.collection('sessions').insertOne({
        sessionToken,
        userId,
        expires,
        createdAt: new Date(),
      });
      return {
        id: result.insertedId.toHexString(),
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken: string | undefined): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      if (!sessionToken) return null;
      const db = await getDb();

      const session = await db.collection('sessions').findOne({ sessionToken });
      if (!session) return null;

      const user = await db
        .collection('users')
        .findOne({ _id: toObjectId(session.userId) });
      if (!user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: formatDoc(user) as AdapterUser,
      };
    },

    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>
    ): Promise<AdapterSession | null | undefined> {
      const db = await getDb();
      const { sessionToken, ...updateData } = session;

      await db.collection('sessions').updateOne(
        { sessionToken },
        { $set: updateData }
      );

      const updatedSession = await db
        .collection('sessions')
        .findOne({ sessionToken });
      if (!updatedSession) return null;

      return {
        sessionToken: updatedSession.sessionToken,
        userId: updatedSession.userId,
        expires: updatedSession.expires,
      };
    },

    async deleteSession(sessionToken: string) {
      const db = await getDb();
      await db.collection('sessions').deleteOne({ sessionToken });
    },

    async unlinkAccount(partialAccount: {
      provider: string;
      providerAccountId: string;
    }) {
      const db = await getDb();
      await db.collection('accounts').deleteOne({
        provider: partialAccount.provider,
        providerAccountId: partialAccount.providerAccountId,
      });
    },

    async deleteUser(userId: string) {
      const db = await getDb();
      await db.collection('users').deleteOne({ _id: toObjectId(userId) });
      await db.collection('sessions').deleteMany({ userId });
      await db.collection('accounts').deleteMany({ userId });
    },
  };
}

