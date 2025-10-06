import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					const { email, password } = credentials;
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/administrator/authentication/login`,
						{
							method: "POST",
							body: JSON.stringify({ email, password }),
							headers: { "Content-Type": "application/json" },
						}
					);

					const data = await res.json();
					console.log("Auth Response:", data);

					// Ensure the request was successful
					if (!res.ok || !data.status || !data.data) {
						console.error("Authentication failed:", data.error || data.message);
						return null;
					}

					// Return a properly structured user object
					return {
						id: data.data.id,
						email, // since your API doesn’t return email directly
						role: data.data.role || "user", // fallback if no role provided
						accessToken: data.data.token,
					};
				} catch (error) {
					console.error("Error in authorize function:", error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.accessToken;
				token.email = user.email;
				token.role = user.role;
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.user = {
				id: token.id,
				email: token.email,
				role: token.role,
			};
			return session;
		},
		async redirect({ url, baseUrl }) {
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	pages: {
		signIn: "/",
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
