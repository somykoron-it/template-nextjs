import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/libs/dbConnect';
import { UserModel } from '@/libs/models/user.model';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      id: 'credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials, req) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        await dbConnect();
        try {
          const user = await UserModel.findOne({ email, provider: 'credentials' });
          if (user) {
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      const { email } = user;
      let existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        if (existingUser.provider !== account?.provider) {
          return false;
        }
      }

      if (account?.provider === 'credentials') {
        return true;
      }

      if (account?.provider === 'google') {
        try {
          if (!existingUser) {
            await UserModel.create({
              name: user.name,
              email: email,
              provider: 'google',
            });
          }
          return true;
        } catch (error) {
          console.error('Error saving user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token }) {
      await dbConnect();
      if (token.email) {
        const user = await UserModel.findOne({ email: token.email });
        if (user) {
          token.accessToken = user.access_token;
          token.id = user._id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          _id: token._id,
        },
      };
    },
  },
};
