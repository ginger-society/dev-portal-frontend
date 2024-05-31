import { worker } from "@/mocks/browser";
import { Meta, StoryObj } from "@storybook/react";
import { waitFor, within, expect } from "@storybook/test";
import { http, HttpResponse } from "msw";
import Test from "../index";

export default {
  title: "Example/MSW based api mocking",
  component: Test,
  parameters: { options: { showPanel: false } },
} as Meta<typeof Test>;

type Story = StoryObj<typeof Test>;

interface APIRequestHandlerI {
  params: Record<string, string | readonly string[]>;
  request: Request;
}

export const Default: Story = {
  args: {},
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("value")).toBeInTheDocument());
  },
};
