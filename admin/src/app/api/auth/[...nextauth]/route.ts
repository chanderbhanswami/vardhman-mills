import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

interface ExtendedUser extends User {
  role: string;
  token: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('NextAuth authorize function called with:', credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Making request to backend API...');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log('Backend response status:', response.status);
          const data = await response.json();
          console.log('Auth response data:', JSON.stringify(data, null, 2));
          console.log('User role:', data.data?.user?.role);

          if (response.ok && data.data?.user?.role === 'admin') {
            console.log('Authentication successful, returning user data');
            return {
              id: data.data.user._id,
              email: data.data.user.email,
              name: `${data.data.user.firstName} ${data.data.user.lastName}`,
              role: data.data.user.role,
              token: data.token,
            } as ExtendedUser;
          }

          console.log('Authentication failed: invalid response or not admin');
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.accessToken = extendedUser.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Extend the session with custom properties
        const extendedSession = session as typeof session & {
          user: typeof session.user & { role: string };
          accessToken: string;
        };
        extendedSession.user.role = token.role as string;
        extendedSession.accessToken = token.accessToken as string;
        return extendedSession;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
