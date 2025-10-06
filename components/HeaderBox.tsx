"use client";
import { IconSettings } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

function HeaderBox() {
	const { data: session } = useSession();
	// Function to get the name initials from the user's name
	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	return (
		<div className="flex flex-row justify-between items-center p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
			{session?.user && (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-dark-1 font-normal font-inter">
						Hi {session?.user?.name || "Admin"}, Welcome back to Akin Alabi
						Foundaiton 👋🏻
					</p>
				</div>
			)}
			<div className="hidden lg:flex flex-row justify-start gap-2 items-center">
				<Link href="/settings">
					<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
						<IconSettings size={18} />
					</div>
				</Link>
				{session?.user && (
					<div className="md:flex flex-row justify-end gap-2 items-center mx-2 px-2">
						<div className="flex justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
							{session.user.image ? (
								<Image
									src={session.user.image}
									alt="profile"
									className="object-cover w-full h-full lg:w-[35px] lg:h-[35px]"
									width={30}
									height={30}
								/>
							) : (
								<div className="flex items-center justify-center w-full h-full bg-secondary-1 p-2">
									<h2 className="text-white font-bold text-lg">
										{getNameInitials({ name: session?.user?.name || "" })}
									</h2>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default HeaderBox;
