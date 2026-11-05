import NextLink from 'next/link';
import type { ComponentProps } from 'react';
export default function DocLink(props: ComponentProps<typeof NextLink>) { return <NextLink prefetch={false} {...props} />; }
