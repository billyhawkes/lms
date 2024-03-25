import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link, redirect } from "@/lib/navigation";
import { getAuth } from "@/server/actions/cached";
import { db } from "@/server/db/db";
import { collections, courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import CreateCourseForm from "./CreateCourseForm";

const Page = async () => {
	const { user } = await getAuth();

	if (!user) {
		return redirect("/auth/google");
	}

	const courseList = await db.query.courses.findMany({
		where: eq(courses.userId, user.id),
	});

	const collectionList = await db.query.collections.findMany({
		where: eq(collections.userId, user.id),
		with: {
			collectionsToCourses: {
				with: {
					course: true,
				},
			},
		},
	});

	return (
		<>
			<h1 className="mb-6">Courses</h1>
			<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							className="flex h-32 flex-col"
						>
							<div className="flex flex-col items-center justify-center gap-4">
								<Plus size={24} />
								Create Course
							</div>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>Create Course</DialogTitle>
						<CreateCourseForm />
					</DialogContent>
				</Dialog>
				{courseList?.map((course) => (
					<Link
						href={`/dashboard/courses/${course.id}`}
						key={course.id}
						className={buttonVariants({
							variant: "outline",
							className: "relative h-32 w-full gap-4 p-4",
						})}
					>
						<p className="truncate text-center">{course.name}</p>
						<Badge variant="outline" className="absolute top-2">
							Free
						</Badge>
					</Link>
				))}
			</div>
			<h1 className="mb-6 mt-12">Collections</h1>
			<p className="mb-2 font-semibold text-blue-300">
				Volunteer Onboarding
			</p>
			<div className="flex flex-col rounded-xl border border-blue-400 p-3">
				<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{courseList?.map((course) => (
						<Link
							href={`/dashboard/courses/${course.id}`}
							key={course.id}
							className={buttonVariants({
								variant: "outline",
								className: "relative h-32 w-full gap-4 p-4",
							})}
						>
							<p className="truncate text-center">
								{course.name}
							</p>
							<Badge variant="outline" className="absolute top-2">
								Free
							</Badge>
						</Link>
					))}
				</div>
				<hr className="my-3" />
				<div className="flex gap-2">
					<Button variant="outline">Invite Learners</Button>
					<Button variant="outline">Add course</Button>
				</div>
			</div>
		</>
	);
};

export default Page;
