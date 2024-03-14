"use client";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createKey, deleteKey } from "@/server/actions/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Clipboard, Eye, EyeOff, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AddKeyFormSchema = z.object({
	name: z.string(),
});
type AddKeyForm = z.infer<typeof AddKeyFormSchema>;

export const AddKeyDialog = () => {
	const [open, setOpen] = useState(false);
	const form = useForm({
		resolver: zodResolver(AddKeyFormSchema),
		defaultValues: {
			name: "",
		},
	});
	const { mutate } = useMutation({
		mutationFn: createKey,
		onSuccess: () => {
			setOpen(false);
			form.reset();
		},
	});

	const onSubmit = (data: AddKeyForm) => {
		mutate(data);
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Plus size={16} />
					Create Key
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create API Key</DialogTitle>
					<DialogDescription>
						Enter the key name below.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-6"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Key name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Create Key</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export const DeleteKeyButton = ({ id }: { id: string }) => {
	const { mutate } = useMutation({
		mutationFn: deleteKey,
	});

	return (
		<Button variant="outline" size="icon" onClick={() => mutate({ id })}>
			<Trash size={20} />
		</Button>
	);
};

export const APIKeyCell = ({ secret }: { secret: string }) => {
	const [hidden, setHidden] = useState(true);
	return (
		<div className="flex items-center gap-1">
			<p className={cn("text-sm", hidden ? "pt-1" : "")}>
				{hidden ? secret.replaceAll(/./g, "*") : secret}
			</p>
			<button className="p-1" onClick={() => setHidden(!hidden)}>
				{hidden ? <Eye size={21} /> : <EyeOff size={21} />}
			</button>
			<button
				className="p-1"
				onClick={() => navigator.clipboard.writeText(secret)}
			>
				<Clipboard size={19} />
			</button>
		</div>
	);
};