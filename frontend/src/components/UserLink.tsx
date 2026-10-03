import type { AnchorHTMLAttributes, ReactNode } from 'react';

export const UGC_LINK_REL = 'ugc nofollow noopener noreferrer';

export interface UserLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  extraRel?: string;
  children: ReactNode;
}

export function UserLink({ href, extraRel, rel, target, children, ...rest }: UserLinkProps) {
  const parts = [extraRel, UGC_LINK_REL, rel]
    .flatMap((part) => (part ? part.split(/\s+/) : []))
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(' ');
  return (
    <a href={href} target={target ?? '_blank'} rel={parts} {...rest}>
      {children}
    </a>
  );
}
