import { getAPIAuth } from "@/server/actions/auth";
import { withErrorHandling } from "@/server/api";
import { getCourses } from "@/server/db/courses";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(async () => {
	const user = await getAPIAuth();

	const courseList = await getCourses(undefined, user.id);

	return NextResponse.json(courseList);
});