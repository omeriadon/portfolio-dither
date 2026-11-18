import { getImageProps } from "next/image";

const SIZE = 64;

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
        className="flex size-16 shrink-0 items-center justify-center rounded-[22%] bg-subtle text-xl font-medium text-muted"
      >
        {name.charAt(0)}
      </div>
    );
  }

  const common = { alt: `${name} icon`, width: SIZE, height: SIZE };
  const { props: light } = getImageProps({ ...common, src: icon });
  const {
    props: { srcSet: dark },
  } = getImageProps({ ...common, src: iconDark || icon });

  return (
    <picture className="shrink-0">
      <source media="(prefers-color-scheme: dark)" srcSet={dark} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...light} className="size-16" />
    </picture>
  );
}
