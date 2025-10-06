"use client";

import { IconLogout2 } from "@tabler/icons-react";
import { Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SignIn() {
	const { status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [showPassword, setShowPassword] = useState(false);

	// Get callbackUrl from search params or default to '/'
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

	const [form, setForm] = useState({ email: "", password: "" });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (status === "authenticated") {
			toast.success("Login Successful!");
			router.push(callbackUrl); // Redirect here after authentication
		}
	}, [status, callbackUrl, router]);

	const handleSubmit = async (event: { preventDefault: () => void }) => {
		event.preventDefault();

		if (!form.email || !form.password) {
			toast.error("Please fill in all fields.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				redirect: false,
				email: form.email,
				password: form.password,
				callbackUrl,
			});

			console.log("SIGNIN RESULT:", result);

			if (result?.error) {
				toast.error(result.error);
			}
		} catch (error) {
			toast.error("Login failed. Please try again.");
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full flex flex-col lg:flex-row justify-between items-center h-screen bg-[#fff]">
			<div className="w-full lg:w-[40%] flex flex-col gap-10 py-[3%] px-[2%] mx-auto my-auto bg-[#fff] shadow-lg shadow-[#0000000D] rounded-lg border-2">
				<div className="p-1 rounded-lg flex flex-col items-center ">
					<div className="w-full px-6 pt-10 rounded-lg flex flex-col items-center">
						<Image
							src="/images/akin.png"
							alt="Logo"
							width={180}
							height={80}
							className="mx-auto mb-4"
						/>

						<p className="text-[20px] font-semibold text-dark-1 text-center font-inter mt-4">
							Biometric Attendance System
						</p>
						<p className="text-sm text-[#6D717F] text-center mt-2 font-inter">
							Login to your account to access biometrics record
						</p>

						<form className="w-full mt-6" onSubmit={handleSubmit}>
							<div className="mb-4">
								<label className="text-sm text-[#6C7278] font-medium font-inter">
									Email address
								</label>
								<input
									type="email"
									placeholder="Enter your email"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									className="w-full bg-[#F4F6F8] text-dark-1 text-sm rounded-lg p-2 border border-[#0000000D] placeholder:text-[#6C7278] focus:outline-none focus:border-primary-1 mt-1 shadow-inner"
									required
								/>
							</div>

							<div className="mb-4">
								<label className="text-sm text-[#6C7278] font-medium">
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										value={form.password}
										onChange={(e) =>
											setForm({ ...form, password: e.target.value })
										}
										className="w-full bg-[#F4F6F8] text-dark-1 text-sm rounded-lg p-2 border border-[#0000000D] placeholder:text-[#6C7278] focus:outline-none focus:border-primary-1 mt-1 shadow-inner"
										required
									/>
									<button
										type="button"
										className="absolute right-3 top-[55%] translate-y-[-50%] text-[#696E77]"
										onClick={() => setShowPassword(!showPassword)}>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							<div className="flex flex-row justify-between items-center mt-2">
								<div className="flex items-center gap-2">
									<input
										id="rememberMe"
										type="checkbox"
										className="peer hidden"
									/>
									<label
										htmlFor="rememberMe"
										className="w-4 h-4 inline-block rounded border border-[#333333] peer-checked:bg-[#C3FF9D] peer-checked:border-primary-1"></label>
									<p className="text-sm text-dark-1 font-manrope">
										Remember me
									</p>
								</div>

								<div>
									<Link
										href="/forgot-password"
										className=" text-secondary-1 underline">
										Forgot Password?
									</Link>
								</div>
							</div>

							<button
								type="submit"
								className="w-full bg-secondary-1 text-white font-inter p-2 rounded-lg mt-12 border-[3px] border-[#2FE0A833] flex flex-row justify-center items-center gap-2 hover:bg-secondary-1/90 transition-colors duration-300 shadow-lg shadow-[#2FE0A833]"
								disabled={isLoading}>
								{isLoading ? "Signing in..." : "Sign In"}{" "}
								<IconLogout2 color="white" />
							</button>
						</form>
					</div>
					<div className="bg-primary w-full text-center mt-4">
						<p className="text-[#7D7C81] text-sm">
							Experiencing any issues ?{" "}
							<Link href="/sign-up" className="underline text-secondary-1">
								Contact Support
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
