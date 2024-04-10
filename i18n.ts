import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "fr"];
export const defaultLocale = "en";

export default getRequestConfig(async ({ locale }) => {
	// Validate that the incoming `locale` parameter is valid
	if (!locales.includes(locale as any)) notFound();

	return {
		messages: (await import(`./messages/${locale}.json`)).default,
	};
});

export const getLocaleLabel = (locale: string) => {
	switch (locale) {
		case "en":
			return "English";
		case "fr":
			return "Français";
		default:
			return locale;
	}
};
