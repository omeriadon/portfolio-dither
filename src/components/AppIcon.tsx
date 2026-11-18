import { getImageProps } from "next/image";

/** Icon size in px. The source AVIFs are 128px, so above 64 they start to soften on Retina screens. */
const SIZE = 74;

export function AppIcon({
	name,
	icon,
	iconDark,
}: {
	name: string;
	icon: string;
	iconDark?: string;
}) {
	if (!icon) {
		return (
			<div
				aria-hidden
				style={{ width: SIZE, height: SIZE }}
				className="flex shrink-0 items-center justify-center rounded-[22%] bg-subtle text-xl font-medium text-muted"
			>
				{name.charAt(0)}
			</div>
		);
	}

	// Icons are already tiny 128px AVIFs, so serve them as-is rather than through Next's optimizer
	const common = {
		alt: `${name} icon`,
		width: SIZE,
		height: SIZE,
		unoptimized: true,
	};
	const { props: light } = getImageProps({ ...common, src: icon });
	// Unoptimized images have no srcSet, so fall back to the plain src
	const { props: darkProps } = getImageProps({
		...common,
		src: iconDark || icon,
	});
	const dark = darkProps.srcSet ?? darkProps.src;

	return (
		<picture
			className="block shrink-0"
			style={{ width: SIZE, height: SIZE }}
		>
			<source media="(prefers-color-scheme: dark)" srcSet={dark} />
			{/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
			<img {...light} className="size-full max-w-none" />
		</picture>
	);
}
