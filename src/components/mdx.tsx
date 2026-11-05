import defaultComponents from 'fumadocs-ui/mdx';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Callout as FumadocsCallout, type CalloutType } from 'fumadocs-ui/components/callout';
import { Cards, Card } from 'fumadocs-ui/components/card';
import { Steps, Step } from 'fumadocs-ui/components/steps';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
function Callout({ type = 'info', ...props }: Omit<ComponentProps<typeof FumadocsCallout>, 'type'> & { type?: CalloutType | 'tip' | 'danger' }) {
  return <FumadocsCallout {...props} type={type === 'tip' ? 'idea' : type === 'danger' ? 'error' : type} />;
}
export function getMDXComponents(components?: MDXComponents): MDXComponents { return { ...defaultComponents, Tabs, Tab, Callout, Cards, Card, Steps, Step, ...components }; }
