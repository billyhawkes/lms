"use client";

import { Course } from "@/types/course";
import {
	Scorm12ErrorCode,
	Scorm12ErrorMessage,
} from "@/types/scorm/versions/12";
import { useEffect, useRef, useState } from "react";
import { updateCourseData } from "./actions";

declare global {
	interface Window {
		API: any;
	}
}

type Props = {
	children: React.ReactNode;
	version: Course["version"];
	courseId: string;
	data: Record<string, any>;
	courseUserId: string;
};

const useSCORM = ({
	version,
	initialData,
}: {
	version: Course["version"];
	initialData: Record<string, any>;
}) => {
	const [data, setData] = useState<Record<string, any>>(initialData);
	const error = useRef<number | undefined>();
	const initialized = useRef<boolean>(false);

	// Log error
	useEffect(() => {
		if (error.current) {
			console.log(
				"Error: ",
				Scorm12ErrorMessage[error.current as Scorm12ErrorCode].short
			);
		}
	}, [error]);

	if (version === "1.2") {
		window.API = {
			LMSInitialize: (): boolean => {
				console.log("LMSInitialize");

				if (initialized.current) {
					error.current = Scorm12ErrorCode.GeneralException;
					return false;
				}

				initialized.current = true;

				return true;
			},
			LMSGetValue: (key: string): string => {
				if (!key || key === "") {
					return "";
				}
				console.log("LMSGetValue", key);

				const value = data[key];

				if (value === undefined) {
					error.current = Scorm12ErrorCode.GeneralException;
					console.log("Error: couldn't find value for key", key);
				}

				return `${value}`;
			},
			LMSSetValue: (key: string, value: string): string => {
				console.log("LMSSetValue", key, value);
				if (!key || key === "") {
					console.log("Error: key is empty", key);
					return "false";
				}

				setData((prev) => {
					return {
						...prev,
						[key]: value,
					};
				});

				return "true";
			},
			LMSGetLastError: (): number | null => {
				console.log("LMSGetLastError", error ?? null);

				return error.current ?? null;
			},
			LMSGetErrorString: (code: number): string => {
				console.log("LMSGetErrorString", code);
				if (code && Object.values(Scorm12ErrorCode).includes(code)) {
					return Scorm12ErrorMessage[code as Scorm12ErrorCode].short;
				} else {
					return "";
				}
			},
			LMSGetDiagnostic: (code: number): string => {
				console.log("LMSGetDiagnostic", code);
				if (code && Object.values(Scorm12ErrorCode).includes(code)) {
					return Scorm12ErrorMessage[code as Scorm12ErrorCode]
						.diagnostic;
				} else {
					return "";
				}
			},
			LMSFinish: (): boolean => {
				console.log("LMSFinish");

				return true;
			},
		};
	} else {
		console.log("Unsupported SCORM version");
	}

	return { data };
};

const LMSProvider = ({
	children,
	version,
	courseId,
	data: initialData,
	courseUserId,
}: Props) => {
	const { data } = useSCORM({
		version,
		initialData,
	});

	useEffect(() => {
		updateCourseData(courseId, data, courseUserId);
	}, [data, courseId, courseUserId]);

	return <>{children}</>;
};

export default LMSProvider;
