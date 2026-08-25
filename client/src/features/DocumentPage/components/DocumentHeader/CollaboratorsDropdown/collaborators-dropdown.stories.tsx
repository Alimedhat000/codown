import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Collaborator } from '@/types/api';

import { CollaboratorsDropdown } from './collaborators-dropdown';

const mockCollaborators: Collaborator[] = [
  {
    id: 'c1',
    documentId: 'doc1',
    userId: 'u1',
    permission: 'edit',
    user: {
      id: 'u1',
      username: 'alice',
      email: 'alice@example.com',
      fullName: 'Alice Johnson',
    },
  },
  {
    id: 'c2',
    documentId: 'doc1',
    userId: 'u2',
    permission: 'view',
    user: {
      id: 'u2',
      username: 'bob',
      email: 'bob@example.com',
      fullName: 'Bob Wilson',
    },
  },
  {
    id: 'c3',
    documentId: 'doc1',
    userId: 'u3',
    permission: 'edit',
    user: {
      id: 'u3',
      username: 'carol',
      email: 'carol@example.com',
      fullName: 'Carol Davis',
    },
  },
];

const longNameCollaborators: Collaborator[] = [
  {
    id: 'c1',
    documentId: 'doc1',
    userId: 'u1',
    permission: 'edit',
    user: {
      id: 'u1',
      username: 'dr.alexander.maximilian.richardson.the.third',
      email: 'alex.richardson@example.com',
      fullName: 'Dr. Alexander Maximilian Richardson III',
    },
  },
  {
    id: 'c2',
    documentId: 'doc1',
    userId: 'u2',
    permission: 'view',
    user: {
      id: 'u2',
      username: 'professor.elizabeth.worthington.smith',
      email: 'liz.worthington@example.com',
      fullName: 'Professor Elizabeth Catherine Worthington-Smith',
    },
  },
];

const meta: Meta = {
  title: 'DocumentPage/CollaboratorsDropdown',
  component: CollaboratorsDropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

// Without injected collaborators the component fetches via useCollaborators(docId),
// which requires a running API — stories inject data through the `collaborators` prop.
export const Default: Story = {
  args: {},
};

export const OwnerWithCollaborators: Story = {
  args: {
    isOwner: true,
    collaborators: mockCollaborators,
  },
};

/** Non-owner sees the roster without remove buttons. */
export const ViewOnlyCollaborators: Story = {
  args: {
    isOwner: false,
    collaborators: mockCollaborators,
  },
};

/**
 * Long display names truncation.
 */
export const LongNames: Story = {
  args: {
    isOwner: true,
    collaborators: longNameCollaborators,
  },
};

/** Owner sees the add-by-email form; the submit button is disabled until an email is typed. */
export const OwnerAddByEmailForm: Story = {
  args: {
    docId: 'doc1',
    isOwner: true,
    collaborators: mockCollaborators,
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /collaborators/i }),
    );
    // Radix portals menu content to document.body, outside the story canvas
    const body = within(document.body);
    const emailInput = await body.findByLabelText('Collaborator email');
    const addButton = body.getByRole('button', { name: /add collaborator/i });

    await expect(addButton).toBeDisabled();
    await userEvent.type(emailInput, 'newcollab@example.com');
    await expect(addButton).toBeEnabled();
  },
};

/** Non-owners never see the add-by-email form. */
export const NonOwnerHidesAddForm: Story = {
  args: {
    isOwner: false,
    collaborators: mockCollaborators,
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /collaborators/i }),
    );
    const body = within(document.body);
    await body.findByText('alice');

    await expect(body.queryByLabelText('Collaborator email')).toBeNull();
  },
};

/**
 * Failed adds surface an error and keep the typed email so it can be
 * corrected and resubmitted.
 *
 * The story canvas has no API to talk to, so this exercises the error
 * path of the add flow.
 */
export const AddFailureShowsError: Story = {
  args: {
    docId: 'doc1',
    isOwner: true,
    collaborators: mockCollaborators,
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /collaborators/i }),
    );
    const body = within(document.body);
    const emailInput = await body.findByLabelText('Collaborator email');

    await userEvent.type(emailInput, 'nobody@example.com');
    await userEvent.click(
      body.getByRole('button', { name: /add collaborator/i }),
    );

    await expect(body.findByRole('alert')).resolves.toHaveTextContent(
      /failed to add collaborator/i,
    );
    await expect(emailInput).toHaveValue('nobody@example.com');
  },
};
