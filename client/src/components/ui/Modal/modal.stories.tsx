import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  SimpleModal,
} from './modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
};

export default meta;

type Story = StoryObj<typeof Modal>;

// Simple usage with the convenience component
export const Simple: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Open Simple Modal
        </button>

        <SimpleModal
          open={open}
          onOpenChange={setOpen}
          title="Simple Modal"
          description="This is a description of what this modal does."
        >
          <p className="text-sm">
            This modal uses the SimpleModal component for quick setup.
          </p>
        </SimpleModal>
      </div>
    );
  },
};

// Fully composable usage
export const Composable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Open Composable Modal
        </button>

        <Modal open={open} onOpenChange={setOpen}>
          <ModalPortal>
            <ModalOverlay />
            <ModalContent size="lg">
              <ModalHeader>
                <div>
                  <ModalTitle>Fully Composable Modal</ModalTitle>
                  <ModalDescription>
                    Build exactly what you need with full control.
                  </ModalDescription>
                </div>
                <ModalClose />
              </ModalHeader>
              <ModalBody>
                <p className="text-sm mb-4">
                  This modal is built using individual components for maximum
                  flexibility.
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <textarea
                    placeholder="Enter a message"
                    className="w-full px-3 py-2 border rounded-md h-20 resize-none"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <ModalClose>
                  <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                </ModalClose>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </ModalFooter>
            </ModalContent>
          </ModalPortal>
        </Modal>
      </div>
    );
  },
};

// Using trigger component
export const WithTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger>
          <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
            Click to Open
          </button>
        </ModalTrigger>

        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Triggered Modal</ModalTitle>
              <ModalClose />
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">
                This modal was opened using the ModalTrigger component.
              </p>
            </ModalBody>
          </ModalContent>
        </ModalPortal>
      </Modal>
    );
  },
};

// Different sizes
export const Sizes: Story = {
  render: () => {
    const [openSm, setOpenSm] = useState(false);
    const [openMd, setOpenMd] = useState(false);
    const [openLg, setOpenLg] = useState(false);
    const [openXl, setOpenXl] = useState(false);

    return (
      <div className="space-x-2">
        <button
          onClick={() => setOpenSm(true)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          Small
        </button>
        <button
          onClick={() => setOpenMd(true)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          Medium
        </button>
        <button
          onClick={() => setOpenLg(true)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          Large
        </button>
        <button
          onClick={() => setOpenXl(true)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          Extra Large
        </button>

        <SimpleModal
          open={openSm}
          onOpenChange={setOpenSm}
          title="Small Modal"
          size="sm"
        >
          <p className="text-sm">Small modal content</p>
        </SimpleModal>

        <SimpleModal
          open={openMd}
          onOpenChange={setOpenMd}
          title="Medium Modal"
          size="md"
        >
          <p className="text-sm">Medium modal content</p>
        </SimpleModal>

        <SimpleModal
          open={openLg}
          onOpenChange={setOpenLg}
          title="Large Modal"
          size="lg"
        >
          <p className="text-sm">Large modal content with more space</p>
        </SimpleModal>

        <SimpleModal
          open={openXl}
          onOpenChange={setOpenXl}
          title="Extra Large Modal"
          size="xl"
        >
          <p className="text-sm">
            Extra large modal with even more space for content
          </p>
        </SimpleModal>
      </div>
    );
  },
};

// Custom styling example
export const CustomStyling: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-white hover:from-pink-600 hover:to-violet-600"
        >
          Open Custom Modal
        </button>

        <Modal open={open} onOpenChange={setOpen}>
          <ModalPortal>
            <ModalOverlay className="bg-gradient-to-br from-pink-500/20 to-violet-500/20 backdrop-blur-md" />
            <ModalContent
              className="bg-gradient-to-br from-white to-gray-50 border-2 border-pink-200 shadow-2xl"
              size="lg"
            >
              <ModalHeader className="border-b border-pink-100">
                <div>
                  <ModalTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                    Custom Styled Modal
                  </ModalTitle>
                  <ModalDescription className="text-gray-600">
                    This modal demonstrates custom styling capabilities.
                  </ModalDescription>
                </div>
                <ModalClose className="text-pink-600 hover:text-pink-700" />
              </ModalHeader>
              <ModalBody className="bg-gradient-to-br from-pink-50 to-violet-50">
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    You have complete control over the styling of each
                    component.
                  </p>
                  <div className="p-4 bg-white rounded-lg border border-pink-200">
                    <h4 className="font-medium text-pink-800 mb-2">
                      Features:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Custom backgrounds and borders</li>
                      <li>• Gradient overlays</li>
                      <li>• Individual component styling</li>
                      <li>• Tailwind CSS integration</li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-pink-100 bg-white/50">
                <ModalClose>
                  <button className="px-4 py-2 text-sm border border-pink-300 text-pink-700 rounded-md hover:bg-pink-50">
                    Close
                  </button>
                </ModalClose>
                <button className="px-4 py-2 text-sm bg-gradient-to-r from-pink-600 to-violet-600 text-white rounded-md hover:from-pink-700 hover:to-violet-700">
                  Save
                </button>
              </ModalFooter>
            </ModalContent>
          </ModalPortal>
        </Modal>
      </div>
    );
  },
};

export const AnimationTypes: Story = {
  render: () => {
    const [openSlide, setOpenSlide] = useState(false);
    const [openZoom, setOpenZoom] = useState(false);
    const [openFade, setOpenFade] = useState(false);
    const [openNone, setOpenNone] = useState(false);

    return (
      <div className="space-x-2">
        <button
          onClick={() => setOpenSlide(true)}
          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
        >
          Slide
        </button>
        <button
          onClick={() => setOpenZoom(true)}
          className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
        >
          Zoom
        </button>
        <button
          onClick={() => setOpenFade(true)}
          className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
        >
          Fade Only
        </button>
        <button
          onClick={() => setOpenNone(true)}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          No Animation
        </button>

        <SimpleModal
          open={openSlide}
          onOpenChange={setOpenSlide}
          title="Slide Animation"
          animationType="slide"
          slideFrom="bottom"
        >
          <p className="text-sm">This modal slides in from the bottom</p>
        </SimpleModal>

        <SimpleModal
          open={openZoom}
          onOpenChange={setOpenZoom}
          title="Zoom Animation"
          animationType="zoom"
        >
          <p className="text-sm">This modal zooms in from the center</p>
        </SimpleModal>

        <SimpleModal
          open={openFade}
          onOpenChange={setOpenFade}
          title="Fade Animation"
          animationType="fade"
        >
          <p className="text-sm">This modal only fades in/out</p>
        </SimpleModal>

        <SimpleModal
          open={openNone}
          onOpenChange={setOpenNone}
          title="No Animation"
          animationType="none"
        >
          <p className="text-sm">This modal appears instantly</p>
        </SimpleModal>
      </div>
    );
  },
};

export const EntranceDirections: Story = {
  render: () => {
    const [openCenter, setOpenCenter] = useState(false);
    const [openTop, setOpenTop] = useState(false);
    const [openBottom, setOpenBottom] = useState(false);
    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);
    const [openTopLeft, setOpenTopLeft] = useState(false);
    const [openBottomRight, setOpenBottomRight] = useState(false);

    return (
      <div className="grid grid-cols-3 gap-2 max-w-md">
        <button
          onClick={() => setOpenTopLeft(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          ↖ Top-Left
        </button>
        <button
          onClick={() => setOpenTop(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          ↑ Top
        </button>
        <div></div>

        <button
          onClick={() => setOpenLeft(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          ← Left
        </button>
        <button
          onClick={() => setOpenCenter(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          ● Center
        </button>
        <button
          onClick={() => setOpenRight(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          → Right
        </button>

        <div></div>
        <button
          onClick={() => setOpenBottom(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          ↓ Bottom
        </button>
        <button
          onClick={() => setOpenBottomRight(true)}
          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          ↘ Bottom-Right
        </button>

        {/* Center */}
        <SimpleModal
          open={openCenter}
          onOpenChange={setOpenCenter}
          title="Center Modal"
          position="center"
          slideFrom="center"
        >
          <p className="text-sm">Slides in from center with zoom effect</p>
        </SimpleModal>

        {/* Top */}
        <SimpleModal
          open={openTop}
          onOpenChange={setOpenTop}
          title="Top Modal"
          position="top"
          slideFrom="top"
        >
          <p className="text-sm">Slides in from the top</p>
        </SimpleModal>

        {/* Bottom */}
        <SimpleModal
          open={openBottom}
          onOpenChange={setOpenBottom}
          title="Bottom Modal"
          position="bottom"
          slideFrom="bottom"
        >
          <p className="text-sm">Slides in from the bottom</p>
        </SimpleModal>

        {/* Left */}
        <SimpleModal
          open={openLeft}
          onOpenChange={setOpenLeft}
          title="Left Modal"
          position="left"
          slideFrom="left"
        >
          <p className="text-sm">Slides in from the left</p>
        </SimpleModal>

        {/* Right */}
        <SimpleModal
          open={openRight}
          onOpenChange={setOpenRight}
          title="Right Modal"
          position="right"
          slideFrom="right"
        >
          <p className="text-sm">Slides in from the right</p>
        </SimpleModal>

        {/* Top-Left */}
        <SimpleModal
          open={openTopLeft}
          onOpenChange={setOpenTopLeft}
          title="Top-Left Modal"
          position="top-left"
          slideFrom="top-left"
        >
          <p className="text-sm">Slides in from the top-left corner</p>
        </SimpleModal>

        {/* Bottom-Right */}
        <SimpleModal
          open={openBottomRight}
          onOpenChange={setOpenBottomRight}
          title="Bottom-Right Modal"
          position="bottom-right"
          slideFrom="bottom-right"
        >
          <p className="text-sm">Slides in from the bottom-right corner</p>
        </SimpleModal>
      </div>
    );
  },
};
