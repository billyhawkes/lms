import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

const Layout = async ({
	children,
	params,
}: {
	params: Promise<{ locale: string }>;
	children: React.ReactNode;
}) => {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({
		locale,
		namespace: "Home",
	});

	return (
		<>
			<header className="border-b-elevation-4 flex h-14 w-full items-center justify-center border-b px-6">
				<nav className="flex w-full max-w-screen-lg items-center justify-end">
					<Link
						href="/auth/google"
						className={buttonVariants({
							className: "mr-4",
						})}
					>
						{t("get-started")}
					</Link>
				</nav>
			</header>
			{children}
		</>
	);
};

export default Layout;
