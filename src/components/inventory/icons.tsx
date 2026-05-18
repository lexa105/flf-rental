interface IconProps {
  size?: number;
  className?: string;
  sw?: number;
}

const Icon = ({
  d,
  size = 16,
  sw = 1.8,
  fill = "none",
  className,
}: {
  d: string | string[];
  size?: number;
  sw?: number;
  fill?: string;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

export const Icons = {
  search:   (p: IconProps) => <Icon {...p} d={["M11 4a7 7 0 1 0 4.95 11.95L20 20", "M11 4a7 7 0 0 1 0 14"]} />,
  plus:     (p: IconProps) => <Icon {...p} d="M12 5v14M5 12h14" />,
  close:    (p: IconProps) => <Icon {...p} d="M6 6l12 12M6 18L18 6" />,
  check:    (p: IconProps) => <Icon {...p} d="M4 12l5 5L20 6" />,
  arrowOut: (p: IconProps) => <Icon {...p} d={["M14 5h5v5", "M19 5l-8 8", "M14 19H5V5"]} />,
  arrowIn:  (p: IconProps) => <Icon {...p} d={["M10 19H5v-5", "M5 19l8-8", "M10 5h9v9"]} />,
  wrench:   (p: IconProps) => <Icon {...p} d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2 2-2.5-.5-.5-2.5 2-2z" />,
  more:     (p: IconProps) => <Icon {...p} d="M5 12h.01M12 12h.01M19 12h.01" sw={3} />,
  camera:   (p: IconProps) => <Icon {...p} d={["M3 7h3l2-3h8l2 3h3v12H3z", "M12 11a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"]} />,
  sun:      (p: IconProps) => <Icon {...p} d={["M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4", "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"]} />,
  moon:     (p: IconProps) => <Icon {...p} d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  download: (p: IconProps) => <Icon {...p} d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />,
  upload:   (p: IconProps) => <Icon {...p} d="M12 20V8m0 0l-4 4m4-4l4 4M5 4h14" />,
  image:    (p: IconProps) => <Icon {...p} d={["M4 5h16v14H4z", "M4 16l5-5 4 4 3-3 4 4"]} />,
  warn:     (p: IconProps) => <Icon {...p} d={["M12 9v4", "M12 17h.01", "M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.39 0z"]} />,
  history:  (p: IconProps) => <Icon {...p} d={["M3 12a9 9 0 1 0 3-6.7", "M3 4v5h5", "M12 8v5l3 2"]} />,
};

export { Icon };
