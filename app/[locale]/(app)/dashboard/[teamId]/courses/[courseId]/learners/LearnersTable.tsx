"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { locales } from "@/i18n";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { Learner } from "@/types/learner";
import { Module } from "@/types/module";
import { Language } from "@/types/translations";
import { useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { InferRequestType } from "hono/client";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import LearnerActions from "./LearnerActions";

export type TableLearner = Learner & {
	module: Module | null;
	joinLink?: string;
};

const columnHelper = createColumnHelper<TableLearner>();

const reinvite = client.api.learners[":id"].reinvite.$post;

export const ReinviteDialog = ({
	learner,
	children,
}: {
	learner: TableLearner;
	children: React.ReactNode;
}) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const { mutate: reinviteLearner, isPending } = useMutation({
		mutationFn: async (input: InferRequestType<typeof reinvite>) => {
			const res = await reinvite(input);
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			router.refresh();
			setOpen(false);
			toast.success("Learner reinvited");
		},
	});

	const form = useForm<{
		inviteLanguage: Language;
	}>({
		defaultValues: {
			inviteLanguage: "en",
		},
	});

	const onSubmit = (values: { inviteLanguage: Language }) => {
		reinviteLearner({
			param: { id: learner.id },
			json: {
				inviteLanguage: values.inviteLanguage,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reinvite Learner</DialogTitle>
					<DialogDescription>
						Modify the language and press the button to reinvite the
						learner
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex justify-end gap-2"
					>
						<FormField
							control={form.control}
							name="inviteLanguage"
							render={({ field }) => (
								<FormItem>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-[80px]">
												<SelectValue placeholder="Select language" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												{locales.map((locale) => (
													<SelectItem
														key={locale}
														value={locale}
													>
														{locale}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" isPending={isPending}>
							Reinvite
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

const StatusCell = ({
	info,
}: {
	info: {
		row: {
			original: TableLearner;
		};
	};
}) => {
	const status = info.row.original.status;
	const router = useRouter();

	const labels = {
		completed: "Completed",
		"not-started": "Not Started",
		"in-progress": "In Progress",
		passed: "Passed",
		failed: "Failed",
	};

	if (info.row.original.startedAt === null) {
		return (
			<div className="flex items-center gap-4">
				<p className="text-sm">Invited</p>
				<ReinviteDialog learner={info.row.original}>
					<DialogTrigger asChild>
						<Button variant="outline">Reinvite</Button>
					</DialogTrigger>
				</ReinviteDialog>
			</div>
		);
	}
	return labels[status];
};

const columns = [
	columnHelper.display({
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	}),
	columnHelper.accessor("id", {
		header: "ID",
	}),
	columnHelper.accessor("firstName", {
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					First Name
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	}),
	columnHelper.accessor("lastName", {
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Last Name
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	}),
	columnHelper.accessor("email", {
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Email
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	}),
	columnHelper.accessor<(row: TableLearner) => string, string>(
		(row) =>
			row.startedAt
				? dayjs(row.startedAt).format("DD-MMM-YYYY HH:mm:ss")
				: "N/A",
		{
			id: "startedAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
					>
						Started At
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4" />
						)}
					</Button>
				);
			},
		}
	),
	columnHelper.accessor<(row: TableLearner) => string, string>(
		(row) =>
			row.completedAt
				? dayjs(row.completedAt).format("DD-MMM-YYYY HH:mm:ss")
				: "N/A",
		{
			id: "completedAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
					>
						Completed At
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4" />
						)}
					</Button>
				);
			},
		}
	),
	columnHelper.accessor("status", {
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Status
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
		cell: (info) => <StatusCell info={info} />,
		sortingFn: (a, b) => {
			const labels = {
				completed: 1,
				"not-started": 2,
				"in-progress": 3,
				passed: 4,
				failed: 5,
			};
			return labels[a.original.status] - labels[b.original.status];
		},
	}),
	columnHelper.accessor((row) => row.module?.language ?? "", {
		id: "language",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Language
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	}),
	columnHelper.accessor((row) => row.module?.versionNumber ?? "", {
		id: "versionNumber",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Module Version
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
	}),
	columnHelper.accessor("score", {
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Score
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
		cell: (info) => {
			const score = info.row.original.score;

			if (score && score.max && score.raw) {
				return `${score.raw}/${score.max}`;
			} else {
				return "N/A";
			}
		},
		sortingFn: (a, b) => {
			if (!a.original.score || !a.original.score.raw) {
				return 1;
			}
			if (!b.original.score || !b.original.score.raw) {
				return -1;
			}
			return a.original.score.raw - b.original.score.raw;
		},
	}),
	columnHelper.display({
		id: "actions",
		header: "",
		cell: ({ row }) => {
			const learner = row.original;

			return <LearnerActions learner={learner} />;
		},
	}),
];

const LearnersTable = ({ learners }: { learners: TableLearner[] }) => {
	const router = useRouter();
	const { mutate: deleteLearners, isPending } = useMutation({
		mutationFn: async (
			input: InferRequestType<typeof client.api.learners.$delete>
		) => {
			const res = await client.api.learners.$delete(input);
			if (!res.ok) {
				throw new Error(await res.text());
			}
		},
		onSuccess: () => {
			router.refresh();
		},
	});

	return (
		<div>
			<DataTable
				data={learners}
				columns={columns as any}
				name={"Learners"}
				filter={{
					column: "email",
					placeholder: "Search emails...",
				}}
				deleteMultiple={(learners) => {
					deleteLearners({
						json: {
							ids: learners.map((learner) => learner.id),
						},
					});
				}}
				deleteMultiplePending={isPending}
			/>
		</div>
	);
};

export default LearnersTable;
