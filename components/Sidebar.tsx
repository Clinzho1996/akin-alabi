"use client";
import { overviewLinks, settingsLinks, sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const Sidebar = () => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const pathname = usePathname();
	const { data: session } = useSession();

	const handleLogout = async () => {
		try {
			await signOut({ redirect: true, callbackUrl: "/" });
			toast.success("Logout successful!");
		} catch (error) {
			toast.error("Failed to log out. Please try again.");
			console.error("Sign-out error:", error);
		}
	};

	const toggleSidebar = () => {
		setIsCollapsed(!isCollapsed);
	};

	return (
		<section
			className={cn(
				"sticky left-0 top-0 flex h-screen w-fit flex-col border-r-[1px] justify-between bg-gradient-to-b from-white via-white to-[#9D902D] text-dark-3 max-sm:hidden z-10 border-[4px] border-white rounded-l-lg p-2",
				{
					"lg:w-[80px]": isCollapsed,
					"lg:w-[284px]": !isCollapsed,
				}
			)}>
			<div className="bg-white h-full rounded-lg flex flex-col">
				<div className="flex flex-1 flex-col gap-2">
					{/* Logo and Toggle Button */}
					<div className="flex items-center justify-between border-b-[#CED0D51A] bg-[#F3F5ED] h-[60px] pr-2">
						{!isCollapsed ? (
							<Link href="/" className="flex items-center gap-1">
								<Image
									src="/images/akin.png"
									alt="Akin Alabi Logo"
									width={150}
									height={60}
									className="w-full justify-center h-full flex object-contain"
								/>
							</Link>
						) : (
							<Link
								href="/"
								className="flex items-center justify-center w-full">
								<Image
									src="/images/icon.png"
									alt="Akin Alabi Logo"
									width={120}
									height={100}
									className="w-[80px] object-contain h-full flex"
								/>
							</Link>
						)}
						<button
							onClick={toggleSidebar}
							className="hidden rounded-full lg:flex items-center justify-center  hover:bg-[#E9E9EB17]">
							<Image
								src={
									isCollapsed
										? "/images/arrow-right.png"
										: "/images/arrow-right.png"
								}
								alt="Toggle sidebar"
								width={20}
								height={20}
								className="w-4 h-4 object-contain"
							/>
						</button>
					</div>

					{/* Overview Section */}
					{!isCollapsed && (
						<p className="text-sm font-normal text-[#8B95A6] pl-4 font-inter py-2">
							OVERVIEW
						</p>
					)}

					{/* Overview Links */}
					{overviewLinks.map((item) => {
						const isActive =
							pathname === item.route || pathname.startsWith(`${item.route}/`);

						return (
							<Link
								href={item.route}
								key={item.label}
								className={cn(
									"flex items-center justify-start rounded-[8px] mx-2 my-0 border-[1px] border-transparent",
									{
										"shadow-inner shadow-[#228B221A] border-[1px] border-[#008027] bg-[#F3F5ED]":
											isActive,
										"px-2 py-3": !isCollapsed,
										"justify-center px-3 py-3": isCollapsed,
									}
								)}>
								<div className="flex gap-3 items-center">
									<div
										className={cn("flex-shrink-0", {
											"w-6 h-6": !isCollapsed,
											"w-6 h-7": isCollapsed,
										})}>
										<Image
											src={item.imgUrl}
											alt={item.label}
											width={24}
											height={24}
											className={cn("w-full h-full object-contain", {
												"invert-[70%] sepia-[18%] saturate-[1400%] hue-rotate-[100deg] brightness-[80%] contrast-[45%]":
													isActive,
											})}
										/>
									</div>
									{!isCollapsed && (
										<p
											className={cn(
												"text-sm font-normal font-inter text-[#0B1221] whitespace-nowrap",
												{
													"text-[#008027]": isActive,
												}
											)}>
											{item.label}
										</p>
									)}
								</div>
							</Link>
						);
					})}

					{/* Operations Section */}
					{!isCollapsed && (
						<p className="text-sm font-normal text-[#8B95A6] pl-4 font-inter py-2">
							OPERATIONS
						</p>
					)}

					{/* Operations Links */}
					{sidebarLinks.map((item) => {
						const isActive =
							pathname === item.route || pathname.startsWith(`${item.route}/`);

						return (
							<Link
								href={item.route}
								key={item.label}
								className={cn(
									"flex items-center justify-start rounded-[8px] mx-2 my-0 border-[1px] border-transparent",
									{
										"shadow-inner shadow-[#C3FF9D38] bg-[#F3F5ED] border-[1px] border-[#008027]":
											isActive,
										"px-2 py-3": !isCollapsed,
										"justify-center px-3 py-3": isCollapsed,
									}
								)}>
								<div className="flex gap-3 items-center">
									<div
										className={cn("flex-shrink-0", {
											"w-5 h-5": !isCollapsed,
											"w-5 h-6": isCollapsed,
										})}>
										<Image
											src={item.imgUrl}
											alt={item.label}
											width={20}
											height={20}
											className={cn("w-full h-full object-contain", {
												"invert-[70%] sepia-[18%] saturate-[1400%] hue-rotate-[100deg] brightness-[80%] contrast-[45%]":
													isActive,
											})}
										/>
									</div>
									{!isCollapsed && (
										<p
											className={cn(
												"text-sm font-normal font-inter text-[#0B1221] whitespace-nowrap",
												{
													"text-[#008027]": isActive,
												}
											)}>
											{item.label}
										</p>
									)}
								</div>
							</Link>
						);
					})}

					{/* General Section */}
					{!isCollapsed && (
						<p className="text-sm font-normal text-[#8B95A6] pl-4 font-inter py-2">
							GENERAL
						</p>
					)}

					{/* Settings Links */}
					{settingsLinks.map((item) => {
						const isActive =
							pathname === item.route || pathname.startsWith(`${item.route}/`);

						return (
							<Link
								href={item.route}
								key={item.label}
								className={cn(
									"flex items-center justify-start rounded-[8px] mx-2 my-0 border-[1px] border-transparent",
									{
										"shadow-inner shadow-[#C3FF9D38] bg-[#F3F5ED] border-[1px] border-[#008027]":
											isActive,
										"px-2 py-3": !isCollapsed,
										"justify-center px-3 py-3": isCollapsed,
									}
								)}>
								<div className="flex gap-3 items-center">
									<div
										className={cn("flex-shrink-0", {
											"w-5 h-5": !isCollapsed,
											"w-5 h-6": isCollapsed,
										})}>
										<Image
											src={item.imgUrl}
											alt={item.label}
											width={20}
											height={20}
											className={cn("w-full h-full object-contain", {
												"invert-[70%] sepia-[18%] saturate-[1400%] hue-rotate-[100deg] brightness-[80%] contrast-[45%]":
													isActive,
											})}
										/>
									</div>
									{!isCollapsed && (
										<p
											className={cn(
												"text-sm font-normal font-inter text-[#0B1221] whitespace-nowrap",
												{
													"text-[#008027]": isActive,
												}
											)}>
											{item.label}
										</p>
									)}
								</div>
							</Link>
						);
					})}
				</div>

				{/* Logout Button */}
				<div className="mt-auto p-4 border-t border-[#CED0D51A]">
					<div
						className={cn(
							"flex items-center cursor-pointer rounded-[8px] p-3 hover:bg-gray-50",
							{
								"justify-start": !isCollapsed,
								"justify-center": isCollapsed,
							}
						)}
						onClick={handleLogout}>
						<div className="flex gap-3 items-center">
							<div className="w-5 h-5 flex-shrink-0">
								<Image
									src="/icons/logout.svg"
									alt="logout"
									width={20}
									height={20}
									className="w-full h-full object-contain"
								/>
							</div>
							{!isCollapsed && (
								<p className="text-sm font-normal font-inter text-[#0B1221] whitespace-nowrap">
									Logout
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Sidebar;
