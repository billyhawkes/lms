import { db } from "@/db/db";
import { courses, learners } from "@/db/schema";
import { s3Client } from "@/lib/s3";
import {
	CourseSchema,
	DeleteCourseSchema,
	SelectCourseSchema,
} from "@/types/course";
import { LearnerSchema } from "@/types/learner";
import { DeleteObjectsCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const courseRouter = router({
	findOne: protectedProcedure
		.meta({
			openapi: {
				summary: "Get a course by ID",
				method: "GET",
				path: "/courses/{id}",
				protect: true,
			},
		})
		.input(SelectCourseSchema)
		.output(CourseSchema.extend({ learners: LearnerSchema.array() }))
		.query(async ({ ctx: { teamId }, input: { id } }) => {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.teamId, teamId), eq(courses.id, id)),
				with: {
					learners: true,
				},
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message:
						"Course does not exist or does not belong to current team",
				});
			} else {
				return course;
			}
		}),
	find: protectedProcedure
		.meta({
			openapi: {
				summary: "Get all courses",
				method: "GET",
				path: "/courses",
				protect: true,
			},
		})
		.input(z.undefined())
		.output(CourseSchema.array())
		.query(async ({ ctx: { teamId } }) => {
			return await db.query.courses.findMany({
				where: eq(courses.teamId, teamId),
			});
		}),
	delete: protectedProcedure
		.meta({
			openapi: {
				summary: "Delete a course",
				method: "DELETE",
				path: "/courses/{id}",
				protect: true,
			},
		})
		.input(DeleteCourseSchema)
		.output(CourseSchema)
		.mutation(async ({ ctx: { teamId }, input: { id } }) => {
			const course = await db.query.courses.findFirst({
				where: and(eq(courses.teamId, teamId), eq(courses.id, id)),
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message:
						"Course does not exist or does not belong to current team",
				});
			}

			// get all files in the course
			const courseFiles = await s3Client.send(
				new ListObjectsCommand({
					Bucket: "krak-lms",
					Prefix: `courses/${course.id}/`,
				})
			);

			// delete the files
			if (courseFiles.Contents) {
				const deleted = await s3Client.send(
					new DeleteObjectsCommand({
						Bucket: "krak-lms",
						Delete: {
							Objects: courseFiles.Contents.map((item) => ({
								Key: item.Key,
							})), // array of keys to be deleted
						},
					})
				);
				console.log("Deleted", deleted.Deleted?.length);
			} else {
				console.log("No files found");
			}

			// delete the course if it exists and the user owns it and is currently on the team
			await db
				.delete(courses)
				.where(
					and(eq(courses.id, course.id), eq(courses.teamId, teamId))
				);

			// Delete the course users
			await db.delete(learners).where(eq(learners.courseId, course.id));

			return course;
		}),
});