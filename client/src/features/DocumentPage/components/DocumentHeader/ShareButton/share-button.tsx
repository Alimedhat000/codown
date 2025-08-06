import React from 'react';
import {
  LuCopy as CopyIcon,
  LuBan,
  LuCheckCheck,
  LuShare2 as ShareIcon,
} from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { useJoinRequests } from '@/hooks/useJoinRequests';
import { useShareLink } from '@/hooks/useShareLink';

import { ShareModeSelect } from './share-mode-select';
type Props = {
  className?: string;
  docId?: string;
};

export const ShareButton = ({ className, docId }: Props) => {
  const {
    requests,
    loading: requestsLoading,
    approve,
    reject,
  } = useJoinRequests(docId!);
  const {
    shareLink,
    loading: linkLoading,
    error,
    refresh,
  } = useShareLink(docId);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    // toast({ title: 'Copied to clipboard!' });
  };

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
          <p className=" flex-1 px-3 py-1 border border-border focus:outline-none focus:ring rounded-md focus:ring-border truncate h-9">
            {linkLoading ? 'Loading…' : shareLink || 'No link available'}
          </p>
          <Button
            size="icon"
            variant="outline"
            onClick={handleCopy}
            disabled={!shareLink}
          >
            <CopyIcon />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <ShareModeSelect onChange={refresh} />

          <Button size="sm" disabled>
            Preview
          </Button>
        </div>

        {requests.length > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            <div className="text-sm font-medium text-foreground">
              Join Requests
            </div>
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-2 border border-border rounded-md px-2 py-1"
              >
                <span className="truncate text-sm">{req.email}</span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="bg-success"
                    onClick={() => approve(req.id)}
                  >
                    <LuCheckCheck />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className=""
                    onClick={() => reject(req.id)}
                  >
                    <LuBan />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {requestsLoading && (
          <p className="text-xs text-muted-foreground">Loading requests…</p>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
