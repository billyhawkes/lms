import { Tailwind } from "@/components/email/Tailwind";
import { buttonVariants } from "@/components/ui/button";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from "@react-email/components";

export const CourseInvite = ({
	href = "https://google.com",
	course = "Golfing Tutorial",
	organization = "Krak",
	text = {
		title: "Invitation:",
		invite: "invites you to join the following:",
		start: "Join",
	},
}: {
	href: string;
	course?: string;
	organization?: string;
	text: {
		title: string;
		invite: string;
		start: string;
	};
}) => (
	<Html lang="en">
		<Head />
		<Preview>{`${text.invite} ${course} by ${organization}.`}</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-border p-8 text-foreground">
					<Heading className="mt-0">
						{text.title} {course}
					</Heading>
					<Text>
						<strong>{organization}</strong> {text.invite}{" "}
						<strong>{course}</strong>
					</Text>
					<Button
						className={buttonVariants({
							class: "h-auto py-3",
						})}
						href={href}
					>
						{text.start}
					</Button>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default CourseInvite;
