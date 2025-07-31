import React from 'react';
import { LuCopy as CopyIcon, LuShare2 as ShareIcon } from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';

import { ShareModeSelect } from './share-mode-select';
type Props = {
  className?: string;
};

export const ShareButton = ({ className }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button size="sm" className="md:space-x-2">
          <ShareIcon className="block" />
          <span className="md:block hidden">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 space-y-2 p-4">
        <div className="text-sm text-muted-foreground">Sharing URL</div>

        <div className="flex items-center gap-2">
          <p className=" flex-1 p-1 border border-border focus:outline-none focus:ring rounded-md focus:ring-border truncate h-9">
            https://hackmd.io/asdasdasdasdasdasdasdas
          </p>
          <Button size="icon" variant="outline">
            <CopyIcon />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <ShareModeSelect />

          <Button size="sm">Preview</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
