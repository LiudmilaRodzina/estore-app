import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import { authConfig } from './auth.config';
import { cookies } from 'next/headers';

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and if password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string, // comes from the form
            user.password // fetched from the database
          );

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // If user does not exist or password does not match, return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // Set the user Id from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // If there is an update, set the new user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },

    async jwt({ session, user, trigger, token }: any) {
      // Assign user fields to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // If user has no name then use email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // Update database to reflect the token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            // get sessionCartId from db
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId: sessionCartId }, // match value from cookies to db
            });

            if (sessionCart) {
              // delete the current cart user has in db
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // assign a new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      return token;
    },

    ...authConfig.callbacks,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
