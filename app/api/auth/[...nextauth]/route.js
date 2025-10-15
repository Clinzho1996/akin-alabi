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
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/admin/signin`,
						{
							method: "POST",
							body: JSON.stringify({ email, password }),
							headers: { "Content-Type": "application/json" },
						}
					);

					const data = await res.json();
					console.log("Auth Response:", data);

					// Check if the request was successful based on your API structure
					if (!res.ok || data.status !== "success" || !data.data) {
						console.error("Authentication failed:", data.message);
						return null;
					}

					// Return user object matching your API response structure
					return {
						id: data.data.id,
						email: data.data.email,
						firstName: data.data.first_name,
						lastName: data.data.last_name,
						staffCode: data.data.staff_code,
						phone: data.data.phone,
						role: data.data.role,
						isActive: data.data.is_active,
						lastLoggedIn: data.data.last_logged_in,
						createdAt: data.data.created_at,
						updatedAt: data.data.updated_at,
						accessToken: data.token, // token is at root level, not in data
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
			// Add user info to token on sign in
			if (user) {
				token.accessToken = user.accessToken;
				token.user = {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					staffCode: user.staffCode,
					phone: user.phone,
					role: user.role,
					isActive: user.isActive,
					lastLoggedIn: user.lastLoggedIn,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				};
			}
			return token;
		},
		async session({ session, token }) {
			// Send user properties to the client
			session.accessToken = token.accessToken;
			session.user = token.user;
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
