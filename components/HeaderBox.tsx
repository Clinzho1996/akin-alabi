"use client";
import { IconSettings } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Define the user type based on your API response
interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	staffCode: string;
	phone: string | null;
	role: string;
	isActive: boolean;
	lastLoggedIn: string | null;
	createdAt: string;
	updatedAt: string | null;
}

// Extend the next-auth session type to include your custom user properties
declare module "next-auth" {
	interface Session {
		user: User;
	}
}

function HeaderBox() {
	const { data: session } = useSession();

	// Function to get the name initials from the user's name with proper typing
	const getNameInitials = ({
		firstName,
		lastName,
	}: {
		firstName: string;
		lastName: string;
	}): string => {
		if (!firstName && !lastName) return "OA";
		const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
		return initials.toUpperCase();
	};

	// Safe access to user data with fallbacks
	const user = session?.user;
	const firstName = user?.firstName || "Admin";
	const lastName = user?.lastName || "";
	const displayName = `${firstName}${lastName ? ` ${lastName}` : ""}`;

	return (
		<div className="flex flex-row justify-between items-center p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
			{user && (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-dark-1 font-normal font-inter">
						Hi {displayName}, Welcome back to Akin Alabi Foundation 👋🏻
					</p>
				</div>
			)}
			<div className="hidden lg:flex flex-row justify-start gap-2 items-center">
				<Link href="/settings">
					<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
						<IconSettings size={18} />
					</div>
				</Link>
				{user && (
					<div className="md:flex flex-row justify-end gap-2 items-center mx-2 px-2">
						<div className="flex justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
							<div className="flex items-center justify-center w-full h-full bg-secondary-1 p-2">
								<h2 className="text-white font-bold text-lg">
									{getNameInitials({
										firstName: firstName,
										lastName: lastName,
									})}
								</h2>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default HeaderBox;
