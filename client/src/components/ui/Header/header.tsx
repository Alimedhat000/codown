import React from 'react';
import { LuCodeXml as CodeIcon } from 'react-icons/lu';
import { Link } from 'react-router';

import { paths } from '@/config/paths';

import { UserMenu } from '../UserMenu'; // Adjust path

export default function Header({
  username,
  logout,
  avatarUrl,
}: {
  username?: string;
  avatarUrl?: string;
  logout?: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-header shadow">
      <Link
        to={paths.landing.getHref()}
        className="flex gap-2 items-center text-2xl"
      >
        <CodeIcon className="text-[#4e44ff] text-3xl" />
        <span className="font-extrabold text-foreground">Co-Down</span>
      </Link>

      {username && logout && (
        <UserMenu username={username} avatarUrl={avatarUrl} logout={logout} />
      )}
    </header>
  );
}
