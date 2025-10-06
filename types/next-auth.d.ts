import "next-auth";

declare module "next-auth" {
	interface Session {
		backendData?: {
			status: string;
			message: string;
			token: string;
			user: {
				id: string;
				first_name: string;
				last_name: string;
				email: string;
				picture: string;
				role: string;
				is_active: boolean;
				staff_code?: string;
				last_logged_in?: string;
			};
		};
	}

	interface JWT {
		backendData?: Session["backendData"];
	}
}
