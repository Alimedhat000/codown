import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { Button } from '@/components/ui/Button';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown';

const meta: Meta = {
  component: DropdownMenu,
  title: 'Components/Dropdown',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A comprehensive dropdown menu component with support for regular items, checkboxes, radio buttons, submenus, shortcuts, and grouping.',
      },
    },
  },
};

export default meta;

export const Default = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Open Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Item One</DropdownMenuItem>
      <DropdownMenuItem>Item Two</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Item Three</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithCheckboxItems = () => {
  const [checked, setChecked] = React.useState(true);
  const [checked2, setChecked2] = React.useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={checked}
          onCheckedChange={setChecked}
        >
          Option One
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={checked2}
          onCheckedChange={setChecked2}
        >
          Option Two
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const WithRadioItems = () => {
  const [value, setValue] = React.useState('one');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select an option</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          <DropdownMenuRadioItem value="one">Option One</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="two">Option Two</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="three">
            Option Three
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const WithSubmenus = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Open Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Item One</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Sub Item One</DropdownMenuItem>
          <DropdownMenuItem>Sub Item Two</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem>Item Three</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithShortcuts = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>File Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        New File
        <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Open File
        <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Save File
        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        Exit
        <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithGroups = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Actions</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel>File Actions</DropdownMenuLabel>
        <DropdownMenuItem>New</DropdownMenuItem>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Save</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Edit Actions</DropdownMenuLabel>
        <DropdownMenuItem>Cut</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem>Paste</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const WithPortal = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Portal Example</Button>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent>
        <DropdownMenuLabel>Portaled Content</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          This content is rendered in a portal
        </DropdownMenuItem>
        <DropdownMenuItem>Useful for z-index issues</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenu>
);

export const ComplexMenu = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [marketing, setMarketing] = React.useState(false);
  const [theme, setTheme] = React.useState('light');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Settings Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Preferences</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={notifications}
            onCheckedChange={setNotifications}
          >
            Email Notifications
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={marketing}
            onCheckedChange={setMarketing}
          >
            Marketing Emails
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              Keyboard Shortcuts
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Help Center</DropdownMenuItem>
            <DropdownMenuItem>Contact Support</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const NestedSubmenus = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Nested Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Home</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Products</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Web Development</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Frontend</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>React</DropdownMenuItem>
              <DropdownMenuItem>Vue</DropdownMenuItem>
              <DropdownMenuItem>Angular</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Backend</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Node.js</DropdownMenuItem>
              <DropdownMenuItem>Python</DropdownMenuItem>
              <DropdownMenuItem>Go</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem>About</DropdownMenuItem>
      <DropdownMenuItem>Contact</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const DisabledItems = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Menu with Disabled Items</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Available Action</DropdownMenuItem>
      <DropdownMenuItem disabled>Disabled Action</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Another Available Action</DropdownMenuItem>
      <DropdownMenuItem disabled>
        Another Disabled Action
        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const AllComponents = () => {
  const [checkboxState, setCheckboxState] = React.useState({
    option1: true,
    option2: false,
    option3: true,
  });
  const [radioValue, setRadioValue] = React.useState('medium');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Complete Example</Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Complete Component Demo</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Regular Items Group */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Regular Items</DropdownMenuLabel>
            <DropdownMenuItem>
              Action Item
              <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Disabled Item
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Checkbox Items Group */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Checkbox Options</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={checkboxState.option1}
              onCheckedChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, option1: checked }))
              }
            >
              Enable Feature A
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={checkboxState.option2}
              onCheckedChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, option2: checked }))
              }
            >
              Enable Feature B
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={checkboxState.option3}
              onCheckedChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, option3: checked }))
              }
            >
              Enable Feature C
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Radio Items Group */}
          <DropdownMenuLabel>Size Selection</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={radioValue}
            onValueChange={setRadioValue}
          >
            <DropdownMenuRadioItem value="small">Small</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="large">Large</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          {/* Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Advanced Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                Import Data
                <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export Data
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Export Format</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>JSON</DropdownMenuItem>
                  <DropdownMenuItem>CSV</DropdownMenuItem>
                  <DropdownMenuItem>XML</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
