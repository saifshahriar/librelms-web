import type { MockDb } from "./db";

const daysAgo = (n: number) =>
	new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

/**
 * Deterministic demo dataset: one user per role, three courses,
 * lessons, a quiz per course, enrollments, progress and posts.
 */
export function seedDb(): MockDb {
	return {
		users: [
			{
				id: 1,
				username: "admin",
				email: "admin@librelms.dev",
				fullName: "Alice Admin",
				role: "admin",
				password: "admin123",
			},
			{
				id: 2,
				username: "manager",
				email: "manager@librelms.dev",
				fullName: "Mateo Manager",
				role: "content_manager",
				password: "manager123",
			},
			{
				id: 3,
				username: "instructor",
				email: "instructor@librelms.dev",
				fullName: "Ivy Instructor",
				role: "instructor",
				password: "instructor123",
			},
			{
				id: 4,
				username: "student",
				email: "student@librelms.dev",
				fullName: "Sam Student",
				role: "student",
				password: "student123",
			},
			{
				id: 5,
				username: "student2",
				email: "student2@librelms.dev",
				fullName: "Sofia Student",
				role: "student",
				password: "student123",
			},
		],
		courses: [
			{
				id: 1,
				documentId: "course-react-fundamentals",
				title: "React Fundamentals",
				description:
					"Master the building blocks of modern React: components, state, props and hooks.",
				coverImageUrl: "",
				instructorIds: [3],
				lessonIds: [1, 2, 3, 4],
				quizIds: [1],
				createdAt: daysAgo(20),
			},
			{
				id: 2,
				documentId: "course-typescript-deep-dive",
				title: "TypeScript Deep Dive",
				description:
					"Go beyond annotations: generics, narrowing, utility types and real-world patterns.",
				coverImageUrl: "",
				instructorIds: [3],
				lessonIds: [5, 6, 7],
				quizIds: [2],
				createdAt: daysAgo(15),
			},
			{
				id: 3,
				documentId: "course-css-layout",
				title: "CSS Layout Mastery",
				description:
					"Flexbox and grid, explained visually. Build any layout with confidence.",
				coverImageUrl: "",
				instructorIds: [2],
				lessonIds: [8, 9],
				quizIds: [3],
				createdAt: daysAgo(8),
			},
		],
		lessons: [
			{
				id: 1,
				documentId: "lesson-jsx-intro",
				courseId: 1,
				title: "JSX and Components",
				order: 1,
				kind: "text",
				body: "JSX is a syntax extension for JavaScript that lets you write UI as functions of data.\n\nEvery React interface is a tree of components. A component is just a function that receives props and returns markup:\n\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\nIn this lesson we cover:\n- What JSX compiles down to (React.createElement / jsx runtime calls)\n- Rendering custom components vs host elements\n- Why keys matter when rendering lists\n\nTry it: build a small <Card> component that renders a title and children.",
			},
			{
				id: 2,
				documentId: "lesson-props-and-state",
				courseId: 1,
				title: "Props and State",
				order: 2,
				kind: "text",
				body: "Props flow down; state is local to a component.\n\nKey ideas:\n- Props are read-only inputs\n- useState gives a component its own memory\n- Never mutate state directly; always call the setter\n- When several components need the same state, lift it up\n\nWorked example: a counter that can be reset by its parent via a prop-driven effect.",
			},
			{
				id: 3,
				documentId: "lesson-hooks-video",
				courseId: 1,
				title: "Hooks in Practice (Video)",
				order: 3,
				kind: "video",
				videoUrl: "https://www.youtube.com/watch?v=O6P86uwqfwo",
			},
			{
				id: 4,
				documentId: "lesson-lists-keys",
				courseId: 1,
				title: "Lists, Keys and Conditional Rendering",
				order: 4,
				kind: "text",
				body: "Rendering collections is a daily task. Rules of thumb:\n- Derive UI from data with .map()\n- Give each item a stable key (not the array index when items reorder)\n- Use early returns or && for conditional UI\n\nMini-challenge: render a filtered, sorted lesson list with alternating styles.",
			},
			{
				id: 5,
				documentId: "lesson-ts-basics",
				courseId: 2,
				title: "Type Annotations Everywhere",
				order: 1,
				kind: "text",
				body: "TypeScript's core value: move errors from runtime to compile time.\n\nThis lesson covers:\n- Primitive and object types\n- Type aliases vs interfaces\n- Function signatures and return types\n- Structural typing: why shape beats name",
			},
			{
				id: 6,
				documentId: "lesson-ts-generics",
				courseId: 2,
				title: "Generics and Utility Types",
				order: 2,
				kind: "text",
				body: "Generics make functions and types reusable without sacrificing safety.\n\nTopics:\n- Generic functions and interfaces\n- Constraints with extends\n- Partial, Pick, Omit, Record, ReturnType\n- When to reach for unknown vs any",
			},
			{
				id: 7,
				documentId: "lesson-ts-narrowing",
				courseId: 2,
				title: "Narrowing and Control Flow Analysis",
				order: 3,
				kind: "text",
				body: "The compiler is smart — help it help you.\n\nTopics:\n- typeof, instanceof, in guards\n- Discriminated unions with a literal field\n- Exhaustiveness checking with never\n- Assertion functions and user-defined type guards",
			},
			{
				id: 8,
				documentId: "lesson-flexbox",
				courseId: 3,
				title: "Flexbox Thinking",
				order: 1,
				kind: "text",
				body: "Flexbox lays out content along one axis at a time.\n\nMental model:\n- main axis vs cross axis\n- flex-grow / shrink / basis\n- gap beats margin for spacing\n- Common patterns: navbar, media object, card grid",
			},
			{
				id: 9,
				documentId: "lesson-grid",
				courseId: 3,
				title: "Grid for Page Structure",
				order: 2,
				kind: "text",
				body: "Grid handles two dimensions: rows AND columns.\n\nTopics:\n- grid-template-columns with fr units\n- Explicit vs implicit tracks\n- Areas for page scaffolding\n- When grid beats flexbox (and when it doesn't)",
			},
		],
		quizzes: [
			{
				id: 1,
				documentId: "quiz-react-basics",
				courseId: 1,
				title: "React Basics Check",
				questions: [
					{
						id: 1,
						text: "What is a React component, conceptually?",
						options: [
							{
								text: "A function that takes props and returns UI",
								isCorrect: true,
							},
							{
								text: "A class that extends HTMLElement",
								isCorrect: false,
							},
							{
								text: "A special HTML tag the browser understands",
								isCorrect: false,
							},
							{ text: "A database record", isCorrect: false },
						],
					},
					{
						id: 2,
						text: "Which rule applies to hooks?",
						options: [
							{
								text: "They can only be called at the top level of components",
								isCorrect: true,
							},
							{
								text: "They can be called inside loops freely",
								isCorrect: false,
							},
							{
								text: "They only work in class components",
								isCorrect: false,
							},
							{
								text: "They must return a promise",
								isCorrect: false,
							},
						],
					},
					{
						id: 3,
						text: "Why give list items a stable key?",
						options: [
							{
								text: "To help React identify items across renders",
								isCorrect: true,
							},
							{ text: "It styles the list", isCorrect: false },
							{
								text: "It is required by HTML",
								isCorrect: false,
							},
							{
								text: "Keys sort the list automatically",
								isCorrect: false,
							},
						],
					},
				],
			},
			{
				id: 2,
				documentId: "quiz-ts-check",
				courseId: 2,
				title: "TypeScript Quick Check",
				questions: [
					{
						id: 1,
						text: "What does Partial<T> do?",
						options: [
							{
								text: "Makes all properties of T optional",
								isCorrect: true,
							},
							{
								text: "Makes all properties required",
								isCorrect: false,
							},
							{
								text: "Deletes half the properties",
								isCorrect: false,
							},
							{
								text: "Creates a string from T",
								isCorrect: false,
							},
						],
					},
					{
						id: 4,
						text: "What is structural typing?",
						options: [
							{
								text: "Compatibility is determined by shape, not name",
								isCorrect: true,
							},
						],
					},
				],
			},
			{
				id: 3,
				documentId: "quiz-css-check",
				courseId: 3,
				title: "CSS Layout Check",
				questions: [
					{
						id: 1,
						text: "Which layout system handles two axes at once?",
						options: [
							{ text: "CSS Grid", isCorrect: true },
							{ text: "Flexbox", isCorrect: false },
							{ text: "Floats", isCorrect: false },
							{ text: "Position absolute", isCorrect: false },
						],
					},
					{
						id: 2,
						text: "What does 1fr mean in grid-template-columns?",
						options: [
							{
								text: "One fraction of the leftover space",
								isCorrect: true,
							},
							{ text: "One rem", isCorrect: false },
							{ text: "A fixed 16px track", isCorrect: false },
							{ text: "Frame rate", isCorrect: false },
						],
					},
				],
			},
		],
		enrollments: [
			{ id: 1, userId: 4, courseId: 1, enrolledAt: daysAgo(10) },
			{ id: 2, userId: 4, courseId: 2, enrolledAt: daysAgo(6) },
			{ id: 3, userId: 5, courseId: 1, enrolledAt: daysAgo(5) },
		],
		completions: [
			{ id: 1, userId: 4, lessonId: 1, completedAt: daysAgo(9) },
			{ id: 2, userId: 4, lessonId: 2, completedAt: daysAgo(8) },
			{ id: 3, userId: 5, lessonId: 1, completedAt: daysAgo(4) },
		],
		quizResults: [
			{
				id: 1,
				userId: 4,
				quizId: 1,
				score: 2,
				total: 3,
				submittedAt: daysAgo(7),
				answers: [0, 0, 2],
			},
		],
		posts: [
			{
				id: 1,
				documentId: "post-welcome",
				title: "Welcome to LibreLMS",
				body: "LibreLMS is an open learning platform built for the modern web.\n\nOur mission is simple: make quality course creation and learning tracking effortless for everyone. Instructors get focused authoring tools, students get a clean learning experience with real progress tracking.\n\nThis is the first post on our blog — expect feature announcements, learning guides and behind-the-scenes notes here.",
				coverImageUrl: "",
				authorId: 2,
				publishedAt: daysAgo(12),
				createdAt: daysAgo(12),
			},
			{
				id: 2,
				documentId: "post-study-tips",
				title: "Five habits of effective learners",
				body: "Learning a new skill is a system, not a burst of motivation.\n\n1. Learn in small, frequent sessions — spaced repetition beats cramming.\n2. Active recall: close the lesson and reproduce it from memory.\n3. Build something with every concept you learn.\n4. Track your progress visibly — a rising percentage is great fuel.\n5. Teach what you learned; gaps reveal themselves fast.\n\nUse the progress bars in My Courses to spot courses you've stalled on, and finish them one lesson at a time.",
				coverImageUrl: "",
				authorId: 2,
				publishedAt: daysAgo(5),
				createdAt: daysAgo(5),
			},
			{
				id: 3,
				documentId: "post-draft-roadmap",
				title: "Draft: Platform roadmap 2027",
				body: "Ideas we're considering for next year:\n- Certificates on course completion\n- Discussion forums per course\n- Live sessions\n\n(This is a draft post used to demo the draft/publish workflow. It should not be visible to the public.)",
				coverImageUrl: "",
				authorId: 2,
				publishedAt: null,
				createdAt: daysAgo(2),
			},
		],
	};
}
